const mongoose = require('mongoose');
const Alert = require('../models/Alert');
const Notification = require('../models/Notification');
const { fetchStockData } = require('./stockService');
const logger = require('../config/logger');

const User = require('../models/User');
const UserSettings = require('../models/UserSettings');
const AlertRule = require('../models/AlertRule');
const { evaluateRules } = require('./alertRulesService');

let alertInterval = null;
let alertEventEmitter = null;
const userCheckTimestamps = new Map(); // Track last check per user

/**
 * Parse refresh rate string to milliseconds
 * Supports: '1s', '5s', '1m', '5m', '15m', '30m', '1h'
 */
const parseRefreshRate = (rate = '5s') => {
    const str = String(rate).toLowerCase().trim();
    const match = str.match(/^(\d+)([smh])$/);
    if (!match) return 5000; // Default 5s
    
    const [, value, unit] = match;
    const num = parseInt(value, 10);
    
    switch (unit) {
        case 's': return num * 1000;
        case 'm': return num * 60 * 1000;
        case 'h': return num * 60 * 60 * 1000;
        default: return 5000;
    }
};

const isDatabaseReady = () => mongoose.connection.readyState === 1;


const emitAlertTriggered = (payload) => {
    if (typeof alertEventEmitter === 'function') {
        alertEventEmitter('alert_triggered', {
            ...payload,
            timestamp: new Date().toISOString(),
        });
    }
};

/**
 * Evaluate all rules for a specific user with their alert frequency settings
 */
const evaluateUserRules = async (userId) => {
    try {
        const result = await evaluateRules(userId);
        return result;
    } catch (error) {
        logger.warn(`Error evaluating rules for user ${userId}:`, error.message);
        return { evaluated: 0, triggeredCount: 0, triggered: [] };
    }
};

/**
 * Check simple price alerts (Alert model) for a user against live prices.
 * Creates a Notification and marks the alert as triggered when price crosses target.
 */
const checkPriceAlerts = async (userId) => {
    try {
        const alerts = await Alert.find({
            $or: [{ userId }, { user: userId }],
            isActive: true,
            targetPrice: { $exists: true, $ne: null },
            $or: [{ status: 'ACTIVE' }, { status: { $exists: false } }]
        }).lean();

        if (!alerts.length) return;

        // Group by symbol to batch-fetch live prices
        const symbols = [...new Set(alerts.map(a => String(a.symbol).toUpperCase()))];
        const quotes = await fetchStockData(symbols).catch(() => []);
        const priceMap = new Map(
            (Array.isArray(quotes) ? quotes : []).map(q => [
                String(q.symbol).toUpperCase().replace(/\.(NS|BO)$/i, ''),
                Number(q.price)
            ])
        );

        for (const alert of alerts) {
            const cleanSym = String(alert.symbol).toUpperCase().replace(/\.(NS|BO)$/i, '');
            const livePrice = priceMap.get(cleanSym);
            if (!livePrice || livePrice <= 0) continue;

            const target = Number(alert.targetPrice ?? alert.threshold ?? alert.value);
            if (!target || target <= 0) continue;

            // Cooldown: skip if triggered in the last 4 hours
            const lastTriggered = alert.lastEvaluatedAt ? new Date(alert.lastEvaluatedAt).getTime() : 0;
            if (Date.now() - lastTriggered < 4 * 60 * 60 * 1000) continue;

            const direction = alert.condition || (target > livePrice ? 'crosses_above' : 'crosses_below');
            const triggered =
                (direction === 'crosses_above' && livePrice >= target) ||
                (direction === 'crosses_below' && livePrice <= target);

            if (!triggered) continue;

            const ownerUserId = alert.userId ?? alert.user;
            if (!ownerUserId) continue;

            // Create notification
            await Notification.create({
                user: ownerUserId,
                type: 'price_alert',
                title: 'Price Alert Triggered',
                message: `${cleanSym} ${direction === 'crosses_above' ? 'rose above' : 'dropped below'} your target of ₹${target.toLocaleString('en-IN')}. Current price: ₹${livePrice.toLocaleString('en-IN')}.`,
                relatedId: cleanSym,
            });

            // Mark alert as evaluated (cooldown)
            await Alert.updateOne(
                { _id: alert._id },
                { $set: { lastEvaluatedAt: new Date() } }
            );

            logger.info(`Price alert triggered: ${cleanSym} for user ${ownerUserId} (target ₹${target}, live ₹${livePrice})`);

            emitAlertTriggered({
                userId: ownerUserId,
                symbol: cleanSym,
                targetPrice: target,
                livePrice,
                direction,
            });
        }
    } catch (err) {
        logger.warn(`checkPriceAlerts error: ${err.message}`);
    }
};

/**
 * Main alert checking function - evaluates all active users' rules
 * respecting their individual refresh rate settings
 */
const checkAlerts = async () => {
    if (!isDatabaseReady()) return;

    try {
        // Fetch only users who have at least one active alert rule
        const activeRules = await AlertRule.find({ active: true }).distinct('user').lean();
        if (!activeRules.length) return;
        const users = activeRules.map(id => ({ _id: id }));
        
        // For each user, check if it's time to evaluate their rules
        for (const user of users) {
            const userId = String(user._id);
            const userSettings = await UserSettings.findOne({ user: user._id }).lean();
            
            // Get user's alert refresh rate from settings (default: 5s)
            const alertRefreshRate = userSettings?.data?.quoteUpdateFreq || '5s';
            const checkIntervalMs = parseRefreshRate(alertRefreshRate);
            
            // Track last check time for this user
            const lastCheckTime = userCheckTimestamps.get(userId) || 0;
            const timeSinceLastCheck = Date.now() - lastCheckTime;
            
            // Only evaluate if enough time has passed
            if (timeSinceLastCheck < checkIntervalMs) {
                continue;
            }
            
            // 1. Evaluate AlertRule (custom multi-condition rules)
            const result = await evaluateUserRules(user._id);
            if (result.triggeredCount > 0) {
                logger.info(`User ${userId}: ${result.triggeredCount} rule(s) triggered (${result.evaluated} evaluated)`);
                result.triggered.forEach(trigger => {
                    emitAlertTriggered({
                        userId: user._id,
                        ruleId: trigger.ruleId,
                        ruleName: trigger.name,
                        symbol: trigger.symbol,
                        triggeredAt: trigger.triggeredAt,
                    });
                });
            }

            // Update last check timestamp
            userCheckTimestamps.set(userId, Date.now());
        }

        // 2. Check simple price alerts (Alert model) — runs every cycle for all users
        const allPriceAlertUsers = await Alert.find({
            isActive: true,
            targetPrice: { $exists: true, $ne: null },
        }).distinct('userId').lean();

        const extraUsers = await Alert.find({
            isActive: true,
            targetPrice: { $exists: true, $ne: null },
        }).distinct('user').lean();

        const uniquePriceAlertUserIds = [...new Set([
            ...allPriceAlertUsers.map(String),
            ...extraUsers.map(String)
        ])].filter(Boolean);

        for (const uid of uniquePriceAlertUserIds) {
            await checkPriceAlerts(uid);
        }

    } catch (error) {
        logger.error(`Error in Alert Engine: ${error.message}`);
    }
};



const startAlertEngine = () => {
    if (alertInterval) return;
    logger.info("Starting Advanced Alert Engine...");
    // Check alerts every 5 seconds (respect individual user refresh rates)
    alertInterval = setInterval(checkAlerts, 5000);
};

const stopAlertEngine = () => {
    if (alertInterval) {
        clearInterval(alertInterval);
        alertInterval = null;
    }
    logger.info('Alert Engine stopped');
};

const setAlertEventEmitter = (emitter) => {
    alertEventEmitter = emitter;
};

module.exports = { 
    startAlertEngine, 
    stopAlertEngine, 
    setAlertEventEmitter,
    evaluateUserRules,
    parseRefreshRate,
};

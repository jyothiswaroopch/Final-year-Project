/**
 * proximityEngine.js
 * 
 * Evaluates alerts (DB + locally defined) against live market prices and
 * returns a ranked list of stocks needing attention — those with alerts
 * within striking distance of their target price.
 */

const Alert = require('../models/Alert');
const logger = require('../utils/logger');

// Inline live quote fetcher (reuses existing market API helper)
const fetchLivePrice = async (symbol) => {
    try {
        const { fetchMarketQuotes } = require('./marketQuoteService');
        const quotes = await fetchMarketQuotes([symbol]);
        if (Array.isArray(quotes) && quotes.length > 0) {
            return Number(quotes[0].price ?? quotes[0].close ?? 0);
        }
    } catch (_) {}

    // fallback: try Yahoo via stockService
    try {
        const { fetchStockHistory } = require('./stockService');
        const history = await fetchStockHistory(symbol, '1D', { limit: 2 }).catch(() => []);
        if (history && history.length > 0) {
            return Number(history[history.length - 1].price ?? 0);
        }
    } catch (_) {}

    return null;
};

/**
 * Classify proximity into priority tiers.
 *   0-5%   → Urgent  (about to trigger)
 *   5-15%  → High
 *   15-30% → Medium
 *   30%+   → Low
 */
const classifyPriority = (proximityPct) => {
    if (proximityPct <= 5)  return 'Urgent';
    if (proximityPct <= 15) return 'High';
    if (proximityPct <= 30) return 'Medium';
    return 'Low';
};

/**
 * Build a human-readable insight message for the alert card.
 */
const buildInsight = (symbol, currentPrice, targetPrice, type, proximityPct) => {
    const dir = currentPrice < targetPrice ? 'needs to rise' : 'needs to fall';
    const gap = Math.abs(currentPrice - targetPrice).toFixed(2);
    const pct = proximityPct.toFixed(1);

    if (type === 'price_above' || (type === 'price' && targetPrice > currentPrice)) {
        return `₹${currentPrice.toLocaleString()} → ₹${targetPrice.toLocaleString()} target. Only ₹${gap} (${pct}%) away. Stock ${dir} to trigger.`;
    }
    if (type === 'price_below' || (type === 'price' && targetPrice < currentPrice)) {
        return `₹${currentPrice.toLocaleString()} → ₹${targetPrice.toLocaleString()} target. ₹${gap} (${pct}%) gap remaining. Watching for drop.`;
    }
    return `Alert within ${pct}% of trigger. Current: ₹${currentPrice.toLocaleString()}, Target: ₹${targetPrice.toLocaleString()}.`;
};

/**
 * Determine badge color from priority.
 */
const priorityToColor = (priority) => {
    if (priority === 'Urgent') return 'rose';
    if (priority === 'High')   return 'amber';
    return 'blue';
};

/**
 * Main function: given the user's DB alerts + optional frontend localAlerts,
 * fetch live prices and return a sorted list of attention items.
 *
 * @param {mongoose.ObjectId} userId
 * @param {Array}  localAlerts  — alert objects passed from frontend (may be empty)
 * @param {number} threshold    — max proximity % to include (default 30%)
 */
const evaluateProximity = async (userId, localAlerts = [], threshold = 30) => {
    // 1. Load DB alerts for this user
    let dbAlerts = [];
    if (userId) {
        dbAlerts = await Alert.find({
            $or: [{ userId }, { user: userId }],
            isActive: true,
            $or: [{ status: 'ACTIVE' }, { status: { $exists: false } }],
            targetPrice: { $exists: true, $ne: null }
        }).lean().catch(() => []);
    }

    // 2. Merge DB + local alerts (deduplicate by symbol+targetPrice)
    const seen = new Set();
    const allAlerts = [];

    for (const a of dbAlerts) {
        const key = `${String(a.symbol).toUpperCase()}-${a.targetPrice}`;
        if (!seen.has(key)) {
            seen.add(key);
            allAlerts.push({
                id: String(a._id),
                symbol: String(a.symbol).toUpperCase(),
                targetPrice: Number(a.targetPrice),
                type: a.type || 'price',
                source: 'db'
            });
        }
    }

    for (const a of (localAlerts || [])) {
        if (!a?.symbol || !a?.targetPrice) continue;
        const sym = String(a.symbol).toUpperCase().replace(/\.(NS|BO)$/i, '');
        const key = `${sym}-${a.targetPrice}`;
        if (!seen.has(key)) {
            seen.add(key);
            allAlerts.push({
                id: `local-${sym}-${a.targetPrice}`,
                symbol: sym,
                targetPrice: Number(a.targetPrice),
                type: a.type || 'price',
                source: 'local'
            });
        }
    }

    if (allAlerts.length === 0) return [];

    // 3. Fetch live prices for unique symbols (in parallel, capped)
    const uniqueSymbols = [...new Set(allAlerts.map(a => a.symbol))];
    const priceMap = {};

    await Promise.all(
        uniqueSymbols.slice(0, 20).map(async (sym) => {
            try {
                const price = await fetchLivePrice(sym);
                if (price && price > 0) priceMap[sym] = price;
            } catch (_) {}
        })
    );

    // 4. Evaluate proximity for each alert
    const results = [];

    for (const alert of allAlerts) {
        const currentPrice = priceMap[alert.symbol];
        if (!currentPrice || currentPrice <= 0) continue;

        const { targetPrice, symbol, type } = alert;
        if (!targetPrice || targetPrice <= 0) continue;

        const proximityPct = Math.abs((currentPrice - targetPrice) / targetPrice) * 100;
        if (proximityPct > threshold) continue;  // outside attention window

        const priority = classifyPriority(proximityPct);

        results.push({
            id: alert.id,
            symbol,
            price: `₹${currentPrice.toLocaleString()}`,
            change: '', // change data not critical here
            isPositive: currentPrice > targetPrice ? false : true,
            tagTop: `${priority} Priority`,
            tagTopColor: priorityToColor(priority),
            insight: buildInsight(symbol, currentPrice, targetPrice, type, proximityPct),
            realAlert: `Target: ₹${targetPrice.toLocaleString()}`,
            targetPrice,
            progressPercent: Math.max(0, 100 - proximityPct),
            priority,
            proximityPct
        });
    }

    // 5. Sort: Urgent → High → Medium → Low, then by proximityPct ascending
    const PRIORITY_RANK = { Urgent: 0, High: 1, Medium: 2, Low: 3 };
    results.sort((a, b) => {
        const rankDiff = (PRIORITY_RANK[a.priority] ?? 4) - (PRIORITY_RANK[b.priority] ?? 4);
        return rankDiff !== 0 ? rankDiff : a.proximityPct - b.proximityPct;
    });

    return results;
};

module.exports = { evaluateProximity };

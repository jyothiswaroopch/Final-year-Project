const SearchStats = require('../models/SearchStats');
const SearchCooldown = require('../models/SearchCooldown');
const SearchLog = require('../models/SearchLog');
const Catalyst = require('../models/Catalyst');

const COOLDOWN_MS = 10 * 60 * 1000;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;
const VALID_CATEGORIES = new Set(['trader', 'investor']);
const VALID_PERIODS = new Set(['all', 'daily', 'weekly']);
const VALID_SOURCES = new Set(['search_bar', 'watchlist', 'recommendation', 'stock_page', 'unknown']);

const getDayBucket = (date = new Date()) => date.toISOString().slice(0, 10);

const getWeekBucket = (date = new Date()) => {
    const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
};

const normalizeSymbol = (value) => {
    const raw = String(value || '').trim().toUpperCase();
    if (!raw) return '';

    return raw
        .replace(/^\^/, '')
        .replace(/\.(NS|BO)$/i, '')
        .replace(/^NSE:/, '')
        .replace(/^BSE:/, '')
        .replace(/\s+/g, '');
};

const inferCategory = (symbol) => {
    if (/(BTC|ETH|USDT|USDINR|EURUSD|GBPUSD|SPX500USD|NAS100USD|US30USD)/i.test(symbol)) {
        return 'trader';
    }

    return 'investor';
};

const normalizeCategory = (value, symbol) => {
    const category = String(value || '').trim().toLowerCase();
    if (VALID_CATEGORIES.has(category)) return category;
    return inferCategory(symbol);
};

const normalizeSource = (value) => {
    const source = String(value || '').trim().toLowerCase();
    return VALID_SOURCES.has(source) ? source : 'unknown';
};

const getFingerprint = (req) => {
    const userId = req.user?._id ? String(req.user._id) : null;
    if (userId) return `user:${userId}`;

    const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
    const ip = forwarded || req.ip || req.socket?.remoteAddress || 'unknown';
    return `ip:${ip}`;
};

const parseLimit = (value) => {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) return DEFAULT_LIMIT;
    return Math.min(parsed, MAX_LIMIT);
};

const getSortForPeriod = (period) => {
    if (period === 'daily') return { dailyCount: -1, lastSearchedAt: -1 };
    if (period === 'weekly') return { weeklyCount: -1, lastSearchedAt: -1 };
    return { count: -1, lastSearchedAt: -1 };
};

const getWindowStart = (period, now = new Date()) => {
    if (period === 'daily') return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    if (period === 'weekly') return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return null;
};

const buildLogMatch = ({ category, source, from }) => {
    const match = {};
    if (category) match.category = category;
    if (source) match.source = source;
    if (from) match.searchedAt = { $gte: from };
    return match;
};

const aggregateLogCounts = async ({ category, source, period, limit }) => {
    const from = getWindowStart(period);
    const match = buildLogMatch({ category, source, from });

    return SearchLog.aggregate([
        { $match: match },
        {
            $group: {
                _id: { symbol: '$symbol', category: '$category' },
                count: { $sum: 1 },
                lastSearchedAt: { $max: '$searchedAt' },
                sources: { $addToSet: '$source' }
            }
        },
        { $sort: { count: -1, lastSearchedAt: -1 } },
        { $limit: limit },
        {
            $project: {
                _id: 0,
                symbol: '$_id.symbol',
                category: '$_id.category',
                count: 1,
                lastSearchedAt: 1,
                sources: 1
            }
        }
    ]);
};

const buildStatsUpdate = (now, symbol, category) => {
    const dailyBucket = getDayBucket(now);
    const weeklyBucket = getWeekBucket(now);

    return [
        {
            $set: {
                symbol,
                category,
                count: { $add: [{ $ifNull: ['$count', 0] }, 1] },
                dailyCount: {
                    $cond: [
                        { $eq: ['$dailyBucket', dailyBucket] },
                        { $add: [{ $ifNull: ['$dailyCount', 0] }, 1] },
                        1
                    ]
                },
                weeklyCount: {
                    $cond: [
                        { $eq: ['$weeklyBucket', weeklyBucket] },
                        { $add: [{ $ifNull: ['$weeklyCount', 0] }, 1] },
                        1
                    ]
                },
                dailyBucket,
                weeklyBucket,
                lastSearchedAt: now
            }
        }
    ];
};

const trackSearch = async (req, res) => {
    try {
        const symbol = normalizeSymbol(req.body?.symbol);
        if (!symbol) {
            return res.status(400).json({ error: 'Symbol is required' });
        }

        const category = normalizeCategory(req.body?.category, symbol);
        const source = normalizeSource(req.body?.source);
        const now = new Date();
        const fingerprint = getFingerprint(req);
        const cooldownUntil = new Date(now.getTime() + COOLDOWN_MS);

        const cooldown = await SearchCooldown.findOne({ symbol, category, fingerprint }).lean();
        if (cooldown?.lastTrackedAt && now.getTime() - new Date(cooldown.lastTrackedAt).getTime() < COOLDOWN_MS) {
            const stats = await SearchStats.findOne({ symbol, category }).lean();
            return res.json({
                success: true,
                tracked: false,
                reason: 'duplicate_within_cooldown',
                cooldownSeconds: Math.ceil((COOLDOWN_MS - (now.getTime() - new Date(cooldown.lastTrackedAt).getTime())) / 1000),
                data: stats
            });
        }

        await SearchCooldown.findOneAndUpdate(
            { symbol, category, fingerprint },
            { $set: { lastTrackedAt: now, expiresAt: cooldownUntil } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        const [stats] = await Promise.all([
            SearchStats.findOneAndUpdate(
                { symbol, category },
                buildStatsUpdate(now, symbol, category),
                { upsert: true, new: true, setDefaultsOnInsert: true }
            ),
            SearchLog.create({
                symbol,
                category,
                source,
                fingerprint,
                searchedAt: now
            })
        ]);

        return res.status(201).json({
            success: true,
            tracked: true,
            data: stats
        });
    } catch (error) {
        if (error?.code === 11000) {
            return res.status(409).json({ error: 'Search tracking conflict, please retry' });
        }

        console.error('Failed to track search:', error);
        return res.status(500).json({ error: 'Failed to track search' });
    }
};

const getMostSearched = async (req, res) => {
    try {
        const category = String(req.query?.category || '').trim().toLowerCase();
        const period = String(req.query?.period || 'all').trim().toLowerCase();
        const source = String(req.query?.source || '').trim().toLowerCase();
        const limit = parseLimit(req.query?.limit);

        if (category && !VALID_CATEGORIES.has(category)) {
            return res.status(400).json({ error: 'Category must be trader or investor' });
        }

        if (source && !VALID_SOURCES.has(source)) {
            return res.status(400).json({ error: 'Source is invalid' });
        }

        if (!VALID_PERIODS.has(period)) {
            return res.status(400).json({ error: 'Period must be all, daily, or weekly' });
        }

        const data = period === 'all' && !source
            ? await SearchStats.find(category ? { category } : {})
                .sort(getSortForPeriod(period))
                .limit(limit)
                .lean()
            : await aggregateLogCounts({
                category,
                source,
                period,
                limit
            });

        return res.json({
            success: true,
            period,
            category: category || 'all',
            source: source || 'all',
            data
        });
    } catch (error) {
        console.error('Failed to fetch most searched:', error);
        return res.status(500).json({ error: 'Failed to fetch most searched' });
    }
};

const getTrending = async (req, res) => {
    try {
        const category = String(req.query?.category || '').trim().toLowerCase();
        const source = String(req.query?.source || '').trim().toLowerCase();
        const limit = parseLimit(req.query?.limit);
        const now = new Date();
        const dailyFrom = getWindowStart('daily', now);
        const weeklyFrom = getWindowStart('weekly', now);

        if (category && !VALID_CATEGORIES.has(category)) {
            return res.status(400).json({ error: 'Category must be trader or investor' });
        }

        if (source && !VALID_SOURCES.has(source)) {
            return res.status(400).json({ error: 'Source is invalid' });
        }

        const match = buildLogMatch({ category, source, from: weeklyFrom });

        const data = await SearchLog.aggregate([
            { $match: match },
            {
                $group: {
                    _id: { symbol: '$symbol', category: '$category' },
                    dailyCount: {
                        $sum: {
                            $cond: [{ $gte: ['$searchedAt', dailyFrom] }, 1, 0]
                        }
                    },
                    weeklyCount: { $sum: 1 },
                    lastSearchedAt: { $max: '$searchedAt' },
                    sources: { $addToSet: '$source' }
                }
            },
            {
                $addFields: {
                    // compute searchScore using production formula
                    searchScore: {
                        $add: [
                            { $multiply: ['$dailyCount', 3] },
                            { $multiply: ['$weeklyCount', 0.7] }
                        ]
                    }
                }
            },
            { $match: { $expr: { $gt: ['$searchScore', 0] } } },
            { $sort: { searchScore: -1, dailyCount: -1, weeklyCount: -1, lastSearchedAt: -1 } },
            { $limit: limit },
            {
                $project: {
                    _id: 0,
                    symbol: '$_id.symbol',
                    category: '$_id.category',
                    searchScore: { $round: ['$searchScore', 2] },
                    dailyCount: 1,
                    weeklyCount: 1,
                    lastSearchedAt: 1,
                    sources: 1
                }
            }
        ]);

        // If no results, return early
        if (!data || data.length === 0) {
            return res.json({ success: true, category: category || 'all', source: source || 'all', formula: 'daily*3 + weekly*0.7 + catalyst + momentum', data: [] });
        }

        // Collect symbols and fetch catalysts for all of them in one query (recent window)
        const symbols = data.map(d => d.symbol);
        const catalysts = await Catalyst.find({ relatedSymbols: { $in: symbols }, date: { $gte: weeklyFrom } }).lean();

        // Build catalyst map per symbol and compute catalystScore
        const baseMap = { high: 20, medium: 10, low: 5 };
        const catalystMap = {};
        for (const c of catalysts) {
            for (const sym of (c.relatedSymbols || [])) {
                if (!symbols.includes(sym)) continue;
                const ageHours = (Date.now() - new Date(c.date).getTime()) / (1000 * 60 * 60);
                const decay = Math.exp(-ageHours / 48);
                const base = baseMap[c.severity] || 0;
                const multiplier = c.verified ? 1.5 : 1;
                const impact = base * multiplier * decay;
                if (!catalystMap[sym]) catalystMap[sym] = { score: 0, items: [] };
                catalystMap[sym].score += impact;
                catalystMap[sym].items.push(c);
            }
        }

        // Fetch momentum (today vs yesterday) for symbols in one aggregation
        const startToday = new Date(now);
        startToday.setUTCHours(0,0,0,0);
        const startYesterday = new Date(startToday);
        startYesterday.setUTCDate(startToday.getUTCDate() - 1);

        const momentumAgg = await SearchLog.aggregate([
            { $match: { symbol: { $in: symbols }, searchedAt: { $gte: startYesterday } } },
            {
                $group: {
                    _id: '$symbol',
                    todayCount: { $sum: { $cond: [{ $gte: ['$searchedAt', startToday] }, 1, 0] } },
                    yesterdayCount: { $sum: { $cond: [{ $and: [{ $gte: ['$searchedAt', startYesterday] }, { $lt: ['$searchedAt', startToday] }] }, 1, 0] } }
                }
            }
        ]);

        const momentumMap = {};
        for (const m of momentumAgg) {
            const today = m.todayCount || 0;
            const yesterday = m.yesterdayCount || 0;
            const momentum = Math.max(0, today - yesterday) * 2;
            momentumMap[m._id] = { today, yesterday, momentum };
        }

        // Combine scores and attach breakdowns
        const combined = data.map(item => {
            const sym = item.symbol;
            const searchScore = Number(item.searchScore || 0);
            const catalystInfo = catalystMap[sym] || { score: 0, items: [] };
            const catalystScore = Number(catalystInfo.score || 0);
            const topCatalysts = (catalystInfo.items || []).sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0,3).map(c => ({ title: c.title, severity: c.severity, verified: c.verified, date: c.date }));
            const mom = momentumMap[sym]?.momentum || 0;
            const finalScore = +(searchScore + catalystScore + mom).toFixed(4);
            return {
                symbol: sym,
                category: item.category,
                score: finalScore,
                breakdown: {
                    search: searchScore,
                    catalyst: +catalystScore.toFixed(4),
                    momentum: mom
                },
                dailyCount: item.dailyCount,
                weeklyCount: item.weeklyCount,
                lastSearchedAt: item.lastSearchedAt,
                catalysts: topCatalysts
            };
        });

        // Sort by final score
        combined.sort((a,b) => b.score - a.score);

        const result = combined.slice(0, limit);

        return res.json({
            success: true,
            category: category || 'all',
            source: source || 'all',
            formula: 'search: daily*3 + weekly*0.7; catalyst: sum(eventBase*verifiedMultiplier*decay); momentum: max(0,today-yesterday)*2',
            data: result
        });
    } catch (error) {
        console.error('Failed to fetch trending searches:', error);
        return res.status(500).json({ error: 'Failed to fetch trending searches' });
    }
};

const getTrendingForSymbol = async (req, res) => {
    try {
        const raw = String(req.params.symbol || '').trim().toUpperCase();
        const symbol = normalizeSymbol(raw);
        if (!symbol) return res.status(400).json({ error: 'Symbol required' });

        const now = new Date();
        const dailyFrom = getWindowStart('daily', now);
        const weeklyFrom = getWindowStart('weekly', now);

        // compute daily and weekly counts for the symbol
        const agg = await SearchLog.aggregate([
            { $match: { symbol } },
            {
                $group: {
                    _id: '$symbol',
                    dailyCount: { $sum: { $cond: [{ $gte: ['$searchedAt', dailyFrom] }, 1, 0] } },
                    weeklyCount: { $sum: { $cond: [{ $gte: ['$searchedAt', weeklyFrom] }, 1, 0] } }
                }
            }
        ]);

        const stats = agg[0] || { dailyCount: 0, weeklyCount: 0 };
        const searchScore = (stats.dailyCount || 0) * 3 + (stats.weeklyCount || 0) * 0.7;

        // catalysts for this symbol
        const baseMap = { high: 20, medium: 10, low: 5 };
        const catalysts = await Catalyst.find({ relatedSymbols: symbol, date: { $gte: weeklyFrom } }).sort({ date: -1 }).limit(10).lean();
        let catalystScore = 0;
        const catalystItems = [];
        for (const c of catalysts) {
            const ageHours = (Date.now() - new Date(c.date).getTime()) / (1000 * 60 * 60);
            const decay = Math.exp(-ageHours / 48);
            const base = baseMap[c.severity] || 0;
            const multiplier = c.verified ? 1.5 : 1;
            const impact = base * multiplier * decay;
            catalystScore += impact;
            catalystItems.push({ title: c.title, severity: c.severity, verified: c.verified, date: c.date });
        }

        // momentum
        const startToday = new Date(now);
        startToday.setUTCHours(0,0,0,0);
        const startYesterday = new Date(startToday);
        startYesterday.setUTCDate(startToday.getUTCDate() - 1);

        const momAgg = await SearchLog.aggregate([
            { $match: { symbol, searchedAt: { $gte: startYesterday } } },
            {
                $group: {
                    _id: '$symbol',
                    todayCount: { $sum: { $cond: [{ $gte: ['$searchedAt', startToday] }, 1, 0] } },
                    yesterdayCount: { $sum: { $cond: [{ $and: [{ $gte: ['$searchedAt', startYesterday] }, { $lt: ['$searchedAt', startToday] }] }, 1, 0] } }
                }
            }
        ]);

        const momRow = momAgg[0] || { todayCount: 0, yesterdayCount: 0 };
        const momentum = Math.max(0, (momRow.todayCount || 0) - (momRow.yesterdayCount || 0)) * 2;

        const finalScore = +(searchScore + catalystScore + momentum).toFixed(4);

        return res.json({
            success: true,
            symbol,
            score: finalScore,
            breakdown: {
                search: +searchScore.toFixed(4),
                catalyst: +catalystScore.toFixed(4),
                momentum
            },
            catalysts: catalystItems.slice(0,3)
        });
    } catch (error) {
        console.error('Failed to compute trending for symbol:', error);
        return res.status(500).json({ error: 'Failed to compute trending for symbol' });
    }
};

module.exports = {
    trackSearch,
    getMostSearched,
    getTrending,
    getTrendingForSymbol,
    normalizeSymbol
};

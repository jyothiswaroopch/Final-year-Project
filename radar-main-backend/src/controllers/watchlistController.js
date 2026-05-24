const Watchlist = require('../models/Watchlist');
const { evaluateRecentChanges } = require('../services/recentChangesEngine');
const freeApiAggregator = require('../services/freeApiAggregator');
const { getTechnicalIndicators } = require('../services/indicatorService');

const getWatchlists = async (req, res) => {
    try {
        let watchlists = await Watchlist.find({ userId: req.user._id });
        if (watchlists.length === 0) {
            const defaultWatchlist = new Watchlist({
                userId: req.user._id,
                name: 'My Watchlist',
                items: []
            });
            await defaultWatchlist.save();
            watchlists = [defaultWatchlist];
        }
        res.json(watchlists);
    } catch (error) {
        console.error("Watchlist GET Error:", error);
        res.status(500).json({ error: "Failed to fetch watchlists", details: error.message });
    }
};

const createWatchlist = async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });

    try {
        const watchlist = new Watchlist({
            userId: req.user._id,
            name,
            items: []
        });
        await watchlist.save();
        res.status(201).json(watchlist);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: "Watchlist with this name already exists" });
        }
        res.status(500).json({ error: "Failed to create watchlist" });
    }
};

const addToWatchlist = async (req, res) => {
    const { id } = req.params;
    const { symbol } = req.body;

    if (!symbol) return res.status(400).json({ error: "Symbol is required" });

    try {
        const watchlist = await Watchlist.findOne({ _id: id, userId: req.user._id });
        if (!watchlist) return res.status(404).json({ error: "Watchlist not found" });

        const exists = watchlist.items.some(item => item.symbol === symbol.toUpperCase());
        if (exists) return res.status(400).json({ error: "Stock already in watchlist" });

        watchlist.items.push({ symbol: symbol.toUpperCase() });
        await watchlist.save();
        res.json(watchlist);
    } catch (error) {
        console.error("addToWatchlist error:", error);
        res.status(500).json({ error: error.message || "Failed to add to watchlist" });
    }
};

const removeFromWatchlist = async (req, res) => {
    const { id, symbol } = req.params;

    try {
        const watchlist = await Watchlist.findOne({ _id: id, userId: req.user._id });
        if (!watchlist) return res.status(404).json({ error: "Watchlist not found" });

        watchlist.items = watchlist.items.filter(item => item.symbol !== symbol.toUpperCase());
        await watchlist.save();
        res.json(watchlist);
    } catch (error) {
        res.status(500).json({ error: "Failed to remove from watchlist" });
    }
};

const getRecentChanges = async (req, res) => {
    try {
        const symbols = Array.isArray(req.body?.symbols) ? req.body.symbols : [];
        const data = await evaluateRecentChanges(symbols);
        return res.json({ success: true, data });
    } catch (error) {
        console.error("Watchlist recent-changes Error:", error);
        return res.status(500).json({ success: false, error: "Failed to evaluate recent changes", details: error.message });
    }
};

// GET /api/watchlist/data?symbols=TCS,INFY,RELIANCE
// Returns live quote + indicators for each symbol for the Research Watchlist
const getWatchlistData = async (req, res) => {
    try {
        const raw = String(req.query.symbols || '');
        const symbols = raw.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
        if (!symbols.length) return res.json({ success: true, data: [] });

        const results = await Promise.allSettled(
            symbols.map(async (sym) => {
                try {
                    const nseSym = sym.includes('.') ? sym : `${sym}.NS`;
                    // Fetch quote and indicators in parallel
                    const [quoteResult, indicatorsResult] = await Promise.allSettled([
                        freeApiAggregator.getQuote(nseSym),
                        getTechnicalIndicators('stock', sym, '1D'),  // FIX: correct arg order
                    ]);

                    // freeApiAggregator returns { success, data: {...} } — unwrap .data
                    const rawQuote = quoteResult.status === 'fulfilled' ? quoteResult.value : null;
                    const q = rawQuote?.success ? (rawQuote.data ?? rawQuote) : null;
                    const ind = indicatorsResult.status === 'fulfilled' ? indicatorsResult.value : {};

                    // .current is the main field from yahoo/twelvedata, also try .price/.ltp/.close
                    const price = Number(q?.current ?? q?.price ?? q?.ltp ?? q?.close ?? 0) || null;
                    const changePercent = Number(q?.changePercent ?? q?.percentChange ?? q?.change ?? 0) || 0;
                    const rsi = ind?.rsi ?? null;
                    const macd = ind?.macd ?? null;

                    // Derive trend label from RSI
                    let trend = 'Neutral';
                    if (rsi !== null) {
                        if (rsi > 60) trend = 'Bullish';
                        else if (rsi < 40) trend = 'Bearish';
                    }

                    // Derive signals
                    const signals = [];
                    if (ind?.volumeStatus === 'spike') signals.push('Volume Spike');
                    if (rsi !== null && rsi < 30) signals.push('Oversold');
                    if (rsi !== null && rsi > 70) signals.push('Overbought');
                    if (ind?.breakoutReady) signals.push('Breakout Ready');

                    return {
                        symbol: sym,
                        name: q?.name || q?.shortName || q?.companyName || sym,
                        price,
                        changePercent,
                        volume: q?.volume ?? null,
                        rsi,
                        macd,
                        ema20: ind?.ema20 ?? null,
                        trend,
                        signals,
                        sentiment: trend,
                        technicalSignal: ind?.signal || (rsi !== null ? `RSI ${Math.round(rsi)}` : 'Live'),
                        source: rawQuote?.source || q?.priceSource || q?.provider || 'yahoo',
                        sector: q?.sector || q?.industry || 'Equity',
                        exchange: 'NSE',
                        indicatorsReady: rsi !== null && macd !== null,
                        // No .error field = the frontend will show price normally
                    };
                } catch (err) {
                    return {
                        symbol: sym,
                        name: sym,
                        price: null,
                        changePercent: null,
                        rsi: null,
                        macd: null,
                        trend: 'Neutral',
                        signals: [],
                        error: 'Feed error',
                    };
                }
            })
        );

        const data = results.map(r => r.status === 'fulfilled' ? r.value : { symbol: '?', price: null, error: 'Failed' });
        return res.json({ success: true, data });
    } catch (error) {
        console.error('getWatchlistData Error:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch watchlist data', details: error.message });
    }
};

module.exports = { getWatchlists, createWatchlist, addToWatchlist, removeFromWatchlist, getRecentChanges, getWatchlistData };

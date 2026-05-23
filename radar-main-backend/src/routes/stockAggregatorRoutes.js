/**
 * stockAggregatorRoutes.js
 *
 * GET /api/stock/:symbol
 *
 * Aggregated single-stock data endpoint used by TraderStockPage.
 * Combines: price/quote + technicals + fundamentals + company profile +
 *           pivot points + derivatives snapshot + volume analysis +
 *           institutional activity estimate.
 *
 * Response shape:
 * {
 *   success: true,
 *   data: {
 *     quote: { price, changePercent, change, open, high, low, previousClose, volume, marketCap, peRatio, name, ... },
 *     companyProfile: { name, sector, industry, website, summary, ... },
 *     technicals: { rsi, macd: { hist, signal }, vwap, atr, emas: { ema20, ema50, cross }, rvol },
 *     fundamentals: { peRatio, ratios: { pbRatio, roe, roa, netProfitMargin, revenueGrowth, debtToEquity, currentRatio, enterpriseValueToEbitda } },
 *     news: [],
 *     pivots: { pivotPoint, r1, r2, r3, s1, s2, s3 },
 *     derivatives: { pcr, oi, futuresBias, maxPain, oiChange },
 *     volumeAnalysis: { deliveryRate, rvol, blockTradesCount, volumeSpikeState, accDistState, volatilityState },
 *     institutionalActivity: { fiiFlow, diiFlow, buyPressure, sellPressure, zones }
 *   }
 * }
 */

const express = require('express');
const router = express.Router();
const logger = require('../config/logger');
const { getFundamentals } = require('../services/fundamentalsEnrichmentService');
const { getTechnicalIndicators } = require('../services/indicatorService');
const yahooFinanceService = require('../services/yahooFinanceService');
const freeApiAggregator = require('../services/freeApiAggregator');
const OHLC = require('../models/OHLC');

// ── helpers ──────────────────────────────────────────────────────────────────

const num = (v, dp = 2) =>
    v != null && Number.isFinite(Number(v)) ? parseFloat(Number(v).toFixed(dp)) : null;

const normalizeSymbol = (sym) => {
    const s = String(sym || '').trim().toUpperCase().replace(/^NSE:/i, '');
    if (!s) return s;
    const CRYPTO_SYMBOLS = new Set(['BTC','ETH','SOL','XRP','BNB','ADA','DOT','DOGE','MATIC','LINK','AVAX','ATOM','LTC','UNI','SHIB','TRX']);
    const bare = s.replace(/\.(NS|BO)$/i, '');
    if (CRYPTO_SYMBOLS.has(bare)) return bare;
    if (/\.(NS|BO)$/i.test(s)) return s;
    if (s.startsWith('^') || s.includes('NIFTY') || s.includes('SENSEX')) return s;
    return `${s}.NS`;
};

/**
 * Compute standard pivot points (Classic method) from a candle's O/H/L/C.
 */
const computePivots = (open, high, low, close) => {
    const o = Number(open) || close;
    const h = Number(high) || close;
    const l = Number(low)  || close;
    const c = Number(close);
    const pp = (h + l + c) / 3;
    return {
        pivotPoint: num(pp),
        r1: num(2 * pp - l),
        r2: num(pp + (h - l)),
        r3: num(h + 2 * (pp - l)),
        s1: num(2 * pp - h),
        s2: num(pp - (h - l)),
        s3: num(l - 2 * (h - pp)),
    };
};

/**
 * Fetch quote data: Yahoo intraday → OHLC MongoDB → freeApiAggregator
 */
const fetchQuoteData = async (rawSymbol) => {
    const yahooSym = normalizeSymbol(rawSymbol);
    const cleanSym = yahooSym.replace(/\.(NS|BO)$/i, '');

    let price = 0, changePercent = 0, prevClose = 0;
    let open = null, high = null, low = null, volume = null;
    let sparklineData = [];
    let priceSource = 'unknown';

    // 1. Yahoo Finance intraday
    try {
        const [intraRes, dailyRes] = await Promise.all([
            yahooFinanceService.fetchHistoricalData(yahooSym, '15m', '5d'),
            yahooFinanceService.fetchHistoricalData(yahooSym, '1d', '5d'),
        ]);

        if (intraRes?.success && intraRes.data?.length > 0) {
            priceSource = 'yahoo';
            const intra = intraRes.data;
            const latest = intra[intra.length - 1];
            price = latest.close;

            if (dailyRes?.success && dailyRes.data?.length > 0) {
                const daily = dailyRes.data;
                const latestD = daily[daily.length - 1];
                const prevD   = daily.length > 1 ? daily[daily.length - 2] : latestD;
                prevClose = prevD.close;
                high      = latestD.high;
                low       = latestD.low;
                open      = latestD.open;
                volume    = latestD.volume;
            } else {
                prevClose = intra.length > 1 ? intra[intra.length - 2].close : price;
                high = latest.high; low = latest.low; open = latest.open; volume = latest.volume;
            }

            changePercent = prevClose > 0 ? ((price - prevClose) / prevClose) * 100 : 0;
            sparklineData = intra.slice(-35).map(c => ({ value: c.close, timestamp: c.timestamp }));
        }
    } catch (e) {
        logger.warn(`[stockAggregator] Yahoo fetch failed for ${yahooSym}: ${e.message}`);
    }

    // 2. MongoDB OHLC fallback
    if (priceSource === 'unknown') {
        try {
            const candles = await OHLC.find({
                symbol: { $in: [cleanSym, yahooSym] },
                timeframe: '1d',
            }).sort({ timestamp: -1 }).limit(35).lean();

            if (candles?.length > 0) {
                priceSource = 'mongodb-ohlc';
                const sorted = candles.reverse();
                const lat = sorted[sorted.length - 1];
                const prev = sorted.length > 1 ? sorted[sorted.length - 2] : lat;
                price = lat.close; prevClose = prev.close;
                high = lat.high; low = lat.low; open = lat.open; volume = lat.volume;
                changePercent = prevClose > 0 ? ((price - prevClose) / prevClose) * 100 : 0;
                sparklineData = sorted.map(c => ({ value: c.close, timestamp: c.timestamp }));
            }
        } catch (e) {
            logger.warn(`[stockAggregator] OHLC fallback failed for ${cleanSym}: ${e.message}`);
        }
    }

    // 3. freeApiAggregator fallback
    if (priceSource === 'unknown') {
        try {
            const agg = await freeApiAggregator.getQuote(yahooSym);
            if (agg?.success && agg.data) {
                const d = agg.data;
                price         = Number(d.current ?? d.price ?? d.close ?? d.ltp ?? 0);
                changePercent = Number(d.changePercent ?? d.change ?? 0);
                prevClose     = Number(d.previousClose ?? price);
                high          = d.high ?? null;
                low           = d.low  ?? null;
                open          = d.open ?? null;
                volume        = d.volume ?? null;
                priceSource   = agg.source || 'aggregator';
            }
        } catch (e) {
            logger.warn(`[stockAggregator] Aggregator fallback failed for ${yahooSym}: ${e.message}`);
        }
    }

    return { price, changePercent, prevClose, open, high, low, volume, sparklineData, priceSource };
};

// ── Main aggregator route ─────────────────────────────────────────────────────

router.get('/:symbol', async (req, res) => {
    const rawSymbol = String(req.params.symbol || '').trim().toUpperCase();
    if (!rawSymbol) {
        return res.status(400).json({ success: false, message: 'Symbol is required' });
    }

    try {
        // Run price fetch and fundamentals in parallel (technicals need price history)
        const [quoteData, fundamentals] = await Promise.all([
            fetchQuoteData(rawSymbol),
            getFundamentals(rawSymbol, 0).catch(e => {
                logger.warn(`[stockAggregator] Fundamentals failed for ${rawSymbol}: ${e.message}`);
                return {};
            }),
        ]);

        const { price, changePercent, prevClose, open, high, low, volume, sparklineData, priceSource } = quoteData;

        // Technicals (computed from historical data)
        let techData = null;
        try {
            techData = await getTechnicalIndicators('stock', normalizeSymbol(rawSymbol), '1D');
        } catch (e) {
            logger.warn(`[stockAggregator] Technicals failed for ${rawSymbol}: ${e.message}`);
        }

        // ── Compute VWAP approximation from sparkline ──────────────────────
        let vwap = null;
        if (sparklineData.length > 0) {
            const avg = sparklineData.reduce((sum, c) => sum + (c.value || 0), 0) / sparklineData.length;
            vwap = num(avg);
        }

        // ── MACD shape: convert indicatorService format → frontend format ──
        let macdFormatted = { hist: null, signal: 'Neutral' };
        if (techData?.macd) {
            const hist = num(techData.macd.value, 2);
            const sigLine = num(techData.macd.signal, 2);
            let sigLabel = 'Neutral';
            if (hist != null && sigLine != null) {
                sigLabel = hist > sigLine ? 'Bullish Crossover' : 'Bearish Crossover';
            }
            macdFormatted = { hist: hist ?? 0, signal: sigLabel, line: hist, signalLine: sigLine };
        }

        // ── EMA cross ──────────────────────────────────────────────────────
        const ema20 = num(techData?.ema20) ?? (price ? num(price * 0.995) : null);
        const ema50 = ema20 ? num(ema20 * 0.985) : null;
        const emaCross = (ema20 && ema50)
            ? (ema20 > ema50 ? 'Bullish' : 'Bearish')
            : 'Neutral';

        // ── Relative Volume (RVOL) estimate ────────────────────────────────
        const avgVol = Number(fundamentals?.averageVolume ?? 0);
        const curVol = Number(volume ?? 0);
        const rvol = (avgVol > 0 && curVol > 0) ? num(curVol / avgVol, 2) : null;

        // ── ATR ────────────────────────────────────────────────────────────
        const atr = num(techData?.atr);

        // ── Pivots ─────────────────────────────────────────────────────────
        const pivots = (open && high && low && price)
            ? computePivots(open, high, low, price)
            : {
                pivotPoint: num(price),
                r1: num(price ? price * 1.01 : null),
                r2: num(price ? price * 1.025 : null),
                r3: num(price ? price * 1.04 : null),
                s1: num(price ? price * 0.99 : null),
                s2: num(price ? price * 0.975 : null),
                s3: num(price ? price * 0.96 : null),
            };

        // ── Support / Resistance ───────────────────────────────────────────
        const support    = num(techData?.support)    ?? pivots.s1;
        const resistance = num(techData?.resistance) ?? pivots.r1;

        // ── Assemble response ──────────────────────────────────────────────
        const quote = {
            price:         num(price)          ?? 0,
            changePercent: num(changePercent, 4),
            change:        num(changePercent, 4),
            open:          num(open),
            high:          num(high),
            low:           num(low),
            previousClose: num(prevClose),
            volume:        volume ?? null,
            marketCap:     fundamentals?.marketCap ?? null,
            peRatio:       fundamentals?.pe ?? null,
            fiftyTwoWeekHigh: fundamentals?.fiftyTwoWeekHigh ?? null,
            fiftyTwoWeekLow:  fundamentals?.fiftyTwoWeekLow  ?? null,
            beta:          fundamentals?.beta ?? null,
            dividendYield: fundamentals?.dividendYield ?? null,
            name:          fundamentals?.longName ?? rawSymbol,
            priceSource,
        };

        const companyProfile = {
            name:     fundamentals?.longName    ?? fundamentals?.shortName ?? rawSymbol,
            sector:   fundamentals?.sector      ?? null,
            industry: fundamentals?.industry    ?? null,
            country:  fundamentals?.country     ?? 'IN',
            website:  fundamentals?.website     ?? null,
            summary:  fundamentals?.longBusinessSummary ?? null,
        };

        const technicals = {
            rsi:  num(techData?.rsi, 2),
            macd: macdFormatted,
            vwap,
            atr,
            emas: {
                ema20,
                ema50,
                cross: emaCross,
            },
            rvol:   rvol ?? null,
            support,
            resistance,
            bollinger: techData?.bollinger ?? null,
            volumeStatus: techData?.volumeStatus ?? null,
        };

        const fundamentalsOut = {
            peRatio: fundamentals?.pe ?? null,
            fiftyTwoWeekHigh: fundamentals?.fiftyTwoWeekHigh ?? null,
            fiftyTwoWeekLow:  fundamentals?.fiftyTwoWeekLow  ?? null,
            ratios: {
                pbRatio:                   fundamentals?.pb              ?? null,
                roe:                       fundamentals?.roe             ?? null,
                roa:                       fundamentals?.roa             ?? null,
                netProfitMargin:           fundamentals?.profitMargins   ?? null,
                operatingMargins:          fundamentals?.operatingMargins ?? null,
                grossMargins:              fundamentals?.grossMargins    ?? null,
                revenueGrowth:             fundamentals?.revenueGrowth   ?? null,
                earningsGrowth:            fundamentals?.earningsGrowth  ?? null,
                debtToEquity:              fundamentals?.debtToEquity    ?? null,
                currentRatio:              fundamentals?.currentRatio    ?? null,
                enterpriseValueToEbitda:   fundamentals?.evEbitda        ?? null,
            },
        };

        // Derivatives: placeholder (real F&O data would come from NSE/Zerodha feed)
        const derivatives = {
            pcr:         null,
            oi:          null,
            futuresBias: null,
            maxPain:     null,
            oiChange:    null,
        };

        // Volume analysis: built from what we know
        const deliveryPct = fundamentals?.deliveryPct ?? null;
        const volumeAnalysis = {
            deliveryRate:     deliveryPct ? num(deliveryPct / 100, 3) : null,
            rvol:             rvol ?? null,
            blockTradesCount: null,
            volumeSpikeState: rvol != null ? (rvol > 2 ? 'High Volume Surge' : rvol > 1.5 ? 'Moderate Surge' : 'Normal') : null,
            accDistState:     (changePercent ?? 0) > 0 ? 'Accumulation' : 'Distribution',
            volatilityState:  atr != null && price > 0 ? num((atr / price) * 100, 2) + '%' : null,
        };

        // Institutional activity: not available from free providers
        const institutionalActivity = {
            fiiFlow:     null,
            diiFlow:     null,
            buyPressure: null,
            sellPressure: null,
            zones:       null,
        };

        return res.json({
            success: true,
            data: {
                quote,
                companyProfile,
                technicals,
                fundamentals: fundamentalsOut,
                news:         [],          // News is fetched separately by the frontend (Finnhub direct)
                pivots,
                derivatives,
                volumeAnalysis,
                institutionalActivity,
                meta: {
                    symbol:      rawSymbol,
                    priceSource,
                    fetchedAt:   new Date().toISOString(),
                },
            },
        });
    } catch (err) {
        logger.error(`[stockAggregator] Unhandled error for ${rawSymbol}: ${err.message}`, err);
        return res.status(500).json({ success: false, message: 'Failed to fetch stock data', error: err.message });
    }
});

module.exports = router;

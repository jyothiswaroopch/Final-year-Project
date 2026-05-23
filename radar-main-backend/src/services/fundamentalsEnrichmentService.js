/**
 * fundamentalsEnrichmentService.js
<<<<<<< HEAD
 *
 * Fetch strategy:
 *   1. MongoDB (FundamentalsSnapshot) — served instantly if < 24h old
 *   2. Yahoo Finance quoteSummary    — on cache miss or forced refresh
 *   3. Persist to MongoDB            — so next call hits DB
 *   4. In-memory NodeCache (6 h)     — hot-path layer within same process
 *
 * Fields stored:
 *   pe, forwardPe, pb, ps, evEbitda, peg
 *   roe, roa, profitMargins, operatingMargins, grossMargins
 *   revenueGrowth, earningsGrowth
 *   debtToEquity, currentRatio, quickRatio
 *   marketCap, beta, dividendYield, payoutRatio
 *   fiftyTwoWeekHigh, fiftyTwoWeekLow
 *   volumeRatio, averageVolume
 *   sector, industry, country, longBusinessSummary, website
 *   valStatus, deliveryPct, asOf
=======
>>>>>>> repo2/main
 */

const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });
const NodeCache    = require('node-cache');
const logger       = require('../config/logger');
const FundamentalsSnapshot = require('../models/FundamentalsSnapshot');

<<<<<<< HEAD
// In-memory hot layer — avoids repeated Mongo queries for same symbol within same process
const memCache = new NodeCache({ stdTTL: 6 * 60 * 60, checkperiod: 30 * 60 });

// How old a DB snapshot can be before we consider it stale (default 24 h)
const DB_STALE_HOURS = Number(process.env.FUNDAMENTALS_STALE_HOURS || 24);
=======
const cache = new NodeCache({ stdTTL: 6 * 60 * 60, checkperiod: 60 * 30 });
>>>>>>> repo2/main

const CRYPTO_SYMBOLS = new Set([
    'BTC','ETH','SOL','XRP','BNB','ADA','DOT','DOGE','MATIC','LINK',
    'AVAX','ATOM','LTC','UNI','SHIB','TRX','ETC','FIL','NEAR','APT',
    'ARB','OP','INJ','SUI','SEI','PEPE','WIF','TON','FLOKI','BONK',
]);

const isCryptoSymbol = (symbol) => {
    const s = String(symbol || '').toUpperCase().replace(/USDT$/i, '').replace(/\.(NS|BO)$/i, '');
    return CRYPTO_SYMBOLS.has(s) || String(symbol).toUpperCase().endsWith('USDT');
};

<<<<<<< HEAD
const normalizeSymbol = (symbol) => {
=======
function normalizeSymbol(symbol) {
>>>>>>> repo2/main
    const s = String(symbol || '').trim().toUpperCase();
    if (isCryptoSymbol(s)) return s;
    if (s.endsWith('.NS') || s.endsWith('.BO')) return s;
    return `${s}.NS`;
};

<<<<<<< HEAD
const classifyValuation = (pe) => {
=======
function classifyValuation(pe) {
>>>>>>> repo2/main
    if (pe == null || isNaN(pe)) return 'fair';
    if (pe < 15) return 'undervalued';
    if (pe > 35) return 'overvalued';
    return 'fair';
};

const pct = (v) => (v != null ? parseFloat((v * 100).toFixed(2)) : null);
const num = (v, dp = 2) => (v != null && Number.isFinite(Number(v)) ? parseFloat(Number(v).toFixed(dp)) : null);

// ── Crypto null-safe object ───────────────────────────────────────────────────
const CRYPTO_SNAPSHOT = (changePercent = 0) => ({
    pe: null, forwardPe: null, pb: null, ps: null, evEbitda: null, peg: null,
    roe: null, roa: null, profitMargins: null, operatingMargins: null, grossMargins: null,
    revenueGrowth: null, earningsGrowth: null, earningsQuarterlyGrowth: null,
    debtToEquity: null, currentRatio: null, quickRatio: null,
    marketCap: null, beta: null, dividendYield: null, payoutRatio: null,
    fiftyTwoWeekHigh: null, fiftyTwoWeekLow: null,
    volumeRatio: 1, averageVolume: null,
    sector: 'Cryptocurrency', industry: 'Digital Assets', country: null,
    longBusinessSummary: null, fullTimeEmployees: null, website: null,
    valStatus: 'fair', deliveryPct: null,
    momentum: changePercent,
    asOf: new Date(),
    source: 'yahoo',
});

// ── Fetch fresh data from Yahoo Finance ──────────────────────────────────────
async function fetchFromYahoo(yahooSym, changePercent = 0) {
    const summary = await yahooFinance.quoteSummary(yahooSym, {
        modules: ['summaryDetail', 'defaultKeyStatistics', 'financialData', 'assetProfile'],
    });

    const sd = summary?.summaryDetail        || {};
    const ks = summary?.defaultKeyStatistics || {};
    const fd = summary?.financialData        || {};
    const ap = summary?.assetProfile         || {};

    const shortPct = ks.shortPercentOfFloat;
    const deliveryPct = shortPct != null ? parseFloat((Math.max(0, (1 - shortPct) * 100)).toFixed(1)) : null;

    const price = sd.regularMarketPrice;
    const ma50  = sd.fiftyDayAverage;
    const momentum = price && ma50 && ma50 !== 0
        ? parseFloat(((price - ma50) / ma50 * 100).toFixed(2))
        : changePercent;

    return {
        pe:              num(sd.trailingPE ?? ks.trailingPE, 1),
        forwardPe:       num(sd.forwardPE  ?? ks.forwardPE, 1),
        pb:              num(sd.priceToBook ?? ks.priceToBook, 2),
        ps:              num(ks.priceToSalesTrailing12Months, 2),
        evEbitda:        num(ks.enterpriseToEbitda, 2),
        peg:             num(ks.pegRatio, 2),

        roe:             pct(fd.returnOnEquity),
        roa:             pct(fd.returnOnAssets),
        profitMargins:   pct(fd.profitMargins),
        operatingMargins: pct(fd.operatingMargins),
        grossMargins:    pct(fd.grossMargins),

        revenueGrowth:   pct(fd.revenueGrowth),
        earningsGrowth:  pct(fd.earningsGrowth),
        earningsQuarterlyGrowth: pct(ks.earningsQuarterlyGrowth),

        debtToEquity:    fd.debtToEquity != null ? parseFloat((fd.debtToEquity / 100).toFixed(2)) : null,
        currentRatio:    num(fd.currentRatio, 2),
        quickRatio:      num(fd.quickRatio, 2),

        marketCap:       num(sd.marketCap ?? ks.marketCap, 0),
        beta:            num(sd.beta, 2),
        dividendYield:   sd.dividendYield != null ? parseFloat((sd.dividendYield * 100).toFixed(2)) : null,
        payoutRatio:     pct(sd.payoutRatio),
        fiftyTwoWeekHigh: num(sd.fiftyTwoWeekHigh, 2),
        fiftyTwoWeekLow:  num(sd.fiftyTwoWeekLow, 2),

        volumeRatio:     sd.averageVolume10days > 0 && sd.averageVolume > 0
            ? parseFloat((sd.averageVolume10days / sd.averageVolume).toFixed(2))
            : 1,
        averageVolume:   num(sd.averageVolume, 0),

        sector:          ap.sector   || null,
        industry:        ap.industry || null,
        country:         ap.country  || null,
        longBusinessSummary: ap.longBusinessSummary || null,
        fullTimeEmployees: ap.fullTimeEmployees || null,
        website:         ap.website  || null,

        valStatus:       classifyValuation(sd.trailingPE ?? ks.trailingPE),
        deliveryPct,
        momentum,
        asOf:            new Date(),
        source:          'yahoo',
    };
}

<<<<<<< HEAD
// ── Persist to MongoDB ────────────────────────────────────────────────────────
async function persistToDb(symbol, data) {
=======
function approximateMomentum(summaryDetail, defaultChange = 0) {
>>>>>>> repo2/main
    try {
        await FundamentalsSnapshot.findOneAndUpdate(
            { symbol: String(symbol).toUpperCase() },
            { ...data, symbol: String(symbol).toUpperCase() },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        logger.debug(`[Fundamentals] Persisted ${symbol} to MongoDB`);
    } catch (err) {
        logger.warn(`[Fundamentals] DB persist failed for ${symbol}: ${err.message}`);
    }
}

<<<<<<< HEAD
// ── Main public function ──────────────────────────────────────────────────────
async function getFundamentals(symbol, changePercent = 0, { forceRefresh = false } = {}) {
=======
function approximateDelivery(defaultKeyStatistics) {
    try {
        const shortPct = defaultKeyStatistics?.shortPercentOfFloat;
        if (shortPct != null) {
            return parseFloat((Math.max(0, (1 - shortPct) * 100)).toFixed(1));
        }
    } catch (_) {}
    return 55;
}

async function getFundamentals(symbol, changePercent = 0) {
>>>>>>> repo2/main
    const yahooSym = normalizeSymbol(symbol);
    const dbKey    = String(symbol).toUpperCase().replace(/\.(NS|BO)$/i, '');
    const memKey   = `fund:${yahooSym}`;

<<<<<<< HEAD
    // Crypto: no fundamental data from Yahoo — return null-safe object
    if (isCryptoSymbol(symbol)) return CRYPTO_SNAPSHOT(changePercent);

    // ── Layer 1: In-memory (hot path) ─────────────────────────────────────
    if (!forceRefresh) {
        const hot = memCache.get(memKey);
        if (hot) return hot;
    }

    // ── Layer 2: MongoDB (warm path) ──────────────────────────────────────
    if (!forceRefresh) {
        try {
            const doc = await FundamentalsSnapshot.findOne({ symbol: dbKey }).lean();
            if (doc) {
                const ageHours = (Date.now() - new Date(doc.updatedAt || doc.asOf).getTime()) / 3_600_000;
                if (ageHours < DB_STALE_HOURS) {
                    const result = { ...doc, _id: undefined, __v: undefined };
                    memCache.set(memKey, result);
                    logger.debug(`[Fundamentals] DB hit for ${dbKey} (${ageHours.toFixed(1)}h old)`);
                    return result;
                }
                logger.info(`[Fundamentals] DB stale for ${dbKey} (${ageHours.toFixed(1)}h) — refreshing`);
            }
        } catch (err) {
            logger.warn(`[Fundamentals] DB lookup failed for ${dbKey}: ${err.message}`);
        }
    }
=======
    if (isCryptoSymbol(symbol)) {
        const ticker = symbol.replace(/\.(NS|BO)$/i, '');
        const seed = ticker.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return {
            pe: null, beta: 0.8 + (seed % 5) / 10, roe: 12 + (seed % 10), debtToEquity: null,
            priceToBook: 2.5 + (seed % 5) / 2, evToEbitda: 12.5 + (seed % 8),
            operatingMargins: 18.5 + (seed % 10), profitMargins: 10 + (seed % 12),
            revenueGrowth: 8 + (seed % 15), epsGrowth: 12 + (seed % 10), profitGrowth: 10 + (seed % 8),
            currentRatio: 1.8 + (seed % 5) / 10, interestCoverage: 5.5 + (seed % 10),
            deliveryPct: 45 + (seed % 30), momentum: changePercent || (seed % 10), volumeRatio: 1,
            sector: 'Cryptocurrency', industry: 'Digital Assets',
            marketCap: (500 + (seed % 500)) * 1000000,
            eps: 0.42, dividendYield: 0.0125 + (seed % 5) / 1000,
            bookValue: 3.15, valStatus: 'fair',
        };
    }

    const cached = cache.get(cacheKey);
    if (cached) return cached;
>>>>>>> repo2/main

    // ── Layer 3: Yahoo Finance (cold path) ────────────────────────────────
    try {
<<<<<<< HEAD
        logger.info(`[Fundamentals] Fetching from Yahoo Finance for ${yahooSym}`);
        const result = await fetchFromYahoo(yahooSym, changePercent);
        memCache.set(memKey, result);
        await persistToDb(dbKey, result); // fire-and-forget persist
        logger.info(`[Fundamentals] ✅ ${yahooSym}: PE=${result.pe}, ROE=${result.roe}%, MktCap=${result.marketCap}`);
=======
        const summary = await yahooFinance.quoteSummary(yahooSym, {
            modules: ['summaryDetail', 'defaultKeyStatistics', 'financialData', 'assetProfile'],
        });

        const sd  = summary?.summaryDetail        || {};
        const ks  = summary?.defaultKeyStatistics || {};
        const fd  = summary?.financialData        || {};
        const ap  = summary?.assetProfile         || {};

        const pe           = sd.trailingPE ?? ks.trailingPE ?? null;
        const beta         = sd.beta ?? null;
        const roe          = fd.returnOnEquity != null ? parseFloat((fd.returnOnEquity * 100).toFixed(2)) : null;
        const debtToEquity = fd.debtToEquity != null ? parseFloat((fd.debtToEquity / 100).toFixed(2)) : null;
        const revenueGrowth = fd.revenueGrowth != null ? parseFloat((fd.revenueGrowth * 100).toFixed(2)) : null;
        const operatingMargins = fd.operatingMargins != null ? parseFloat((fd.operatingMargins * 100).toFixed(2)) : null;
        const profitMargins = fd.profitMargins != null ? parseFloat((fd.profitMargins * 100).toFixed(2)) : null;
        const deliveryPct  = approximateDelivery(ks);
        const momentum     = approximateMomentum(sd, changePercent);
        const sector       = ap.sector   || 'Equity';
        const industry     = ap.industry || '';
        const marketCap    = sd.marketCap ?? ks.marketCap ?? null;
        const volumeRatio  = sd.averageVolume10days > 0 && sd.averageVolume > 0
            ? parseFloat((sd.averageVolume10days / sd.averageVolume).toFixed(2))
            : 1;

        const ticker = symbol.replace(/\.(NS|BO)$/i, '');
        const seed = ticker.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const isCrypto = isCryptoSymbol(symbol);

        const eps          = ks.trailingEps ?? ks.forwardEps ?? null;
        const dividendYield = sd.dividendYield ?? ks.dividendYield ?? null;
        const bookValue     = ks.bookValue ?? null;
        const evToEbitda    = ks.enterpriseToEbitda ?? null;
        const currentRatio  = ks.currentRatio ?? null;
        const interestCoverage = ks.interestCoverage ?? null;
        const epsGrowth     = ks.earningsQuarterlyGrowth ?? null;
        const profitGrowth  = ks.netIncomeQuarterlyGrowth ?? null;

        const result = {
            pe:            (pe != null) ? parseFloat(pe.toFixed(1)) : (isCrypto ? null : 15 + (seed % 20)),
            priceToBook:   (bookValue != null) ? parseFloat(bookValue.toFixed(2)) : (2.5 + (seed % 5) / 2),
            beta:          (beta != null) ? parseFloat(beta.toFixed(2)) : 0.8 + (seed % 5) / 10,
            roe:           (roe != null) ? roe : 12 + (seed % 10),
            debtToEquity:  (debtToEquity != null) ? debtToEquity : (isCrypto ? null : 0.1 + (seed % 10) / 20),
            evToEbitda:    (evToEbitda != null) ? evToEbitda : 12.5 + (seed % 8),
            operatingMargins: operatingMargins != null ? operatingMargins : 18.5 + (seed % 10),
            profitMargins: profitMargins != null ? profitMargins : 10 + (seed % 12),
            revenueGrowth: (revenueGrowth != null) ? revenueGrowth : 8 + (seed % 15),
            epsGrowth:     (epsGrowth != null) ? epsGrowth : 12 + (seed % 10),
            profitGrowth:  (profitGrowth != null) ? profitGrowth : 10 + (seed % 8),
            currentRatio:  (currentRatio != null) ? currentRatio : 1.8 + (seed % 5) / 10,
            interestCoverage: (interestCoverage != null) ? interestCoverage : 5.5 + (seed % 10),
            deliveryPct:   deliveryPct,
            momentum:      momentum,
            volumeRatio:   volumeRatio,
            sector:        sector,
            industry:      industry,
            marketCap:     marketCap != null ? marketCap : (500 + (seed % 500)) * 1000000,
            eps:           eps != null ? parseFloat(eps.toFixed(2)) : (isCrypto ? 0.42 : 42.5 + (seed % 10)),
            dividendYield: dividendYield != null ? parseFloat(dividendYield.toFixed(4)) : 0.0125 + (seed % 5) / 1000,
            bookValue:     bookValue != null ? parseFloat(bookValue.toFixed(2)) : (isCrypto ? 3.15 : 315 + (seed % 50)),
            valStatus:     classifyValuation(pe != null ? pe : (isCrypto ? null : 15 + (seed % 20))),
        };

        cache.set(cacheKey, result);
>>>>>>> repo2/main
        return result;
    } catch (err) {
<<<<<<< HEAD
        logger.warn(`[Fundamentals] Yahoo failed for ${yahooSym}: ${err.message}`);
        // Try returning stale DB data as last resort
        try {
            const stale = await FundamentalsSnapshot.findOne({ symbol: dbKey }).lean();
            if (stale) {
                logger.info(`[Fundamentals] Serving stale DB snapshot for ${dbKey}`);
                return stale;
            }
        } catch (_) {}
        // Hard null-safe fallback
        return {
            pe: null, forwardPe: null, pb: null, roe: null, debtToEquity: null,
            revenueGrowth: null, profitMargins: null, marketCap: null,
            beta: null, dividendYield: null, sector: 'Equity', industry: '',
            valStatus: 'fair', deliveryPct: null, momentum: changePercent,
            volumeRatio: 1, asOf: new Date(), source: 'fallback',
=======
        const ticker = symbol.replace(/\.(NS|BO)$/i, '');
        const seed = ticker.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const isCrypto = isCryptoSymbol(symbol);

        return {
            pe: isCrypto ? null : 15 + (seed % 20),
            priceToBook: 2.5 + (seed % 5) / 2,
            beta: 0.8 + (seed % 5) / 10,
            roe: 12 + (seed % 10),
            debtToEquity: isCrypto ? null : 0.1 + (seed % 10) / 20,
            evToEbitda: 12.5 + (seed % 8),
            operatingMargins: 18.5 + (seed % 10),
            profitMargins: 10 + (seed % 12),
            revenueGrowth: 8 + (seed % 15),
            epsGrowth: 12 + (seed % 10),
            profitGrowth: 10 + (seed % 8),
            currentRatio: 1.8 + (seed % 5) / 10,
            interestCoverage: 5.5 + (seed % 10),
            deliveryPct: 45 + (seed % 30),
            momentum: changePercent || (seed % 10),
            volumeRatio: 0.9 + (seed % 5) / 10,
            sector: isCrypto ? 'Cryptocurrency' : 'Equity',
            industry: isCrypto ? 'Digital Assets' : 'Diversified',
            marketCap: (500 + (seed % 500)) * 1000000,
            eps: isCrypto ? 0.42 : 42.5 + (seed % 10),
            dividendYield: 0.0125 + (seed % 5) / 1000,
            bookValue: isCrypto ? 3.15 : 315 + (seed % 50),
            valStatus: classifyValuation(15 + (seed % 20)),
>>>>>>> repo2/main
        };
    }
}

<<<<<<< HEAD
// ── Batch enrichment ─────────────────────────────────────────────────────────
async function getBatchFundamentals(items, concurrency = 3) {
    const results = new Map();
    const queue   = [...items];
    const worker  = async () => {
        let item;
        while ((item = queue.shift())) {
=======
async function getBatchFundamentals(items, concurrency = 3) {
    const results = new Map();
    const queue = [...items];
    async function worker() {
        while (queue.length > 0) {
            const item = queue.shift();
            if (!item) break;
>>>>>>> repo2/main
            const sym = item.symbol || item;
            const chg = item.changePercent || 0;
            results.set(sym, await getFundamentals(sym, chg));
        }
<<<<<<< HEAD
    };
=======
    }
>>>>>>> repo2/main
    await Promise.all(Array.from({ length: concurrency }, worker));
    return results;
}

module.exports = { getFundamentals, getBatchFundamentals, normalizeSymbol };

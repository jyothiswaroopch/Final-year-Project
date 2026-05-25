const {
    fetchStockData,
} = require('./stockService');
const { getTechnicalIndicators } = require('./indicatorService');
const { getInstrumentScore }     = require('./scoringService');
const yahooFinanceService        = require('./yahooFinanceService');
const FundamentalsSnapshot       = require('../models/FundamentalsSnapshot');
const logger                     = require('../config/logger');

const DEFAULT_LIMIT = 50;
const MAX_LIMIT     = 3000;

// ── Helpers ───────────────────────────────────────────────────────────────────
const normalizeSymbol  = (v) => String(v || '').trim().toUpperCase();
const stripSuffix      = (v) => normalizeSymbol(v).replace(/\.(NS|BO)$/i, '');

const toNumber = (value, fallback = NaN) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const isFiniteNum = (v) => Number.isFinite(Number(v));

/**
 * inRange — returns true when no filter is active for that field,
 * OR when the stock value satisfies the filter.
 * IMPORTANT: if a filter IS set but the stock value is NaN/null,
 * we SKIP the stock for that filter (don't silently drop it).
 * Changed: when ONLY maxPe is set (e.g. "PE < 20") and stock PE is null,
 * we let the stock through rather than hiding it — matching TradingView's
 * screener behaviour where missing data = not filtered out.
 */
const inRange = (value, min, max, { excludeOnMissing = false } = {}) => {
    const hasMin = isFiniteNum(min);
    const hasMax = isFiniteNum(max);
    if (!hasMin && !hasMax) return true;                      // no filter active
    if (!isFiniteNum(value)) return !excludeOnMissing;        // missing value — pass through by default
    if (hasMin && Number(value) < Number(min)) return false;
    if (hasMax && Number(value) > Number(max)) return false;
    return true;
};

// ── Signal classification ─────────────────────────────────────────────────────
/**
 * Derive a signal type from real technical values.
 * Priority: BREAKOUT > SQUEEZE > PULLBACK > REVERSAL > MOMENTUM
 */
const classifySignal = (row) => {
    const { rsi, score, changePercent, bias, volumeRatio, ema20, price } = row;

    if (rsi > 60 && changePercent > 1.5 && volumeRatio > 1.5) return 'BREAKOUT';
    if (rsi < 40 && changePercent > 0) return 'REVERSAL';
    if (rsi < 45 && changePercent < 0) return 'PULLBACK';
    if (rsi > 55 && rsi <= 70 && changePercent > 0) return 'MOMENTUM';

    // SQUEEZE: price near EMA20 with low volume (consolidation)
    if (ema20 && price && Math.abs((price - ema20) / ema20) < 0.015 && volumeRatio < 1.2) return 'SQUEEZE';

    // PULLBACK: price pulling back after uptrend (bias bullish but price down today)
    if (bias === 'bullish' && change < -0.5 && rsi >= 30 && rsi <= 50) return 'PULLBACK';

    // REVERSAL: deep oversold bouncing
    if (rsi < 35 && change > 0) return 'REVERSAL';

    // BREAKOUT (score-based): high confidence even without huge move
    if (score >= 75 && rsi >= 55) return 'BREAKOUT';

    // PULLBACK: bearish bias + RSI recovering from low
    if (bias === 'bearish' && rsi >= 25 && rsi < 40) return 'PULLBACK';

    return 'MOMENTUM';
};

const classifyStrength = (score, rsi, volumeRatio) => {
    if (score >= 80 || (rsi >= 60 && volumeRatio >= 2.0)) return 'Strong';
    if (score >= 65 || volumeRatio >= 1.5) return 'Medium';
    return 'Low';
};

const classifyTrend = (bias, rsi, change) => {
    if (bias === 'bullish' || (rsi > 55 && change >= 0)) return 'bullish';
    if (bias === 'bearish' || (rsi < 40 && change < 0)) return 'bearish';
    return 'neutral';
};

const classifyMacdBias = (bias, change) => {
    if (bias === 'bullish' || change > 0.5) return 'bullish';
    if (bias === 'bearish' || change < -0.5) return 'bearish';
    return 'neutral';
};

// ── Bulk load FundamentalsSnapshot from MongoDB ───────────────────────────────
/**
 * Returns a Map<cleanSymbol, snapshot> for all symbols with cached data.
 * Single query — avoids N+1 queries during screener run.
 */
const loadFundamentalsCache = async (symbols) => {
    const cleanSymbols = symbols.map(stripSuffix);
    try {
        const docs = await FundamentalsSnapshot.find(
            { symbol: { $in: cleanSymbols } },
            { symbol:1, pe:1, marketCap:1, sector:1, industry:1, roe:1,
              dividendYield:1, volumeRatio:1, beta:1, profitMargins:1,
              revenueGrowth:1, debtToEquity:1, valStatus:1 }
        ).lean();

        const map = new Map();
        docs.forEach(d => map.set(String(d.symbol).toUpperCase(), d));
        logger.info(`[Screener] FundamentalsSnapshot cache: ${docs.length}/${cleanSymbols.length} symbols found in DB`);
        return map;
    } catch (err) {
        logger.warn(`[Screener] FundamentalsSnapshot bulk load failed: ${err.message}`);
        return new Map();
    }
};

// ── Build row from Yahoo stock + DB snapshot ──────────────────────────────────
const buildRow = (stock, dbFund) => {
    const cleanSym = stripSuffix(stock.symbol);

    // Prefer DB snapshot over Yahoo's often-empty details
    const pe          = toNumber(dbFund?.pe ?? stock.details?.pe_ratio, NaN);
    const marketCapRaw = dbFund?.marketCap ?? null;
    const sector      = dbFund?.sector || stock.details?.sector || 'Equity';
    const roe         = toNumber(dbFund?.roe ?? stock.details?.roe, NaN);
    const divYield    = toNumber(dbFund?.dividendYield ?? stock.details?.dividend_yield, NaN);
    const volumeRatio = toNumber(dbFund?.volumeRatio, 1);

    return {
        symbol:          normalizeSymbol(stock.symbol),
        displaySymbol:   cleanSym,
        name:            stock.name || cleanSym,
        type:            stock.type || 'STOCK',
        price:           toNumber(stock.price, NaN),
        change:          toNumber(stock.change, NaN),
        changePercent:   toNumber(stock.changePercent, NaN),
        sector,
        pe,
        marketCap:       marketCapRaw,
        marketCapNumeric: isFiniteNum(marketCapRaw) ? Number(marketCapRaw) : NaN,
        roe,
        dividendYield:   divYield,
        volumeRatio,
        // Technical fields — filled in later by attachTechnicals
        rsi:             NaN,
        score:           NaN,
        bias:            'neutral',
        ema20:           null,
        macd:            null,
        technicalLive:   false,
    };
};

// ── Apply base (fundamental) filters ─────────────────────────────────────────
const applyBaseFilters = (rows, filters) => rows.filter((row) => {
    if (!inRange(row.price,           filters.minPrice,     filters.maxPrice))     return false;
    if (!inRange(row.changePercent,   filters.minChange,    filters.maxChange))    return false;
    if (!inRange(row.pe,              filters.minPe,        filters.maxPe))        return false;
    if (!inRange(row.marketCapNumeric, filters.minMarketCap, filters.maxMarketCap)) return false;
    if (!inRange(row.roe,             filters.minRoe,       filters.maxRoe))        return false;
    if (!inRange(row.dividendYield,   filters.minYield,     filters.maxYield))      return false;
    if (!inRange(row.volumeRatio,     filters.minRvol,      filters.maxRvol))       return false;

    if (filters.minVolume != null && isFiniteNum(filters.minVolume)) {
        if (!isFiniteNum(row.volume) || row.volume < Number(filters.minVolume)) return false;
    }

    if (Array.isArray(filters.sectors) && filters.sectors.length > 0) {
        const norm = filters.sectors.map(s => String(s || '').toLowerCase());
        if (!norm.includes(String(row.sector || '').toLowerCase())) return false;
    }

    if (Array.isArray(filters.symbols) && filters.symbols.length > 0) {
        const norm = filters.symbols.map(s => stripSuffix(s));
        if (!norm.includes(row.displaySymbol)) return false;
    }

    return true;
});

// ── Attach live technical indicators ─────────────────────────────────────────
const needsTechnicalData = (filters, sortBy) => {
    return filters.minRsi !== undefined || filters.maxRsi !== undefined ||
           filters.minScore !== undefined || filters.maxScore !== undefined ||
           filters.trendType !== undefined || (filters.signals && filters.signals.length > 0) ||
           sortBy === 'rsi' || sortBy === 'score';
};

const attachTechnicals = async (rows, strictLive) => {
    if (rows.length === 0) return [];
    
    // Protect against rate limits and timeouts:
    // If there are too many rows (e.g., Trader Screener requesting 3000), 
    // skip live technicals and return safe default values.
    if (rows.length > 200) {
        logger.warn(`[Screener] Skipping live technicals for ${rows.length} rows to prevent timeout.`);
        return rows.map(row => ({
            ...row,
            rsi: 50,
            ema20: null,
            macd: null,
            score: 60,
            bias: 'neutral',
            technicalLive: false
        }));
    }

    // Process in batches of 25 to avoid overwhelming the provider
    const results = [];
    const BATCH_SIZE = 25;
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        const batch = rows.slice(i, i + BATCH_SIZE);
        const batchResults = await Promise.all(batch.map(async (row) => {
            try {
                const [indicators, scoreResult] = await Promise.all([
                    getTechnicalIndicators('stock', row.displaySymbol, '1D', { strictLive }),
                    getInstrumentScore('stock', row.displaySymbol, { strictLive }),
                ]);

                return {
                    ...row,
                    rsi:   toNumber(indicators?.rsi, 50),
                    ema20: indicators?.ema20 ?? null,
                    macd:  indicators?.macd ?? null,
                    score: toNumber(scoreResult?.score, 60),
                    bias:  scoreResult?.bias || 'neutral',
                    technicalLive: true,
                };
            } catch (_) {
                return { ...row, rsi: 50, ema20: null, macd: null, score: 60, bias: 'neutral', technicalLive: false };
            }
        }));
        results.push(...batchResults);
    }
    return results;
};

// ── Apply technical filters ───────────────────────────────────────────────────
const applyTechnicalFilters = (rows, filters) => rows.filter((row) => {
    if (!inRange(row.rsi,   filters.minRsi,   filters.maxRsi))   return false;
    if (!inRange(row.score, filters.minScore, filters.maxScore)) return false;

    if (filters.trendType && filters.trendType !== 'all') {
        const rowTrend = classifyTrend(row.bias, row.rsi, row.changePercent);
        if (rowTrend !== filters.trendType) return false;
    }

    if (Array.isArray(filters.signals) && filters.signals.length > 0) {
        const rowSignal = classifySignal({ ...row, volumeRatio: row.volumeRatio });
        if (!filters.signals.includes(rowSignal)) return false;
    }

    return true;
});

// ── Sort ──────────────────────────────────────────────────────────────────────
const sortRows = (rows, sortBy, sortOrder) => {
    const field = String(sortBy || 'change').toLowerCase();
    const dir   = String(sortOrder || 'desc').toLowerCase() === 'asc' ? 1 : -1;

    const val = (row) => {
        switch (field) {
            case 'price':     return row.price;
            case 'rsi':       return row.rsi;
            case 'score':     return row.score;
            case 'pe':        return row.pe;
            case 'marketcap': return row.marketCapNumeric;
            case 'rvol':      return row.volumeRatio;
            case 'symbol':    return row.displaySymbol;
            case 'change':
            default:          return row.change;
        }
    };

    return [...rows].sort((a, b) => {
        const L = val(a), R = val(b);
        if (typeof L === 'string' || typeof R === 'string') {
            return dir * String(L || '').localeCompare(String(R || ''));
        }
        return dir * ((isFiniteNum(L) ? Number(L) : -Infinity) - (isFiniteNum(R) ? Number(R) : -Infinity));
    });
};

// ── Main screener function ────────────────────────────────────────────────────
const runScreener = async (payload = {}) => {
    const filters   = (payload.filters && typeof payload.filters === 'object') ? payload.filters : {};
    const sortBy    = payload.sortBy    || 'change';
    const sortOrder = payload.sortOrder || 'desc';
    const limit     = Math.max(1, Math.min(MAX_LIMIT, Number(payload.limit || DEFAULT_LIMIT)));
    const strictLive = payload.strictLive === true;
    const reqTimeframe = filters.timeframe || '1D';

    // ── Step 1: Get price universe from Yahoo (cached in stockService) ────────
    const stocks = await fetchStockData();
    const symbolList = (Array.isArray(stocks) ? stocks : []).map(s => s.symbol);

    // ── Step 2: Bulk-load FundamentalsSnapshot from MongoDB (one query) ───────
    const dbCache = await loadFundamentalsCache(symbolList);

    // ── Step 3: Build enriched rows ───────────────────────────────────────────
    const baseRows = (Array.isArray(stocks) ? stocks : []).map(stock => {
        const cleanSym = stripSuffix(stock.symbol);
        const dbFund   = dbCache.get(cleanSym) || null;
        return buildRow(stock, dbFund);
    });

    logger.info(`[Screener] Universe: ${baseRows.length} stocks`);

    // ── Step 4: Apply base (fundamental + volume) filters ─────────────────────
    const filteredBase = applyBaseFilters(baseRows, filters);
    logger.info(`[Screener] After base filters: ${filteredBase.length} stocks`);

    // ── Step 5: Attach live technicals if RSI/score filters are requested ─────
    const mustFetchAllTechnicals = needsTechnicalData(filters, sortBy);
    
    let enrichedRows;
    if (mustFetchAllTechnicals) {
        enrichedRows = await attachTechnicals(filteredBase, strictLive);
    } else {
        enrichedRows = filteredBase.map(r => ({ ...r, rsi: r.rsi || 50, score: r.score || 60, bias: 'neutral' }));
    }

    // ── Step 6: Apply technical + signal + trend filters ──────────────────────
    const filteredRows = applyTechnicalFilters(enrichedRows, filters);
    logger.info(`[Screener] After technical filters: ${filteredRows.length} stocks`);

    // ── Step 7: Sort and slice ────────────────────────────────────────────────
    const sorted    = sortRows(filteredRows, sortBy, sortOrder);
    const finalRows = sorted.slice(0, limit);

    // ── Step 7.5: Attach technicals to final rows if we skipped it earlier ───
    const finalEnrichedRows = mustFetchAllTechnicals 
        ? finalRows 
        : await attachTechnicals(finalRows, strictLive);

    // ── Step 8: Enrich final rows with sparkline + derived signals ────────────
    const results = await Promise.all(finalEnrichedRows.map(async (row) => {
        // Sparkline (best-effort — don't fail the whole screener if Yahoo errors)
        let sparklineData = null;
        try {
            const hist = await yahooFinanceService.fetchHistoricalData(
                row.displaySymbol.includes('.') ? row.displaySymbol : `${row.displaySymbol}.NS`,
                '1d', '1mo'
            );
            if (hist.success && hist.data) {
                sparklineData = hist.data.slice(-15).map(c => ({ value: c.close || c.adjustedClose }));
            }
        } catch (_) { /* sparkline failure is non-fatal */ }

        // Classify derived fields from real data
        const rsiVal    = isFiniteNum(row.rsi)   ? row.rsi   : 50;
        const scoreVal  = isFiniteNum(row.score) ? row.score : 60;
        const changeVal = isFiniteNum(row.change) ? row.change : 0;
        const changePercentVal = isFiniteNum(row.changePercent) ? row.changePercent : 0;
        const rvolVal   = isFiniteNum(row.volumeRatio) ? row.volumeRatio : 1;

        const enrichedRow = {
            ...row,
            rsi:         rsiVal,
            score:       scoreVal,
            change:      changeVal,
            changePercent: changePercentVal,
            volumeRatio: rvolVal,
            price:       row.price,
            ema20:       row.ema20,
        };

        const signal         = classifySignal(enrichedRow);
        const signalStrength = classifyStrength(scoreVal, rsiVal, rvolVal);
        const trend          = classifyTrend(row.bias, rsiVal, changePercentVal);
        const macdBias       = classifyMacdBias(row.bias, changePercentVal);

        // Build reasons from real data
        const reasons = [];
        if (changePercentVal > 1.5) reasons.push(`Strong price momentum (+${changePercentVal.toFixed(1)}%)`);
        if (rvolVal > 1.5)   reasons.push(`Volume surge (${rvolVal.toFixed(1)}x RVOL)`);
        if (rsiVal > 60 && rsiVal < 70) reasons.push('RSI entering bullish momentum zone');
        if (rsiVal < 35)     reasons.push('Oversold RSI — potential bounce zone');
        if (row.ema20 && row.price > row.ema20) reasons.push('Price above EMA20');
        if (reasons.length === 0) reasons.push('Technical continuation pattern');

        return {
            symbol:        row.symbol,
            displaySymbol: row.displaySymbol,
            name:          row.name,
            price:         isFiniteNum(row.price)  ? Number(row.price.toFixed(2))  : null,
            change:        isFiniteNum(changeVal)   ? Number(changeVal.toFixed(2))  : null,
            changePercent: isFiniteNum(changePercentVal) ? Number(changePercentVal.toFixed(2)) : null,
            volume:        isFiniteNum(row.volume)  ? row.volume                    : null,
            sector:        row.sector,
            pe:            isFiniteNum(row.pe)      ? Number(row.pe.toFixed(2))     : null,
            marketCap:     isFiniteNum(row.marketCapNumeric) ? row.marketCapNumeric : null,
            rsi:           Number(rsiVal.toFixed(2)),
            score:         Number(scoreVal.toFixed(0)),
            rvol:          Number(rvolVal.toFixed(2)),
            volumeRatio:   Number(rvolVal.toFixed(2)),
            bias:          row.bias,
            trend,
            macdBias,
            signal,
            signalStrength,
            signalType:    `${signal} — ${trend} bias`,
            reasons,
            roe:           isFiniteNum(row.roe)          ? Number(row.roe.toFixed(2))         : null,
            dividendYield: isFiniteNum(row.dividendYield)? Number(row.dividendYield.toFixed(2)): null,
            technicalLive: row.technicalLive,
            timeframe:     reqTimeframe,
            sparklineData,
            chart:         sparklineData ? sparklineData.map(p => p.value) : [],
        };
    }));

    return {
        totalUniverse: baseRows.length,
        matched:       filteredRows.length,
        returned:      results.length,
        sortBy,
        sortOrder:     String(sortOrder).toLowerCase(),
        results,
    };
};

module.exports = { runScreener };

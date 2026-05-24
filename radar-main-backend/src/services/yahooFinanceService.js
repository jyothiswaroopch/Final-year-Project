const yf = new (require('yahoo-finance2').default)();
const logger = require('../config/logger');

// Suppress yahoo-finance2's own validation warnings cleanly (removed as it's not supported in v3)

// Map plain NSE/BSE symbols to Yahoo Finance ticker format
const toYahooSymbol = (symbol) => {
    const s = String(symbol || '').trim().toUpperCase()
        .replace(/\.(NS|BO)$/i, '');

    // Already qualified
    if (/\.(NS|BO|L|AX|TO|HK|SS|SZ)$/i.test(symbol)) return symbol;

    // Known BSE-only tickers (add more as needed)
    const BSE_ONLY = new Set(['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'WIPRO', 'ICICIBANK',
        'KOTAKBANK', 'SBIN', 'AXISBANK', 'HINDUNILVR', 'BAJFINANCE', 'MARUTI',
        'ASIANPAINT', 'TITAN', 'NESTLEIND', 'SUNPHARMA', 'DRREDDY', 'CIPLA',
        'DIVISLAB', 'HCLTECH', 'TECHM', 'LTIM', 'MPHASIS', 'PERSISTENT',
        'ADANIPORTS', 'ADANIENT', 'ADANIGREEN', 'POWERGRID', 'NTPC', 'ONGC',
        'IOC', 'BPCL', 'COAL INDIA', 'COALINDIA', 'GRASIM', 'ULTRACEMCO',
        'SHREECEM', 'BAJAJFINSV', 'SBILIFE', 'HDFCLIFE', 'ICICIPRULI',
        'BRITANNIA', 'HAVELLS', 'PIDILITIND', 'BERGEPAINT', 'DABUR',
        'MARICO', 'COLPAL', 'EMAMILTD', 'GODREJCP', 'ITC', 'LT', 'MM',
        'BHARTIARTL', 'JIOFINANCE', 'BAJAJ-AUTO', 'BAJAJ AUTO', 'EICHERMOT',
        'HEROMOTOCO', 'TATACONSUM', 'TATAMOTORS', 'TATAPOWER', 'TATASTEEL',
        'JSWSTEEL', 'HINDALCO', 'VEDL', 'UPL', 'INDUSINDBK']);

    if (BSE_ONLY.has(s)) return `${s}.NS`;

    return `${s}.NS`; // Default to NSE
};

class YahooFinanceService {

    /**
     * Fetch historical OHLCV candles using yahoo-finance2
     * @param {string} symbol - Raw symbol like "RELIANCE" or "RELIANCE.NS"
     * @param {string} interval - '1d' | '1wk' | '1mo' | '1h' | '15m' | '5m'
     * @param {string} range   - '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '2y' | '5y' | 'max'
     */
    async fetchHistoricalData(symbol, interval = '1d', range = '1y') {
        const ticker = toYahooSymbol(symbol);
        try {
            logger.info(`[Yahoo] Fetching ${interval}/${range} for ${ticker}`);

            const result = await yf.chart(ticker, {
                interval,
                range,
                includePrePost: false,
            });

            if (!result?.quotes?.length) {
                return { success: false, message: 'No data returned', data: [] };
            }

            const ohlcData = result.quotes
                .filter(q => q.open != null && q.close != null)
                .map(q => ({
                    timestamp: new Date(q.date),
                    open:   Number(q.open),
                    high:   Number(q.high),
                    low:    Number(q.low),
                    close:  Number(q.close),
                    volume: Number(q.volume ?? 0),
                    adjustedClose: Number(q.adjclose ?? q.close),
                }));

            logger.info(`[Yahoo] ✅ ${ohlcData.length} candles for ${ticker}`);
            return { success: true, count: ohlcData.length, data: ohlcData, symbol: ticker, interval, range };
        } catch (err) {
            logger.error(`[Yahoo] fetchHistoricalData(${ticker}) failed: ${err.message}`);
            return { success: false, message: err.message, data: [] };
        }
    }

    /**
     * Fetch candles for a custom date range
     */
    async fetchCustomRange(symbol, startDate, endDate, interval = '1d') {
        const ticker = toYahooSymbol(symbol);
        try {
            logger.info(`[Yahoo] Custom range ${interval} for ${ticker}: ${startDate.toDateString()} → ${endDate.toDateString()}`);

            const result = await yf.chart(ticker, {
                interval,
                period1: startDate,
                period2: endDate,
                includePrePost: false,
            });

            if (!result?.quotes?.length) {
                return { success: false, message: 'No data returned', data: [] };
            }

            const ohlcData = result.quotes
                .filter(q => q.open != null && q.close != null)
                .map(q => ({
                    timestamp: new Date(q.date),
                    open:   Number(q.open),
                    high:   Number(q.high),
                    low:    Number(q.low),
                    close:  Number(q.close),
                    volume: Number(q.volume ?? 0),
                    adjustedClose: Number(q.adjclose ?? q.close),
                }));

            logger.info(`[Yahoo] ✅ ${ohlcData.length} candles for ${ticker}`);
            return { success: true, count: ohlcData.length, data: ohlcData };
        } catch (err) {
            logger.error(`[Yahoo] fetchCustomRange(${ticker}) failed: ${err.message}`);
            return { success: false, message: err.message, data: [] };
        }
    }

    /**
     * Get a live quote (price, change, volume) via yahoo-finance2 quoteSummary
     */
    async getLiveQuote(symbol) {
        const ticker = toYahooSymbol(symbol);
        try {
            const q = await yf.quote(ticker);
            if (!q) return { success: false, message: 'No quote data' };

            return {
                success: true,
                source: 'yahoo-finance2',
                data: {
                    symbol: ticker,
                    current:       Number(q.regularMarketPrice ?? 0),
                    open:          Number(q.regularMarketOpen ?? 0),
                    high:          Number(q.regularMarketDayHigh ?? 0),
                    low:           Number(q.regularMarketDayLow ?? 0),
                    previousClose: Number(q.regularMarketPreviousClose ?? 0),
                    change:        Number(q.regularMarketChange ?? 0),
                    changePercent: Number(q.regularMarketChangePercent ?? 0),
                    volume:        Number(q.regularMarketVolume ?? 0),
                    marketCap:     Number(q.marketCap ?? 0),
                    pe:            Number(q.trailingPE ?? 0),
                    high52w:       Number(q.fiftyTwoWeekHigh ?? 0),
                    low52w:        Number(q.fiftyTwoWeekLow ?? 0),
                    name:          q.shortName || q.longName || ticker,
                    currency:      q.currency || 'INR',
                    exchange:      q.fullExchangeName || q.exchange || 'NSE',
                    timestamp:     new Date(q.regularMarketTime * 1000 || Date.now()),
                },
            };
        } catch (err) {
            logger.error(`[Yahoo] getLiveQuote(${ticker}) failed: ${err.message}`);
            return { success: false, message: err.message };
        }
    }

    /**
     * Batch fetch live quotes for multiple symbols
     * Respects a small delay to avoid rate limits
     */
    async batchFetch(symbols, interval = '1d', range = '1y') {
        const results = { success: [], failed: [] };

        for (const symbol of symbols) {
            try {
                const result = await this.fetchHistoricalData(symbol, interval, range);
                if (result.success && result.data.length > 0) {
                    results.success.push({ symbol, count: result.count, data: result.data });
                } else {
                    results.failed.push({ symbol, reason: result.message || 'No data' });
                }
                await new Promise(r => setTimeout(r, 250)); // rate limit guard
            } catch (err) {
                results.failed.push({ symbol, reason: err.message });
            }
        }

        logger.info(`[Yahoo] Batch complete: ${results.success.length} ok, ${results.failed.length} failed`);
        return results;
    }

    /**
     * Fetch fundamentals (summary, financials, key stats)
     */
    async getFundamentals(symbol) {
        const ticker = toYahooSymbol(symbol);
        try {
            const summary = await yf.quoteSummary(ticker, {
                modules: ['summaryDetail', 'defaultKeyStatistics', 'financialData', 'assetProfile'],
            });

            const sd  = summary?.summaryDetail || {};
            const ks  = summary?.defaultKeyStatistics || {};
            const fd  = summary?.financialData || {};
            const ap  = summary?.assetProfile || {};

            return {
                success: true,
                data: {
                    symbol: ticker,
                    pe:           sd.trailingPE,
                    forwardPe:    sd.forwardPE,
                    pb:           ks.priceToBook,
                    eps:          ks.trailingEps,
                    marketCap:    sd.marketCap,
                    dividendYield: sd.dividendYield,
                    beta:         sd.beta,
                    roe:          fd.returnOnEquity,
                    roa:          fd.returnOnAssets,
                    debtToEquity: fd.debtToEquity,
                    currentRatio: fd.currentRatio,
                    revenue:      fd.totalRevenue,
                    grossMargin:  fd.grossMargins,
                    operatingMargin: fd.operatingMargins,
                    profitMargin: fd.profitMargins,
                    industry:     ap.industry,
                    sector:       ap.sector,
                    description:  ap.longBusinessSummary,
                    website:      ap.website,
                    employees:    ap.fullTimeEmployees,
                },
            };
        } catch (err) {
            logger.error(`[Yahoo] getFundamentals(${ticker}) failed: ${err.message}`);
            return { success: false, message: err.message, data: null };
        }
    }
}

module.exports = new YahooFinanceService();

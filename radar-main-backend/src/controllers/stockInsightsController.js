const {
    getStockFundamentals,
    getStockEarningsCalendar,
    getStockNewsSentiment,
    getStockSignals,
} = require('../services/stockInsightsService');


const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });
const getFundamentals = async (req, res) => {

    let yahooSymbol = '';
    try {

        const symbol = req.params.symbol || '';
        yahooSymbol = symbol.trim().toUpperCase();
        if (!yahooSymbol.includes('.') && !yahooSymbol.startsWith('^')) {
            yahooSymbol = `${yahooSymbol}.NS`;
        }

        const result = await yahooFinance.quoteSummary(yahooSymbol, {
            modules: [
                'price',
                'summaryDetail',
                'defaultKeyStatistics',
                'financialData',
                'assetProfile'
            ]
        });

        const period1 = new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const [quarterlyTS, yearlyTS] = await Promise.all([
            yahooFinance.fundamentalsTimeSeries(yahooSymbol, { period1, module: 'financials', type: 'quarterly' }).catch(() => []),
            yahooFinance.fundamentalsTimeSeries(yahooSymbol, { period1, module: 'financials', type: 'annual' }).catch(() => [])
        ]);

        const formatTSData = (history, isQuarterly) => {
            if (!history || !history.length) return [];
            return history.slice(-4).map(item => {
                const date = new Date(item.date);
                const periodLabel = isQuarterly 
                    ? `Q${Math.floor(date.getMonth() / 3) + 1} '${date.getFullYear().toString().slice(-2)}`
                    : `'${date.getFullYear().toString().slice(-2)}`;
                return {
                    quarter: periodLabel,
                    revenue: (item.totalRevenue || item.operatingRevenue || 0) / 10000000,
                    profit: (item.netIncome || item.normalizedIncome || 0) / 10000000
                };
            });
        };

        const fundamentals = {

            symbol,

            marketCap:
                result?.summaryDetail?.marketCap ||
                result?.price?.marketCap ||
                null,

            peRatio:
                result?.summaryDetail?.trailingPE ||
                null,

            eps:
                result?.defaultKeyStatistics?.trailingEps ||
                null,

            dividendYield:
                result?.summaryDetail?.dividendYield ||
                null,

            beta:
                result?.summaryDetail?.beta ||
                null,

            sector:
                result?.assetProfile?.sector ||
                null,

            industry:
                result?.assetProfile?.industry ||
                null,

            profitMargins:
                result?.financialData?.profitMargins ||
                null,

            operatingMargins:
                result?.financialData?.operatingMargins ||
                null,

            revenueGrowth:
                result?.financialData?.revenueGrowth ||
                null,

            bookValue:
                result?.defaultKeyStatistics?.bookValue ||
                null,

            priceToBook:
                result?.defaultKeyStatistics?.priceToBook ||
                null,

            fiftyTwoWeekHigh:
                result?.summaryDetail?.fiftyTwoWeekHigh ||
                null,

            fiftyTwoWeekLow:
                result?.summaryDetail?.fiftyTwoWeekLow ||
                null,
                
            financialPerformance: {
                quarterly: formatTSData(quarterlyTS, true),
                yearly: formatTSData(yearlyTS, false)
            }
        };

        res.json({
            success: true,
            data: fundamentals
        });

    } catch (error) {

        console.error('FUNDAMENTALS ERROR:', error);

        res.status(500).json({
            success: false,
            message: error.message,
            yahooSymbol
        });
    }
};
const getEarningsCalendar = async (req, res) => {
    try {
        const data = await getStockEarningsCalendar(req.params.symbol);
        return res.json({ success: true, data });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to fetch earnings calendar',
        });
    }
};

const getNewsSentiment = async (req, res) => {
    try {
        const data = await getStockNewsSentiment(req.params.symbol);
        return res.json({ success: true, data });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to fetch news sentiment',
        });
    }
};

const getSignals = async (req, res) => {
    try {
        const { term = 'medium' } = req.query;
        const data = await getStockSignals(req.params.symbol, term);
        return res.json({ success: true, data });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to fetch signals',
        });
    }
};

module.exports = {
    getFundamentals,
    getEarningsCalendar,
    getNewsSentiment,
    getSignals,
};

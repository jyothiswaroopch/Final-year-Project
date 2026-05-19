const YahooFinance = require('yahoo-finance2').default;

const yahooFinance = new YahooFinance();

const getChartData = async (
    symbol,
    interval = '1d'
) => {

    const result = await yahooFinance.chart(symbol, {
        period1: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        period2: new Date(),
        interval: interval
    });

    return result.quotes.map((candle) => ({
        time: new Date(candle.date).getTime(),
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
        volume: candle.volume
    }));
};

module.exports = {
    getChartData
};
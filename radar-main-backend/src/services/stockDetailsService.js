const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });const normalizeStockData = require('../utils/normalizeStockData');


const INDEX_MAP = {
  NIFTY: '^NSEI',
  SENSEX: '^BSESN',
  BANKNIFTY: '^NSEBANK'
};
const ABOUT_FALLBACKS = {
  'HDFCBANK.NS':
    'HDFC Bank is one of India’s largest private sector banks offering retail banking, wholesale banking, treasury operations, loans, credit cards, and digital banking services.',

  '^NSEI':
    'NIFTY 50 is India’s benchmark stock market index representing the top 50 companies listed on the National Stock Exchange.',

  '^BSESN':
    'SENSEX is the benchmark index of the Bombay Stock Exchange representing 30 financially sound companies across key sectors.',

  '^NSEBANK':
    'NIFTY Bank tracks the performance of major banking sector companies listed on the National Stock Exchange.'
};
const getStockDetails = async (symbol) => {

  let yahooSymbol =
    INDEX_MAP[symbol.toUpperCase()] || symbol;

  // Add .NS only for regular stocks
  if (
    !yahooSymbol.startsWith('^') &&
    !yahooSymbol.includes('.NS')
  ) {
    yahooSymbol = `${yahooSymbol}.NS`;
  }

  const quote = await yahooFinance.quote(yahooSymbol);

  const summary = await yahooFinance.quoteSummary(
    yahooSymbol,
    {
      modules: [
        'assetProfile',
        'financialData',
        'defaultKeyStatistics',
        'price',
        'summaryDetail',
        'majorHoldersBreakdown',
        'incomeStatementHistory',
        'incomeStatementHistoryQuarterly'
      ]
    }
  );
  const quarterlyTS = summary?.incomeStatementHistoryQuarterly?.incomeStatementHistory || [];
  const yearlyTS = summary?.incomeStatementHistory?.incomeStatementHistory || [];

  // Sort them so oldest is first, newest is last (since Yahoo usually returns newest first)
  const sortOldestFirst = (arr) => [...arr].sort((a, b) => new Date(a.endDate) - new Date(b.endDate));

  const formatTSData = (history, isQuarterly) => {
    if (!history || !history.length) return [];
    return sortOldestFirst(history).slice(-5).map(item => {
        const date = new Date(item.endDate);
        let periodLabel = '';
        if (isQuarterly) {
            periodLabel = `Q${Math.floor(date.getMonth() / 3) + 1} '${date.getFullYear().toString().slice(-2)}`;
        } else {
            periodLabel = `'${date.getFullYear().toString().slice(-2)}`;
        }
        return {
          quarter: periodLabel,
          revenue: (item.totalRevenue || item.operatingRevenue || 0) / 10000000,
          profit: (item.netIncome || item.normalizedIncome || 0) / 10000000
        };
    });
  };

  const financialPerformance = {
    quarterly: formatTSData(quarterlyTS, true),
    yearly: formatTSData(yearlyTS, false)
  };

  const majorHolders = summary?.majorHoldersBreakdown || {};
  const promoters = (majorHolders.insidersPercentHeld || 0) * 100;
  const institutions = (majorHolders.institutionsPercentHeld || 0) * 100;
  const retail = Math.max(0, 100 - (promoters + institutions));

  const shareholding = {
    promoters: promoters.toFixed(2),
    institutions: institutions.toFixed(2),
    retail: retail.toFixed(2)
  };

  return {
    ...normalizeStockData(quote, summary),
    about:
      summary?.assetProfile?.longBusinessSummary ||
      ABOUT_FALLBACKS[yahooSymbol] ||
      '',
    financialPerformance,
    shareholding
  };
};

module.exports = {
  getStockDetails
};

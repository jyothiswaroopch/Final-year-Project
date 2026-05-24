const normalizeCrypto = (data) => {
    return data.map(coin => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        price: coin.current_price,
        change_24h: coin.price_change_percentage_24h,
        image: coin.image,
        type: 'CRYPTO',
        details: coin.details 
    }));
};

const cleanSymbolSuffix = (value) => {
    const s = String(value || '');
    if (s === '^NSEI') return 'NIFTY 50';
    if (s === '^BSESN') return 'SENSEX';
    if (s === '^NSEBANK') return 'BANKNIFTY';
    return s.replace(/\.(NS|BO)$/i, '');
};

const normalizeStock = (data) => {
    const INDICES = ['NIFTY 50', 'SENSEX', 'BANKNIFTY', 'NIFTY', 'FINNIFTY', 'MIDCPNIFTY', 'INDIA VIX', 'SPX', 'NDX', 'DJIA'];

    return data.map(stock => {
        const sym = cleanSymbolSuffix(stock.symbol);
        const isIndex = INDICES.includes(sym) || sym.startsWith('^');
        
        return {
            id: sym,
            symbol: sym,
            name: stock.name,
            price: stock.price,
            change_24h: stock.change,
            image: null,
            type: isIndex ? 'INDEX' : 'STOCK',
            details: stock.details,
            financials: stock.financials,
            volume: stock.volume || 0,
            dayLow: stock.dayLow || 0,
            dayHigh: stock.dayHigh || 0
        };
    });
};

const normalizeForex = (data) => {
    return data.map(pair => ({
        id: pair.ticker,
        symbol: pair.ticker,
        name: pair.name,
        price: (pair.bid + pair.ask) / 2,
        change_24h: pair.change,
        image: null,
        type: 'FOREX',
        details: pair.details 
    }));
};

module.exports = { normalizeCrypto, normalizeStock, normalizeForex };

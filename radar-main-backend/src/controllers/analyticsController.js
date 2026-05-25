const { fetchStockData } = require('../services/stockService');

const getPreMarketPulse = async (req, res) => {
    try {
        const stocks = await fetchStockData();

        const sortedByChangeDesc = [...stocks].sort((a, b) => Number(b.changePercent || 0) - Number(a.changePercent || 0));
        const sortedByChangeAsc = [...stocks].sort((a, b) => Number(a.changePercent || 0) - Number(b.changePercent || 0));

        const gapUp = sortedByChangeDesc.slice(0, 5).map((s) => ({
            symbol: s.symbol,
            change: `${Number(s.changePercent || 0) >= 0 ? '+' : ''}${Number(s.changePercent || 0).toFixed(2)}%`,
            price: s.price,
        }));
        const gapDown = sortedByChangeAsc.slice(0, 5).map((s) => ({
            symbol: s.symbol,
            change: `${Number(s.changePercent || 0).toFixed(2)}%`,
            price: s.price,
        }));

        // Sort by volume for volume shockers
        const sortedByVolumeDesc = [...stocks].sort((a, b) => Number(b.volume || 0) - Number(a.volume || 0));
        const volumeShockers = sortedByVolumeDesc.slice(0, 6).map((s) => ({
            symbol: s.symbol,
            volume: s.volume ? `${(s.volume / 1000000).toFixed(2)}M` : 'N/A',
            avgVolume: 'N/A', // We don't have avg volume in base fetch, so we leave it as N/A or compute it
            shock: s.volume ? 'High Vol' : '-',
        }));

        res.json({
            gapUp,
            gapDown,
            volumeShockers
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};

const getSectorHeatmap = async (req, res) => {
    try {
        const heatmapData = [
            {
                name: "Technology",
                children: [
                    { name: "AAPL", size: 2700, change: 1.25 },
                    { name: "MSFT", size: 2300, change: -0.5 },
                    { name: "NVDA", size: 1200, change: 5.4 }
                ]
            },
            {
                name: "Automotive",
                children: [
                    { name: "TSLA", size: 750, change: -3.1 },
                    { name: "F", size: 45, change: 0.2 }
                ]
            },
            {
                name: "Finance",
                children: [
                    { name: "JPM", size: 400, change: 1.1 },
                    { name: "BAC", size: 250, change: 0.8 }
                ]
            }
        ];

        res.json(heatmapData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};

module.exports = { getPreMarketPulse, getSectorHeatmap };

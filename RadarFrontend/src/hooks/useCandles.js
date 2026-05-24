import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// Helper to normalize any date input to yyyy-mm-dd
const parseDateToYYYYMMDD = (dateStr) => {
  if (!dateStr) {
    return new Date().toISOString().split('T')[0];
  }

  const str = String(dateStr).trim();

  // If ISO timestamp contains 'T' (e.g., 2026-05-22T00:00:00.000Z)
  if (str.includes('T')) {
    return str.split('T')[0];
  }

  // Handle DD/MM/YYYY or D/M/YYYY (e.g., 23/4/2026, 7/5/2026)
  const dmyRegex = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/;
  const dmyMatch = str.match(dmyRegex);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }

  // Handle YYYY/MM/DD or YYYY-M-D
  const ymdRegex = /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/;
  const ymdMatch = str.match(ymdRegex);
  if (ymdMatch) {
    const year = ymdMatch[1];
    const month = ymdMatch[2].padStart(2, '0');
    const day = ymdMatch[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Fallback to JS native Date parsing
  try {
    const dateObj = new Date(str);
    if (!isNaN(dateObj.getTime())) {
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  } catch (err) {}

  return str;
};


// Maps frontend timeframe button label → { daysBack, interval } for /api/chart/:symbol
const mapIntervalToParams = (interval) => {
  const map = {
    '1D':  { daysBack: 1,    interval: '1h'  },  // 1 day of hourly candles
    '5D':  { daysBack: 5,    interval: '1h'  },  // 5 days of hourly candles
    '1M':  { daysBack: 30,   interval: '1d'  },  // 1 month of daily candles
    '3M':  { daysBack: 90,   interval: '1d'  },  // 3 months of daily candles
    '6M':  { daysBack: 180,  interval: '1d'  },  // 6 months of daily candles
    '1Y':  { daysBack: 365,  interval: '1d'  },  // 1 year of daily candles
    '5Y':  { daysBack: 1825, interval: '1wk' },  // 5 years of weekly candles
  };
  return map[String(interval).toUpperCase()] || { daysBack: 365, interval: '1d' };
};

export const useCandles = (symbol, interval = '1D') => {
  const [candles, setCandles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const generateFallbackCandles = useCallback((sym) => {
    const data = [];
    const now = new Date();
    const upper = String(sym || 'RELIANCE').toUpperCase();

    // Seed prices for common symbols
    const seedMap = {
      TCS: 3800, INFY: 1600, RELIANCE: 2900, HDFCBANK: 1700,
      ICICIBANK: 1300, SBIN: 820, WIPRO: 480, AXISBANK: 1200,
      KOTAKBANK: 1900, LT: 3600, ITC: 460, SUNPHARMA: 1700,
      TITAN: 3400, BAJFINANCE: 9000, MARUTI: 12000, GRASIM: 2700,
      NIFTY: 22000, BANKNIFTY: 48000, SENSEX: 73000,
      BTC: 65000, ETH: 3500, SOL: 170,
    };

    let currentPrice = 2500;
    for (const [key, price] of Object.entries(seedMap)) {
      if (upper.includes(key)) { currentPrice = price; break; }
    }

    for (let i = 250; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      // Skip weekends
      const dow = date.getDay();
      if (dow === 0 || dow === 6) continue;

      const change = currentPrice * (Math.random() * 0.04 - 0.019);
      const open = currentPrice;
      const close = Number((currentPrice + change).toFixed(2));
      const high = Number((Math.max(open, close) + Math.random() * currentPrice * 0.012).toFixed(2));
      const low  = Number((Math.min(open, close) - Math.random() * currentPrice * 0.012).toFixed(2));
      const volume = Math.round(500000 + Math.random() * 2000000);

      data.push({
        time: date.toISOString().split('T')[0],
        open: Number(open.toFixed(2)),
        high, low, close, volume,
      });
      currentPrice = close;
    }
    return data;
  }, []);

  const loadCandles = useCallback(async () => {
    if (!symbol) return;
    setLoading(true);
    setError(null);
    try {
      const { daysBack, interval: yInterval } = mapIntervalToParams(interval);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await axios.get(`/api/chart/${encodeURIComponent(symbol)}`, {
        params: { daysBack, interval: yInterval },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        timeout: 12000,
      });

      const rawData = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data) ? res.data.data : [];

      if (rawData.length > 0) {
        const mapped = rawData.map(c => {
          // Backend returns Unix timestamp in seconds (shifted for IST)
          const rawTime = c.time || c.timestamp || '';
          let timeVal;
          if (typeof rawTime === 'number' && rawTime > 1e9) {
            // Unix epoch seconds → YYYY-MM-DD
            const d = new Date(rawTime * 1000);
            timeVal = d.toISOString().split('T')[0];
          } else {
            timeVal = parseDateToYYYYMMDD(String(rawTime));
          }
          return {
            time: timeVal,
            open:   Number(c.open  || c.close || 0),
            high:   Number(c.high  || c.close || 0),
            low:    Number(c.low   || c.close || 0),
            close:  Number(c.close || 0),
            volume: Number(c.volume || 0),
          };
        }).filter(c => c.time && c.close > 0)
          .sort((a, b) => a.time.localeCompare(b.time));

        // De-duplicate dates
        const unique = [];
        const seen = new Set();
        for (const item of mapped) {
          if (!seen.has(item.time)) { seen.add(item.time); unique.push(item); }
        }
        setCandles(unique);
      } else {
        console.warn(`[useCandles] Empty response for ${symbol}, using fallback candles`);
        setCandles(generateFallbackCandles(symbol));
      }
    } catch (err) {
      console.warn(`[useCandles] Backend unavailable for ${symbol}, using fallback candles:`, err.message);
      setCandles(generateFallbackCandles(symbol));
    } finally {
      setLoading(false);
    }
  }, [symbol, interval, generateFallbackCandles]);

  useEffect(() => {
    loadCandles();
  }, [loadCandles]);

  return { candles, loading, error, refetch: loadCandles };
};

export default useCandles;

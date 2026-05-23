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

const mapIntervalToPeriod = (interval) => {
  const map = {
    '1D': '1d',
    '5D': '5d',
    '1M': '1m',
    '3M': '3m',
    '6M': '6m',
    '1Y': '1y',
    '5Y': '5y'
  };
  return map[String(interval).toUpperCase()] || '1y';
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
      const periodParam = mapIntervalToPeriod(interval);
      // Use raw axios to bypass the api.js response interceptor
      // which strips .NS/.BO suffixes and can corrupt date strings
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await axios.get(`/api/chart/${encodeURIComponent(symbol)}`, {
        params: { period: periodParam },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        timeout: 12000,
      });

      if (res && Array.isArray(res.data) && res.data.length > 0) {
        const mapped = res.data.map(c => {
          const rawTime = c.time || c.timestamp || '';
          const timeVal = parseDateToYYYYMMDD(rawTime);
          return {
            time: timeVal,
            open: Number(c.open || c.close),
            high: Number(c.high || c.close),
            low: Number(c.low || c.close),
            close: Number(c.close),
            volume: Number(c.volume || 0)
          };
        }).sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

        // De-duplicate dates to satisfy lightweight-charts constraint
        const unique = [];
        const seen = new Set();
        for (const item of mapped) {
          if (!seen.has(item.time)) {
            seen.add(item.time);
            unique.push(item);
          }
        }

        setCandles(unique);
      } else {
        // Backend returned empty – use fallback so chart is always visible
        console.warn(`[useCandles] Empty response for ${symbol}, using fallback candles`);
        setCandles(generateFallbackCandles(symbol));
      }
    } catch (err) {
      // Backend unreachable – show fallback candles so chart is never blank
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

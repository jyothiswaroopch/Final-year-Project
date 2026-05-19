import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/api';

const TIMEFRAME_MAP = {
  '1D':  { resolution: '1',  daysBack: 1 },
  '5D':  { resolution: '5',  daysBack: 5 },
  '1M':  { resolution: '60', daysBack: 30 },
  '3M':  { resolution: 'D',  daysBack: 90 },
  '6M':  { resolution: 'D',  daysBack: 180 },
  '1Y':  { resolution: 'D',  daysBack: 365 },
  '5Y':  { resolution: 'W',  daysBack: 1825 },
  'ALL': { resolution: 'M',  daysBack: 3650 },
};

const useChartData = (symbol, timeframe, customFrom = null, customTo = null) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);
  const cache = useRef({});

  const fetchData = useCallback(async () => {
    if (!symbol || !timeframe) return;

    const now = Math.floor(Date.now() / 1000);
    const tf = TIMEFRAME_MAP[timeframe] || TIMEFRAME_MAP['1Y'];
    const toTs = customTo ? Math.floor(new Date(customTo).getTime() / 1000) : now;
    const fromTs = customFrom
      ? Math.floor(new Date(customFrom).getTime() / 1000)
      : now - tf.daysBack * 86400;

    const cacheKey = `${symbol}__${timeframe}__${fromTs}__${toTs}`;
    if (cache.current[cacheKey]) {
      setData(cache.current[cacheKey]);
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const res = await api.get(`/stocks/${symbol}/chart`, {
        params: {
          timeframe,
          resolution: tf.resolution,
          from: fromTs,
          to: toTs,
        },
        signal: abortRef.current.signal,
      });

      let raw = res.data?.data || [];

      // Fallback: try legacy /history endpoint
      if (!raw.length) {
        const histRes = await api.get(`/stocks/${symbol}/history`, {
          params: { interval: '1day', exchange: 'NSE' },
          signal: abortRef.current.signal,
        });
        raw = histRes.data?.data || [];
      }

      // Normalize to TV format
      const normalized = raw
        .map(d => ({
          time: typeof d.time === 'number' && d.time < 1e10
            ? d.time
            : d.timestamp
              ? Math.floor(new Date(d.timestamp).getTime() / 1000)
              : d.date
                ? Math.floor(new Date(d.date).getTime() / 1000)
                : Math.floor(new Date(d.time).getTime() / 1000),
          open:   +(d.open  || 0),
          high:   +(d.high  || 0),
          low:    +(d.low   || 0),
          close:  +(d.close || 0),
          volume: +(d.volume || 0),
        }))
        .filter(d => d.time && d.close > 0)
        .sort((a, b) => a.time - b.time);

      // Deduplicate by time
      const deduped = [];
      const seen = new Set();
      for (const d of normalized) {
        if (!seen.has(d.time)) { deduped.push(d); seen.add(d.time); }
      }

      cache.current[cacheKey] = deduped;
      setData(deduped);
    } catch (err) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') return;
      console.error(`[useChartData] Error fetching ${symbol}:`, err.message);
      setError(err.message);
      // Return empty — ChartPane will handle fallback mock
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [symbol, timeframe, customFrom, customTo]);

  useEffect(() => {
    fetchData();
    return () => abortRef.current?.abort();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

export default useChartData;
export { TIMEFRAME_MAP };

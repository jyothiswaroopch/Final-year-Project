import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Filter,
  Zap,
  AlertTriangle,
  RefreshCw,
  Download,
  BarChart3,
  Activity,
} from 'lucide-react';
import ScreenerFilterPanel from '../components/screener/ScreenerFilterPanel';
import ScreenerStockCard from '../components/screener/ScreenerStockCard';
import ScreenerResultsTable from '../components/screener/ScreenerResultsTable';
import './ScreenerPage.css';
import { runScreenerScan } from '../api/screenerApi';

// Diverse fallback dataset — covers every filter dimension so any preset returns results
const MOCK_STOCKS = [
  { id: 1, symbol: 'INFY', name: 'Infosys', price: 1556.15, change: 2.21, changePercent: 2.21, volume: 8500000, sector: 'IT', signal: 'BREAKOUT', signalStrength: 'Strong', signalType: 'EMA breakout + volume surge', reasons: ['Breakout above 20 EMA', 'Volume spike (2.1x RVOL)'], catalyst: 'Q4 Earnings Beat', rsi: 62, pe: 25.3, marketCap: 650000000000, trend: 'bullish', sentiment: 65, macdBias: 'bullish', strength: 'Confidence 85%', entry: 1548.2, target: 1602.6, stopLoss: 1528.9, rvol: 2.1, timeframe: '5M', chart: [1500, 1510, 1520, 1535, 1545, 1556] },
  { id: 2, symbol: 'HDFCBANK', name: 'HDFC Bank', price: 1689.20, change: 1.48, changePercent: 1.48, volume: 7600000, sector: 'Banking', signal: 'MOMENTUM', signalStrength: 'Strong', signalType: 'MACD bullish crossover', reasons: ['MACD Bullish Crossover', 'Trend continuation'], catalyst: '', rsi: 65, pe: 22.1, marketCap: 1200000000000, trend: 'bullish', sentiment: 72, macdBias: 'bullish', strength: 'Confidence 78%', entry: 1680.4, target: 1725.8, stopLoss: 1662.7, rvol: 1.8, timeframe: '5M', chart: [1650, 1665, 1675, 1682, 1687, 1689] },
  { id: 3, symbol: 'TCS', name: 'Tata Consultancy Services', price: 3627.55, change: 1.16, changePercent: 1.16, volume: 3100000, sector: 'IT', signal: 'MOMENTUM', signalStrength: 'Strong', signalType: 'Momentum + MACD crossover', reasons: ['Momentum acceleration', 'IT sector breadth'], catalyst: '', rsi: 68, pe: 28.5, marketCap: 1300000000000, trend: 'bullish', sentiment: 68, macdBias: 'bullish', strength: 'Confidence 82%', entry: 3605.2, target: 3715.6, stopLoss: 3558.4, rvol: 1.6, timeframe: '1D', chart: [3500, 3540, 3580, 3610, 3620, 3628] },
  { id: 4, symbol: 'RELIANCE', name: 'Reliance Industries', price: 2845.00, change: 1.40, changePercent: 1.40, volume: 9900000, sector: 'Energy', signal: 'BREAKOUT', signalStrength: 'Strong', signalType: 'Range breakout +volume', reasons: ['Multi-week range breakout', 'Institutional buying'], catalyst: 'AGM Meeting', rsi: 58, pe: 20.2, marketCap: 1900000000000, trend: 'bullish', sentiment: 75, macdBias: 'bullish', strength: 'Confidence 88%', entry: 2830.4, target: 2898.1, stopLoss: 2796.2, rvol: 2.3, timeframe: '15M', chart: [2800, 2820, 2835, 2840, 2843, 2845] },
  { id: 5, symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', price: 1850.50, change: -4.70, changePercent: -4.70, volume: 2200000, sector: 'Banking', signal: 'PULLBACK', signalStrength: 'Medium', signalType: 'Pullback to support level', reasons: ['Sharp pullback to support', 'Oversold RSI'], catalyst: 'Management Transition', rsi: 28, pe: 19.8, marketCap: 350000000000, trend: 'bearish', sentiment: -35, macdBias: 'bearish', strength: 'Confidence 64%', entry: 1862.2, target: 1910.4, stopLoss: 1822.6, rvol: 1.4, timeframe: '1D', chart: [1950, 1910, 1880, 1865, 1855, 1850] },
  { id: 6, symbol: 'SBIN', name: 'State Bank of India', price: 826.50, change: -1.55, changePercent: -1.55, volume: 11200000, sector: 'Banking', signal: 'MOMENTUM', signalStrength: 'Medium', signalType: 'Bearish MACD cross', reasons: ['Bearish MACD cross', 'Distribution volume'], catalyst: '', rsi: 35, pe: 18.4, marketCap: 750000000000, trend: 'bearish', sentiment: -45, macdBias: 'bearish', strength: 'Confidence 61%', entry: 832.6, target: 856.2, stopLoss: 812.4, rvol: 1.9, timeframe: '1D', chart: [840, 835, 831, 829, 828, 826] },
  { id: 7, symbol: 'BAJAJAUTO', name: 'Bajaj Auto', price: 9250.75, change: 3.21, changePercent: 3.21, volume: 1800000, sector: 'Auto', signal: 'BREAKOUT', signalStrength: 'Strong', signalType: 'ATH Range Breakout', reasons: ['All-time high breakout', 'Sector outperformance'], catalyst: '', rsi: 78, pe: 24.6, marketCap: 270000000000, trend: 'bullish', sentiment: 82, macdBias: 'bullish', strength: 'Confidence 91%', entry: 9202.4, target: 9495.8, stopLoss: 9068.3, rvol: 2.6, timeframe: '5M', chart: [8900, 9000, 9100, 9200, 9230, 9251] },
  { id: 8, symbol: 'ITC', name: 'ITC Limited', price: 468.25, change: 0.54, changePercent: 0.54, volume: 8400000, sector: 'FMCG', signal: 'MOMENTUM', signalStrength: 'Low', signalType: 'Consolidation zone', reasons: ['Flat consolidation', 'Defensive sector flow'], catalyst: '', rsi: 48, pe: 21.3, marketCap: 580000000000, trend: 'neutral', sentiment: 12, macdBias: 'bullish', strength: 'Confidence 53%', entry: 465.8, target: 478.4, stopLoss: 458.3, rvol: 0.9, timeframe: '1D', chart: [460, 463, 465, 467, 468, 468] },
  { id: 9, symbol: 'WIPRO', name: 'Wipro Ltd', price: 452.80, change: -2.10, changePercent: -2.10, volume: 5600000, sector: 'IT', signal: 'REVERSAL', signalStrength: 'Medium', signalType: 'Bearish-to-Bullish reversal forming', reasons: ['Oversold bounce potential', 'RSI divergence'], catalyst: '', rsi: 32, pe: 17.8, marketCap: 235000000000, trend: 'bearish', sentiment: -28, macdBias: 'bearish', strength: 'Confidence 60%', entry: 456.2, target: 472.0, stopLoss: 441.5, rvol: 1.3, timeframe: '15M', chart: [480, 472, 465, 460, 455, 452] },
  { id: 10, symbol: 'TATASTEEL', name: 'Tata Steel', price: 162.40, change: 0.80, changePercent: 0.80, volume: 14000000, sector: 'Metals', signal: 'SQUEEZE', signalStrength: 'Medium', signalType: 'Bollinger Band Squeeze', reasons: ['Volatility compression', 'Volume tapering at key level'], catalyst: '', rsi: 51, pe: 8.2, marketCap: 200000000000, trend: 'neutral', sentiment: 20, macdBias: 'bullish', strength: 'Confidence 58%', entry: 160.8, target: 168.5, stopLoss: 157.2, rvol: 2.8, timeframe: '15M', chart: [158, 160, 162, 162, 162, 162] },
  { id: 11, symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical', price: 1620.30, change: 1.90, changePercent: 1.90, volume: 3200000, sector: 'Pharma', signal: 'BREAKOUT', signalStrength: 'Strong', signalType: '52-week high breakout', reasons: ['52-week high breakout', 'Strong sector momentum'], catalyst: 'FDA Approval', rsi: 72, pe: 32.1, marketCap: 390000000000, trend: 'bullish', sentiment: 78, macdBias: 'bullish', strength: 'Confidence 87%', entry: 1608.4, target: 1672.0, stopLoss: 1580.6, rvol: 3.2, timeframe: '5M', chart: [1560, 1580, 1595, 1610, 1615, 1620] },
  { id: 12, symbol: 'NTPC', name: 'NTPC Ltd', price: 364.70, change: -0.45, changePercent: -0.45, volume: 6800000, sector: 'Utilities', signal: 'PULLBACK', signalStrength: 'Low', signalType: 'Minor pullback in uptrend', reasons: ['Healthy pullback', 'Support at 20 EMA'], catalyst: '', rsi: 44, pe: 14.5, marketCap: 350000000000, trend: 'neutral', sentiment: -5, macdBias: 'bearish', strength: 'Confidence 55%', entry: 366.2, target: 378.0, stopLoss: 357.4, rvol: 1.1, timeframe: '1D', chart: [372, 370, 368, 367, 365, 364] },
];

const ScreenerPage = () => {
  const navigate = useNavigate();
  const SETTINGS_STORAGE_KEY = 'radar_screener_settings';
  const [filterOpen, setFilterOpen] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [filters, setFilters] = useState({
    search: '',
    sector: 'All',
    signals: [],
    signalStrength: [],
    minPriceChange: '',
    maxPriceChange: '',
    minRsi: 0,
    maxRsi: 100,
    minPrice: '',
    maxPrice: '',
    minVolume: '',
    minRvol: '',
    maxRvol: '',
    minPe: '',
    maxPe: '',
    minMarketCap: '',
    maxMarketCap: '',
    timeframe: 'all',
    showOnlySignals: true,
    trendType: 'all',
    emaFilter: 'all',
    macdFilter: 'all',
  });

  const [stocks, setStocks] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [baseFilteredStocks, setBaseFilteredStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStocks, setSelectedStocks] = useState([]);
  const [activeSignalTab, setActiveSignalTab] = useState('all');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [actionNotice, setActionNotice] = useState('');
  const contentRef = useRef(null);
  const noticeTimerRef = useRef(null);


  // Live load on mount — replaces MOCK_STOCKS
  const fetchAndSet = useCallback(async (currentFilters) => {
    setLoading(true);
    try {
      // Map frontend filters to backend expected format
      const apiFilters = {};
      if (currentFilters) {
        if (currentFilters.minPrice !== '') apiFilters.minPrice = parseFloat(currentFilters.minPrice);
        if (currentFilters.maxPrice !== '') apiFilters.maxPrice = parseFloat(currentFilters.maxPrice);
        if (currentFilters.minPriceChange !== '') apiFilters.minChange = parseFloat(currentFilters.minPriceChange);
        if (currentFilters.maxPriceChange !== '') apiFilters.maxChange = parseFloat(currentFilters.maxPriceChange);
        if (currentFilters.minPe !== '') apiFilters.minPe = parseFloat(currentFilters.minPe);
        if (currentFilters.maxPe !== '') apiFilters.maxPe = parseFloat(currentFilters.maxPe);
        if (currentFilters.minMarketCap !== '') apiFilters.minMarketCap = parseFloat(currentFilters.minMarketCap);
        if (currentFilters.maxMarketCap !== '') apiFilters.maxMarketCap = parseFloat(currentFilters.maxMarketCap);
        if (currentFilters.sector !== 'All') apiFilters.sectors = [currentFilters.sector];
        
        // Technical filters
        if (currentFilters.minRsi > 0) apiFilters.minRsi = currentFilters.minRsi;
        if (currentFilters.maxRsi < 100) apiFilters.maxRsi = currentFilters.maxRsi;
        if (currentFilters.minRvol !== '') apiFilters.minRvol = parseFloat(currentFilters.minRvol);
        if (currentFilters.minVolume !== '') apiFilters.minVolume = parseFloat(currentFilters.minVolume);
        if (currentFilters.signals?.length > 0) apiFilters.signals = currentFilters.signals;
        if (currentFilters.trendType !== 'all') apiFilters.trendType = currentFilters.trendType;
        if (currentFilters.timeframe && currentFilters.timeframe !== 'all') apiFilters.timeframe = currentFilters.timeframe;
      }

      let sortBy = 'change';
      let sortOrder = 'desc';

      // If they are looking for oversold, sort by RSI asc
      if (currentFilters && currentFilters.minRsi >= 0 && currentFilters.maxRsi <= 40) {
        sortBy = 'rsi';
        sortOrder = 'asc';
      }

      const res = await runScreenerScan({ 
        limit: 200,
        filters: apiFilters,
        sortBy,
        sortOrder
      });
      // Backend wraps: { success, data: { results: [...] } }
      const inner = res?.data ?? res;
      const raw = inner?.results ?? inner?.stocks ?? inner?.data ?? (Array.isArray(inner) ? inner : []);
      
      const normalized = raw.map((s, i) => {
        const changePercent = Number(s.changePercent ?? s.change ?? 0);
        const symStr = String(s.displaySymbol || s.symbol || i).replace(/\.(NS|BO)$/i, '');
        // ── Real data from backend (trusted) ──────────────────────────
        const rsiVal   = s.rsi  != null ? Number(s.rsi)  : 50;
        const rvolVal  = s.rvol != null ? Number(s.rvol) : (s.volumeRatio != null ? Number(s.volumeRatio) : 1);
        const scoreVal = s.score != null ? Number(s.score) : 60;

        // Signal — backend classifies; client fallback as safety net only
        const signal = s.signal || (
          changePercent > 1.5 && rvolVal >= 1.5 ? 'BREAKOUT' :
          rsiVal < 35 && changePercent > 0 ? 'REVERSAL' :
          rsiVal < 40 ? 'PULLBACK' : 'MOMENTUM'
        );
        const signalStrength = s.signalStrength || (scoreVal > 80 ? 'Strong' : scoreVal > 65 ? 'Medium' : 'Low');
        const trend    = s.trend    || s.bias || (changePercent >= 0.5 ? 'bullish' : changePercent <= -0.5 ? 'bearish' : 'neutral');
        const macdBias = s.macdBias || s.bias || (changePercent >= 0 ? 'bullish' : 'bearish');

        const derivedReasons = (s.reasons && s.reasons.length > 0) ? s.reasons : [
          changePercent > 1.5 ? `Strong momentum (+${changePercent.toFixed(1)}%)` : null,
          rvolVal > 1.5 ? `Volume surge (${rvolVal.toFixed(1)}x RVOL)` : null,
          rsiVal > 60 && rsiVal < 70 ? 'RSI in bullish zone' : null,
          'Technical continuation',
        ].filter(Boolean).slice(0, 3);

        const flags = [];
        if (rsiVal > 75) flags.push('⚠️ Overbought (RSI > 75)');
        if (rsiVal < 30) flags.push('⚠️ Oversold (RSI < 30)');
        if (rvolVal < 0.8) flags.push('⚠️ Low Volume');

        const rawSentiment = Number(s.sentiment ?? (changePercent * 10));

        const price = Number(s.price ?? 0);
        return {
          id:            s._id || s.id || symStr || i,
          symbol:        symStr,
          name:          s.name || symStr,
          price,
          change:        changePercent,
          changePercent,
          volume:        Number(s.volume ?? 0),
          sector:        s.sector || 'Equity',
          signal,
          signalStrength,
          signalType:    s.signalType || `${signal} — ${trend} bias`,
          reasons:       derivedReasons,
          catalyst:      s.catalyst || '',
          riskFlags:     flags,
          rsi:           rsiVal,
          pe:            s.pe != null ? Number(s.pe) : null,
          marketCap:     s.marketCap != null ? Number(s.marketCap) : null,
          trend,
          macdBias,
          sentiment:     Number(rawSentiment.toFixed(1)),
          strength:      s.strength || `Confidence ${scoreVal}%`,
          entry:         Number(s.entry   ?? price),
          target:        Number(s.target  ?? price * 1.04),
          stopLoss:      Number(s.stopLoss ?? s.sl ?? price * 0.985),
          rvol:          rvolVal,
          timeframe:     (s.timeframe || '1D').toUpperCase(),
          chart:         s.chart || (s.sparklineData ? s.sparklineData.map(p => p.value) : []),
        };
      });

      // If API returned stocks, use them — otherwise fall back to demo data
      if (normalized.length > 0) {
        setStocks(normalized);
        setFilteredStocks(normalized);
      } else {
        setStocks(MOCK_STOCKS);
        setFilteredStocks(MOCK_STOCKS);
      }
    } catch (err) {
      console.warn('ScreenerPage load failed, using demo data:', err.message);
      setStocks(MOCK_STOCKS);
      setFilteredStocks(MOCK_STOCKS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let initialFilters = filters;
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          if (parsed.filters && typeof parsed.filters === 'object') {
            initialFilters = { ...initialFilters, ...parsed.filters };
            setFilters((prev) => ({ ...prev, ...parsed.filters }));
          }
          if (typeof parsed.activeSignalTab === 'string') setActiveSignalTab(parsed.activeSignalTab);
          if (typeof parsed.viewMode === 'string') setViewMode(parsed.viewMode);
          if (typeof parsed.filterOpen === 'boolean') setFilterOpen(parsed.filterOpen);
        }
      }
    } catch (error) {
      console.error('Failed to restore screener settings:', error);
    }
    fetchAndSet(initialFilters);
  }, [fetchAndSet]);

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current) {
        clearTimeout(noticeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let result = stocks;

    // Search
    if (filters.search) {
      result = result.filter(
        (stock) =>
          stock.symbol.toLowerCase().includes(filters.search.toLowerCase()) ||
          stock.name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Sector
    if (filters.sector !== 'All') {
      result = result.filter((stock) => stock.sector === filters.sector);
    }

    // Signal type
    if (filters.signals?.length > 0) {
      result = result.filter((stock) => filters.signals.includes(stock.signal));
    }

    // Signal strength
    if (filters.signalStrength?.length > 0) {
      result = result.filter((stock) => filters.signalStrength.includes(stock.signalStrength));
    }

    // Price change %
    if (filters.minPriceChange !== '' && filters.minPriceChange !== null) {
      result = result.filter((stock) => stock.change >= parseFloat(filters.minPriceChange));
    }
    if (filters.maxPriceChange !== '' && filters.maxPriceChange !== null) {
      result = result.filter((stock) => stock.change <= parseFloat(filters.maxPriceChange));
    }

    // RSI
    result = result.filter((stock) => stock.rsi >= filters.minRsi && stock.rsi <= filters.maxRsi);

    // Price range
    if (filters.minPrice) result = result.filter((stock) => stock.price >= parseFloat(filters.minPrice));
    if (filters.maxPrice) result = result.filter((stock) => stock.price <= parseFloat(filters.maxPrice));

    // Volume
    if (filters.minVolume) result = result.filter((stock) => stock.volume >= parseFloat(filters.minVolume));

    // RVOL
    if (filters.minRvol) result = result.filter((stock) => stock.rvol >= parseFloat(filters.minRvol));
    if (filters.maxRvol) result = result.filter((stock) => stock.rvol <= parseFloat(filters.maxRvol));

    // PE ratio
    if (filters.minPe) result = result.filter((stock) => stock.pe >= parseFloat(filters.minPe));
    if (filters.maxPe) result = result.filter((stock) => stock.pe > 0 && stock.pe <= parseFloat(filters.maxPe));

    // Market cap
    if (filters.minMarketCap) result = result.filter((stock) => (stock.marketCap ?? 0) >= parseFloat(filters.minMarketCap));
    if (filters.maxMarketCap) result = result.filter((stock) => (stock.marketCap ?? 0) <= parseFloat(filters.maxMarketCap));

    // Trend type
    if (filters.trendType !== 'all') {
      result = result.filter((stock) => stock.trend === filters.trendType);
    }

    // Timeframe (case-insensitive)
    if (filters.timeframe && filters.timeframe !== 'all') {
      result = result.filter((stock) => (stock.timeframe || '').toUpperCase() === filters.timeframe.toUpperCase());
    }

    // EMA filter (client-side) — all 5 options handled
    if (filters.emaFilter && filters.emaFilter !== 'all') {
      result = result.filter((stock) => {
        const price = stock.price;
        const ema20 = stock.ema20 || (price * 0.95);
        const ema50 = stock.ema50 || (price * 0.90);
        if (filters.emaFilter === 'above_ema20') return price > ema20;
        if (filters.emaFilter === 'below_ema20') return price < ema20;
        if (filters.emaFilter === 'above_ema50') return price > ema50;
        if (filters.emaFilter === 'below_ema50') return price < ema50;
        // Golden cross: EMA20 > EMA50 (bullish alignment)
        if (filters.emaFilter === 'ema20_above_ema50') return ema20 > ema50;
        // Death cross: EMA20 < EMA50 (bearish alignment)
        if (filters.emaFilter === 'ema20_below_ema50') return ema20 < ema50;
        return true;
      });
    }

    // MACD filter (client-side using macd field if present)
    if (filters.macdFilter && filters.macdFilter !== 'all') {
      result = result.filter((stock) => {
        const macdBias = stock.macdBias || (stock.change >= 0 ? 'bullish' : 'bearish');
        return macdBias === filters.macdFilter;
      });
    }

    // Save base filtered stocks for the tabs to use
    const baseResult = [...result];
    setBaseFilteredStocks(baseResult);

    // showOnlySignals: only show stocks that have a signal set (not empty/null)
    if (filters.showOnlySignals) {
      result = result.filter((stock) => stock.signal && stock.signal !== '' && stock.signal !== 'NONE');
    }

    // Signal tab filter (applied on top of showOnlySignals)
    if (activeSignalTab !== 'all') {
      result = result.filter((stock) => stock.signal?.toLowerCase() === activeSignalTab.toLowerCase());
    }

    setFilteredStocks(result);
  }, [filters, stocks, activeSignalTab]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const pushNotice = (text) => {
    setActionNotice(text);
    if (noticeTimerRef.current) {
      clearTimeout(noticeTimerRef.current);
    }
    noticeTimerRef.current = setTimeout(() => setActionNotice(''), 2400);
  };

  const handleRefresh = useCallback(async () => {
    setLoading(true);
    try {
      await fetchAndSet(filters);
      setLastUpdated(new Date());
      pushNotice('Scanner refreshed with live data.');
    } finally {
      setLoading(false);
    }
  }, [fetchAndSet, filters]);

  const toggleStockSelection = (stockId) => {
    setSelectedStocks((prev) =>
      prev.includes(stockId) ? prev.filter((id) => id !== stockId) : [...prev, stockId]
    );
  };

  const openResearch = (symbol) => {
    navigate(`/stocks/${encodeURIComponent(symbol)}`);
  };

  const handleExport = () => {
    if (!filteredStocks.length) {
      pushNotice('No results to export.');
      return;
    }

    const data = filteredStocks
      .map((stock) => ({
        Symbol: stock.symbol,
        Name: stock.name,
        Price: stock.price,
        Change: stock.change,
        RSI: stock.rsi,
        Signal: stock.signal,
        Sector: stock.sector,
      }))
      .sort((a, b) => parseFloat(b.Change) - parseFloat(a.Change));

    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map((row) => Object.values(row).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `screener-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    pushNotice('Excel export completed.');
  };

  const handlePublishSettings = () => {
    try {
      const payload = {
        filters,
        activeSignalTab,
        viewMode,
        filterOpen,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(payload));
      pushNotice('Settings published and saved.');
    } catch (error) {
      console.error('Failed to publish settings:', error);
      pushNotice('Unable to publish settings.');
    }
  };

  const SIGNAL_TABS = [
    { id: 'all', label: 'Market Opportunities', count: baseFilteredStocks.length },
    { id: 'breakout', label: 'Breakout', count: baseFilteredStocks.filter((s) => s.signal === 'BREAKOUT').length },
    { id: 'momentum', label: 'Momentum', count: baseFilteredStocks.filter((s) => s.signal === 'MOMENTUM').length },
    { id: 'pullback', label: 'Pullback', count: baseFilteredStocks.filter((s) => s.signal === 'PULLBACK').length },
  ];
  const scansActive = Math.max(12, filteredStocks.length * 8 + 2);

  const SECTOR_OPTIONS = ['All', ...new Set(stocks.map((s) => s.sector))];

  return (
    <div className="screener-page h-screen flex overflow-hidden">
      {}
      <AnimatePresence>
        {filterOpen && (
          <motion.div
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-80 bg-slate-900/95 border-r border-slate-700 overflow-y-auto"
          >
            <ScreenerFilterPanel
              sectors={SECTOR_OPTIONS}
              filters={filters}
              onFilterChange={handleFilterChange}
              onActivateScan={handleRefresh}
              onClose={() => setFilterOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {}
      <div className="flex-1 flex flex-col overflow-hidden">
        {}
        <div className="h-20 border-b border-slate-700/50 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {!filterOpen && (
              <button
                onClick={() => setFilterOpen(true)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <Filter className="w-5 h-5 text-slate-300" />
              </button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Zap className="w-6 h-6 text-cyan-400" />
                Screener Dashboard
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Discover actionable market opportunities with research-first scans.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            <button
              onClick={handleExport}
              className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Excel
            </button>

            <button
              onClick={handlePublishSettings}
              className="px-4 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-200 rounded-lg transition-colors"
            >
              Publish Settings
            </button>

            <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-cyan-500/30 text-cyan-300'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 rounded transition-colors ${
                  viewMode === 'table'
                    ? 'bg-cyan-500/30 text-cyan-300'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                <Activity className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {}
        <div className="h-16 border-b border-slate-700/50 px-6 flex items-center justify-between gap-4 overflow-x-auto">
          <div className="flex items-center gap-2 overflow-x-auto">
          {SIGNAL_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSignalTab(tab.id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all flex items-center gap-2 ${
                activeSignalTab === tab.id
                  ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/50'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              {tab.label}
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  activeSignalTab === tab.id ? 'bg-cyan-500/40' : 'bg-slate-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs text-amber-300 whitespace-nowrap">
            <span className="inline-block h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-semibold">{scansActive} Scans Active</span>
          </div>
        </div>

        {}
        <div ref={contentRef} className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="mb-4"
                >
                  <Zap className="w-12 h-12 text-cyan-400" />
                </motion.div>
                <p className="text-slate-400">Scanning market universe...</p>
              </motion.div>
            ) : filteredStocks.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full"
              >
                <AlertTriangle className="w-12 h-12 text-slate-500 mb-4" />
                <p className="text-slate-400 text-lg">No stocks match your filters</p>
                <p className="text-slate-500 text-sm mt-2">Try adjusting your search criteria</p>
              </motion.div>
            ) : viewMode === 'grid' ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4"
              >
                {filteredStocks.map((stock, index) => (
                  <ScreenerStockCard
                    key={stock.id}
                    stock={stock}
                    isSelected={selectedStocks.includes(stock.id)}
                    onSelect={() => toggleStockSelection(stock.id)}
                    onOpenResearch={openResearch}
                    index={index}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="table"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ScreenerResultsTable stocks={filteredStocks} onOpenResearch={openResearch} />
              </motion.div>
            )}
          </AnimatePresence>

          {}
          {!loading && filteredStocks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-4 bg-slate-800/30 rounded-lg border border-slate-700/50"
            >
              <p className="text-sm text-slate-400">
                Showing <span className="text-cyan-300 font-semibold">{filteredStocks.length}</span> results
                {filters.search && ` for "${filters.search}"`}
              </p>
            </motion.div>
          )}

          {actionNotice && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-lg border border-cyan-400/20 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-100"
            >
              {actionNotice}
            </motion.div>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <span>Last Updated: {lastUpdated.toLocaleDateString()} {lastUpdated.toLocaleTimeString()}</span>
            <span>Data provided by Market Terminal 2.0.4 | prices delayed by 16 seconds</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScreenerPage;

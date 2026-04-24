import { useMemo, useState } from 'react';
import { Activity, BarChart2, Settings2, TrendingUp, TrendingDown } from 'lucide-react';

/* ── helpers ─────────────────────────────────────────── */
const buildPath = (series, w, h) => {
  if (!series || series.length < 2) return '';
  const max = Math.max(...series);
  const min = Math.min(...series);
  const range = max - min || 1;
  return series
    .map((v, i) => {
      const x = (i / (series.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 12) - 6;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
};

const TIMEFRAMES = ['1m', '5m', '10m', '15m', '30m', '1H', '4H', '1D'];
const INDICATORS = ['EMA', 'RSI', 'MACD'];

/* ── component ───────────────────────────────────────── */
export default function MainChartSection({ chart }) {
  const [timeframe, setTimeframe] = useState('1D');
  const [chartType, setChartType] = useState('line');        // 'line' | 'candles'
  const [activeIndicators, setActiveIndicators] = useState(['EMA']);
  const [showIndPanel, setShowIndPanel] = useState(false);

  const series = chart?.timeframes?.[timeframe] ?? chart?.timeframes?.['1D'] ?? [];
  const isPositive = series.length >= 2 && series[series.length - 1] >= series[0];

  const pathData   = useMemo(() => buildPath(series, 960, 340), [series]);
  const fillPath   = pathData ? `${pathData} L 960 340 L 0 340 Z` : '';

  const strokeColor = isPositive ? '#22d3ee' : '#f87171';
  const gradStart   = isPositive ? 'rgba(34,211,238,0.4)' : 'rgba(248,113,113,0.4)';
  const gradEnd     = 'rgba(0,0,0,0)';

  const latestPrice = series[series.length - 1] ?? 0;
  const firstPrice  = series[0] ?? latestPrice;
  const pctChange   = firstPrice ? (((latestPrice - firstPrice) / firstPrice) * 100).toFixed(2) : '0.00';

  const toggleIndicator = (name) =>
    setActiveIndicators(prev =>
      prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name]
    );

  return (
    <section className="rounded-2xl border border-white/10 bg-[#0B1220] overflow-hidden">

      {/* ── Header bar ───────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-white/5 bg-[#080d18]">

        {/* Left: symbol + price change badge */}
        <div className="flex items-center gap-3">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Chart</h2>
          <span
            className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
              isPositive
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
            }`}
          >
            {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {isPositive ? '+' : ''}{pctChange}%
          </span>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Chart-type toggle */}
          <div className="flex bg-[#101828] rounded-lg p-1 border border-white/5">
            <button
              onClick={() => setChartType('line')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
                chartType === 'line' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Activity size={12} /> Line
            </button>
            <button
              onClick={() => setChartType('candles')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
                chartType === 'candles' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <BarChart2 size={12} /> Candles
            </button>
          </div>

          {/* Indicators dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowIndPanel(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#101828] border border-white/5 text-[11px] font-bold text-slate-300 hover:text-white transition-colors"
            >
              <Settings2 size={12} /> Indicators
              {activeIndicators.length > 0 && (
                <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 text-[9px] font-black text-slate-900">
                  {activeIndicators.length}
                </span>
              )}
            </button>
            {showIndPanel && (
              <div className="absolute right-0 top-full mt-1 z-20 w-44 rounded-xl border border-white/10 bg-[#0e1624] shadow-2xl p-2">
                <p className="px-2 py-1 text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Indicators</p>
                {INDICATORS.map(ind => (
                  <label key={ind} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-white/5 transition-colors">
                    <input
                      type="checkbox"
                      checked={activeIndicators.includes(ind)}
                      onChange={() => toggleIndicator(ind)}
                      className="accent-cyan-400 h-3 w-3"
                    />
                    <span className="text-xs font-semibold text-slate-300">{ind}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Timeframe pills ───────────────────────────── */}
      <div className="flex items-center gap-1 px-5 py-2.5 border-b border-white/5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {TIMEFRAMES.map(tf => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              timeframe === tf
                ? 'bg-cyan-500 text-slate-900 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tf}
          </button>
        ))}
        <div className="flex-1" />
        <span className="text-[10px] font-mono text-slate-500 flex-shrink-0">
          {series.length} candles
        </span>
      </div>

      {/* ── Chart area ────────────────────────────────── */}
      <div className="relative h-[58vh] min-h-[340px] bg-[#0B1220] px-2 pb-2">
        {/* grid lines */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage:
              'linear-gradient(rgba(148,163,184,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(148,163,184,0.07) 1px,transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <svg
          viewBox="0 0 960 340"
          preserveAspectRatio="none"
          className="h-full w-full"
        >
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={gradStart} />
              <stop offset="100%" stopColor={gradEnd} />
            </linearGradient>
          </defs>

          {/* fill */}
          {fillPath && (
            <path d={fillPath} fill="url(#chartGrad)" opacity="0.5" />
          )}

          {/* line */}
          {pathData && (
            <path
              d={pathData}
              fill="none"
              stroke={strokeColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>

        {/* price label (top-right) */}
        <div className="absolute top-3 right-4 text-right pointer-events-none">
          <div className="text-lg font-black text-white font-mono">
            ₹{latestPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className={`text-xs font-bold mt-0.5 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isPositive ? '▲' : '▼'} {Math.abs(pctChange)}%&nbsp;<span className="text-slate-500 font-semibold">this {timeframe}</span>
          </div>
        </div>
      </div>

      {/* ── Compact data strip ────────────────────────── */}
      <div className="grid grid-cols-3 divide-x divide-white/5 border-t border-white/5">
        {[
          { label: 'Trend', value: isPositive ? 'Bullish' : 'Bearish', color: isPositive ? 'text-emerald-400' : 'text-rose-400' },
          { label: 'RSI (14)', value: '64.5 · Neutral', color: 'text-cyan-400' },
          { label: 'Volume', value: 'Above Avg', color: 'text-violet-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="px-5 py-3">
            <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">{label}</div>
            <div className={`text-xs font-bold ${color}`}>{value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

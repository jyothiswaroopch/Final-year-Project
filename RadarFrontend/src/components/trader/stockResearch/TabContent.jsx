import { Zap, TrendingUp, TrendingDown, AlertTriangle, BarChart2 } from 'lucide-react';

/* ── tiny helpers ── */
const Row = ({ label, value, color = 'text-white', sub }) => (
  <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
    <div>
      <div className="text-xs font-semibold text-slate-400">{label}</div>
      {sub && <div className="text-[10px] text-slate-600 mt-0.5">{sub}</div>}
    </div>
    <span className={`text-sm font-bold ${color}`}>{value}</span>
  </div>
);

const MeterBar = ({ label, value, max = 100, color = 'bg-cyan-500' }) => (
  <div>
    <div className="flex justify-between mb-1.5">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
      <span className="text-[10px] font-black text-white">{value}/{max}</span>
    </div>
    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${(value / max) * 100}%`, transition: 'width 0.6s ease' }} />
    </div>
  </div>
);

const HeatCell = ({ symbol, value }) => {
  const pos = value >= 0;
  const intensity = Math.min(Math.abs(value) / 3, 1);
  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-white/5 text-center"
      style={{ background: pos ? `rgba(16,185,129,${0.05 + intensity * 0.2})` : `rgba(239,68,68,${0.05 + intensity * 0.2})` }}>
      <span className="text-[10px] font-bold text-slate-400">{symbol}</span>
      <span className={`text-sm font-black mt-1 ${pos ? 'text-emerald-400' : 'text-rose-400'}`}>{pos ? '+' : ''}{value.toFixed(1)}%</span>
    </div>
  );
};

const MiniSparkline = ({ data, color = '#22d3ee' }) => {
  const max = Math.max(...data), min = Math.min(...data), range = max - min || 1;
  const w = 80, h = 28;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

/* ── INSIGHTS TAB ───────────────────────────────────── */
export const InsightsTab = ({ data }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {/* Left: meters */}
    <div className="space-y-4">
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-4">Signal Meters</p>
      <MeterBar label="Trend Strength"       value={78} color="bg-emerald-500" />
      <MeterBar label="Momentum Score"       value={64} color="bg-cyan-500" />
      <MeterBar label="Volume Confirmation"  value={85} color="bg-violet-500" />
      <MeterBar label="Breakout Probability" value={62} color="bg-amber-500" />
      <MeterBar label="Risk Meter"           value={32} color="bg-rose-500" />
      <div className="grid grid-cols-3 gap-3 mt-4">
        {[
          { label: 'Trend Bias',  value: 'Bullish',   color: 'text-emerald-400' },
          { label: 'Entry Zone',  value: '₹2,840–65', color: 'text-cyan-400' },
          { label: 'Stop Loss',   value: '₹2,798',    color: 'text-rose-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="p-3 rounded-xl border border-white/5" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">{label}</div>
            <div className={`text-sm font-black ${color}`}>{value}</div>
          </div>
        ))}
      </div>
    </div>
    {/* Right: insights list */}
    <div>
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-4">AI Smart Insights</p>
      <div className="space-y-3">
        {[...(data.whyThisStock ?? []), ...(data.smartInsights ?? [])].map((t, i) => (
          <div key={i} className="flex gap-3 p-3 rounded-xl border border-white/5" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <TrendingUp size={14} className="text-cyan-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-slate-300 leading-relaxed">{t}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ── SECTOR TAB ─────────────────────────────────────── */
export const SectorTab = ({ data }) => {
  const heatmap = [
    { symbol: 'IT',     value: 2.1 }, { symbol: 'BANK',   value: -0.8 },
    { symbol: 'ENERGY', value: 1.5 }, { symbol: 'PHARMA', value: 0.3 },
    { symbol: 'FMCG',   value: -0.2 },{ symbol: 'AUTO',   value: 1.8 },
    { symbol: 'METAL',  value: -1.4 },{ symbol: 'REALTY',  value: 2.4 },
  ];
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-3">Sector Heatmap</p>
        <div className="grid grid-cols-4 gap-2">{heatmap.map(h => <HeatCell key={h.symbol} {...h} />)}</div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-3">Sector Strength Score</p>
          <div className="space-y-3">
            <MeterBar label="Energy vs NIFTY"    value={72} color="bg-emerald-500" />
            <MeterBar label="Relative Strength"  value={64} color="bg-cyan-500" />
            <MeterBar label="Sector Momentum"    value={58} color="bg-violet-500" />
          </div>
        </div>
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-3">Peer Performance</p>
          <div className="space-y-1">
            {[...(data.sectorStrength?.peers ?? []), { symbol: 'RELIANCE', changePercent: 1.83 }]
              .sort((a, b) => b.changePercent - a.changePercent)
              .map(p => (
                <div key={p.symbol} className="flex items-center gap-3 py-1.5 border-b border-white/5 last:border-0">
                  <span className="text-xs font-bold text-white w-20">{p.symbol}</span>
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${p.changePercent >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                      style={{ width: `${Math.min(Math.abs(p.changePercent) * 20, 100)}%` }} />
                  </div>
                  <span className={`text-xs font-black w-14 text-right ${p.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {p.changePercent >= 0 ? '+' : ''}{p.changePercent.toFixed(2)}%
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── ACTIVITY TAB ───────────────────────────────────── */
export const ActivityTab = () => {
  const feed = [
    { time: '14:38', type: 'BREAKOUT', msg: 'Price broke above ₹2,868 resistance with 1.8x volume surge', color: 'text-emerald-400', bg: 'rgba(16,185,129,0.07)', border: 'rgba(16,185,129,0.2)', icon: TrendingUp },
    { time: '13:52', type: 'VOL ALERT', msg: 'Unusual volume: 2.3x avg — institutional accumulation signal', color: 'text-cyan-400',    bg: 'rgba(34,211,238,0.07)', border: 'rgba(34,211,238,0.2)', icon: BarChart2 },
    { time: '12:15', type: 'CAUTION',   msg: 'Fake breakout detected at ₹2,875 — rejected at upper wick', color: 'text-amber-400',   bg: 'rgba(245,158,11,0.07)', border: 'rgba(245,158,11,0.2)', icon: AlertTriangle },
    { time: '11:30', type: 'SIGNAL',    msg: 'EMA 20 crossed above EMA 50 — Golden Cross confirmed', color: 'text-violet-400',  bg: 'rgba(139,92,246,0.07)', border: 'rgba(139,92,246,0.2)', icon: Zap },
    { time: '10:45', type: 'VOL ALERT', msg: 'Opening range breakout — first 15m candle above prev day high', color: 'text-cyan-400', bg: 'rgba(34,211,238,0.07)', border: 'rgba(34,211,238,0.2)', icon: BarChart2 },
    { time: '10:05', type: 'BEARISH',   msg: 'RSI divergence at 09:55 — price rose but RSI declined', color: 'text-rose-400',    bg: 'rgba(239,68,68,0.07)', border: 'rgba(239,68,68,0.2)', icon: TrendingDown },
  ];
  return (
    <div className="space-y-3">
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-4">Intraday Activity Feed</p>
      {feed.map((item, i) => {
        const Icon = item.icon;
        return (
          <div key={i} className="flex gap-4 p-4 rounded-xl border"
            style={{ background: item.bg, borderColor: item.border }}>
            <div className="flex-shrink-0 flex flex-col items-center gap-1">
              <Icon size={16} className={item.color} />
              <span className="text-[9px] font-bold text-slate-500">{item.time}</span>
            </div>
            <div>
              <span className={`text-[9px] font-black uppercase tracking-widest ${item.color} mb-1 block`}>{item.type}</span>
              <p className="text-xs text-slate-300 leading-relaxed">{item.msg}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ── PERFORMANCE TAB ────────────────────────────────── */
export const PerformanceTab = ({ data }) => {
  const sparkData = {
    '1W': [100, 102, 101, 104, 103, 106, 104],
    '1M': [100, 103, 107, 105, 110, 108, 112],
    '6M': [100, 108, 115, 112, 120, 118, 123],
    '1Y': [100, 112, 125, 118, 134, 128, 140],
  };
  const niftyData = {
    '1W': [100, 101, 100, 102, 101, 103, 102],
    '1M': [100, 101, 103, 102, 105, 104, 107],
    '6M': [100, 104, 108, 106, 111, 109, 114],
    '1Y': [100, 107, 113, 110, 120, 116, 122],
  };
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(data.performanceBenchmarks ?? {}).map(([period, val]) => {
          const pos = val.startsWith('+');
          return (
            <div key={period} className="p-4 rounded-xl border border-white/5" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="flex items-start justify-between mb-3">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{period}</div>
                <span className={`text-sm font-black ${pos ? 'text-emerald-400' : 'text-rose-400'}`}>{val}</span>
              </div>
              {sparkData[period] && (
                <div className="flex items-end gap-3">
                  <div>
                    <div className="text-[8px] text-slate-600 mb-1">Stock</div>
                    <MiniSparkline data={sparkData[period]} color={pos ? '#10b981' : '#ef4444'} />
                  </div>
                  <div>
                    <div className="text-[8px] text-slate-600 mb-1">NIFTY</div>
                    <MiniSparkline data={niftyData[period] ?? []} color="#64748b" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="p-4 rounded-xl border border-white/5" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-4">Volatility Metrics</p>
          <div className="space-y-0">
            {[
              { label: 'Beta (1Y)',           value: '1.12',   color: 'text-cyan-400',    sub: 'vs NIFTY 50' },
              { label: 'ATR (14)',            value: '₹42.8',  color: 'text-white',       sub: '1.5% of price' },
              { label: 'Max Drawdown (1Y)',   value: '−18.4%', color: 'text-rose-400',    sub: 'Peak to trough' },
              { label: 'Sharpe Ratio',        value: '1.84',   color: 'text-emerald-400', sub: 'Risk-adjusted return' },
              { label: 'Std Deviation (30D)', value: '2.3%',   color: 'text-amber-400',   sub: 'Daily returns' },
            ].map(r => <Row key={r.label} {...r} />)}
          </div>
        </div>
        <div className="p-4 rounded-xl border border-white/5" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-4">vs Index Comparison</p>
          <div className="space-y-0">
            {[
              { label: '1W Alpha',  value: '+0.8%',  color: 'text-emerald-400', sub: 'Outperforming' },
              { label: '1M Alpha',  value: '+1.4%',  color: 'text-emerald-400', sub: 'Outperforming' },
              { label: '6M Alpha',  value: '+2.6%',  color: 'text-emerald-400', sub: 'Strong outperform' },
              { label: '1Y Alpha',  value: '+8.2%',  color: 'text-emerald-400', sub: 'Top decile' },
              { label: 'Rel. Str.', value: '1.46',   color: 'text-cyan-400',    sub: 'RS rating vs sector' },
            ].map(r => <Row key={r.label} {...r} />)}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── FUNDAMENTALS TAB ───────────────────────────────── */
export const FundamentalsTab = ({ data }) => {
  const quarterlyRevenue = [8.2, 8.8, 9.1, 9.4, 9.7];
  const quarterlyProfit  = [0.62, 0.70, 0.74, 0.76, 0.79];
  const quarters = ['Q2 FY24', 'Q3 FY24', 'Q4 FY24', 'Q1 FY25', 'Q2 FY25'];

  return (
    <div className="space-y-5">
      {/* Key ratios */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'P/E Ratio', value: '28.4',   color: 'text-white' },
          { label: 'P/B Ratio', value: '3.12',   color: 'text-white' },
          { label: 'ROE',       value: '18.2%',  color: 'text-emerald-400' },
          { label: 'ROCE',      value: '14.8%',  color: 'text-emerald-400' },
          { label: 'Debt/Eq',   value: '0.45',   color: 'text-amber-400' },
          { label: 'Div Yield', value: '1.45%',  color: 'text-cyan-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="p-4 rounded-xl border border-white/5 text-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">{label}</div>
            <div className={`text-lg font-black ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Quarterly charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {[
          { title: 'Quarterly Revenue (₹T)', values: quarterlyRevenue, color: '#22d3ee' },
          { title: 'Quarterly Profit (₹T)',  values: quarterlyProfit,  color: '#10b981' },
        ].map(({ title, values, color }) => {
          const max = Math.max(...values);
          return (
            <div key={title} className="p-4 rounded-xl border border-white/5" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-4">{title}</p>
              <div className="flex items-end gap-2 h-24">
                {values.map((v, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[9px] font-bold text-slate-400">{v}</span>
                    <div className="w-full rounded-t" style={{ height: `${(v / max) * 80}px`, background: color, opacity: 0.7 + (i / values.length) * 0.3 }} />
                    <span className="text-[8px] text-slate-600">{quarters[i]}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Other fundamentals */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Object.entries(data.fundamentals ?? {}).map(([k, v]) => (
          <div key={k} className="p-3 rounded-xl border border-white/5" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1 capitalize">{k.replace(/([A-Z])/g, ' $1')}</div>
            <div className="text-sm font-bold text-white">{String(v)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

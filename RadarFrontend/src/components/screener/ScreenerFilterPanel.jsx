import React, { useState } from 'react';
import { ChevronDown, X, Sliders, Zap, RotateCcw, TrendingUp, BarChart2, DollarSign, Activity, Target, Shield, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Preset scan configurations ──────────────────────────────────────────────
const PRESET_SCANS = [
  {
    id: 'breakout_kings',
    label: '🚀 Breakout Kings',
    desc: 'RVOL>2, RSI 55-70, strong momentum',
    filters: { signals: ['BREAKOUT'], minRsi: 55, maxRsi: 70, minRvol: '2', trendType: 'bullish', signalStrength: ['Strong'] },
  },
  {
    id: 'oversold_bounce',
    label: '🎯 Oversold Bounce',
    desc: 'RSI<35, pullback signal, low risk',
    filters: { signals: ['PULLBACK'], minRsi: 20, maxRsi: 35, trendType: 'all', signalStrength: [] },
  },
  {
    id: 'momentum_surfers',
    label: '⚡ Momentum Surfers',
    desc: 'MACD bullish, RSI 50-65, volume surge',
    filters: { signals: ['MOMENTUM'], minRsi: 50, maxRsi: 65, minRvol: '1.5', trendType: 'bullish' },
  },
  {
    id: 'overbought_alert',
    label: '⚠️ Overbought Alert',
    desc: 'RSI>75, potential reversal zone',
    filters: { minRsi: 75, maxRsi: 100, trendType: 'all' },
  },
  {
    id: 'value_momentum',
    label: '💎 Value + Momentum',
    desc: 'Low PE (<20), strong trend, positive change',
    filters: { maxPe: '20', minPriceChange: '0.5', trendType: 'bullish' },
  },
  {
    id: 'high_rvol',
    label: '🔊 High Volume Alert',
    desc: 'RVOL>3x, institutional activity spike',
    filters: { minRvol: '3', signals: [], trendType: 'all' },
  },
];

const DEFAULT_FILTERS = {
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
  trendType: 'all',
  emaFilter: 'all',     // 'above_ema20', 'below_ema20', 'above_ema50', 'all'
  macdFilter: 'all',    // 'bullish', 'bearish', 'all'
  showOnlySignals: true,
};

// ── Sub-component: collapsible section ───────────────────────────────────────
const Section = ({ title, icon: Icon, color = 'text-cyan-400', defaultOpen = false, badge, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-700/50">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full px-4 py-3 flex justify-between items-center hover:bg-slate-800/40 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-200">
          {Icon && <Icon className={`w-3.5 h-3.5 ${color}`} />}
          {title}
          {badge != null && (
            <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold">{badge}</span>
          )}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Sub-component: range input pair ──────────────────────────────────────────
const RangeInputs = ({ label, minKey, maxKey, minPlaceholder, maxPlaceholder, filters, onChange, prefix = '' }) => (
  <div>
    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
    <div className="grid grid-cols-2 gap-1.5">
      <input
        type="number"
        placeholder={minPlaceholder || 'Min'}
        value={filters[minKey] ?? ''}
        onChange={e => onChange(minKey, e.target.value)}
        className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-cyan-500 transition-colors placeholder-slate-600"
      />
      <input
        type="number"
        placeholder={maxPlaceholder || 'Max'}
        value={filters[maxKey] ?? ''}
        onChange={e => onChange(maxKey, e.target.value)}
        className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-cyan-500 transition-colors placeholder-slate-600"
      />
    </div>
  </div>
);

// ── Sub-component: pill multi-select ─────────────────────────────────────────
const PillSelect = ({ label, options, filterKey, filters, onChange }) => {
  const active = filters[filterKey] || [];
  const toggle = val => {
    const updated = active.includes(val) ? active.filter(v => v !== val) : [...active, val];
    onChange(filterKey, updated);
  };
  return (
    <div>
      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
      <div className="flex flex-wrap gap-1.5">
        {options.map(({ value, label: lbl, color }) => (
          <button
            key={value}
            onClick={() => toggle(value)}
            className={`px-2.5 py-1 text-xs rounded-full border font-semibold transition-all ${
              active.includes(value)
                ? `${color || 'bg-cyan-500/30 border-cyan-400/60 text-cyan-200'}`
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
            }`}
          >
            {lbl}
          </button>
        ))}
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const ScreenerFilterPanel = ({ sectors, filters, onFilterChange, onActivateScan, onClose }) => {
  const handleChange = (key, value) => onFilterChange({ ...filters, [key]: value });

  const handleReset = () => onFilterChange({ ...DEFAULT_FILTERS });

  const applyPreset = (preset) => {
    onFilterChange({ ...DEFAULT_FILTERS, ...preset.filters });
  };

  // Count active non-default filters
  const activeCount = [
    filters.sector !== 'All',
    filters.trendType !== 'all',
    filters.signals?.length > 0,
    filters.signalStrength?.length > 0,
    filters.minPriceChange !== '' && filters.minPriceChange !== 0,
    filters.maxPriceChange !== '',
    filters.minRsi > 0 || filters.maxRsi < 100,
    filters.minPrice !== '',
    filters.maxPrice !== '',
    filters.minVolume !== '',
    filters.minRvol !== '',
    filters.minPe !== '',
    filters.maxPe !== '',
    filters.minMarketCap !== '',
    filters.timeframe !== 'all',
    filters.emaFilter !== 'all',
    filters.macdFilter !== 'all',
  ].filter(Boolean).length;

  return (
    <div className="h-full flex flex-col bg-slate-900/95">
      {/* Header */}
      <div className="px-4 py-3.5 flex justify-between items-center border-b border-slate-700 bg-slate-900 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold text-white">Scanner Filters</h2>
          {activeCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500 text-black font-black">{activeCount}</span>
          )}
        </div>
        <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded transition-colors">
          <X className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Scrollable filter area */}
      <div className="flex-1 overflow-y-auto">

        {/* ── PRESET SCANS ── */}
        <div className="px-4 py-3 border-b border-slate-700/50">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">⚡ Quick Scans</p>
          <div className="grid grid-cols-2 gap-1.5">
            {PRESET_SCANS.map(preset => (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                title={preset.desc}
                className="text-left px-2.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-cyan-500/40 rounded-lg text-xs text-slate-300 font-semibold transition-all leading-tight"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── SEARCH ── */}
        <div className="px-4 py-3 border-b border-slate-700/50">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Search</label>
          <input
            type="text"
            placeholder="Symbol or company name..."
            value={filters.search}
            onChange={e => handleChange('search', e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-cyan-500 transition-colors placeholder-slate-600"
          />
        </div>

        {/* ── MARKET STRUCTURE ── */}
        <Section title="Market Structure" icon={TrendingUp} defaultOpen={true}>
          {/* Sector */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Sector</label>
            <select
              value={filters.sector}
              onChange={e => handleChange('sector', e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-cyan-500 transition-colors"
            >
              {(sectors || ['All']).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Trend Direction — simple radio buttons */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Trend Direction</label>
            <div className="grid grid-cols-4 gap-1">
              {[
                { value: 'all',     label: 'All',       cls: 'text-slate-300 border-slate-500 bg-slate-600/50' },
                { value: 'bullish', label: '▲ Bull',    cls: 'text-emerald-300 border-emerald-400/50 bg-emerald-500/20' },
                { value: 'neutral', label: '→ Flat',    cls: 'text-amber-300 border-amber-400/50 bg-amber-500/20' },
                { value: 'bearish', label: '▼ Bear',    cls: 'text-rose-300 border-rose-400/50 bg-rose-500/20' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleChange('trendType', opt.value)}
                  className={`py-1.5 text-[10px] rounded-lg font-bold transition-all border ${
                    filters.trendType === opt.value
                      ? opt.cls
                      : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Timeframe */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Timeframe</label>
            <div className="grid grid-cols-4 gap-1">
              {['all', '5m', '15m', '1D'].map(tf => (
                <button
                  key={tf}
                  onClick={() => handleChange('timeframe', tf)}
                  className={`py-1.5 text-xs rounded-lg font-semibold transition-all ${
                    filters.timeframe === tf
                      ? 'bg-cyan-500/30 border border-cyan-400/50 text-cyan-300'
                      : 'bg-slate-800 border border-slate-700 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  {tf === 'all' ? 'Any' : tf}
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* ── SIGNALS ── */}
        <Section title="Signals & Pattern" icon={Zap} color="text-yellow-400" defaultOpen={true}>
          <PillSelect
            label="Signal Type"
            filterKey="signals"
            filters={filters}
            onChange={handleChange}
            options={[
              { value: 'BREAKOUT',  label: '🚀 Breakout',  color: 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300' },
              { value: 'MOMENTUM',  label: '⚡ Momentum',  color: 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300' },
              { value: 'PULLBACK',  label: '🎯 Pullback',  color: 'bg-amber-500/20 border-amber-400/50 text-amber-300' },
              { value: 'REVERSAL',  label: '🔄 Reversal',  color: 'bg-purple-500/20 border-purple-400/50 text-purple-300' },
              { value: 'SQUEEZE',   label: '🗜 Squeeze',   color: 'bg-pink-500/20 border-pink-400/50 text-pink-300' },
            ]}
          />

          <PillSelect
            label="Signal Strength"
            filterKey="signalStrength"
            filters={filters}
            onChange={handleChange}
            options={[
              { value: 'Strong', label: '🔥 Strong', color: 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300' },
              { value: 'Medium', label: '📊 Medium', color: 'bg-amber-500/20 border-amber-400/50 text-amber-300' },
              { value: 'Low',    label: '🌊 Low',    color: 'bg-slate-600/50 border-slate-500 text-slate-300' },
            ]}
          />
        </Section>

        {/* ── TECHNICALS ── */}
        <Section title="Technical Indicators" icon={Activity} color="text-purple-400" defaultOpen={true}>
          {/* RSI Range */}
          <div>
            <label className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              <span>RSI Range</span>
              <span className="text-cyan-400 font-mono">{filters.minRsi} – {filters.maxRsi}</span>
            </label>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 w-6">Min</span>
                <input type="range" min="0" max="100" value={filters.minRsi}
                  onChange={e => handleChange('minRsi', Math.min(parseInt(e.target.value), filters.maxRsi))}
                  className="flex-1 accent-cyan-400"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 w-6">Max</span>
                <input type="range" min="0" max="100" value={filters.maxRsi}
                  onChange={e => handleChange('maxRsi', Math.max(parseInt(e.target.value), filters.minRsi))}
                  className="flex-1 accent-cyan-400"
                />
              </div>
              {/* Quick RSI zone presets */}
              <div className="flex gap-1 mt-1">
                {[
                  { label: 'Oversold', min: 0, max: 35, color: 'text-rose-300 border-rose-500/40 hover:bg-rose-500/10' },
                  { label: 'Neutral', min: 40, max: 60, color: 'text-slate-300 border-slate-600 hover:bg-slate-700' },
                  { label: 'Bullish', min: 55, max: 70, color: 'text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/10' },
                  { label: 'Overbought', min: 75, max: 100, color: 'text-amber-300 border-amber-500/40 hover:bg-amber-500/10' },
                ].map(z => (
                  <button key={z.label}
                    onClick={() => { handleChange('minRsi', z.min); handleChange('maxRsi', z.max); }}
                    className={`flex-1 text-[9px] px-1 py-1 rounded border font-bold transition-all ${z.color}`}
                  >{z.label}</button>
                ))}
              </div>
            </div>
          </div>

          {/* RVOL */}
          <RangeInputs label="Relative Volume (RVOL)"
            minKey="minRvol" maxKey="maxRvol"
            minPlaceholder="Min (e.g. 1.5)" maxPlaceholder="Max"
            filters={filters} onChange={handleChange}
          />

          {/* Price Change % */}
          <RangeInputs label="Price Change %"
            minKey="minPriceChange" maxKey="maxPriceChange"
            minPlaceholder="Min %" maxPlaceholder="Max %"
            filters={filters} onChange={handleChange}
          />

          {/* EMA Position */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">EMA Position</label>
            <select
              value={filters.emaFilter}
              onChange={e => handleChange('emaFilter', e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-cyan-500 transition-colors"
            >
              <option value="all">Any Position</option>
              <option value="above_ema20">Price Above EMA20</option>
              <option value="below_ema20">Price Below EMA20</option>
              <option value="above_ema50">Price Above EMA50</option>
              <option value="below_ema50">Price Below EMA50</option>
              <option value="ema20_above_ema50">EMA20 Cross Above EMA50 (Golden)</option>
              <option value="ema20_below_ema50">EMA20 Cross Below EMA50 (Death)</option>
            </select>
          </div>

          {/* MACD */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">MACD Signal</label>
            <div className="grid grid-cols-3 gap-1">
              {[
                { value: 'all', label: 'Any' },
                { value: 'bullish', label: '▲ Bullish' },
                { value: 'bearish', label: '▼ Bearish' },
              ].map(opt => (
                <button key={opt.value}
                  onClick={() => handleChange('macdFilter', opt.value)}
                  className={`py-1.5 text-xs rounded-lg font-semibold transition-all ${
                    filters.macdFilter === opt.value
                      ? 'bg-cyan-500/30 border border-cyan-400/50 text-cyan-300'
                      : 'bg-slate-800 border border-slate-700 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* ── FUNDAMENTALS ── */}
        <Section title="Fundamentals" icon={BookOpen} color="text-green-400">
          <RangeInputs label="Price Range (₹)"
            minKey="minPrice" maxKey="maxPrice"
            minPlaceholder="Min ₹" maxPlaceholder="Max ₹"
            filters={filters} onChange={handleChange}
          />

          <RangeInputs label="P/E Ratio"
            minKey="minPe" maxKey="maxPe"
            minPlaceholder="Min PE" maxPlaceholder="Max PE"
            filters={filters} onChange={handleChange}
          />

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Market Cap</label>
            <select
              value={filters.minMarketCap}
              onChange={e => handleChange('minMarketCap', e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-cyan-500 transition-colors"
            >
              <option value="">Any Market Cap</option>
              <option value="500000000000">Large Cap (₹5,000 Cr+)</option>
              <option value="50000000000">Mid Cap (₹500 Cr+)</option>
              <option value="5000000000">Small Cap (₹50 Cr+)</option>
              <option value="1000000000">Micro Cap (₹10 Cr+)</option>
            </select>
          </div>
        </Section>

        {/* ── VOLUME & LIQUIDITY ── */}
        <Section title="Volume & Liquidity" icon={BarChart2} color="text-amber-400">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Min Volume</label>
            <select
              value={filters.minVolume}
              onChange={e => handleChange('minVolume', e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-cyan-500 transition-colors"
            >
              <option value="">Any Volume</option>
              <option value="100000">100K+</option>
              <option value="500000">500K+</option>
              <option value="1000000">1M+</option>
              <option value="5000000">5M+</option>
              <option value="10000000">10M+</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Volume Spike (RVOL)</label>
            <div className="grid grid-cols-4 gap-1">
              {[
                { value: '', label: 'Any' },
                { value: '1.5', label: '1.5x+' },
                { value: '2', label: '2x+' },
                { value: '3', label: '3x+' },
              ].map(opt => (
                <button key={opt.value}
                  onClick={() => handleChange('minRvol', opt.value)}
                  className={`py-1.5 text-xs rounded-lg font-semibold transition-all ${
                    filters.minRvol === opt.value
                      ? 'bg-amber-500/30 border border-amber-400/50 text-amber-300'
                      : 'bg-slate-800 border border-slate-700 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* ── RISK CONTROLS ── */}
        <Section title="Risk Controls" icon={Shield} color="text-rose-400">
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <div
                onClick={() => handleChange('showOnlySignals', !filters.showOnlySignals)}
                className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer flex-shrink-0 ${filters.showOnlySignals ? 'bg-cyan-500' : 'bg-slate-700'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${filters.showOnlySignals ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-xs text-slate-300 font-medium">Only show stocks with signals</span>
            </label>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Max Price Change % (Cap Drawdown)</label>
            <input
              type="number"
              placeholder="e.g. -5 (exclude >5% fallers)"
              value={filters.maxPriceChange ?? ''}
              onChange={e => handleChange('maxPriceChange', e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-rose-500 transition-colors placeholder-slate-600"
            />
          </div>
        </Section>

      </div>

      {/* Footer actions */}
      <div className="px-4 py-3 border-t border-slate-700 space-y-2 flex-shrink-0 bg-slate-900">
        <button
          onClick={() => onActivateScan?.()}
          className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-lg transition-all text-sm font-bold uppercase tracking-wide shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
        >
          <Zap className="w-4 h-4" />
          Run Scan
        </button>
        <button
          onClick={handleReset}
          className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg transition-colors text-xs font-semibold flex items-center justify-center gap-1.5"
        >
          <RotateCcw className="w-3 h-3" />
          Reset All Filters
        </button>
      </div>
    </div>
  );
};

export default ScreenerFilterPanel;

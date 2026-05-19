import React, { useState, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Settings, Maximize2, Minimize2,
  Layout as LayoutIcon, ArrowLeftRight, Star, Newspaper,
  Bell, Edit3, BarChart2, X, Calendar,
} from 'lucide-react';

// Context
import { ChartProvider, useChartContext } from '../context/ChartContext';

// Chart components
import ChartWorkspace   from '../components/investor/charts/ChartWorkspace';
import IndicatorDropdown from '../components/investor/charts/IndicatorDropdown';
import LayoutPicker      from '../components/investor/charts/LayoutPicker';
import CompareModal      from '../components/investor/charts/CompareModal';
import SettingsDrawer    from '../components/investor/charts/SettingsDrawer';
import {
  NewsDrawer, FundamentalsDrawer, AlertsDrawer, NotesDrawer, WatchlistDrawer,
} from '../components/investor/charts/SidebarDrawers';
import BottomAnalyticalPanel from '../components/investor/charts/BottomAnalyticalPanel';

import './InvestorDashboard.css';

// ── Timeframes ─────────────────────────────────────────────────────────────────
const TIMEFRAMES = ['1D', '5D', '1M', '3M', '6M', '1Y', '5Y', 'ALL'];

// ── Custom Date Picker Modal ──────────────────────────────────────────────────
const DateRangeModal = ({ onApply, onClose, isDark }) => {
  const [from, setFrom] = useState('');
  const [to,   setTo]   = useState('');
  const base = isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-100 text-slate-900';
  const inp  = `w-full rounded-xl border px-3 py-2 text-sm outline-none transition-all ${
    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
  }`;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-80 rounded-2xl border shadow-2xl p-6 ${base}`}>
        <h3 className="text-sm font-black mb-4">Custom Date Range</h3>
        <div className="space-y-3">
          <div>
            <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>From</label>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} className={inp} />
          </div>
          <div>
            <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>To</label>
            <input type="date" value={to} onChange={e => setTo(e.target.value)} className={inp} />
          </div>
          <button
            onClick={() => { if (from && to) { onApply(from, to); onClose(); } }}
            disabled={!from || !to}
            className="w-full py-2.5 mt-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-[11px] font-black transition-all"
          >
            Apply Range
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Inner Component (uses context) ────────────────────────────────────────
const AdvancedChartsInner = () => {
  const navigate = useNavigate();
  const {
    settings, setSettings,
    layout, panels, activePanelId, setActivePanelId,
    applyLayout, updatePanel, updateActivePanel, getActivePanel,
    LAYOUT_CONFIGS,
    activeDrawer, toggleDrawer,
    crosshairSync, setCrosshairSync,
    rangeSync, setRangeSync,
  } = useChartContext();

  const [activeTimeframe, setActiveTimeframe] = useState('1Y');
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo,   setCustomTo]   = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showLayoutPicker, setShowLayoutPicker] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const isDark = false; // Workstation UI stays light as per request
  const activePanel = getActivePanel();

  // ── Timeframe change ─────────────────────────────────────────────────────────
  const handleTimeframe = (tf) => {
    if (tf === 'CUSTOM') { setShowDatePicker(true); return; }
    setActiveTimeframe(tf);
    setCustomFrom(null);
    setCustomTo(null);
    if (settings.syncTimeframe) {
      // sync all panels
      const updated = panels.map(p => ({ ...p, timeframe: tf }));
      updated.forEach(p => updatePanel(p.id, { timeframe: tf }));
    } else {
      updateActivePanel({ timeframe: tf });
    }
  };

  // ── Crosshair / Range sync ────────────────────────────────────────────────────
  const handleCrosshairMove = useCallback((panelId, param) => {
    if (settings.syncCrosshair && panelId === activePanelId) {
      setCrosshairSync({ time: param.time, price: param.point?.y });
    }
  }, [settings.syncCrosshair, activePanelId, setCrosshairSync]);

  const handleRangeChange = useCallback((panelId, range) => {
    if (settings.syncZoom && panelId === activePanelId) {
      setRangeSync(range);
    }
  }, [settings.syncZoom, activePanelId, setRangeSync]);

  // ── Compare ───────────────────────────────────────────────────────────────────
  const handleCompare = (symbols) => {
    const count = Math.min(symbols.length, 8);
    const layoutKey = count === 1 ? 'single' : count === 2 ? 'vsplit' : count <= 4 ? '4grid' : '6grid';
    applyLayout(layoutKey, symbols);
  };

  // ── Fullscreen ────────────────────────────────────────────────────────────────
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // ── Sidebar drawer ─────────────────────────────────────────────────────────────
  const DRAWER_ITEMS = [
    { id: 'watchlist',     icon: Star,      label: 'Watchlist'     },
    { id: 'compare',       icon: ArrowLeftRight, label: 'Compare'  },
    { id: 'news',          icon: Newspaper, label: 'News'          },
    { id: 'alerts',        icon: Bell,      label: 'Alerts'        },
    { id: 'notes',         icon: Edit3,     label: 'Notes'         },
  ];

  const DRAWER_CONTENT = {
    watchlist:    <WatchlistDrawer symbol={activePanel?.symbol || 'RELIANCE'} isDark={isDark} />,
    news:         <NewsDrawer symbol={activePanel?.symbol || 'RELIANCE'} isDark={isDark} />,
    alerts:       <AlertsDrawer symbol={activePanel?.symbol || 'RELIANCE'} isDark={isDark} />,
    notes:        <NotesDrawer symbol={activePanel?.symbol || 'RELIANCE'} isDark={isDark} />,
  };

  // ── Theme classes ──────────────────────────────────────────────────────────────
  const bg     = isDark ? 'bg-[#0b1120]'     : 'bg-[#f1f5f9]';
  const header = isDark ? 'bg-slate-900/95 border-slate-700/60' : 'bg-white border-slate-200/80';
  const drawer = isDark ? 'bg-slate-900 border-slate-700/60'    : 'bg-white border-slate-200/80';
  const sidebar = isDark ? 'bg-slate-900 border-slate-700/60'   : 'bg-white border-slate-200/80';

  return (
    <div className={`h-screen w-screen flex flex-col font-sans overflow-hidden ${bg} transition-colors duration-300`}>

      {/* ── TOP COMMAND BAR ─────────────────────────────────────────────────── */}
      {/* ── TOP COMMAND BAR ─────────────────────────────────────────────────── */}
      <header className={`flex items-center gap-3 px-4 py-2 m-2 rounded-[16px] shadow-sm z-[100] border ${header}`}>

        {/* Back + Logo */}
        <button
          onClick={() => navigate(-1)}
          className={`p-2 rounded-xl transition-all ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
        >
          <ChevronLeft size={18} />
        </button>
        <div className="flex items-center gap-2 shrink-0 mr-2">
          <img src="/radar-logo-final.jpg" alt="Radar" className="w-7 h-7 rounded-lg object-cover" />
          <span className="text-sm font-black tracking-tight" style={{ color: '#3E84F6' }}>RADAR</span>
        </div>
        <div className={`w-px h-5 ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />

        {/* Active symbol badge */}
        <div className="flex items-center gap-2 mr-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white font-black text-xs shadow-lg">
            {activePanel?.symbol?.[0] || 'R'}
          </div>
          <div>
            <p className={`text-xs font-black leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {activePanel?.symbol || 'RELIANCE'}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className={`text-[8px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Live</span>
            </div>
          </div>
        </div>
        <div className={`w-px h-5 ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />

        {/* Timeframe buttons */}
        <div className={`flex items-center gap-0.5 rounded-xl p-1 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
          {TIMEFRAMES.map(tf => (
            <button
              key={tf}
              onClick={() => handleTimeframe(tf)}
              className={`px-2.5 py-1.5 text-[10px] font-black rounded-lg transition-all ${
                activeTimeframe === tf && !customFrom
                  ? 'bg-blue-600 text-white shadow-sm'
                  : isDark ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-500 hover:text-slate-900 hover:bg-white'
              }`}
            >
              {tf}
            </button>
          ))}
          {/* Custom range button */}
          <button
            onClick={() => setShowDatePicker(true)}
            className={`p-1.5 rounded-lg transition-all ${
              customFrom
                ? 'bg-blue-600 text-white'
                : isDark ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-500 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Calendar size={13} />
          </button>
        </div>
        <div className={`w-px h-5 ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />

        {/* Chart type + Indicators */}
        <IndicatorDropdown
          indicators={activePanel?.indicators || {}}
          onToggle={(id) => updateActivePanel({
            indicators: { ...activePanel.indicators, [id]: !activePanel.indicators[id] },
          })}
          chartType={activePanel?.chartType || 'candlestick'}
          onChartTypeChange={(type) => updateActivePanel({ chartType: type })}
          isDark={isDark}
        />

        {/* Compare button */}
        <button
          onClick={() => setShowCompare(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${
            isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ArrowLeftRight size={13} />
          Compare
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Layout picker */}
        <div className="relative">
          <button
            onClick={() => setShowLayoutPicker(o => !o)}
            className={`p-2 rounded-xl transition-all ${isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500'}`}
          >
            <LayoutIcon size={18} />
          </button>
          <LayoutPicker
            isOpen={showLayoutPicker}
            onClose={() => setShowLayoutPicker(false)}
            currentLayout={layout}
            onSelect={(l) => applyLayout(l)}
            isDark={isDark}
          />
        </div>

        {/* Settings */}
        <div className="relative">
          <button
            onClick={() => setShowSettings(o => !o)}
            className={`p-2 rounded-xl transition-all ${showSettings ? 'bg-blue-600 text-white' : isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500'}`}
          >
            <Settings size={18} />
          </button>
          <SettingsDrawer
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
            settings={settings}
            setSettings={setSettings}
          />
        </div>

        {/* Fullscreen */}
        <button
          onClick={toggleFullscreen}
          className={`p-2 rounded-xl transition-all ${isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500'}`}
        >
          {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>
      </header>

      {/* ── MAIN BODY ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex min-h-0 overflow-hidden">

        {/* ── Left icon sidebar ────────────────────────────────────────────── */}
        <aside className={`w-20 flex flex-col items-center py-4 gap-4 shrink-0 m-2 rounded-[16px] z-[50] border ${
          isDark ? 'shadow-[0_10px_30px_rgba(0,0,0,0.5)]' : 'shadow-[0_10px_30px_rgba(0,0,0,0.1)]'
        } ${sidebar}`}>
          {DRAWER_ITEMS.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              title={label}
              onClick={() => {
                if (id === 'compare') { setShowCompare(true); return; }
                toggleDrawer(id);
              }}
              className={`relative group flex flex-col items-center gap-1 p-3 rounded-xl transition-all w-12 ${
                activeDrawer === id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200/40'
                  : isDark
                    ? 'text-slate-500 hover:text-slate-200 hover:bg-slate-800'
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Icon size={18} className="shrink-0" />
              <span className="text-[7px] font-black uppercase tracking-tight leading-none">{label.split(' ')[0]}</span>

              {/* Tooltip */}
              <div className={`absolute left-full ml-2 px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-all z-50 shadow-lg ${
                isDark ? 'bg-slate-800 text-slate-200 border border-slate-700' : 'bg-slate-900 text-white'
              }`}>
                {label}
              </div>
            </button>
          ))}
        </aside>

        {/* Left drawer (slides in) */}
        {activeDrawer && activeDrawer !== 'compare' && (
          <aside className={`w-80 border-r flex flex-col shrink-0 ${drawer}`} style={{ transition: 'width 0.2s' }}>
            <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? 'border-slate-700/60' : 'border-slate-100'}`}>
              <p className={`text-sm font-black capitalize ${isDark ? 'text-white' : 'text-slate-900'}`}>{activeDrawer}</p>
              <button onClick={() => toggleDrawer(null)} className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}>
                <X size={16} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 custom-scrollbar">
              {DRAWER_CONTENT[activeDrawer]}
            </div>
          </aside>
        )}

        {/* ── Chart workspace ──────────────────────────────────────────────────── */}
        <main className="flex-1 flex flex-col min-w-0 min-h-0 overflow-y-auto custom-scrollbar">
          <div className="h-[70vh] shrink-0 p-2">
            <ChartWorkspace
              layout={layout}
              panels={panels}
              activePanelId={activePanelId}
              onSelectPanel={setActivePanelId}
              settings={settings}
              crosshairSync={crosshairSync}
              onCrosshairMove={handleCrosshairMove}
              rangeSync={rangeSync}
              onRangeChange={handleRangeChange}
              customFrom={customFrom}
              customTo={customTo}
            />
          </div>

          {/* ── Bottom panel (Fundamentals/Overview/Signals) ──────────────────────── */}
          <div className={`flex-1 border-t ${isDark ? 'border-slate-700/60' : 'border-slate-200'}`}>
            <BottomAnalyticalPanel symbol={activePanel?.symbol || 'RELIANCE'} isDark={isDark} />
          </div>
        </main>


      </div>

      {/* ── Bottom panel (Fundamentals/Overview/Signals) ──────────────────────── */}

      {/* ── Modals ─────────────────────────────────────────────────────────────── */}
      {showDatePicker && (
        <DateRangeModal
          isDark={isDark}
          onClose={() => setShowDatePicker(false)}
          onApply={(from, to) => {
            setCustomFrom(from);
            setCustomTo(to);
            setActiveTimeframe('CUSTOM');
          }}
        />
      )}

      {showCompare && (
        <CompareModal
          currentSymbol={activePanel?.symbol || 'RELIANCE'}
          isDark={isDark}
          onClose={() => setShowCompare(false)}
          onCompare={handleCompare}
        />
      )}
    </div>
  );
};

// ── Page export wrapped in Provider ───────────────────────────────────────────
const InvestorAdvancedCharts = () => {
  const [searchParams] = useSearchParams();
  const symbol = searchParams.get('symbol') || 'RELIANCE';

  return (
    <ChartProvider initialSymbol={symbol}>
      <AdvancedChartsInner />
    </ChartProvider>
  );
};

export default InvestorAdvancedCharts;

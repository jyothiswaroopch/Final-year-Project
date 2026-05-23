import { useEffect, useMemo, useState, useRef, memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { 
  TrendingUp, 
  Activity, 
  ChevronLeft, 
  ChevronRight, 
  Zap, 
  Target, 
  ShieldAlert, 
  BarChart3,
  Flame,
  LayoutGrid,
  List,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  LayoutPanelLeft,
  Star,
  Trash2,
  X,
  Filter,
  Save,
} from "lucide-react";
import Header from "./stockScreener/Header.jsx";
import FiltersPanel from "./stockScreener/FiltersPanel.jsx";
import StockCardGrid from "./stockScreener/StockCardGrid.jsx";
import TerminalLogs from "./stockScreener/TerminalLogs.jsx";
import StockDetailsPanel from "../watchlist/StockDetailsPanel.jsx";
import "./stockScreener/StockScreener.css";
import { runScreenerScan, createSavedScreener, getSavedScreeners, deleteSavedScreener } from "../../api/screenerApi";

const STORAGE_KEY = "radar_saved_screener_dashboards";
const INITIAL_ROWS = 12;

const SIGNAL_TABS = [
  { id: "all", label: "All Signals", icon: <LayoutPanelLeft className="h-4 w-4" /> },
  { id: "momentum", label: "Momentum", icon: <Zap className="h-4 w-4" /> },
  { id: "breakout", label: "Breakout", icon: <Flame className="h-4 w-4" /> },
  { id: "pullback", label: "Pullback", icon: <RefreshCw className="h-4 w-4" /> },
  { id: "fakeout", label: "Fakeout", icon: <AlertTriangle className="h-4 w-4 text-amber-500" /> },
];

const DEFAULT_FILTERS = {
  search: "",
  sector: "All",
  minRsi: 0,
  maxRsi: 100,
  minPrice: "",
  maxPrice: "",
  minVolume: "",
  rvol: "",
  gapMin: 0,
  sma50: false,
  sma200: false,
  macdCross: false,
};

// ── Save Screener Modal ──────────────────────────────────────────────────────
const SaveScreenerModal = ({ isOpen, onClose, onSave, filters }) => {
  const [name, setName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const reset = () => { setName(''); setPurpose(''); setError(''); };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Please enter a name for your screener.'); return; }
    if (!purpose.trim()) { setError('Please describe the purpose of this screener.'); return; }
    setSaving(true);
    try {
      await onSave({ name: name.trim(), purpose: purpose.trim(), filters });
      reset();
      onClose();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // active filter summary for preview
  const activeEntries = Object.entries(filters || {}).filter(([k, v]) =>
    v !== '' && v !== 'All' && v !== false && v !== 0 && v != null &&
    !['minRsi', 'maxRsi'].includes(k)
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
        onClick={handleClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="relative z-10 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: '#0d1829', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ background: 'rgba(99,102,241,0.15)' }}>
              <Star size={18} className="text-indigo-400" fill="currentColor" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Save Screener</h2>
              <p className="text-[11px] text-gray-500 font-bold mt-0.5">Name and describe your filter setup</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all">
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Error */}
          {error && (
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <AlertTriangle size={14} className="text-rose-400 flex-shrink-0" />
              <p className="text-[12px] font-bold text-rose-400">{error}</p>
            </div>
          )}

          {/* Name field */}
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Screener Name *</label>
            <input
              type="text"
              autoFocus
              placeholder="e.g. My MACD Breakout Scan"
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              className="w-full px-4 py-3 rounded-xl text-[13px] font-bold text-white placeholder-gray-600 outline-none transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', caretColor: '#6366f1' }}
              onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.5)'; e.target.style.background = 'rgba(99,102,241,0.05)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.background = 'rgba(255,255,255,0.04)'; }}
            />
          </div>

          {/* Purpose field */}
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Purpose / Why *</label>
            <textarea
              placeholder="Why did you build this screener? What market condition does it target?"
              value={purpose}
              onChange={e => { setPurpose(e.target.value); setError(''); }}
              rows={3}
              className="w-full px-4 py-3 rounded-xl text-[13px] font-bold text-white placeholder-gray-600 outline-none transition-all resize-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', caretColor: '#6366f1' }}
              onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.5)'; e.target.style.background = 'rgba(99,102,241,0.05)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.background = 'rgba(255,255,255,0.04)'; }}
            />
          </div>

          {/* Active filters preview */}
          {activeEntries.length > 0 && (
            <div className="rounded-xl p-3" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
              <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2">Filters being saved</p>
              <div className="flex flex-wrap gap-1.5">
                {activeEntries.map(([k, v]) => (
                  <span key={k} className="text-[9px] font-black px-2 py-0.5 rounded" style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc' }}>
                    {k}: {String(v)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full py-3 rounded-xl font-black text-[13px] text-white flex items-center justify-center gap-2 transition-all"
            style={{ background: saving ? 'rgba(99,102,241,0.4)' : 'linear-gradient(135deg, #4f46e5, #6366f1)', boxShadow: '0 8px 24px rgba(99,102,241,0.25)' }}
          >
            {saving ? (
              <><RefreshCw size={14} className="animate-spin" /> Saving…</>
            ) : (
              <><Star size={14} fill="currentColor" /> Save Screener</>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ── Saved Screener Card ───────────────────────────────────────────────────────
const SavedScreenerCard = ({ screener, isActive, onLoad, onDelete }) => {
  const sid = screener._id || screener.id;
  const activeEntries = Object.entries(screener.filters || {}).filter(
    ([k, v]) => v !== '' && v !== 'All' && v !== false && v !== 0 && v != null && !['minRsi', 'maxRsi'].includes(k)
  );

  return (
    <div
      onClick={() => onLoad(screener)}
      className="relative min-w-[280px] max-w-[280px] rounded-xl cursor-pointer transition-all group flex flex-col"
      style={{
        background: isActive ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.03)',
        border: isActive ? '1px solid rgba(99,102,241,0.45)' : '1px solid rgba(255,255,255,0.06)',
        padding: '16px',
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg" style={{ background: 'rgba(99,102,241,0.15)' }}>
            <Filter size={13} className="text-indigo-400" />
          </div>
          <div>
            <div className="text-[13px] font-black text-white leading-tight">{screener.name}</div>
            {isActive && <div className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mt-0.5">● Active</div>}
          </div>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onDelete(sid); }}
          className="p-1 rounded text-gray-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
        >
          <Trash2 size={13} />
        </button>
      </div>

      <p className="text-[11px] font-bold text-gray-500 leading-relaxed mb-3 line-clamp-2">{screener.purpose}</p>

      {activeEntries.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {activeEntries.slice(0, 4).map(([k, v]) => (
            <span key={k} className="text-[9px] font-black px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }}>
              {k}: {String(v)}
            </span>
          ))}
          {activeEntries.length > 4 && (
            <span className="text-[9px] font-black text-gray-600">+{activeEntries.length - 4} more</span>
          )}
        </div>
      )}

      <div
        className="w-full py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-center transition-all mt-auto"
        style={{ background: isActive ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)', color: isActive ? '#a5b4fc' : '#4b5563' }}
      >
        {isActive ? 'Applied ✓' : 'Apply Filters'}
      </div>
    </div>
  );
};


export default function EnhancedStockScreener({ onStockDeepAnalysis }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(INITIAL_ROWS);
  const [loadingMore, setLoadingMore] = useState(false);
  const [allStocks, setAllStocks] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const contentRef = useRef(null);

  // ── Save modal state ────────────────────────────────────────────────────
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [savedScreeners, setSavedScreeners] = useState(() => {
    try { return JSON.parse(localStorage.getItem('radar_trader_saved_screeners') || '[]'); } catch { return []; }
  });
  const [activePreset, setActivePreset] = useState(null); // id of active saved screener

  // Load from DB on mount
  useEffect(() => {
    getSavedScreeners()
      .then(res => {
        const data = res?.data || [];
        setSavedScreeners(data);
        localStorage.setItem('radar_trader_saved_screeners', JSON.stringify(data));
      })
      .catch(() => {});
  }, []);

  const handleSaveConfirm = async ({ name, purpose, filters: f }) => {
    const res = await createSavedScreener({ name, purpose, filters: f });
    const newItem = res?.data || { id: Date.now().toString(), _id: Date.now().toString(), name, purpose, filters: f };
    const updated = [newItem, ...savedScreeners];
    setSavedScreeners(updated);
    localStorage.setItem('radar_trader_saved_screeners', JSON.stringify(updated));
  };

  const handleDeleteSaved = async (id) => {
    try { await deleteSavedScreener(id); } catch (_) {}
    const updated = savedScreeners.filter(s => (s._id || s.id) !== id);
    setSavedScreeners(updated);
    localStorage.setItem('radar_trader_saved_screeners', JSON.stringify(updated));
    if (activePreset === id) setActivePreset(null);
  };

  const handleLoadSaved = (screener) => {
    const sid = screener._id || screener.id;
    if (activePreset === sid) {
      setActivePreset(null);
      setFilters(DEFAULT_FILTERS);
      setAppliedFilters(DEFAULT_FILTERS);
    } else {
      setActivePreset(sid);
      setFilters({ ...DEFAULT_FILTERS, ...screener.filters });
      setAppliedFilters({ ...DEFAULT_FILTERS, ...screener.filters });
    }
  };

  // Live scan via screener API
  const doScan = async (activeFilters) => {
    setIsLoading(true);
    try {
      const data = await runScreenerScan(activeFilters);
      const rows = data?.results ?? data?.stocks ?? (Array.isArray(data) ? data : []);
      const normalized = rows.map((s, i) => ({
        symbol: String(s.symbol || '').replace(/\.(NS|BO)$/i, ''),
        name: s.name || s.companyName || '',
        sector: s.sector || 'Equity',
        price: Number(s.price ?? 0),
        change: Number(s.changePercent ?? s.change ?? 0),
        changePercent: Number(s.changePercent ?? 0),
        percent: Number(s.changePercent ?? 0),
        volume: Number(s.volume ?? 0),
        confidence: Number(s.confidence ?? s.score ?? 0),
        entry: Number(s.entry ?? s.price ?? 0),
        target: Number(s.target ?? 0),
        sl: Number(s.sl ?? 0),
        signalType: s.signalType || 'N/A',
        history: s.history || [],
        rvol: Number(s.volumeRatio ?? s.rvol ?? 0),
        rsi: Number(s.rsi ?? 0),
        gap: Number(s.gap ?? 0),
        sma50: Boolean(s.sma50 ?? false),
        sma200: Boolean(s.sma200 ?? false),
        macdCross: Boolean(s.macdCross ?? false),
        vwap: Number(s.vwap ?? s.price ?? 0),
        high52w: Number(s.high52w ?? s.yearHigh ?? 0),
        low52w: Number(s.low52w ?? s.yearLow ?? 0),
      }));
      setAllStocks(normalized);
      setFilteredStocks(normalized);
      setVisibleCount(INITIAL_ROWS);
    } catch (err) {
      console.warn('EnhancedStockScreener scan failed:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { doScan(appliedFilters); }, [appliedFilters, activeTab]);

  const visibleRows = useMemo(() => filteredStocks.slice(0, visibleCount), [filteredStocks, visibleCount]);

  const handleScroll = (e) => {
    if (loadingMore || visibleCount >= filteredStocks.length) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 100) {
      setLoadingMore(true);
      setTimeout(() => {
        setVisibleCount(prev => Math.min(prev + 12, filteredStocks.length));
        setLoadingMore(false);
      }, 600);
    }
  };

  const handleActivateScan = () => {
    setIsLoading(true);
    setAppliedFilters(filters);
    setActivePreset(null);
    setTimeout(() => setIsLoading(false), 800);
  };

  const handleExport = () => {
    alert("Exporting scanner results to Excel... Check your downloads area.");
  };

  const handleNewScreener = () => {
    setFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
    setSelectedStock(null);
    setActivePreset(null);
  };

  return (
    <div className={`relative screener-v2-layout overflow-hidden bg-gradient-to-br from-[#020617] via-[#020617] to-[#0f172a] text-[#dce9ff] ${sidebarCollapsed ? "sidebar-closed" : ""}`}>
      {}
      <div className="pointer-events-none absolute -left-24 -top-20 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute right-8 top-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-120px] left-1/3 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
      {}
      <aside className="screener-v2-sidebar">
        <div className="sidebar-header">
           <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-blue-500" />
            {!sidebarCollapsed && <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Scanner Params</span>}
           </div>
           <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="collapse-btn">
             {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
           </button>
        </div>
        
        {!sidebarCollapsed && (
          <div className="sidebar-content custom-scrollbar">
            <FiltersPanel
              filters={filters}
              setFilters={setFilters}
              onApply={handleActivateScan}
              onReset={() => {
                setFilters(DEFAULT_FILTERS);
                setAppliedFilters(DEFAULT_FILTERS);
              }}
              isOpen={true}
            />

            {/* ── Your Saved Screeners (in sidebar) ─────────────────────── */}
            {savedScreeners.length > 0 && (
              <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex items-center gap-2 mb-3 px-1">
                  <Star size={11} className="text-indigo-400" fill="currentColor" />
                  <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Your Saved Screeners</span>
                </div>
                <div className="space-y-2">
                  {savedScreeners.map(sc => {
                    const sid = sc._id || sc.id;
                    const isAct = activePreset === sid;
                    return (
                      <div
                        key={sid}
                        onClick={() => handleLoadSaved(sc)}
                        className="flex items-start justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all group"
                        style={{
                          background: isAct ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.03)',
                          border: isAct ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                        }}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] font-black text-white truncate">{sc.name}</div>
                          <div className="text-[9px] font-bold text-gray-600 truncate mt-0.5">{sc.purpose}</div>
                        </div>
                        <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                          {isAct && <CheckCircle2 size={11} className="text-indigo-400" />}
                          <button
                            onClick={e => { e.stopPropagation(); handleDeleteSaved(sid); }}
                            className="text-gray-700 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </aside>

      {}
      <main className="screener-v2-main">
        {}
        <div className="intelligence-bar">
          <div className="market-status-group">
            <div className="market-stat-item">
              <span className="stat-label">NIFTY 50</span>
              <div className="flex items-center gap-1.5">
                <span className="stat-value text-green-500">22,453.10</span>
                <TrendingUp size={12} className="text-green-500" />
              </div>
            </div>
            <div className="divider" />
            <div className="market-stat-item">
              <span className="stat-label">Sentiment</span>
              <div className="flex items-center gap-1.5">
                <span className="stat-value text-amber-400">GREED</span>
                <Flame size={12} className="text-amber-400" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="relative group hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Universal Scan..." 
                  className="search-lite"
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                />
             </div>
             <Header onSave={() => setShowSaveModal(true)} onExport={handleExport} onNewScreener={handleNewScreener} />
          </div>
        </div>

        {}
        <div className="signal-tabs-container">
          <div className="signal-tabs">
            {SIGNAL_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`signal-tab ${activeTab === tab.id ? "active" : ""}`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {activeTab === tab.id && <motion.div layoutId="activeTab" className="tab-indicator" />}
              </button>
            ))}
          </div>
          <div className="pool-count">
            <span className="ml-2 text-gray-500">{filteredStocks.length} ASSETS SCANNING</span>
          </div>
        </div>

        {/* ── Your Saved Screeners — horizontal cards below tabs ─────────── */}
        {savedScreeners.length > 0 && (
          <div className="px-4 pt-3 pb-1">
            <div className="flex items-center gap-2 mb-2.5">
              <Star size={12} className="text-indigo-400" fill="currentColor" />
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Your Saved Screeners</span>
              <span className="text-[9px] font-bold text-gray-700 ml-1">({savedScreeners.length})</span>
            </div>
            <div
              className="flex gap-3 pb-2 overflow-x-auto"
              style={{ scrollbarWidth: 'none' }}
            >
              {savedScreeners.map(sc => (
                <SavedScreenerCard
                  key={sc._id || sc.id}
                  screener={sc}
                  isActive={activePreset === (sc._id || sc.id)}
                  onLoad={handleLoadSaved}
                  onDelete={handleDeleteSaved}
                />
              ))}
            </div>
          </div>
        )}

        {}
        <div 
          className="content-area custom-scrollbar" 
          onScroll={handleScroll}
          ref={contentRef}
        >
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-32">
               <div className="loading-orbit">
                  <div className="orbit-dot" />
               </div>
              <span className="mt-8 text-[11px] font-bold text-blue-500/50 uppercase tracking-[0.3em]">Calibrating Trader Dashboard</span>
            </div>
          ) : (
            <>
            <StockCardGrid 
                stocks={visibleRows} 
                onSelect={(symbol) => onStockDeepAnalysis(symbol)}
                selectedSymbol={selectedStock?.symbol}
                onDeepResearch={onStockDeepAnalysis}
              />
              {loadingMore && (
                <div className="flex justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                </div>
              )}
            </>
          )}

          {}
          <AnimatePresence>
            {selectedStock && (
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 h-full w-[400px] z-[1000] p-4 bg-[#08162b]/95 backdrop-blur-xl border-l border-white/10 shadow-[-20px_0_40px_rgba(0,0,0,0.5)]"
              >
                <StockDetailsPanel 
                  stock={selectedStock} 
                  onClose={() => setSelectedStock(null)} 
                  mode="research"
                  onResearchAction={(action) => alert(`Action "${action}" triggered for ${selectedStock.symbol}`)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {}
        <div className="actionable-feed-container">
           <div className="feed-header">
              <div className="flex items-center gap-2">
                <div className="pulse-dot" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Actionable Intelligence</span>
              </div>
              <span className="text-[10px] text-gray-500 font-bold uppercase">Real-time Scanner v2.0</span>
           </div>
           <TerminalLogs mode="actionable" scanTimestamp={appliedFilters} />
        </div>
      </main>

      {/* ── Save Screener Modal ───────────────────────────────────────────── */}
      <AnimatePresence>
        {showSaveModal && (
          <SaveScreenerModal
            isOpen={showSaveModal}
            onClose={() => setShowSaveModal(false)}
            onSave={handleSaveConfirm}
            filters={appliedFilters}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

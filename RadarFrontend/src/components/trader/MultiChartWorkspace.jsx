import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/api';
import {
  Grid,
  Maximize2,
  Minimize2,
  Plus,
  X,
  Save,
  FolderOpen,
  Settings,
  Copy,
  Layout,
  Monitor,
} from 'lucide-react';
import AdvancedTradingChart from './AdvancedTradingChart';

const INDEX_SYMBOLS = ['NIFTY 50', 'BANKNIFTY', 'SENSEX', 'NIFTY IT'];

const LAYOUTS = [
  { id: '1x1', label: '1 Chart', rows: 1, cols: 1, icon: '1x1' },
  { id: '1x2', label: '1x2', rows: 1, cols: 2, icon: '1x2' },
  { id: '2x1', label: '2x1', rows: 2, cols: 1, icon: '2x1' },
  { id: '2x2', label: '2x2', rows: 2, cols: 2, icon: '2x2' },
  { id: '1x3', label: '1x3', rows: 1, cols: 3, icon: '1x3' },
  { id: '3x1', label: '3x1', rows: 3, cols: 1, icon: '3x1' },
  { id: '2x3', label: '2x3', rows: 2, cols: 3, icon: '2x3' },
  { id: '3x2', label: '3x2', rows: 3, cols: 2, icon: '3x2' },
  { id: '3x3', label: '3x3', rows: 3, cols: 3, icon: '3x3' },
];

const MultiChartWorkspace = () => {
  const [layout, setLayout] = useState('2x2');
  const [availableSymbols] = useState(INDEX_SYMBOLS);
  const [charts, setCharts] = useState([
    { id: 1, symbol: 'NIFTY 50', timeframe: '15' },
    { id: 2, symbol: 'BANKNIFTY', timeframe: '15' },
    { id: 3, symbol: 'SENSEX', timeframe: '15' },
    { id: 4, symbol: 'NIFTY IT', timeframe: '15' },
  ]);
  const [fullscreenChart, setFullscreenChart] = useState(null);
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');
  const [savedWorkspaces, setSavedWorkspaces] = useState([]);

  const currentLayout = LAYOUTS.find(l => l.id === layout);
  const totalCharts = currentLayout.rows * currentLayout.cols;

  const displayCharts = [...charts];
  while (displayCharts.length < totalCharts) {
    const nextSymbol = availableSymbols[displayCharts.length % availableSymbols.length];
    displayCharts.push({
      id: Date.now() + displayCharts.length,
      symbol: nextSymbol,
      timeframe: '15',
    });
  }

  const updateChart = useCallback((chartId, updates) => {
    setCharts(prev => prev.map(chart => 
      chart.id === chartId ? { ...chart, ...updates } : chart
    ));
  }, []);

  const removeChart = useCallback((chartId) => {
    setCharts(prev => prev.filter(chart => chart.id !== chartId));
  }, []);

  const addChart = useCallback(() => {
    const newChart = {
      id: Date.now(),
      symbol: INDEX_SYMBOLS[charts.length % INDEX_SYMBOLS.length],
      timeframe: '15',
    };
    setCharts(prev => [...prev, newChart]);
  }, [charts.length]);

  const changeLayout = useCallback((newLayout) => {
    setLayout(newLayout);
    setShowLayoutMenu(false);
  }, []);

  const toggleFullscreen = useCallback((chartId) => {
    setFullscreenChart(fullscreenChart === chartId ? null : chartId);
  }, [fullscreenChart]);

  // Close fullscreen on Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setFullscreenChart(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const saveWorkspace = useCallback(() => {
    if (!workspaceName.trim()) return;

    const workspace = {
      id: Date.now(),
      name: workspaceName,
      layout,
      charts: displayCharts.slice(0, totalCharts),
      syncEnabled,
      createdAt: new Date().toISOString(),
    };

    const saved = JSON.parse(localStorage.getItem('radar-workspaces') || '[]');
    saved.push(workspace);
    localStorage.setItem('radar-workspaces', JSON.stringify(saved));
    
    setSavedWorkspaces(saved);
    setWorkspaceName('');
    setShowSaveMenu(false);
  }, [workspaceName, layout, displayCharts, totalCharts, syncEnabled]);

  const loadWorkspace = useCallback((workspace) => {
    setLayout(workspace.layout);
    setCharts(workspace.charts);
    setSyncEnabled(workspace.syncEnabled);
    setShowSaveMenu(false);
  }, []);

  const deleteWorkspace = useCallback((workspaceId) => {
    const saved = JSON.parse(localStorage.getItem('radar-workspaces') || '[]');
    const filtered = saved.filter(w => w.id !== workspaceId);
    localStorage.setItem('radar-workspaces', JSON.stringify(filtered));
    setSavedWorkspaces(filtered);
  }, []);

  React.useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('radar-workspaces') || '[]');
    setSavedWorkspaces(saved);
  }, []);

  return (
    <div className="h-full bg-slate-950 flex flex-col">
      {}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Monitor className="w-6 h-6 text-cyan-400" />
            Multi-Chart Workspace
          </h1>
          {syncEnabled && (
            <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold border border-cyan-400/30">
              Sync Enabled
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-2 rounded-lg bg-slate-800 text-slate-200">
            <span className="text-sm font-semibold">2×2</span>
          </div>
        </div>
      </div>

      {/* ── Chart expand modal — centered in viewport, portal on body ── */}
      {fullscreenChart && (() => {
        const chart = displayCharts.find(c => c.id === fullscreenChart);
        const MODAL_W = Math.min(window.innerWidth  * 0.92, 1600);
        const MODAL_H = Math.min(window.innerHeight * 0.88, 900);
        const HEADER_H = 52;
        const CHART_H  = MODAL_H - HEADER_H;

        return ReactDOM.createPortal(
          <>
            {/* ── Backdrop — click to close ── */}
            <div
              onClick={() => setFullscreenChart(null)}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 2147483646,
                background: 'rgba(0,0,0,0.78)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
              }}
            />

            {/* ── Centered modal card ── */}
            <div
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 2147483647,
                width:  MODAL_W,
                height: MODAL_H,
                background: '#0d1829',
                borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.10)',
                boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(34,211,238,0.08)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {/* Modal header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 20px',
                background: '#0f172a',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
                flexShrink: 0,
                height: HEADER_H,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Monitor style={{ width: 15, height: 15, color: '#22d3ee' }} />
                  <span style={{
                    color: '#f1f5f9', fontWeight: 800, fontSize: 14,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                  }}>
                    {chart?.symbol}
                  </span>
                  <span style={{
                    padding: '2px 8px', borderRadius: 4,
                    background: 'rgba(34,211,238,0.10)',
                    border: '1px solid rgba(34,211,238,0.20)',
                    color: '#22d3ee', fontSize: 9, fontWeight: 700,
                    letterSpacing: '0.12em', textTransform: 'uppercase',
                  }}>EXPANDED</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, color: '#475569' }}>Press Esc to close</span>
                  <button
                    onClick={() => setFullscreenChart(null)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 30, height: 30, borderRadius: 8,
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.10)',
                      color: '#94a3b8', cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(239,68,68,0.20)';
                      e.currentTarget.style.color = '#f87171';
                      e.currentTarget.style.borderColor = 'rgba(239,68,68,0.35)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                      e.currentTarget.style.color = '#94a3b8';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)';
                    }}
                  >
                    <X style={{ width: 14, height: 14 }} />
                  </button>
                </div>
              </div>

              {/* Chart area */}
              <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                <AdvancedTradingChart
                  symbol={chart?.symbol}
                  initialTimeframe={chart?.timeframe}
                  height={CHART_H}
                />
              </div>
            </div>
          </>,
          document.body
        );
      })()}

      {/* ── Normal grid view ── */}
      <div className="flex-1 p-4 overflow-auto min-h-0">
        <div
          className="grid gap-4 h-full min-h-0"
          style={{
            gridTemplateRows: `repeat(${currentLayout.rows}, 1fr)`,
            gridTemplateColumns: `repeat(${currentLayout.cols}, 1fr)`,
          }}
        >
          {displayCharts.slice(0, totalCharts).map((chart, index) => (
            <motion.div
              key={chart.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 group min-h-0"
            >
              {}

              {}
              <div className="absolute top-2 left-2 z-10 transition-opacity">
                <div className="px-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-lg text-white text-sm font-semibold">
                  {chart.symbol}
                </div>
              </div>

              <AdvancedTradingChart
                symbol={chart.symbol}
                initialTimeframe={chart.timeframe}
                height={300}
                showHeader={false}
              />
            </motion.div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default MultiChartWorkspace;

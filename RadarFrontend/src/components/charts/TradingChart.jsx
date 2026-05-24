import React, { useRef, useState, useEffect } from 'react';
import { useCandles } from '../../hooks/useCandles';
import { useIndicators } from '../../hooks/useIndicators';
import ChartToolbar from './ChartToolbar';
import FloatingToolbar from './FloatingToolbar';
import MainChart from './MainChart';
import RSIChart from './RSIChart';
import MACDChart from './MACDChart';

export default function TradingChart({
  symbol,
  onSymbolChange,
  isInWatchlist,
  onWatchlistToggle,
  watchlistSymbols = [],
  compareSymbol: externalCompareSymbol,
  onCompareSelect: externalOnCompareSelect,
}) {
  const [timeframe, setTimeframe] = useState('1D');
  const [localCompareAsset, setLocalCompareAsset] = useState('');
  
  const compareAsset = externalCompareSymbol !== undefined ? externalCompareSymbol : localCompareAsset;
  const setCompareAsset = externalOnCompareSelect !== undefined ? externalOnCompareSelect : setLocalCompareAsset;
  const [activeIndicators, setActiveIndicators] = useState([]);
  const [activeTool, setActiveTool] = useState('cursor');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [hoverData, setHoverData] = useState(null);

  const { candles, loading: candlesLoading } = useCandles(symbol, timeframe);
  const indicators = useIndicators(candles);

  const outerContainerRef = useRef();

  const mainChartRef = useRef();
  const rsiChartRef = useRef();
  const macdChartRef = useRef();

  const isSyncing = useRef(false);

  // Sync zoom / pan across all panels
  const syncRange = (range, sourceChart) => {
    if (isSyncing.current) return;
    isSyncing.current = true;
    
    const targets = [
      mainChartRef.current, 
      rsiChartRef.current, 
      macdChartRef.current
    ];

    targets.forEach(c => {
      if (c && c !== sourceChart) {
        c.timeScale().setVisibleLogicalRange(range);
      }
    });
    
    isSyncing.current = false;
  };

  const toggleIndicator = (ind) => {
    if (activeIndicators.includes(ind)) {
      setActiveIndicators(prev => prev.filter(x => x !== ind));
    } else {
      setActiveIndicators(prev => [...prev, ind]);
    }
  };

  const latestCandle = candles[candles.length - 1];
  const displayHover = hoverData || (latestCandle ? {
    open: latestCandle.open,
    high: latestCandle.high,
    low: latestCandle.low,
    close: latestCandle.close,
    volume: latestCandle.volume
  } : null);

  const isRsiActive = activeIndicators.includes('RSI');
  const isMacdActive = activeIndicators.includes('MACD');
  
  // Calculate relative heights for active panels
  let mainHeightPct = 'h-full';
  let rsiHeightPct = 'h-0';
  let macdHeightPct = 'h-0';

  const activePanelsCount = [isRsiActive, isMacdActive].filter(Boolean).length;

  if (activePanelsCount === 2) {
    mainHeightPct = 'h-[64%]';
    rsiHeightPct = 'h-[18%]';
    macdHeightPct = 'h-[18%]';
  } else if (activePanelsCount === 1) {
    mainHeightPct = 'h-[76%]';
    if (isRsiActive) rsiHeightPct = 'h-[24%]';
    else macdHeightPct = 'h-[24%]';
  }

  return (
    <div 
      ref={outerContainerRef}
      className="w-full flex flex-col bg-[#050816] rounded border border-white/[0.04] overflow-hidden h-[80vh]"
    >
      <ChartToolbar
        activeTimeframe={timeframe}
        setTimeframe={setTimeframe}
        activeIndicators={activeIndicators}
        toggleIndicator={toggleIndicator}
      />

      <div className="flex-grow flex overflow-hidden">

        {/* LEFT: collapsible drawing sidebar */}
        <FloatingToolbar
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          onClearDrawings={() => setActiveTool('cursor')}
        />

        {/* RIGHT: chart panels */}
        <div className="flex-grow flex flex-col h-full">
          
          {/* Main Pane (Candlestick + Volume + EMAs) */}
          <div className={`relative w-full ${mainHeightPct} border-b border-white/[0.04]`}>
            {displayHover && (
              <div className="absolute top-2 left-3 z-20 text-[9px] font-black font-mono text-[#7c8aa5] flex flex-wrap gap-x-2 gap-y-0.5 pointer-events-none">
                <span className="text-[#00ff9d]">{symbol}</span>
                <span>O: <span className="text-white font-bold">{displayHover.open?.toFixed(1)}</span></span>
                <span>H: <span className="text-white font-bold">{displayHover.high?.toFixed(1)}</span></span>
                <span>L: <span className="text-white font-bold">{displayHover.low?.toFixed(1)}</span></span>
                <span>C: <span className="text-white font-bold">{displayHover.close?.toFixed(1)}</span></span>
                <span>VOL: <span className="text-white font-bold">{(displayHover.volume / 1000).toFixed(0)}K</span></span>
                {activeIndicators.includes('EMA 20') && (
                  <span className="text-[#3b82f6]">EMA 20: <span className="font-bold">{displayHover.ema20 || indicators.ema20[indicators.ema20.length - 1]?.value || '—'}</span></span>
                )}
                {activeIndicators.includes('EMA 50') && (
                  <span className="text-[#f59e0b]">EMA 50: <span className="font-bold">{displayHover.ema50 || indicators.ema50[indicators.ema50.length - 1]?.value || '—'}</span></span>
                )}
                {activeIndicators.includes('VWAP') && (
                  <span className="text-[#10b981]">VWAP: <span className="font-bold">{displayHover.vwap || indicators.vwap[indicators.vwap.length - 1]?.value || '—'}</span></span>
                )}
              </div>
            )}

            {candlesLoading ? (
              <div className="w-full h-full flex items-center justify-center bg-[#0b1120]">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-[#00d4ff]/30 border-t-[#00d4ff] rounded-full animate-spin"/>
                  <span className="text-xs text-slate-500 font-mono">Loading candles...</span>
                </div>
              </div>
            ) : (
              <MainChart
                candles={candles}
                indicators={indicators}
                compareAsset={compareAsset}
                activeIndicators={activeIndicators}
                onRangeChange={syncRange}
                chartRef={mainChartRef}
                setHoverData={setHoverData}
                symbol={symbol}
                height={null}
              />
            )}
          </div>



          {/* RSI Pane */}
          {isRsiActive && (
            <div className={`relative w-full ${rsiHeightPct} border-b border-white/[0.04]`}>
              <RSIChart
                data={indicators.rsi}
                height={null}
                width={null}
                onRangeChange={syncRange}
                chartRef={rsiChartRef}
              />
            </div>
          )}

          {/* MACD Pane */}
          {isMacdActive && (
            <div className={`relative w-full ${macdHeightPct}`}>
              <MACDChart
                data={indicators.macd}
                height={null}
                width={null}
                onRangeChange={syncRange}
                chartRef={macdChartRef}
              />
            </div>
          )}

        </div>

      </div>
      
    </div>
  );
}

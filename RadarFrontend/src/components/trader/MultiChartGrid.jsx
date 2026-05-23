import { useEffect, useRef, useId } from "react";

// ── Symbol map to TradingView format ─────────────────────────────────────────
const TV_SYMBOL_MAP = {
  "NIFTY 50":  "NSE:NIFTY50",
  BANKNIFTY:   "NSE:BANKNIFTY",
  SENSEX:      "BSE:SENSEX",
  "NIFTY IT":  "NSE:CNXIT",
  RELIANCE:    "NSE:RELIANCE",
  HDFCBANK:    "NSE:HDFCBANK",
  TCS:         "NSE:TCS",
  INFY:        "NSE:INFY",
  "S&P 500":   "OANDA:SPX500USD",
  NASDAQ:      "OANDA:NAS100USD",
  "BTC/USDT":  "BINANCE:BTCUSDT",
  "GOLD":      "OANDA:XAUUSD",
};

const TF_MAP = {
  "1m": "1", "5m": "5", "15m": "15",
  "1h": "60", "4h": "240", "1D": "D",
};

// ── Single TradingView widget panel ──────────────────────────────────────────
const TVWidget = ({ title, timeframe }) => {
  const containerRef = useRef(null);
  const widgetRef    = useRef(null);
  // Use a stable, unique container ID
  const uid = useRef(`tv_${title.replace(/[^a-zA-Z0-9]/g, '_')}_${Math.random().toString(36).slice(2, 7)}`);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const containerId = uid.current;
    el.id = containerId;

    const symbol   = TV_SYMBOL_MAP[title] || `NSE:${title}`;
    const interval = TF_MAP[timeframe] || "15";

    // Load TV script once globally
    const existingScript = document.querySelector('script[src*="tradingview.com/tv.js"]');

    const createWidget = () => {
      if (typeof window.TradingView === "undefined") return;
      if (widgetRef.current) return; // already created

      try {
        widgetRef.current = new window.TradingView.widget({
          container_id:        containerId,
          width:               "100%",
          height:              "100%",
          autosize:            true,
          symbol,
          interval,
          timezone:            "Asia/Kolkata",
          theme:               "dark",
          style:               "1",           // candlestick
          locale:              "in",
          toolbar_bg:          "#0d1320",
          hide_top_toolbar:    false,
          hide_side_toolbar:   true,
          allow_symbol_change: false,
          save_image:          false,
          enable_publishing:   false,
          withdateranges:      true,
          studies:             [],
          overrides: {
            "paneProperties.background":              "#0d1320",
            "paneProperties.backgroundType":          "solid",
            "paneProperties.vertGridProperties.color":"#1e293b",
            "paneProperties.horzGridProperties.color":"#1e293b",
            "scalesProperties.textColor":             "#9ca3af",
            "scalesProperties.lineColor":             "#1e293b",
            "mainSeriesProperties.candleStyle.upColor":       "#26a69a",
            "mainSeriesProperties.candleStyle.downColor":     "#ef5350",
            "mainSeriesProperties.candleStyle.wickUpColor":   "#26a69a",
            "mainSeriesProperties.candleStyle.wickDownColor": "#ef5350",
            "mainSeriesProperties.candleStyle.borderUpColor":   "#26a69a",
            "mainSeriesProperties.candleStyle.borderDownColor": "#ef5350",
          },
        });
      } catch (e) {
        console.error("[TVWidget] widget creation failed:", e);
      }
    };

    if (existingScript) {
      // Script already loaded — just create widget
      if (window.TradingView) {
        createWidget();
      } else {
        existingScript.addEventListener("load", createWidget);
      }
    } else {
      const script = document.createElement("script");
      script.src   = "https://s3.tradingview.com/tv.js";
      script.async = true;
      script.onload = createWidget;
      document.head.appendChild(script);
    }

    return () => {
      // Destroy widget iframe on unmount
      try {
        if (widgetRef.current && widgetRef.current.remove) {
          widgetRef.current.remove();
        }
      } catch {}
      widgetRef.current = null;
      // Clear container
      if (el) el.innerHTML = "";
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // mount only — title/timeframe handled by key on parent

  return (
    <div className="bg-[#0d1320] border border-white/[0.07] hover:border-[#42C0A5]/20 transition-all rounded-xl overflow-hidden flex flex-col" style={{ minHeight: 240 }}>
      {/* Header bar above TV chart */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-white/[0.06] flex-shrink-0">
        <div className="w-1.5 h-1.5 rounded-full bg-[#42C0A5] animate-pulse" />
        <span className="text-white font-bold text-xs tracking-wide">{title}</span>
        <span className="text-[9px] text-white/40 font-mono ml-auto">{timeframe.toUpperCase()}</span>
      </div>
      {/* TradingView widget mounts here */}
      <div ref={containerRef} className="flex-1 w-full" style={{ minHeight: 220 }} />
    </div>
  );
};

// ── Grid ──────────────────────────────────────────────────────────────────────
const MultiChartGrid = ({
  className,
  onOpenChart,
  timeframe        = "15m",
  activeIndicators = new Set(),
  showGridLines    = true,
  layout           = "4-grid",
}) => {
  const ALL    = ["SENSEX", "NIFTY 50", "S&P 500", "BTC/USDT"];
  const charts = layout === "1-grid" ? [ALL[0]] : layout === "2-grid" ? ALL.slice(0, 2) : ALL;
  const cols   = layout === "1-grid" ? "grid-cols-1" : "grid-cols-2";

  return (
    <div className={`${className || ""} w-full`}>
      {/* Status bar */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-[#42C0A5] rounded-full animate-pulse" />
          <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">
            TradingView · {timeframe.toUpperCase()}
          </span>
        </div>
        <span className="text-[9px] text-white/25 font-mono">{layout.toUpperCase()}</span>
      </div>

      <div className={`grid ${cols} gap-2`}>
        {charts.map(title => (
          // key includes timeframe so widget recreates when timeframe changes
          <TVWidget
            key={`${title}-${timeframe}`}
            title={title}
            timeframe={timeframe}
          />
        ))}
      </div>
    </div>
  );
};

export default MultiChartGrid;

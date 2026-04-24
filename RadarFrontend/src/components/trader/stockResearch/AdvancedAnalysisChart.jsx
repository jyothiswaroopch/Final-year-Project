import { useEffect, useMemo, useRef, useState } from 'react';
import {
  createChart,
  ColorType,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
  AreaSeries,
  CrosshairMode,
} from 'lightweight-charts';

const TF_CONFIG = {
  '1m': { stepSec: 60, points: 600, drift: 0.12, volatility: 0.55 },
  '5m': { stepSec: 300, points: 600, drift: 0.18, volatility: 0.8 },
  '10m': { stepSec: 600, points: 600, drift: 0.22, volatility: 0.95 },
  '15m': { stepSec: 900, points: 600, drift: 0.28, volatility: 1.1 },
  '30m': { stepSec: 1800, points: 600, drift: 0.32, volatility: 1.3 },
  '1H': { stepSec: 3600, points: 600, drift: 0.38, volatility: 1.4 },
  '4H': { stepSec: 14400, points: 600, drift: 0.41, volatility: 1.5 },
  '1D': { stepSec: 86400, points: 600, drift: 0.45, volatility: 1.6 },
  '1W': { stepSec: 604800, points: 600, drift: 0.5, volatility: 2.0 },
  '1M': { stepSec: 2592000, points: 600, drift: 0.6, volatility: 2.5 },
  '1Y': { stepSec: 31536000, points: 600, drift: 0.8, volatility: 3.5 },
};

const toSeed = (value = '') =>
  String(value)
    .split('')
    .reduce((acc, char, idx) => acc + char.charCodeAt(0) * (idx + 1), 17);

const buildOhlcSeries = (symbol, basePrice, timeframe) => {
  const config = TF_CONFIG[timeframe] || TF_CONFIG['15m'];
  const stepSec = Number(config.stepSec);
  const points = Number(config.points);
  const drift = Number(config.drift);
  const volatility = Number(config.volatility);

  const seed = toSeed(symbol) + toSeed(timeframe);
  const nowSec = Math.floor(Date.now() / 1000);
  const alignedNow = Math.floor(nowSec / stepSec) * stepSec;
  const startSec = alignedNow - (points - 1) * stepSec;

  const rows = [];
  let prevClose = Number(basePrice || 1000);

  for (let i = 0; i < points; i += 1) {
    const trendWave = Math.sin((i + seed) / 6) * drift;
    const noise = Math.cos((i + seed) / 3.3) * (volatility * 0.35);
    const stepMove = trendWave + noise;

    const open = prevClose;
    const close = Math.max(1, open + stepMove);
    const high = Math.max(open, close) + Math.abs(Math.sin(i + seed) * volatility);
    const low = Math.min(open, close) - Math.abs(Math.cos(i + seed) * volatility * 0.9);
    const volume = Math.round(650000 + Math.abs(stepMove) * 220000 + (i % 7) * 32000 + (seed % 10000));

    rows.push({
      time: Number(startSec + (i * stepSec)),
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(Math.max(1, low).toFixed(2)),
      close: Number(close.toFixed(2)),
      volume,
    });

    prevClose = close;
  }
  return rows;
};

const sma = (values, period = 20) =>
  values.map((row, index) => {
    if (index < period - 1) return null;
    const sum = values.slice(index - period + 1, index + 1).reduce((acc, item) => acc + item.close, 0);
    return { time: row.time, value: Number((sum / period).toFixed(2)) };
  }).filter(Boolean);

const ema = (values, period = 20) => {
  const multiplier = 2 / (period + 1);
  const rows = [];
  let prevEma = values[0]?.close ?? 0;

  values.forEach((row, index) => {
    if (index === 0) {
      rows.push({ time: row.time, value: Number(prevEma.toFixed(2)) });
      return;
    }
    const nextEma = (row.close - prevEma) * multiplier + prevEma;
    prevEma = nextEma;
    rows.push({ time: row.time, value: Number(nextEma.toFixed(2)) });
  });

  return rows;
};

const rsiSeries = (values, period = 14) => {
  if (values.length < period + 1) return [];

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i += 1) {
    const delta = values[i].close - values[i - 1].close;
    if (delta >= 0) gains += delta;
    else losses += Math.abs(delta);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;
  const rows = [];

  for (let i = period + 1; i < values.length; i += 1) {
    const delta = values[i].close - values[i - 1].close;
    const gain = Math.max(delta, 0);
    const loss = Math.max(-delta, 0);

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsiValue = 100 - 100 / (1 + rs);

    rows.push({ time: values[i].time, value: Number(rsiValue.toFixed(2)) });
  }

  return rows;
};

const emaOnValues = (values, period) => {
  if (!values.length) return [];
  const multiplier = 2 / (period + 1);
  const out = [values[0]];

  for (let i = 1; i < values.length; i += 1) {
    out.push((values[i] - out[i - 1]) * multiplier + out[i - 1]);
  }

  return out;
};

const macdSeries = (values) => {
  const closes = values.map((row) => row.close);
  const ema12 = emaOnValues(closes, 12);
  const ema26 = emaOnValues(closes, 26);
  const macd = closes.map((_, idx) => ema12[idx] - ema26[idx]);
  const signal = emaOnValues(macd, 9);

  return macd.map((value, idx) => ({
    time: values[idx]?.time,
    macd: Number(value.toFixed(2)),
    signal: Number((signal[idx] ?? 0).toFixed(2)),
    histogram: Number((value - (signal[idx] ?? 0)).toFixed(2)),
  })).slice(26).filter((row) => row.time);
};

export default function AdvancedAnalysisChart({
  symbol,
  price,
  timeframe,
  chartType = 'candles',
  enabledIndicators,
  onToggleIndicator,
  supportResistance,
}) {
  const mainContainerRef = useRef(null);
  const rsiContainerRef = useRef(null);
  const macdContainerRef = useRef(null);
  const wrapperRef = useRef(null);

  const [hoverData, setHoverData] = useState(null);

  const ohlc = useMemo(() => buildOhlcSeries(symbol, price, timeframe), [symbol, price, timeframe]);
  const sma20 = useMemo(() => sma(ohlc, 20), [ohlc]);
  const ema20 = useMemo(() => ema(ohlc, 20), [ohlc]);
  const rsi14 = useMemo(() => rsiSeries(ohlc, 14), [ohlc]);
  const macd = useMemo(() => macdSeries(ohlc), [ohlc]);
  const macdByTime = useMemo(() => new Map(macd.map((row) => [row.time, row])), [macd]);

  const levelPlan = useMemo(() => {
    const s1 = Number(supportResistance?.support?.s1);
    const s2 = Number(supportResistance?.support?.s2);
    const r1 = Number(supportResistance?.resistance?.r1);
    const r2 = Number(supportResistance?.resistance?.r2);
    const px = Number(price || 0);

    const entryLow = Number.isFinite(s1) ? Number((s1 + (px - s1) * 0.35).toFixed(2)) : Number((px * 0.993).toFixed(2));
    const entryHigh = Number((px + 2.8).toFixed(2));
    const stop = Number((entryLow - 8.5).toFixed(2));
    const targets = [r1, r2].filter((v) => Number.isFinite(v));

    return {
      support: [s1, s2].filter((v) => Number.isFinite(v)),
      resistance: [r1, r2].filter((v) => Number.isFinite(v)),
      entryLow,
      entryHigh,
      stop,
      targets,
    };
  }, [supportResistance, price]);

  const range = useMemo(() => {
    const lows = ohlc.map((b) => b.low);
    const highs = ohlc.map((b) => b.high);
    const min = Math.min(...lows, levelPlan.stop, levelPlan.entryLow);
    const max = Math.max(...highs, levelPlan.entryHigh, ...(levelPlan.targets.length ? levelPlan.targets : [0]));
    return { min, max: max <= min ? min + 1 : max };
  }, [ohlc, levelPlan]);

  const yPct = (value) => {
    const normalized = (range.max - value) / (range.max - range.min);
    return Math.max(0, Math.min(100, normalized * 100));
  };

  const showRsi = Boolean(enabledIndicators?.rsi);
  const showMacd = Boolean(enabledIndicators?.macd);
  const panelHeight = 92;
  const totalHeight = 392;
  const subPanels = Number(showRsi) + Number(showMacd);
  const mainHeight = Math.max(220, totalHeight - subPanels * panelHeight - subPanels * 6);

  const latestRsi = rsi14[rsi14.length - 1]?.value;
  const latestMacd = macd[macd.length - 1];

  useEffect(() => {
    if (!mainContainerRef.current) return undefined;
    const initialWidth = mainContainerRef.current.clientWidth;
    if (!initialWidth || initialWidth < 2) return undefined;

    const mainChart = createChart(mainContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'rgba(2, 6, 23, 0)' },
        textColor: '#94a3b8',
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: 'rgba(148,163,184,0.10)' },
        horzLines: { color: 'rgba(148,163,184,0.10)' },
      },
      width: mainContainerRef.current.clientWidth,
      height: mainHeight,
      rightPriceScale: {
        borderColor: 'rgba(148,163,184,0.25)',
        autoScale: true,
        scaleMargins: { top: 0.08, bottom: 0.08 },
      },
      leftPriceScale: { visible: false },
      timeScale: {
        borderColor: 'rgba(148,163,184,0.25)',
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 0,
        fixLeftEdge: true,
        fixRightEdge: false,
        barSpacing: 6,
        minBarSpacing: 0.1,
        shiftVisibleRangeOnNewBar: true,
        lockVisibleTimeRangeOnResize: false,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: false,
      },
      handleScale: {
        mouseWheel: true,
        pinch: true,
        axisPressedMouseMove: true,
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
    });

    const closeLineData = ohlc.map((bar) => ({ time: bar.time, value: bar.close }));

    let priceSeries;
    if (chartType === 'line') {
      priceSeries = mainChart.addSeries(LineSeries, {
        color: '#22d3ee',
        lineWidth: 2,
        priceLineVisible: true,
        lastValueVisible: true,
      });
      priceSeries.setData(closeLineData);
    } else if (chartType === 'area') {
      priceSeries = mainChart.addSeries(AreaSeries, {
        lineColor: '#22d3ee',
        topColor: 'rgba(34, 211, 238, 0.35)',
        bottomColor: 'rgba(34, 211, 238, 0.02)',
        lineWidth: 2,
        priceLineVisible: true,
        lastValueVisible: true,
      });
      priceSeries.setData(closeLineData);
    } else {
      priceSeries = mainChart.addSeries(CandlestickSeries, {
        upColor: '#10b981',
        downColor: '#ef4444',
        borderUpColor: '#10b981',
        borderDownColor: '#ef4444',
        wickUpColor: '#10b981',
        wickDownColor: '#ef4444',
        priceLineVisible: true,
      });
      priceSeries.setData(ohlc);
    }

    const latestClose = ohlc[ohlc.length - 1]?.close;
    if (Number.isFinite(latestClose)) {
      priceSeries.createPriceLine({
        price: latestClose,
        color: 'rgba(56, 189, 248, 0.9)',
        lineWidth: 2,
        lineStyle: 0,
        axisLabelVisible: true,
        title: 'LTP',
      });
    }

    levelPlan.support.forEach((support, idx) => {
      priceSeries.createPriceLine({
        price: support,
        color: idx === 0 ? 'rgba(16, 185, 129, 0.7)' : 'rgba(16, 185, 129, 0.45)',
        lineWidth: idx === 0 ? 2 : 1,
        lineStyle: 2,
        axisLabelVisible: true,
        title: `S${idx + 1}`,
      });
    });

    levelPlan.resistance.forEach((resistance, idx) => {
      priceSeries.createPriceLine({
        price: resistance,
        color: idx === 0 ? 'rgba(244, 63, 94, 0.7)' : 'rgba(244, 63, 94, 0.45)',
        lineWidth: idx === 0 ? 2 : 1,
        lineStyle: 2,
        axisLabelVisible: true,
        title: `R${idx + 1}`,
      });
    });

    priceSeries.createPriceLine({
      price: levelPlan.stop,
      color: 'rgba(239, 68, 68, 0.9)',
      lineWidth: 2,
      lineStyle: 1,
      axisLabelVisible: true,
      title: 'STOP',
    });

    const resistanceSet = new Set(levelPlan.resistance.map((value) => Number(value.toFixed(2))));
    levelPlan.targets
      .filter((target) => !resistanceSet.has(Number(target.toFixed(2))))
      .forEach((target, idx) => {
      priceSeries.createPriceLine({
        price: target,
        color: 'rgba(250, 204, 21, 0.85)',
        lineWidth: 2,
        lineStyle: 1,
        axisLabelVisible: true,
        title: `T${idx + 1}`,
      });
      });

    const volumeSeries = mainChart.addSeries(HistogramSeries, {
      color: 'rgba(56, 189, 248, 0.35)',
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
      lastValueVisible: false,
      priceLineVisible: false,
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.78, bottom: 0 },
      borderVisible: false,
    });

    volumeSeries.setData(
      ohlc.map((bar) => ({
        time: bar.time,
        value: bar.volume,
        color: bar.close >= bar.open ? 'rgba(16,185,129,0.35)' : 'rgba(239,68,68,0.35)',
      }))
    );

    if (enabledIndicators.sma) {
      const smaSeries = mainChart.addSeries(LineSeries, {
        color: '#f59e0b',
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      smaSeries.setData(sma20);
    }

    if (enabledIndicators.ema) {
      const emaSeries = mainChart.addSeries(LineSeries, {
        color: '#22d3ee',
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      emaSeries.setData(ema20);
    }

    let rsiChart;
    let macdChart;

    if (showRsi && rsiContainerRef.current) {
      rsiChart = createChart(rsiContainerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: 'rgba(2, 6, 23, 0)' },
          textColor: '#94a3b8',
          attributionLogo: false,
        },
        grid: {
          vertLines: { color: 'rgba(148,163,184,0.07)' },
          horzLines: { color: 'rgba(148,163,184,0.07)' },
        },
        width: rsiContainerRef.current.clientWidth,
        height: panelHeight,
        rightPriceScale: {
          borderColor: 'rgba(148,163,184,0.2)',
          scaleMargins: { top: 0.12, bottom: 0.12 },
        },
          timeScale: {
            borderColor: 'rgba(148,163,184,0.2)',
            timeVisible: false,
            secondsVisible: false,
            rightOffset: 0,
            fixLeftEdge: true,
            fixRightEdge: false,
            barSpacing: 6,
            minBarSpacing: 0.1,
            shiftVisibleRangeOnNewBar: true,
            lockVisibleTimeRangeOnResize: false,
          },
        handleScroll: { mouseWheel: true, pressedMouseMove: true },
        handleScale: { mouseWheel: true, pinch: true },
      });

      const rsiLine = rsiChart.addSeries(LineSeries, {
        color: '#a78bfa',
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: true,
      });
      rsiLine.setData(rsi14);
      rsiLine.createPriceLine({ price: 70, color: 'rgba(239,68,68,0.7)', lineWidth: 1, lineStyle: 2, axisLabelVisible: true, title: '70' });
      rsiLine.createPriceLine({ price: 30, color: 'rgba(16,185,129,0.7)', lineWidth: 1, lineStyle: 2, axisLabelVisible: true, title: '30' });
      rsiLine.createPriceLine({ price: 50, color: 'rgba(148,163,184,0.4)', lineWidth: 1, lineStyle: 2, axisLabelVisible: false });
    }

    if (showMacd && macdContainerRef.current) {
      macdChart = createChart(macdContainerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: 'rgba(2, 6, 23, 0)' },
          textColor: '#94a3b8',
          attributionLogo: false,
        },
        grid: {
          vertLines: { color: 'rgba(148,163,184,0.07)' },
          horzLines: { color: 'rgba(148,163,184,0.07)' },
        },
        width: macdContainerRef.current.clientWidth,
        height: panelHeight,
        rightPriceScale: {
          borderColor: 'rgba(148,163,184,0.2)',
          scaleMargins: { top: 0.14, bottom: 0.14 },
        },
          timeScale: {
            borderColor: 'rgba(148,163,184,0.2)',
            timeVisible: true,
            secondsVisible: false,
            rightOffset: 0,
            fixLeftEdge: true,
            fixRightEdge: false,
            barSpacing: 6,
            minBarSpacing: 0.1,
            shiftVisibleRangeOnNewBar: true,
            lockVisibleTimeRangeOnResize: false,
          },
        handleScroll: { mouseWheel: true, pressedMouseMove: true },
        handleScale: { mouseWheel: true, pinch: true },
      });

      const histSeries = macdChart.addSeries(HistogramSeries, {
        priceLineVisible: false,
        lastValueVisible: false,
      });
      histSeries.setData(macd.map((row) => ({
        time: row.time,
        value: row.histogram,
        color: row.histogram >= 0 ? 'rgba(16,185,129,0.6)' : 'rgba(239,68,68,0.6)',
      })));

      const macdLine = macdChart.addSeries(LineSeries, {
        color: '#22d3ee',
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: true,
      });
      macdLine.setData(macd.map((row) => ({ time: row.time, value: row.macd })));

      const signalLine = macdChart.addSeries(LineSeries, {
        color: '#f97316',
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: true,
      });
      signalLine.setData(macd.map((row) => ({ time: row.time, value: row.signal })));
      signalLine.createPriceLine({ price: 0, color: 'rgba(148,163,184,0.45)', lineWidth: 1, lineStyle: 2, axisLabelVisible: false });
    }

    const charts = [mainChart, rsiChart, macdChart].filter(Boolean);
    let syncing = false;
    charts.forEach((sourceChart) => {
      sourceChart.timeScale().subscribeVisibleLogicalRangeChange((rangeValue) => {
        if (!rangeValue || syncing) return;
        syncing = true;
        charts.forEach((targetChart) => {
          if (targetChart !== sourceChart) {
            targetChart.timeScale().setVisibleLogicalRange(rangeValue);
          }
        });
        syncing = false;
      });
    });

    mainChart.subscribeCrosshairMove((param) => {
      if (!param?.point || !param?.time) {
        setHoverData(null);
        return;
      }

      const pricePoint = param.seriesData.get(priceSeries);
      if (!pricePoint) {
        setHoverData(null);
        return;
      }

      const closeValue = Number(pricePoint.close ?? pricePoint.value ?? 0);
      const openValue = Number(pricePoint.open ?? closeValue);
      const highValue = Number(pricePoint.high ?? closeValue);
      const lowValue = Number(pricePoint.low ?? closeValue);
      const osc = macdByTime.get(param.time);

      setHoverData({
        x: param.point.x,
        y: param.point.y,
        time: param.time,
        open: openValue,
        high: highValue,
        low: lowValue,
        close: closeValue,
        rsi: rsi14.find((row) => row.time === param.time)?.value,
        macd: osc?.macd,
        signal: osc?.signal,
        hist: osc?.histogram,
      });
    });

    // Institutional Flush: pin data to left edge immediately
    const flushFit = () => {
      const chartsToFit = [mainChart, rsiChart, macdChart].filter(Boolean);
      if (ohlc.length > 0) {
        chartsToFit.forEach(c => {
          c.timeScale().fitContent();
          c.timeScale().setVisibleLogicalRange({ from: 0, to: ohlc.length - 1 });
        });
      }
    };
    requestAnimationFrame(flushFit);
    // Secondary fit to handle cases where DOM hasn't fully painted
    setTimeout(flushFit, 50);
    setTimeout(flushFit, 200);

    const resizeObserver = new ResizeObserver(() => {
      if (mainContainerRef.current) {
        mainChart.applyOptions({ width: mainContainerRef.current.clientWidth, height: mainHeight });
        mainChart.timeScale().fitContent();
      }
      if (rsiChart && rsiContainerRef.current) {
        rsiChart.applyOptions({ width: rsiContainerRef.current.clientWidth, height: panelHeight });
        rsiChart.timeScale().fitContent();
      }
      if (macdChart && macdContainerRef.current) {
        macdChart.applyOptions({ width: macdContainerRef.current.clientWidth, height: panelHeight });
        macdChart.timeScale().fitContent();
      }
    });

    if (wrapperRef.current) resizeObserver.observe(wrapperRef.current);

    return () => {
      resizeObserver.disconnect();
      mainChart.remove();
      if (rsiChart) rsiChart.remove();
      if (macdChart) macdChart.remove();
    };
  }, [
    ohlc,
    sma20,
    ema20,
    enabledIndicators,
    timeframe,
    chartType,
    supportResistance,
    showRsi,
    showMacd,
    mainHeight,
    macd,
    macdByTime,
    rsi14,
    levelPlan,
  ]);

  const indicatorChipClass = (on) => `rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-[0.04em] transition ${on
    ? 'border-cyan-300/40 bg-cyan-400/15 text-cyan-100'
    : 'border-white/15 bg-white/5 text-slate-300'
    }`;

  const entryTop = yPct(Math.max(levelPlan.entryLow, levelPlan.entryHigh));
  const entryBottom = yPct(Math.min(levelPlan.entryLow, levelPlan.entryHigh));
  const stopTop = yPct(levelPlan.stop);
  const targetOneTop = levelPlan.targets[0] ? yPct(levelPlan.targets[0]) : null;
  const tooltipLeft = Math.max(8, Math.min((hoverData?.x ?? 0) + 12, (mainContainerRef.current?.clientWidth ?? 360) - 220));
  const latestClose = ohlc[ohlc.length - 1]?.close ?? Number(price || 0);
  const r1Level = levelPlan.resistance[0];
  const t1Level = levelPlan.targets[0];
  const levelBadges = [
    Number.isFinite(t1Level) ? { key: 't1', label: 'T1', value: t1Level, tone: 'bg-amber-300 text-[#0b1220]' } : null,
    Number.isFinite(r1Level) ? { key: 'r1', label: 'R1', value: r1Level, tone: 'bg-rose-500 text-white' } : null,
    { key: 'ltp', label: 'LTP', value: Number(latestClose.toFixed(2)), tone: 'bg-cyan-400 text-[#0b1220]' },
    { key: 'px', label: '', value: Number(price || latestClose).toFixed(2), tone: 'bg-rose-500 text-white' },
  ].filter(Boolean);

  const formatTime = (timeValue) => {
    if (!timeValue) return 'n/a';
    const d = new Date(Number(timeValue) * 1000);
    return timeframe === '1D'
      ? d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
      : d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div ref={wrapperRef} className="relative rounded-xl border border-white/10 bg-[rgba(2,6,23,0.55)] p-1.5">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-1.5">
        <div className="pointer-events-auto flex flex-wrap items-center gap-1.5 rounded-md border border-white/10 bg-[#020617]/80 px-1.5 py-1 backdrop-blur-md">
          <span className="px-1 text-[10px] uppercase tracking-[0.14em] text-slate-400">{chartType}</span>
          <span className="mx-0.5 h-4 w-px bg-white/10" />
          <button type="button" onClick={() => onToggleIndicator?.('sma')} className={indicatorChipClass(enabledIndicators.sma)}>SMA 20</button>
          <button type="button" onClick={() => onToggleIndicator?.('ema')} className={indicatorChipClass(enabledIndicators.ema)}>EMA 20</button>
          <button type="button" onClick={() => onToggleIndicator?.('rsi')} className={indicatorChipClass(enabledIndicators.rsi)}>RSI 14</button>
          <button type="button" onClick={() => onToggleIndicator?.('macd')} className={indicatorChipClass(enabledIndicators.macd)}>MACD 12,26,9</button>
          <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] text-slate-300">Crosshair</span>
        </div>

        <div className="rounded-md border border-white/10 bg-[#020617]/80 px-2 py-1 text-[10px] text-slate-200 backdrop-blur-md">
          <span className="font-semibold text-slate-300">RSI</span> {latestRsi ? latestRsi.toFixed(1) : 'n/a'}
          <span className="mx-1 text-slate-500">|</span>
          <span className="font-semibold text-slate-300">MACD</span> {latestMacd ? latestMacd.macd.toFixed(2) : 'n/a'}
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="relative">
          <div ref={mainContainerRef} style={{ height: `${mainHeight}px` }} className="w-full rounded-lg border border-white/10 bg-[rgba(2,6,23,0.35)]" />

          <div className="pointer-events-none absolute inset-0 rounded-lg">
            <div
              className="absolute left-0 right-0 bg-emerald-400/12"
              style={{ top: `${entryTop}%`, height: `${Math.max(1.5, entryBottom - entryTop)}%` }}
            />
            <div className="absolute left-0 right-0 border-t border-rose-400/80" style={{ top: `${stopTop}%` }} />
            {targetOneTop !== null && (
              <div className="absolute left-0 right-0 border-t border-amber-300/70" style={{ top: `${targetOneTop}%` }} />
            )}

            <div className="absolute right-1 top-1.5 flex flex-col gap-1">
              {levelBadges.map((item) => (
                <div key={item.key} className={`min-w-[88px] rounded-sm px-1.5 py-0.5 text-right text-[10px] font-bold ${item.tone}`}>
                  {item.label ? `${item.label} ` : ''}{Number(item.value).toFixed(2)}
                </div>
              ))}
            </div>
          </div>
        </div>

        {showRsi && (
          <div className="relative">
            <div ref={rsiContainerRef} style={{ height: `${panelHeight}px` }} className="w-full rounded-md border border-violet-300/25 bg-[rgba(76,29,149,0.08)]" />
            <div className="pointer-events-none absolute left-2 top-1 rounded bg-black/35 px-1.5 py-0.5 text-[10px] font-semibold text-violet-200">RSI</div>
          </div>
        )}

        {showMacd && (
          <div className="relative">
            <div ref={macdContainerRef} style={{ height: `${panelHeight}px` }} className="w-full rounded-md border border-cyan-300/25 bg-[rgba(8,47,73,0.16)]" />
            <div className="pointer-events-none absolute left-2 top-1 rounded bg-black/35 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-200">MACD</div>
          </div>
        )}
      </div>

      {hoverData && (
        <div className="pointer-events-none absolute top-10 z-20 rounded-md border border-white/10 bg-[#020617]/95 px-2 py-1.5 text-[10px] text-slate-100 shadow-lg" style={{ left: tooltipLeft }}>
          <div className="mb-1 text-slate-400">{formatTime(hoverData.time)}</div>
          <div>O: {hoverData.open.toFixed(2)} H: {hoverData.high.toFixed(2)}</div>
          <div>L: {hoverData.low.toFixed(2)} C: {hoverData.close.toFixed(2)}</div>
          <div className="mt-1 text-violet-200">RSI: {Number.isFinite(hoverData.rsi) ? hoverData.rsi.toFixed(2) : 'n/a'}</div>
          <div className="text-cyan-200">MACD: {Number.isFinite(hoverData.macd) ? hoverData.macd.toFixed(2) : 'n/a'}</div>
          <div className="text-orange-200">Signal: {Number.isFinite(hoverData.signal) ? hoverData.signal.toFixed(2) : 'n/a'}</div>
        </div>
      )}

      <div className="pointer-events-none absolute bottom-2 right-2 rounded bg-black/35 px-1.5 py-0.5 text-[10px] text-slate-300">
        Invalidation: Break below {levelPlan.stop.toFixed(2)} with volume
      </div>
    </div>
  );
}

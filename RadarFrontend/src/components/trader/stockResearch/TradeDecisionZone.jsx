import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';

const Panel = ({ children, className = '' }) => (
  <div className={`rounded-xl p-5 ${className}`}
    style={{ background: '#0D1421', border: '1px solid rgba(255,255,255,0.07)' }}>
    {children}
  </div>
);

const PanelLabel = ({ children }) => (
  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">{children}</div>
);

const Row = ({ label, value, valueClass = 'text-slate-200' }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-white/[0.05] last:border-0">
    <span className="text-xs text-slate-500">{label}</span>
    <span className={`text-sm font-semibold ${valueClass}`}>{value}</span>
  </div>
);

const CHECKLIST = [
  { label: 'Price above EMA 20',       pass: true  },
  { label: 'Volume above 20D average', pass: true  },
  { label: 'RSI in momentum zone',     pass: true  },
  { label: 'MACD bullish crossover',   pass: true  },
  { label: 'Sector outperforming',     pass: false },
  { label: 'No major resistance near', pass: false },
];

export default function TradeDecisionZone({ stock }) {
  const price  = stock?.price ?? 2870;
  const isPos  = (stock?.changePercent ?? 0) >= 0;
  const entry  = +(price * 0.998).toFixed(2);
  const sl     = +(price * 0.972).toFixed(2);
  const target = +(price * 1.038).toFixed(2);
  const rr     = ((target - entry) / (entry - sl)).toFixed(1);
  const passed = CHECKLIST.filter(c => c.pass).length;
  const riskLabel = passed >= 5 ? 'Low' : passed >= 3 ? 'Medium' : 'High';
  const riskColor = passed >= 5 ? 'text-emerald-400' : passed >= 3 ? 'text-amber-400' : 'text-rose-400';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

      {/* 1 — Signal & Trend */}
      <Panel>
        <PanelLabel>Signal & Trend</PanelLabel>
        <Row label="Trend"    value={isPos ? 'Bullish' : 'Bearish'} valueClass={isPos ? 'text-emerald-400' : 'text-rose-400'} />
        <Row label="Signal"   value="Strong Buy" valueClass="text-emerald-400" />
        <Row label="Strength" value="78 / 100"   valueClass="text-slate-200" />
        <Row label="Momentum" value="Rising"     valueClass="text-slate-200" />
        <Row label="Bias"     value="Long"        valueClass="text-slate-200" />
      </Panel>

      {/* 2 — Trade Setup */}
      <Panel>
        <PanelLabel>Trade Setup</PanelLabel>
        <Row label="Entry Zone"   value={`₹${entry.toLocaleString('en-IN')}`}  valueClass="text-slate-200" />
        <Row label="Stop Loss"    value={`₹${sl.toLocaleString('en-IN')}`}     valueClass="text-rose-400" />
        <Row label="Target 1"     value={`₹${target.toLocaleString('en-IN')}`} valueClass="text-emerald-400" />
        <div className="flex items-center justify-between pt-3 mt-1">
          <span className="text-xs text-slate-500">Risk : Reward</span>
          <span className="text-base font-bold text-slate-200">1 : {rr}</span>
        </div>
      </Panel>

      {/* 3 — Risk Analysis */}
      <Panel>
        <PanelLabel>Risk Analysis</PanelLabel>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-slate-500">Risk Level</span>
          <span className={`text-sm font-bold ${riskColor}`}>{riskLabel} Risk</span>
        </div>
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
          <span className="text-xs text-slate-500">Confirmations</span>
          <span className="text-sm font-bold text-slate-200">{passed} / {CHECKLIST.length}</span>
        </div>
        <div className="space-y-2">
          {CHECKLIST.map(({ label, pass }) => (
            <div key={label} className="flex items-center gap-2.5">
              {pass
                ? <CheckCircle2 size={12} className="text-emerald-500 flex-shrink-0" />
                : <Circle       size={12} className="text-slate-700    flex-shrink-0" />}
              <span className={`text-[11px] ${pass ? 'text-slate-400' : 'text-slate-600'}`}>{label}</span>
            </div>
          ))}
        </div>
      </Panel>

      {/* 4 — Invalidation */}
      <Panel>
        <PanelLabel>Invalidation Conditions</PanelLabel>
        <div className="space-y-3">
          {[
            'Close below ₹2,798 (S2 support)',
            'Volume dries up below 0.6× avg',
            'RSI breaks below 40 on daily',
            'NIFTY loses 23,400 level',
          ].map((item, i) => (
            <div key={i} className="flex gap-2.5 items-start">
              <AlertCircle size={12} className="text-slate-600 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-slate-400 leading-relaxed">{item}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-white/5">
          <p className="text-[10px] text-slate-600 leading-relaxed">
            Exit on 15m close below stop loss with above-average volume confirmation.
          </p>
        </div>
      </Panel>

    </div>
  );
}

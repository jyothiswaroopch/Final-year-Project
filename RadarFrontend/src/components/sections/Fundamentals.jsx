import React from 'react';
import { SlidersHorizontal } from 'lucide-react';

export default function Fundamentals({ fundamentals, stockDetails }) {
  const pe = stockDetails?.peRatio ?? fundamentals?.pe ?? null;
  const roe = stockDetails?.roe ?? fundamentals?.roe ?? null;
  const roa = fundamentals?.roa ?? null;
  const revGrowth = fundamentals?.revGrowth ?? null;
  const debtEquity = stockDetails?.debtToEquity ?? fundamentals?.debtEquity ?? null;
  const eps = fundamentals?.epsGrowth ?? null;

  const indPe = fundamentals?.industryPeAvg ?? null;
  const indRoe = fundamentals?.industryRoeAvg ?? null;
  const indMargin = fundamentals?.industryMarginAvg ?? null;
  const indGrowth = fundamentals?.industryGrowthAvg ?? null;

  const metrics = [
    { label: 'P/E Ratio', value: pe, format: (v) => Number(v).toFixed(2), indAvg: indPe, highlight: false },
    { label: 'ROE %', value: roe, format: (v) => `${Number(v).toFixed(2)}%`, indAvg: indRoe, highlight: true },
    { label: 'ROA %', value: roa, format: (v) => `${Number(v).toFixed(2)}%`, highlight: true },
    { label: 'Rev Growth', value: revGrowth, format: (v) => `+${Number(v).toFixed(2)}%`, indAvg: indGrowth, highlight: true },
    { label: 'Debt to Equity', value: debtEquity, format: (v) => Number(v).toFixed(2), highlight: false },
    { label: 'Net Margin', value: stockDetails?.profitMargins ?? fundamentals?.profitMargins ?? null, format: (v) => `${(Number(v) * 100).toFixed(2)}%`, indAvg: indMargin ? indMargin * 100 : null, highlight: true }
  ];

  return (
    <div className="bg-[#101827] border border-white/[0.06] rounded-xl p-[28px] shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all hover:border-[#00d4ff]/20">
      <div className="flex items-center gap-2 mb-6">
        <SlidersHorizontal className="text-[#00d4ff]" size={18} />
        <h3 className="font-sans font-bold text-[#dbe4ff] text-sm uppercase tracking-wider">Fundamental Metrics</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 font-mono text-xs">
        {metrics.map((m, idx) => (
          <div key={idx} className="bg-[#0b1120] p-4 rounded-lg border border-white/[0.04] flex flex-col justify-between min-h-[5rem]">
            <span className="text-[#7c8db5] text-[10px] font-sans font-semibold uppercase">{m.label}</span>
            <div className="flex flex-col mt-1">
              <span className={`text-lg font-black ${m.highlight && m.value > 0 ? 'text-[#00ff9d]' : m.highlight && m.value < 0 ? 'text-[#ff4d6d]' : 'text-white'}`}>
                {m.value != null && !isNaN(m.value) ? m.format(m.value) : '--'}
              </span>
              {m.indAvg != null && !isNaN(m.indAvg) && (
                <span className="text-[#7c8db5] text-[9px] font-sans mt-0.5">
                  Ind: {m.format(m.indAvg)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

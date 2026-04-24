import { Info } from 'lucide-react';

export default function TermTooltip({ term, children }) {
  return (
    <span className="support-term-wrap">
      <span className="support-term-text">{children}</span>
      <span className="support-term-badge" aria-hidden="true">
        <Info size={12} />
      </span>
      <span role="tooltip" className="support-term-tooltip">
        {term}
      </span>
    </span>
  );
}

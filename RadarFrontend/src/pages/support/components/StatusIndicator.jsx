export default function StatusIndicator({ label, value, tone = 'ok' }) {
  return (
    <div className="support-status-card">
      <div className="support-status-head">
        <span className={`support-status-dot ${tone}`} aria-hidden="true" />
        <span className="support-status-label">{label}</span>
      </div>
      <div className="support-status-value">{value}</div>
    </div>
  );
}

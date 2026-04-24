import React from 'react';

const MetricsCard = ({ label, value, suffix = '', hint }) => {
  return (
    <article className="metric-card">
      <p className="metric-label">{label}</p>
      <p className="metric-value">
        {value}
        {suffix}
      </p>
      {hint ? <p className="metric-hint">{hint}</p> : null}
    </article>
  );
};

export default MetricsCard;

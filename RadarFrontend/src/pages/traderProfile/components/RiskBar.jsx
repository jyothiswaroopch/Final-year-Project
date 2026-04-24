import React from 'react';

const RiskBar = ({ value, label }) => {
  return (
    <div className="risk-bar-wrapper">
      <div className="risk-bar-labels">
        <span>Low</span>
        <span>{label}</span>
        <span>High</span>
      </div>
      <div className="risk-bar-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}>
        <div className="risk-bar-fill" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
};

export default RiskBar;

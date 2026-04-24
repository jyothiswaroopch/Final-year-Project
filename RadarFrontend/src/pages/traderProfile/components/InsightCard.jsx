import React from 'react';

const InsightCard = ({ title, children, className = '' }) => {
  return (
    <section className={`insight-card ${className}`.trim()}>
      <h3 className="insight-title">{title}</h3>
      <div className="insight-body">{children}</div>
    </section>
  );
};

export default InsightCard;

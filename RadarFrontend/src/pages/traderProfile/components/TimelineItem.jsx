import React from 'react';

const TimelineItem = ({ symbol, pattern, description, time }) => {
  return (
    <li className="timeline-item">
      <div className="timeline-dot" aria-hidden="true" />
      <div className="timeline-content">
        <div className="timeline-top-row">
          <span className="timeline-symbol">{symbol}</span>
          <span className="timeline-time">{time}</span>
        </div>
        <p className="timeline-pattern">{pattern}</p>
        <p className="timeline-description">{description}</p>
      </div>
    </li>
  );
};

export default TimelineItem;

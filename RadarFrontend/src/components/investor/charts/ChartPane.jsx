import React from 'react';

const ChartPane = ({
  panel,
  isActive,
  onSelect,
}) => {
  const symbol = panel?.symbol || 'RELIANCE';
  const tradingViewSymbol = symbol.includes('.') ? symbol : `NSE:${symbol}`;

  return (
    <div 
      className={`relative w-full h-full min-h-[400px] rounded overflow-hidden border-2 transition-colors ${
        isActive ? 'border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'border-slate-800'
      }`}
      onClick={onSelect}
    >
      <iframe
        title={`TradingView-${tradingViewSymbol}`}
        src={`https://s.tradingview.com/widgetembed/?frameElementId=tv-widget&symbol=${encodeURIComponent(tradingViewSymbol)}&interval=D&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=050816&studies=[]&theme=dark&style=1&timezone=Etc%2FUTC&withdateranges=1&hideideas=1&locale=en`}
        width="100%"
        height="100%"
        className="flex-grow pointer-events-auto"
        frameBorder="0"
        allowTransparency
        scrolling="no"
      />
    </div>
  );
};

export default ChartPane;

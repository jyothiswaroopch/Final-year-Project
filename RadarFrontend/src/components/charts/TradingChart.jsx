import React from 'react';

export default function TradingChart({
  symbol,
  onSymbolChange,
  isInWatchlist,
  onWatchlistToggle,
  watchlistSymbols = [],
  compareSymbol,
  onCompareSelect,
}) {
  const tradingViewSymbol = symbol?.includes('.') ? symbol : `NSE:${symbol || 'NIFTY'}`;

  return (
    <div className="w-full h-full min-h-[60vh] bg-[#050816] rounded border border-white/[0.04] overflow-hidden flex flex-col">
      <iframe
        title={`TradingView-${tradingViewSymbol}`}
        src={`https://s.tradingview.com/widgetembed/?frameElementId=tv-widget&symbol=${encodeURIComponent(tradingViewSymbol)}&interval=D&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=050816&studies=[]&theme=dark&style=1&timezone=Etc%2FUTC&withdateranges=1&hideideas=1&locale=en`}
        width="100%"
        height="100%"
        className="flex-grow"
        frameBorder="0"
        allowTransparency
        scrolling="no"
      />
    </div>
  );
}

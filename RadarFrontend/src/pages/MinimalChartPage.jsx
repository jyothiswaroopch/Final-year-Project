import React from 'react';
import { useParams } from 'react-router-dom';
import ImmersiveTraderTerminal from '../components/trader/stockResearch/ImmersiveTraderTerminal';

export default function MinimalChartPage() {
  const { symbol } = useParams();
  const displaySymbol = (symbol || 'RELIANCE').toUpperCase();

  return (
    <div className="h-screen w-screen overflow-hidden">
      <ImmersiveTraderTerminal symbol={displaySymbol} basePrice={2870.15} />
    </div>
  );
}

export const profileData = {
  name: 'Krishna',
  email: 'krishna.trader@radar.com',
  status: 'Active',
  tradingStyle: 'Intraday',
  riskType: 'Aggressive',
  description:
    'Fast decision-maker with strong breakout recognition and above-average execution during market open.',
  metrics: {
    totalSignals: 342,
    accuracy: 78,
    consistency: 82,
    screensAnalyzed: 1289,
  },
  riskLevel: 'Medium-High',
  riskScore: 72,
  riskInsight: 'Takes higher risk after losses. Better results when position size is reduced post drawdown.',
  sessionPerformance: {
    opening: 84,
    midDay: 69,
    closing: 74,
    bestSession: 'Opening',
  },
  bestPattern: 'Breakout',
  strengths: ['Breakouts', 'Volume confirmation', 'Quick trend alignment'],
  weaknesses: ['Late entries', 'Overtrading', 'Holding losers too long'],
  activityTimeline: [
    {
      symbol: 'RELIANCE',
      pattern: 'Breakout',
      description: 'Entered on volume breakout above previous day high.',
      time: '10:12 AM',
    },
    {
      symbol: 'INFY',
      pattern: 'Pullback',
      description: 'Late entry on pullback reduced risk-reward.',
      time: '11:46 AM',
    },
    {
      symbol: 'HDFCBANK',
      pattern: 'Range Breakdown',
      description: 'Good confirmation with RSI and market breadth.',
      time: '1:28 PM',
    },
    {
      symbol: 'TCS',
      pattern: 'Momentum Fade',
      description: 'Avoided weak setup during low liquidity phase.',
      time: '2:54 PM',
    },
  ],
};

export const fallbackQuotes = [
  { symbol: 'AAPL', price: 208.21 },
  { symbol: 'MSFT', price: 427.64 },
];

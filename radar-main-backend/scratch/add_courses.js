const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../src/data/learningData.json');
let courses = [];
try {
  const data = fs.readFileSync(dataPath, 'utf8');
  courses = JSON.parse(data);
} catch (err) {
  console.error("Error reading file:", err);
  process.exit(1);
}

const newCourses = [
  {
    "id": "chart-patterns-101",
    "title": "Introduction to Chart Patterns",
    "category": "Price Action",
    "difficulty": "Beginner",
    "icon": "BookMarked",
    "color": "blue",
    "description": "Learn to identify classic chart patterns like Head & Shoulders, Double Tops, and Triangles.",
    "duration": "40 min",
    "chapters": [
      {
        "id": "cp-1",
        "title": "Reversal Patterns",
        "content": "Reversal patterns signal that the prior trend is about to change course.\n\n**Head and Shoulders:** A bearish reversal pattern consisting of three peaks: a higher middle peak (head) and two lower outside peaks (shoulders). A break below the 'neckline' confirms the reversal.\n**Double Top / Double Bottom:** A Double Top looks like an 'M' and signals a bearish reversal. A Double Bottom looks like a 'W' and signals a bullish reversal.\n\nWait for the pattern to complete and break the neckline before entering the trade."
      },
      {
        "id": "cp-2",
        "title": "Continuation Patterns",
        "content": "Continuation patterns suggest the price will resume its prior trend after a brief consolidation.\n\n**Bull / Bear Flags:** A sharp, strong price movement (the flagpole) followed by a tight, sloping rectangular consolidation (the flag). A breakout in the direction of the trend signals a continuation.\n**Ascending / Descending Triangles:** Ascending triangles have a flat top resistance and rising bottom support, usually breaking out upwards. Descending triangles have flat bottom support and falling top resistance, typically breaking downwards."
      }
    ],
    "quiz": [
      {
        "id": "q-cp-1",
        "question": "Which of the following is a bullish reversal pattern?",
        "options": ["Head and Shoulders", "Double Top", "Double Bottom", "Bear Flag"],
        "answer": 2,
        "explanation": "A Double Bottom resembles a 'W' shape and typically appears at the end of a downtrend, signaling a potential bullish reversal."
      }
    ],
    "audience": "trader"
  },
  {
    "id": "market-trends",
    "title": "Understanding Market Trends",
    "category": "Fundamentals",
    "difficulty": "Beginner",
    "icon": "PlayCircle",
    "color": "emerald",
    "description": "Discover how to identify and ride market trends using simple Dow Theory concepts.",
    "duration": "35 min",
    "chapters": [
      {
        "id": "mt-1",
        "title": "Higher Highs and Lower Lows",
        "content": "A trend is simply a direction in which the market is moving over a period of time.\n\n**Uptrend:** A series of Higher Highs (HH) and Higher Lows (HL). As long as the price continues to make higher lows, the uptrend is intact.\n**Downtrend:** A series of Lower Highs (LH) and Lower Lows (LL). \n**Ranging Market:** Price moves sideways between a defined support and resistance level without making significant higher highs or lower lows.\n\n**Rule:** Never trade against the primary trend."
      },
      {
        "id": "mt-2",
        "title": "Trendlines and Channels",
        "content": "Trendlines visually represent the trend and act as dynamic support or resistance.\n\n**Drawing Trendlines:** Connect at least two swing lows to draw an ascending trendline (uptrend). Connect at least two swing highs to draw a descending trendline (downtrend). A third touch confirms the trendline's validity.\n**Trend Channels:** When price is bouncing between two parallel trendlines (one support, one resistance), it creates a channel. Traders often buy at the lower channel line and sell at the upper channel line."
      }
    ],
    "quiz": [
      {
        "id": "q-mt-1",
        "question": "What defines an uptrend?",
        "options": ["A series of Lower Highs and Lower Lows", "Sideways movement", "A series of Higher Highs and Higher Lows", "A break below a major support level"],
        "answer": 2,
        "explanation": "An uptrend is characterized by a sequence of higher highs and higher lows, showing sustained buying pressure."
      }
    ],
    "audience": "trader"
  },
  {
    "id": "swing-trading",
    "title": "Swing Trading Strategies",
    "category": "Strategies",
    "difficulty": "Intermediate",
    "icon": "Award",
    "color": "purple",
    "description": "Learn how to capture short-to-medium term moves by holding positions for days or weeks.",
    "duration": "55 min",
    "chapters": [
      {
        "id": "st-1",
        "title": "The Pullback Strategy",
        "content": "Swing traders look to capture 'swings' within a larger trend. The easiest way to enter a trend is on a pullback.\n\n**How it works:** \n1. Identify a strong trend (e.g., using moving averages).\n2. Wait for the price to retrace (pull back) to a key support level, such as a prior resistance turned support, or a moving average (like the 20 EMA or 50 SMA).\n3. Enter the trade when bullish price action (like a hammer or engulfing candle) confirms the support is holding.\n\n**Stop Loss:** Placed just below the recent swing low."
      },
      {
        "id": "st-2",
        "title": "Mean Reversion vs Trend Following",
        "content": "Swing traders generally use two approaches:\n\n**Trend Following:** Buying pullbacks in an uptrend, expecting the trend to continue. Higher win rate, but you rely on the market trending.\n**Mean Reversion:** Betting that an extreme price move will reverse back to its average (mean). Often uses indicators like RSI or Bollinger Bands to identify overbought or oversold conditions.\n\n*Pro Tip:* Mean reversion works best in ranging markets; trend following works best in strongly trending markets."
      }
    ],
    "quiz": [
      {
        "id": "q-st-1",
        "question": "Where is the ideal entry point for a trend-following pullback strategy?",
        "options": ["At the absolute top of a bullish run", "During a retracement to a key support level or moving average", "After the price breaks below a major support", "When the RSI is heavily overbought"],
        "answer": 1,
        "explanation": "The safest entry in an uptrend is waiting for a pullback to an area of value, like support or a moving average, rather than buying at the very top."
      }
    ],
    "audience": "trader"
  },
  {
    "id": "gaps-and-breakouts",
    "title": "Trading Gaps and Breakouts",
    "category": "Strategies",
    "difficulty": "Intermediate",
    "icon": "Zap",
    "color": "blue",
    "description": "Understand how to trade morning gaps and explosive breakouts without getting caught in fake-outs.",
    "duration": "60 min",
    "chapters": [
      {
        "id": "gb-1",
        "title": "Understanding Gaps",
        "content": "A gap occurs when a stock opens significantly higher or lower than its previous close, usually due to overnight news or earnings.\n\n**Common Gap Types:**\n- **Breakaway Gap:** Occurs at the start of a new trend, breaking out of a consolidation zone. Highly profitable.\n- **Runaway (Measuring) Gap:** Happens in the middle of a strong trend, showing accelerated interest.\n- **Exhaustion Gap:** Appears at the end of a massive trend, signaling the trend is dying.\n\n**Gap Fill:** 'Gaps always fill' is a myth, but exhaustion and common gaps often do retrace back to their origin. Breakaway gaps rarely fill immediately."
      },
      {
        "id": "gb-2",
        "title": "Trading Breakouts Successfully",
        "content": "Breakout trading involves entering a trade when price moves outside a defined support or resistance level with increased volume.\n\n**Avoiding Fake-outs (Bull/Bear Traps):**\n- **Volume is Key:** A valid breakout should be accompanied by a spike in volume. Low volume breakouts are likely to fail.\n- **The Retest:** Instead of buying the initial breakout, wait for the price to pull back and retest the breakout level as new support. This offers a safer entry with a tighter stop loss."
      }
    ],
    "quiz": [
      {
        "id": "q-gb-1",
        "question": "Which gap type usually occurs at the very beginning of a new trend?",
        "options": ["Exhaustion Gap", "Runaway Gap", "Common Gap", "Breakaway Gap"],
        "answer": 3,
        "explanation": "A Breakaway Gap signifies strong momentum breaking out of a consolidation phase, initiating a new trend."
      }
    ],
    "audience": "trader"
  },
  {
    "id": "algo-trading-concepts",
    "title": "Algorithmic Trading Concepts",
    "category": "Advanced",
    "difficulty": "Advanced",
    "icon": "PlayCircle",
    "color": "emerald",
    "description": "A primer on how algorithms work, quantitative strategies, and backtesting principles.",
    "duration": "70 min",
    "chapters": [
      {
        "id": "at-1",
        "title": "What is Algorithmic Trading?",
        "content": "Algorithmic (algo) trading involves using computer programs to execute trades automatically based on predefined criteria.\n\n**Benefits:** Removes human emotion, ensures instant execution, and allows for simultaneous monitoring of thousands of markets.\n\n**Types of Algos:**\n- **Execution Algos (e.g., VWAP, TWAP):** Used by institutions to break up large orders and minimize market impact.\n- **Statistical Arbitrage:** Exploits temporary pricing inefficiencies between correlated assets.\n- **Momentum/Trend Algos:** Automatically detect and ride strong trends using moving averages or breakout logic."
      },
      {
        "id": "at-2",
        "title": "Backtesting and Optimization",
        "content": "Backtesting is simulating a trading strategy on historical data to see how it would have performed.\n\n**Key Pitfalls to Avoid:**\n- **Overfitting (Curve Fitting):** Tweaking strategy parameters so perfectly that it looks amazing in the past, but fails in the future. Keep rules simple.\n- **Look-Ahead Bias:** Accidentally using data in the backtest that wouldn't have been available at the time of the trade.\n- **Ignoring Slippage and Fees:** Real-world trading has transaction costs and slippage (getting filled at a worse price). Backtests must account for this to be realistic."
      }
    ],
    "quiz": [
      {
        "id": "q-at-1",
        "question": "What is 'overfitting' in algorithmic trading?",
        "options": ["Executing trades too quickly", "Creating a strategy that is too complex and tailored perfectly to past data but fails in live trading", "Ignoring transaction fees", "Trading multiple markets simultaneously"],
        "answer": 1,
        "explanation": "Overfitting (or curve-fitting) happens when a strategy is excessively optimized to fit historical noise rather than genuine market patterns, causing it to perform poorly in real-time."
      }
    ],
    "audience": "trader"
  },
  {
    "id": "advanced-options-strategies",
    "title": "Advanced Options: Iron Condors & Straddles",
    "category": "Derivatives",
    "difficulty": "Advanced",
    "icon": "Award",
    "color": "purple",
    "description": "Learn multi-leg option strategies for trading volatility and ranging markets.",
    "duration": "80 min",
    "chapters": [
      {
        "id": "aos-1",
        "title": "Trading Volatility with Straddles",
        "content": "A Long Straddle involves buying both a Call and a Put at the exact same strike price and expiration date.\n\n**When to use it:** You expect a massive price movement (e.g., upcoming earnings report) but you don't know which direction it will go.\n**Risk/Reward:** Max loss is the total premium paid for both options. Profit potential is unlimited in either direction.\n\n**The catch (Implied Volatility Crush):** Options get expensive before known events. After the event, Implied Volatility (IV) plummets, rapidly decreasing the value of both options even if the price moves slightly. The price move must be significant to overcome this 'IV crush'."
      },
      {
        "id": "aos-2",
        "title": "The Iron Condor",
        "content": "An Iron Condor is a neutral, 4-leg option strategy designed to profit when the underlying asset stays within a specific price range.\n\n**Setup:** \n- Sell an Out-of-the-Money (OTM) Put and buy a further OTM Put (Bull Put Spread).\n- Sell an OTM Call and buy a further OTM Call (Bear Call Spread).\n\n**Why trade it?** You collect premium upfront. As long as the stock stays between the two short strikes at expiration, you keep all the premium.\n**Risk/Reward:** High probability of a small win. Defined, but potentially larger maximum loss if the stock breaks out of the wings. It benefits immensely from time decay (Theta) and a drop in volatility."
      }
    ],
    "quiz": [
      {
        "id": "q-aos-1",
        "question": "In an Iron Condor, what market condition are you primarily betting on?",
        "options": ["A massive directional breakout", "The market crashing", "The underlying asset remaining within a specific price range", "Interest rates dropping"],
        "answer": 2,
        "explanation": "An Iron Condor is a delta-neutral strategy that profits from time decay and low volatility, relying on the underlying asset to trade sideways within your defined range."
      }
    ],
    "audience": "trader"
  }
];

// Append new courses
courses.push(...newCourses);

// Save back to file
fs.writeFileSync(dataPath, JSON.stringify(courses, null, 4));
console.log("Successfully appended 6 new courses to learningData.json");

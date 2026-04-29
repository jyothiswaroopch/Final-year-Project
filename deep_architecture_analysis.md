# Section 13: Deep Architecture & Algorithmic Analysis

This section provides thesis-level, microscopic details into the core backend services, showcasing the exact algorithmic choices, fault-tolerant routing, and quantitative models running within the RADAR Node.js environment.

---

## 13.1 Psychometric State Management: The "Investor DNA" Model
RADAR does not use a traditional static Boolean role (e.g., `isTrader: true`). Instead, the backend employs a deeply nested, quantitative **psychometric profiling schema** within the `User.js` model.

**Schema Architecture (`src/models/User.js`):**
When a user completes onboarding, the backend calculates an `investorDNA` matrix. This is persisted to MongoDB:
```javascript
investorDNA: {
    dominant:            { type: String, enum: ['TRADER', 'INVESTOR'], default: null },
    personaName:         { type: String, default: null }, // e.g., "The Calculated Sniper"
    investorPercent:     { type: Number, default: null },
    traderPercent:       { type: Number, default: null },
    hybridLine:          { type: String, default: null },
    metrics: {
        speed:       { type: Number, default: null },
        risk:        { type: Number, default: null },
        patience:    { type: Number, default: null },
        volatility:  { type: Number, default: null },
        discipline:  { type: Number, default: null }
    }
}
```
**Security & Hashes:**
*   **Authentication:** The model utilizes `bcryptjs` for secure password hashing with a computational cost of `salt = 10`.
*   **Tokenization:** Password reset tokens avoid simple random strings. The backend generates a 20-byte cryptographically secure buffer (`crypto.randomBytes(20)`), hashes it via SHA-256 (`crypto.createHash('sha256')`), and enforces a strict 10-minute expiry window (`Date.now() + 10 * 60 * 1000`).

---

## 13.2 High-Velocity Data Aggregation & Concurrent Routing
To deliver the global market overview rapidly without blocking the Node.js event loop, the `marketController.js` utilizes concurrent Promise resolution combined with aggressive, short-lived caching.

**Algorithmic Approach (`src/controllers/marketController.js`):**
1.  **Concurrent Execution:** The controller dispatches three parallel network requests using `Promise.allSettled`. This is critical: if `fetchForexData()` fails due to upstream API limits, it resolves as `'rejected'`, allowing `fetchCryptoData()` and `fetchStockData()` to succeed independently without crashing the entire request cycle.
2.  **Normalization Engine:** Each data stream passes through strict normalization pipelines (`normalizeCrypto`, `normalizeStock`, `normalizeForex`) to ensure the frontend React tables receive perfectly standardized objects, regardless of the differing upstream JSON structures.
3.  **Transient Cache:** The aggregated payload across all asset classes is massive. The controller pushes the merged array to a local `NodeCache` with an extremely short `stdTTL: 60` (1 minute). This ensures that if 1,000 users refresh the dashboard simultaneously, the backend executes the upstream API requests exactly *once* per minute.
4.  **Region-Aware Slicing:** The trending endpoints dynamically pivot based on the server's `DEFAULT_MARKET_REGION` environment variable. A request from the 'IN' region pins `NIFTY` and `USDINR`, while 'US' pins `NASDAQ` and `BTC`.

---

## 13.3 Quantitative Risk Engine: Parametric Value-at-Risk (VaR)
The platform doesn't just show portfolio balances; it runs real-time mathematical risk assessments on the user's holdings utilizing a custom Parametric Value-at-Risk (VaR) model.

**Risk Calculation Pipeline (`src/services/portfolioRiskService.js`):**
The `calculatePortfolioRisk` function computes the 95% confidence interval for maximum daily drawdown.

1.  **Sector Aggregation & Concentration Penalties:**
    The engine fetches live fundamentals for all holdings, mapping each to its respective sector. It identifies the heaviest sector weight (e.g., 60% in IT) and calculates a **Concentration Penalty**:
    ```javascript
    const topWeight = concentration[0]?.weightPct || 0;
    const concentrationPenalty = topWeight / 100;
    ```
2.  **Dynamic Volatility & Beta Modeling:**
    Instead of relying on static historical volatility, the backend dynamically calculates assumed daily volatility based on portfolio diversity. High concentration geometrically increases assumed volatility and portfolio Beta.
    ```javascript
    // Base volatility of 1.8% daily, scaled by concentration
    const assumedDailyVol = 0.018 + concentrationPenalty * 0.04;
    
    // Base beta of 0.85, scaled by concentration
    const beta = Number((0.85 + concentrationPenalty * 0.9).toFixed(2));
    ```
3.  **Parametric VaR Computation:**
    Using the normal distribution Z-score for a 95% confidence interval (`z95 = 1.65`), the backend computes the exact dollar amount at risk for a 1-day horizon:
    ```javascript
    const z95 = 1.65;
    const var95 = totalHoldingsValue * assumedDailyVol * z95;
    ```
4.  **Risk Output Payload:**
    This rigorous mathematical output is then passed to the frontend to drive the "Portfolio DNA" gauges, providing hedge-fund-level analytics directly to the retail user:
    ```json
    {
      "var95": 420.50,
      "beta": 1.35,
      "riskLevel": "high",
      "assumptions": {
          "method": "parametric-var",
          "confidence": 0.95,
          "horizon": "1D"
      }
    }
    ```

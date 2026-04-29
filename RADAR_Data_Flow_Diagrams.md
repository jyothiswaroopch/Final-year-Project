# RADAR System: Data Flow Diagrams (DFDs)

Based on the extensive architectural audit of the RADAR Full-Stack System, these Data Flow Diagrams (DFDs) map out how data moves between external entities, major internal processes, and data stores.

These diagrams use Mermaid.js and follow the Gane & Sarson / Yourdon DFD logical structure.

## 1. Level 0: Context Diagram
The Level 0 DFD illustrates the RADAR platform as a single macro-process interacting with its external environment (Users and Market Data Providers).

```mermaid
flowchart LR
    %% External Entities
    User((User \n Trader/Investor))
    MarketAPI[External Data Providers\n Finnhub, Yahoo, SEC]
    
    %% System
    RADAR((0.0 \n RADAR \n Full-Stack System))
    
    %% Flows
    User -- Registration, Preferences,\n Trading Actions, Filter Criteria --> RADAR
    RADAR -- UI Dashboards, Real-time Prices, \n Portfolio Status, Alerts --> User
    
    RADAR -- API Requests, \n WebSockets Subscriptions --> MarketAPI
    MarketAPI -- Live Ticker Data, Historical OHLC,\n News, Fundamentals --> RADAR
```

---

## 2. Level 1: Core System Processes
This diagram breaks down the RADAR platform into its primary functional subsystems (User Management, Market Data, Portfolio Engine, Analytics, and Alert Engine) and introduces the main data stores.

```mermaid
flowchart TD
    %% Entities
    User((User))
    MarketAPI[Market Data Providers]
    
    %% Data Stores
    D1[(D1: User & Settings DB)]
    D2[(D2: Market Data Cache & OHLC DB)]
    D3[(D3: Portfolios & Watchlists DB)]
    D4[(D4: Alerts & Rules DB)]
    
    %% Processes
    P1((1.0\nUser\nManagement))
    P2((2.0\nMarket Data\nEngine))
    P3((3.0\nPortfolio &\nWatchlist))
    P4((4.0\nAnalytics &\nScreener))
    P5((5.0\nAlert\nEngine))
    
    %% Flows from/to User
    User -- Auth Data, Persona/Settings --> P1
    P1 -- Session Token, Profile Data --> User
    
    User -- Trade Actions, Watchlist Add --> P3
    P3 -- Portfolio State, Watchlist View --> User
    
    User -- Filter Criteria, Indicator Reqs --> P4
    P4 -- Charts, Screener Results, Techs --> User
    
    User -- Custom Alert Rules --> P5
    P5 -- Notifications, Breakout Alerts --> User
    
    %% Flows to/from APIs
    P2 -- REST Queries, WS Subs --> MarketAPI
    MarketAPI -- Live Quotes, OHLC, News --> P2
    
    %% Flows between processes and datastores
    P1 <-->|Read/Write| D1
    P2 -- Write Cache/DB --> D2
    P3 <-->|Read/Write| D3
    P5 <-->|Read/Write| D4
    
    %% Internal process communication
    P2 -- Normalized Market Data --> P4
    P2 -- Live Asset Pricing --> P3
    P2 -- Streamed Prices --> P5
    P3 -- Current Holdings --> P4
```

---

## 3. Level 2: Market Data Processing (Process 2.0 Breakdown)
This diagram zooms into the Market Data Engine, illustrating how RADAR achieves fault tolerance, background caching, and real-time streaming.

```mermaid
flowchart TD
    %% Entities
    MarketAPI[External APIs: Finnhub, Yahoo, Polygon]
    InternalServices((Other RADAR \n Subsystems))
    
    %% Data Stores
    D2_Cache[(D2.1: Node-Cache \n In-Memory)]
    D2_DB[(D2.2: OHLC & Symbols \n MongoDB)]
    
    %% Sub-processes
    P2_1((2.1\nWebSocket\nManager))
    P2_2((2.2\nWaterfall\nRouting))
    P2_3((2.3\nBackground Cron\n& Backfill))
    P2_4((2.4\nData\nNormalization))
    
    %% Flows
    P2_1 <-- Real-time ticks --> MarketAPI
    P2_1 -- Raw Live Trades --> P2_4
    P2_2 -- Primary/Fallback Queries --> MarketAPI
    MarketAPI -- Historical OHLC, Fundamentals --> P2_2
    
    P2_3 -- Nightly History Queries --> MarketAPI
    MarketAPI -- Bulk History --> P2_3
    
    P2_4 -- Normalized Stream --> InternalServices
    P2_2 -- Formatted Response --> InternalServices
    
    P2_2 <-->|Check/Set| D2_Cache
    P2_3 -- Update/Insert --> D2_DB
    P2_2 -- Read Misses --> D2_DB
```

---

## 4. Level 2: Analytics & Screener Engine (Process 4.0 Breakdown)
This diagram details the logic behind technical analysis calculations, pattern detection, and the multi-filter screener.

```mermaid
flowchart TD
    %% Entities
    User((User))
    MarketEngine((Market Data Engine))
    
    %% Data Stores
    D5[(D4.1: Custom Filters DB)]
    
    %% Sub-processes
    P4_1((4.1\nIndicator\nCalculation))
    P4_2((4.2\nScreen & Filter\nExecution))
    P4_3((4.3\nPortfolio Risk\nScoring))
    P4_4((4.4\nPattern\nDetection))
    
    %% Flows
    User -- Multi-Criteria --> P4_2
    P4_2 -- Filtered Stock Universe --> User
    
    User -- Chart Params --> P4_1
    P4_1 -- MACD, RSI, Bollinger Bands --> User
    
    P4_2 <-->|Save/Load Presets| D5
    
    MarketEngine -- OHLC Arrays --> P4_1
    MarketEngine -- Universe Scan Data --> P4_2
    MarketEngine -- Asset Volatility Data --> P4_3
    MarketEngine -- Tick Data --> P4_4
    
    P4_3 -- Portfolio Risk Metrics --> User
    P4_4 -- Bull Flags, Double Bottoms --> User
```

---

## 5. Level 2: Alert & Notification Engine (Process 5.0 Breakdown)
Details how RADAR processes real-time data against user-defined thresholds to emit notifications.

```mermaid
flowchart TD
    %% Entities
    User((User))
    MarketEngine((Market Data Engine))
    
    %% Data Stores
    D4_1[(D5.1: Alert Rules DB)]
    D4_2[(D5.2: Notifications DB)]
    
    %% Sub-processes
    P5_1((5.1\nRule\nEvaluator))
    P5_2((5.2\nThreshold\nMonitor))
    P5_3((5.3\nNotification\nDispatcher))
    
    %% Flows
    User -- Create/Edit Rules --> P5_1
    P5_1 -- Store Rule --> D4_1
    
    D4_1 -- Active Rules --> P5_2
    MarketEngine -- Live Price/Volume --> P5_2
    
    P5_2 -- Trigger Event --> P5_3
    P5_3 -- Save History --> D4_2
    
    P5_3 -- Toast / Email / Web Push --> User
    User -- Acknowledge/Read --> D4_2
```

# Implementation Plan: Trader Dashboard Refinement & Backend Architecture

## 1. Trader Dashboard Refinement (Frontend)

### Goal
Shift the focus from "Execution" (Quick Orders) to "Research & Insight" (Deep Analytics), as per the platform's core value proposition.

### Changes Overview
1.  **Remove `QuickTradePanel`**:
    *   **Reason**: The platform focuses on research and analysis, not high-frequency execution. Users likely execute trades on their broker's terminal after researching here.
    *   **Benefit**: Frees up prime screen real estate for more analytical tools.

2.  **Relocate & Enhance `AdvancedWatchlist`**:
    *   **Action**: Move `AdvancedWatchlist` to the **Right Sidebar**.
    *   **Enhancement**: Add "Sparklines" (mini-charts) to visualize immediate trends (as requested).
    *   **Reason**: A vertical, full-height watchlist is the standard "anchor" for traders to monitor their universe while analyzing charts.

3.  **Layout Reorganization**:
    *   **Right Sidebar**: Market Breadth + Sentiment + **Advanced Watchlist** (taking up the vertical space).
    *   **Row 1 (Pulse)**: `SectorHeatmap` (Expanded), `GapLists`, `VolumeShockers`.
    *   **Row 3 (Deep Dive)**: `TechnicalScreeners`, `FODashboard`, and **News Flash** (moved from sidebar).

### Utility for Traders
*   **Contextual Awareness**: By having the watchlist always visible on the right with sparklines, traders instantly spot trend changes without leaving their analysis view.
*   **Deeper Research**: Replacing trade buttons with expanded screeners/news prevents impulse trading and encourages data-driven decisions.

---

## 2. Backend Integration & Architecture Guide

Since you are currently building the frontend, understanding the backend integration is crucial for the next phase.

### How to get information from the Backend?

The frontend communicates with the backend primarily through **APIs** (Application Programming Interfaces).

#### A. REST API (Request-Response)
*   **Usage**: For fetching static or slowly changing data (e.g., historical chart data, company financials, news feed).
*   **Flow**:
    1.  Frontend sends a `GET` request (e.g., `GET /api/stocks/RELIANCE/history`).
    2.  Backend queries the database.
    3.  Backend sends back JSON data.
    4.  Frontend renders the chart.

#### B. WebSockets (Real-Time Streaming)
*   **Usage**: For live price updates, heartbeat, and order book changes.
*   **Flow**:
    1.  Frontend establishes a persistent connection (`ws://api.radar.com/stream`).
    2.  Backend "pushes" updates instantly when a price changes.
    3.  Frontend updates the specific number in the DOM without reloading.

### How the Backend Works (Architecture)

1.  **Data Sources (The Input)**:
    *   Your backend will subscribe to data providers (e.g., NSE/BSE feeds, Bloomberg, or APIs like AlphaVantage/Yahoo Finance).
    *   *Worker Services* ingest this data continuously.

2.  **Core Application Layer (The Logic)**:
    *   **Technology**: Node.js (Express), Python (Django/FastAPI), or Go.
    *   **Processing**:
        *   calculates technical indicators (RSI, MACD) on the fly.
        *   Detects "Breakouts" or "Volume Shocks" by comparing current stream data vs. historical averages.

3.  **Database Layer (The Memory)**:
    *   **Timeseries DB (e.g., InfluxDB, TimescaleDB)**: specific for storing price history (Open, High, Low, Close) efficiently.
    *   **Relational DB (e.g., PostgreSQL)**: For user profiles, saved watchlists, and configurations.

4.  **API Layer (The Gateway)**:
    *   Exposes endpoints that your React Frontend calls.
    *   Handles authentication (Login/Signup tokens).

### Example Data Flow for "Volume Shockers":
1.  **Backend**: Ingests live volume for 'ADANIENT'.
2.  **Logic**: Checks `if (currentVolume > 5 * averageVolume_10day)`.
3.  **Alert**: If true, adds to "Volume Shockers" list in memory.
4.  **Frontend**: Polling endpoint `GET /api/alerts/volume` receives this new list and renders it in the widget.

### Next Steps for You
1.  **Mock Data**: Continue using `mockStock`, `priceData` arrays in React (as you are doing).
2.  **Service Layer**: Create a `services/api.js` file in your frontend to centralize potential API calls (even if they return mock data for now), making the switch to real backend easier later.

# RADAR System Architecture & Data Flow Diagrams

These diagrams use Mermaid.js. Most Markdown viewers (including GitHub) will render them automatically.

## 1. High-Level System Architecture

```mermaid
graph TD
    %% Frontend Layer
    subgraph Frontend ["RADAR React Frontend (Vite)"]
        UI["React UI Components"]
        API_Layer["Axios API Services"]
        Sockets["Socket.io Client"]
        
        UI --> API_Layer
        UI --> Sockets
    end

    %% Backend Layer
    subgraph Backend ["Node.js / Express Backend"]
        Controllers["Express Controllers"]
        Services["Business Logic Services"]
        Realtime["Realtime Service (WebSockets)"]
        Cron["Data Update Cron"]
        Cache["Node-Cache (In-Memory)"]
        
        API_Layer -->|HTTP REST| Controllers
        Sockets <-->|WebSockets| Realtime
        
        Controllers --> Services
        Services <--> Cache
        Cron --> Services
    end

    %% Database Layer
    subgraph Database ["MongoDB"]
        DB[(Mongoose Schemas)]
        Services <-->|Read/Write| DB
    end

    %% External APIs
    subgraph External ["External Data Providers"]
        Finnhub["Finnhub (Real-time Market Data)"]
        Yahoo["Yahoo Finance (Fundamentals)"]
        
        Services -->|REST| Yahoo
        Realtime <-->|WebSockets| Finnhub
        Services -->|REST| Finnhub
    end
```

## 2. The Fault-Tolerant Waterfall Routing (Data Flow)

```mermaid
sequenceDiagram
    participant Client as React Frontend
    participant Backend as Node.js Service
    participant Cache as Node-Cache (TTL: 6 Hrs)
    participant Primary as Finnhub API (Primary)
    participant Secondary as Yahoo Finance (Fallback)

    Client->>Backend: Request Market Data (Symbol)
    
    %% Attempt 1
    Backend->>Primary: fetchData()
    alt Primary Success
        Primary-->>Backend: Fast Real-time Data
        Backend->>Cache: Update Cache Background
        Backend-->>Client: Return Data
    else Primary Timeout/Fail
        %% Attempt 2
        Backend->>Secondary: fetchFallbackData()
        alt Secondary Success
            Secondary-->>Backend: Historical/Delayed Data
            Backend-->>Client: Return Data
        else Secondary Fail
            %% Attempt 3
            Backend->>Cache: getLatest()
            Cache-->>Backend: Stale/Cached Data
            Backend-->>Client: Return Cached Data (Null Safe)
        end
    end
```

## 3. Investor DNA (Dual Persona Onboarding) Flow

```mermaid
stateDiagram-v2
    [*] --> Registration
    Registration --> PsychologicalTest : User signs up
    
    state PsychologicalTest {
        RiskTolerance
        HoldingPeriod
        VolatilityResponse
    }
    
    PsychologicalTest --> BackendAnalysis : Submit Form
    BackendAnalysis --> TraderPersona : Score >= 70 (High Risk/Speed)
    BackendAnalysis --> InvestorPersona : Score < 70 (Low Risk/Patience)
    
    TraderPersona --> TerminalUI : Loads Trading Workspaces, Order Books, Live Scanners
    InvestorPersona --> DashboardUI : Loads Portfolio PnL, Fundamentals, News
```

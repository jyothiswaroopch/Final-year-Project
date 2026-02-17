# TradingView-Style Redesign Plan

## Current vs Target Layout

### CURRENT (Dashboard Style)
```
┌─────────────────────────────────────────────┐
│ Header (70px)                               │
├─────────────────────────────────────────────┤
│ Sector Heatmap (200px)    │ Market Breadth  │
├───────────────────────────┤ (95px)          │
│ Vol Shockers │ Gainers    │─────────────────│
│ (220px)      │ (220px)    │ Market Sentiment│
├───────────────────────────┤ (95px)          │
│ Multi-Chart (350px)       │─────────────────│
│ [4 small charts]          │ Watchlist       │
├───────────────────────────┤ (fills)         │
│ Screeners │ F&O │ News    │                 │
└─────────────────────────────────────────────┘
```

### TARGET (TradingView Terminal Style)
```
┌─────────────────────────────────────────────┐
│ Slim Header (45px) - Search, Timeframes     │
├─────────────────────────────────────────────┤
│ Chart Toolbar (35px) - Indicators, Drawing  │
├───────────────────────────────────┬─────────┤
│                                   │Watchlist│
│                                   │ (300px) │
│         MAIN CHART                │  width  │
│       (70% of screen)             ├─────────┤
│                                   │ Details │
│                                   │  Panel  │
├───────────────────────────────────┴─────────┤
│ Bottom Panel (200px) - Tabs:                │
│ [Screener] [Vol Shockers] [Heatmap]         │
└─────────────────────────────────────────────┘
```

## Key Changes

### 1. Layout Structure
- **Chart**: 70% screen height, full width (minus sidebar)
- **Right Sidebar**: Fixed 300px width
- **Bottom Panel**: Collapsible 200px height
- **Header**: Slim 45px

### 2. Color Palette
```css
--bg-primary: #131722      /* Main background */
--bg-secondary: #1E222D    /* Panes */
--border-color: #2A2E39    /* Separators */
--text-primary: #D1D4DC    /* Main text */
--text-secondary: #787B86  /* Labels */
--accent-green: #26A69A    /* Bullish */
--accent-red: #EF5350      /* Bearish */
```

### 3. Typography
- **Prices/Numbers**: Roboto Mono, 12-13px
- **Labels**: Inter, 11-12px
- **Headers**: Inter Semi-Bold, 12-13px

### 4. Component Placement
- **Multi-Chart**: Main canvas (center-left)
- **Watchlist**: Right sidebar (top 50%)
- **Market Data**: Right sidebar (bottom 50%)
- **Vol Shockers**: Bottom panel tab
- **Sector Heatmap**: Bottom panel tab
- **Screeners**: Bottom panel tab

## Implementation Steps

1. ✅ Create new color scheme
2. ✅ Redesign grid layout (chart-first)
3. ✅ Remove card styling (no rounded corners, shadows)
4. ✅ Add bottom collapsible panel
5. ✅ Slim down header
6. ✅ Add chart toolbar
7. ✅ Tighten spacing (remove gaps)
8. ✅ Switch to monospace fonts for numbers

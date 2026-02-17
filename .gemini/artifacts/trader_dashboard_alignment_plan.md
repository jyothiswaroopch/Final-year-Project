# Trader Dashboard Alignment Implementation Plan

## Current Issues Identified

1. **Sector Heatmap** - Too tall, not aligned with Market Breadth/Sentiment
2. **Volume Shockers & Gap Lists** - Heights don't match
3. **Multi-Chart Workspace** - Charts are misaligned within the grid
4. **Bottom row (Breakout Alerts, F&O, News)** - Inconsistent heights
5. **Right sidebar** - Watchlist is too long, creating vertical misalignment

## Target Layout Structure

### Row 1: Sector Overview + Market Indicators
- **Left (9 cols)**: Sector Heatmap - `h-[200px]`
- **Right (3 cols)**: 
  - Market Breadth - `h-[95px]`
  - Market Sentiment - `h-[95px]`
  - Gap: `8px`
  - **Total**: 200px

### Row 2: Market Movers + Watchlist Start
- **Left (9 cols)**: 
  - Volume Shockers (6 cols) - `h-[220px]`
  - Gap Lists (6 cols) - `h-[220px]`
- **Right (3 cols)**: Advanced Watchlist - `flex-1` (starts here)

### Row 3: Charts
- **Left (9 cols)**: Multi-Chart Workspace - `h-[350px]`
- **Right (3 cols)**: Watchlist continues

### Row 4: Intelligence
- **Left (9 cols)**: 
  - Technical Screeners (4 cols) - `h-[220px]`
  - F&O Dashboard (4 cols) - `h-[220px]`
  - News Flash (4 cols) - `h-[220px]`
- **Right (3 cols)**: Watchlist continues

## Total Heights
- **Left column**: 200 + 220 + 350 + 220 + (3 × 8px gaps) = **1014px**
- **Right column**: 95 + 95 + (watchlist fills rest) = **Matches left**

## Implementation Steps

1. Update TraderView layout structure
2. Fix all component heights
3. Ensure proper gap spacing (8px = gap-2)
4. Make right sidebar use flexbox for proper fill
5. Test alignment at different screen sizes

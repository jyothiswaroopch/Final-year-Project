# RADAR: Comprehensive Full-Stack System Report

> This document contains an exhaustive structural and functional analysis of every major module in the RADAR platform across both the Node.js Backend and React Frontend.

## 1. Executive Architecture Summary
- **Backend Framework**: Node.js, Express.js, Mongoose (MongoDB)
- **Frontend Framework**: React, Vite, Tailwind CSS, Recharts, Lucide Icons
- **Total Backend Modules Analyzed**: 123
- **Total Frontend Modules Analyzed**: 245

## 2. Backend Subsystems Analysis

### 📁 CONFIG Layer
#### `db.js`
- **Path**: `src/config/db.js`
- **Size**: 0.95 KB
- **Core Operations**: getDbStatus, connectDB

#### `logger.js`
- **Path**: `src/config/logger.js`
- **Size**: 0.04 KB

#### `timeseriesSetup.js`
- **Path**: `src/config/timeseriesSetup.js`
- **Size**: 1.27 KB
- **Core Operations**: setupTimeSeriesCollection

### 📁 CONTROLLERS Layer
#### `alertController.js`
- **Path**: `src/controllers/alertController.js`
- **Size**: 1.26 KB

#### `alertsRuleController.js`
- **Path**: `src/controllers/alertsRuleController.js`
- **Size**: 2.29 KB
- **Core Operations**: createAlertRule, getAlertRules, testAlertRules

#### `analyticsController.js`
- **Path**: `src/controllers/analyticsController.js`
- **Size**: 2.32 KB
- **Core Operations**: getPreMarketPulse, getSectorHeatmap

#### `backtestController.js`
- **Path**: `src/controllers/backtestController.js`
- **Size**: 1.76 KB
- **Core Operations**: runBacktest, getBacktestStatus

#### `calendarController.js`
- **Path**: `src/controllers/calendarController.js`
- **Size**: 10.54 KB
- **Core Operations**: shiftDate, toIsoDate, todayStart, isWeekend, toNextBusinessDay

#### `customFilterController.js`
- **Path**: `src/controllers/customFilterController.js`
- **Size**: 2.40 KB
- **Core Operations**: createCustomFilter, getCustomFilters, deleteCustomFilter

#### `dataQualityController.js`
- **Path**: `src/controllers/dataQualityController.js`
- **Size**: 1.99 KB
- **Core Operations**: toNumber, summarize, getDataQuality

#### `depthController.js`
- **Path**: `src/controllers/depthController.js`
- **Size**: 0.43 KB
- **Core Operations**: getOrderBook

#### `earningsController.js`
- **Path**: `src/controllers/earningsController.js`
- **Size**: 0.55 KB
- **Core Operations**: getEarningsSummary

#### `fnoController.js`
- **Path**: `src/controllers/fnoController.js`
- **Size**: 0.51 KB
- **Core Operations**: getDashboardData

#### `fundamentalController.js`
- **Path**: `src/controllers/fundamentalController.js`
- **Size**: 5.12 KB
- **Core Operations**: toNumber, getValuationThermometer, getInvestmentIdeas, uniqueBySymbol, getPeerComparison

#### `historyController.js`
- **Path**: `src/controllers/historyController.js`
- **Size**: 2.08 KB
- **Core Operations**: getHistory

#### `learningController.js`
- **Path**: `src/controllers/learningController.js`
- **Size**: 4.25 KB
- **Core Operations**: readCourses, getLearnings, getCourse, getProgress, saveProgress

#### `marketController.js`
- **Path**: `src/controllers/marketController.js`
- **Size**: 6.39 KB
- **Core Operations**: stripStockSuffix, getMarketData, getCryptoBySymbol, getTrendingSearches, logSearchEndpoint

#### `newsController.js`
- **Path**: `src/controllers/newsController.js`
- **Size**: 0.79 KB
- **Core Operations**: getMarketNews

#### `noteController.js`
- **Path**: `src/controllers/noteController.js`
- **Size**: 1.29 KB
- **Core Operations**: getNotes, addNote, deleteNote

#### `notificationController.js`
- **Path**: `src/controllers/notificationController.js`
- **Size**: 3.42 KB

#### `ohlcController.js`
- **Path**: `src/controllers/ohlcController.js`
- **Size**: 2.94 KB

#### `optionsController.js`
- **Path**: `src/controllers/optionsController.js`
- **Size**: 1.03 KB
- **Core Operations**: getChain, getGreeks

#### `portfolioController.js`
- **Path**: `src/controllers/portfolioController.js`
- **Size**: 4.46 KB
- **Core Operations**: getPortfolio, executeTrade

#### `portfolioRiskController.js`
- **Path**: `src/controllers/portfolioRiskController.js`
- **Size**: 0.54 KB
- **Core Operations**: getPortfolioRisk

#### `screenerController.js`
- **Path**: `src/controllers/screenerController.js`
- **Size**: 0.53 KB
- **Core Operations**: runScreenerScan

#### `sectorController.js`
- **Path**: `src/controllers/sectorController.js`
- **Size**: 0.84 KB
- **Core Operations**: getSectorPerformanceHandler

#### `settingsController.js`
- **Path**: `src/controllers/settingsController.js`
- **Size**: 1.47 KB

#### `signalsController.js`
- **Path**: `src/controllers/signalsController.js`
- **Size**: 0.73 KB
- **Core Operations**: issueStreamToken

#### `statusController.js`
- **Path**: `src/controllers/statusController.js`
- **Size**: 0.20 KB
- **Core Operations**: getStatus

#### `stockInsightsController.js`
- **Path**: `src/controllers/stockInsightsController.js`
- **Size**: 1.78 KB
- **Core Operations**: getFundamentals, getEarningsCalendar, getNewsSentiment, getSignals

#### `technicalController.js`
- **Path**: `src/controllers/technicalController.js`
- **Size**: 5.38 KB
- **Core Operations**: getWatchlistData, getBreakoutAlerts, getIndicatorSignals, getQuickOrderData, strictLiveEnabled

#### `tickerController.js`
- **Path**: `src/controllers/tickerController.js`
- **Size**: 0.99 KB
- **Core Operations**: getMarketIndices, getLatency

#### `userController.js`
- **Path**: `src/controllers/userController.js`
- **Size**: 15.26 KB
- **Core Operations**: generateToken, normalizeIdentifier

#### `watchlistController.js`
- **Path**: `src/controllers/watchlistController.js`
- **Size**: 2.28 KB
- **Core Operations**: getWatchlists, createWatchlist, addToWatchlist, removeFromWatchlist

### 📁 MIDDLEWARE Layer
#### `authMiddleware.js`
- **Path**: `src/middleware/authMiddleware.js`
- **Size**: 1.64 KB
- **Core Operations**: authMiddleware

#### `errorMiddleware.js`
- **Path**: `src/middleware/errorMiddleware.js`
- **Size**: 0.60 KB
- **Core Operations**: notFound, errorHandler

#### `validationMiddleware.js`
- **Path**: `src/middleware/validationMiddleware.js`
- **Size**: 1.74 KB
- **Core Operations**: validateRequest

### 📁 MODELS Layer
#### `Alert.js`
- **Path**: `src/models/Alert.js`
- **Size**: 0.80 KB
- **Type**: MongoDB Database Schema definition.

#### `AlertRule.js`
- **Path**: `src/models/AlertRule.js`
- **Size**: 1.60 KB
- **Type**: MongoDB Database Schema definition.

#### `BacktestJob.js`
- **Path**: `src/models/BacktestJob.js`
- **Size**: 0.79 KB
- **Type**: MongoDB Database Schema definition.

#### `CustomFilter.js`
- **Path**: `src/models/CustomFilter.js`
- **Size**: 0.62 KB
- **Type**: MongoDB Database Schema definition.

#### `Note.js`
- **Path**: `src/models/Note.js`
- **Size**: 0.49 KB
- **Type**: MongoDB Database Schema definition.

#### `Notification.js`
- **Path**: `src/models/Notification.js`
- **Size**: 0.70 KB
- **Type**: MongoDB Database Schema definition.

#### `OHLC.js`
- **Path**: `src/models/OHLC.js`
- **Size**: 1.48 KB
- **Type**: MongoDB Database Schema definition.

#### `Portfolio.js`
- **Path**: `src/models/Portfolio.js`
- **Size**: 0.92 KB
- **Type**: MongoDB Database Schema definition.

#### `SignalStreamToken.js`
- **Path**: `src/models/SignalStreamToken.js`
- **Size**: 0.85 KB
- **Type**: MongoDB Database Schema definition.

#### `Symbol.js`
- **Path**: `src/models/Symbol.js`
- **Size**: 1.19 KB
- **Type**: MongoDB Database Schema definition.

#### `User.js`
- **Path**: `src/models/User.js`
- **Size**: 3.50 KB
- **Type**: MongoDB Database Schema definition.

#### `UserSettings.js`
- **Path**: `src/models/UserSettings.js`
- **Size**: 1.80 KB
- **Type**: MongoDB Database Schema definition.

#### `Watchlist.js`
- **Path**: `src/models/Watchlist.js`
- **Size**: 0.66 KB
- **Type**: MongoDB Database Schema definition.

### 📁 ROUTES Layer
#### `adminRoutes.js`
- **Path**: `src/routes/adminRoutes.js`
- **Size**: 4.54 KB
- **Type**: Express Route handler establishing API endpoints.

#### `alertRoutes.js`
- **Path**: `src/routes/alertRoutes.js`
- **Size**: 0.61 KB
- **Type**: Express Route handler establishing API endpoints.

#### `analyticsRoutes.js`
- **Path**: `src/routes/analyticsRoutes.js`
- **Size**: 0.27 KB
- **Type**: Express Route handler establishing API endpoints.

#### `authRoutes.js`
- **Path**: `src/routes/authRoutes.js`
- **Size**: 0.42 KB
- **Type**: Express Route handler establishing API endpoints.

#### `backtestRoutes.js`
- **Path**: `src/routes/backtestRoutes.js`
- **Size**: 0.36 KB
- **Type**: Express Route handler establishing API endpoints.

#### `cacheAdminRoutes.js`
- **Path**: `src/routes/cacheAdminRoutes.js`
- **Size**: 3.79 KB
- **Core Operations**: dataFetcher
- **Type**: Express Route handler establishing API endpoints.

#### `calendarRoutes.js`
- **Path**: `src/routes/calendarRoutes.js`
- **Size**: 0.37 KB
- **Type**: Express Route handler establishing API endpoints.

#### `contractRoutes.js`
- **Path**: `src/routes/contractRoutes.js`
- **Size**: 36.86 KB
- **Core Operations**: toNumber, normalizeSymbol, stripSymbolSuffix, nowIso, safeObjectId
- **Type**: Express Route handler establishing API endpoints.

#### `earningsRoutes.js`
- **Path**: `src/routes/earningsRoutes.js`
- **Size**: 0.29 KB
- **Type**: Express Route handler establishing API endpoints.

#### `fnoRoutes.js`
- **Path**: `src/routes/fnoRoutes.js`
- **Size**: 0.29 KB
- **Type**: Express Route handler establishing API endpoints.

#### `fundamentalRoutes.js`
- **Path**: `src/routes/fundamentalRoutes.js`
- **Size**: 0.51 KB
- **Type**: Express Route handler establishing API endpoints.

#### `healthRoutes.js`
- **Path**: `src/routes/healthRoutes.js`
- **Size**: 0.22 KB
- **Type**: Express Route handler establishing API endpoints.

#### `learningRoutes.js`
- **Path**: `src/routes/learningRoutes.js`
- **Size**: 0.45 KB
- **Type**: Express Route handler establishing API endpoints.

#### `marketRoutes.js`
- **Path**: `src/routes/marketRoutes.js`
- **Size**: 5.78 KB
- **Type**: Express Route handler establishing API endpoints.

#### `noteRoutes.js`
- **Path**: `src/routes/noteRoutes.js`
- **Size**: 0.36 KB
- **Type**: Express Route handler establishing API endpoints.

#### `notificationRoutes.js`
- **Path**: `src/routes/notificationRoutes.js`
- **Size**: 0.53 KB
- **Type**: Express Route handler establishing API endpoints.

#### `ohlcRoutes.js`
- **Path**: `src/routes/ohlcRoutes.js`
- **Size**: 0.42 KB
- **Type**: Express Route handler establishing API endpoints.

#### `optionsRoutes.js`
- **Path**: `src/routes/optionsRoutes.js`
- **Size**: 0.52 KB
- **Type**: Express Route handler establishing API endpoints.

#### `portfolioRoutes.js`
- **Path**: `src/routes/portfolioRoutes.js`
- **Size**: 0.79 KB
- **Type**: Express Route handler establishing API endpoints.

#### `quotesRoutes.js`
- **Path**: `src/routes/quotesRoutes.js`
- **Size**: 4.77 KB
- **Type**: Express Route handler establishing API endpoints.
- **Dependency**: Finnhub Real-time API.

#### `refreshAdminRoutes.js`
- **Path**: `src/routes/refreshAdminRoutes.js`
- **Size**: 4.73 KB
- **Type**: Express Route handler establishing API endpoints.

#### `screenerRoutes.js`
- **Path**: `src/routes/screenerRoutes.js`
- **Size**: 0.71 KB
- **Type**: Express Route handler establishing API endpoints.

#### `sectorRoutes.js`
- **Path**: `src/routes/sectorRoutes.js`
- **Size**: 0.24 KB
- **Type**: Express Route handler establishing API endpoints.

#### `signalsRoutes.js`
- **Path**: `src/routes/signalsRoutes.js`
- **Size**: 0.30 KB
- **Type**: Express Route handler establishing API endpoints.

#### `stocksRoutes.js`
- **Path**: `src/routes/stocksRoutes.js`
- **Size**: 1.75 KB
- **Type**: Express Route handler establishing API endpoints.

#### `technicalRoutes.js`
- **Path**: `src/routes/technicalRoutes.js`
- **Size**: 1.42 KB
- **Type**: Express Route handler establishing API endpoints.

#### `tickerRoutes.js`
- **Path**: `src/routes/tickerRoutes.js`
- **Size**: 0.25 KB
- **Type**: Express Route handler establishing API endpoints.

#### `updateAdminRoutes.js`
- **Path**: `src/routes/updateAdminRoutes.js`
- **Size**: 4.01 KB
- **Type**: Express Route handler establishing API endpoints.

#### `userRoutes.js`
- **Path**: `src/routes/userRoutes.js`
- **Size**: 1.36 KB
- **Type**: Express Route handler establishing API endpoints.

#### `watchlistRoutes.js`
- **Path**: `src/routes/watchlistRoutes.js`
- **Size**: 0.48 KB
- **Type**: Express Route handler establishing API endpoints.

### 📁 SERVICES Layer
#### `alertEngine.js`
- **Path**: `src/services/alertEngine.js`
- **Size**: 5.29 KB
- **Core Operations**: isDatabaseReady, calculateRSI, checkCondition, emitAlertTriggered, checkAlerts

#### `alertRulesService.js`
- **Path**: `src/services/alertRulesService.js`
- **Size**: 4.41 KB
- **Core Operations**: normalizeSymbol, toNumber, evaluateCondition, buildFieldMap, createRule

#### `backtestService.js`
- **Path**: `src/services/backtestService.js`
- **Size**: 3.87 KB
- **Core Operations**: toNumber, normalizeSymbol, computeBacktest, runBacktestJob, getBacktestJob

#### `cryptoService.js`
- **Path**: `src/services/cryptoService.js`
- **Size**: 13.33 KB
- **Core Operations**: toBinancePair, toBinanceInterval, getSymbolModel, getActiveCryptoPairs, fetchCryptoData

#### `dataUpdateCron.js`
- **Path**: `src/services/dataUpdateCron.js`
- **Size**: 4.20 KB
- **Classes Provided**: DataUpdateCron
- **Type**: Automated background scheduler.

#### `economicCalendarService.js`
- **Path**: `src/services/economicCalendarService.js`
- **Size**: 5.22 KB
- **Core Operations**: toIsoDate, addDaysIso, normalizeCountryCode, toImpactLabel, hasAnyKeyword

#### `enhancedCacheService.js`
- **Path**: `src/services/enhancedCacheService.js`
- **Size**: 6.38 KB
- **Classes Provided**: EnhancedCacheService

#### `finnhubService.js`
- **Path**: `src/services/finnhubService.js`
- **Size**: 4.27 KB
- **Classes Provided**: FinnhubService
- **Dependency**: Finnhub Real-time API.

#### `forexService.js`
- **Path**: `src/services/forexService.js`
- **Size**: 10.41 KB
- **Core Operations**: parseForexSymbol, toExchangeRatePair, fetchForexData, fetchForexHistory

#### `freeApiAggregator.js`
- **Path**: `src/services/freeApiAggregator.js`
- **Size**: 7.88 KB
- **Classes Provided**: FreeApiAggregator
- **Dependency**: Yahoo Finance API.
- **Dependency**: Finnhub Real-time API.

#### `fundamentalsEnrichmentService.js`
- **Path**: `src/services/fundamentalsEnrichmentService.js`
- **Size**: 8.00 KB
- **Core Operations**: isCryptoSymbol, normalizeSymbol, classifyValuation, approximateMomentum, approximateDelivery
- **Dependency**: Yahoo Finance API.

#### `historicalDataBackfillService.js`
- **Path**: `src/services/historicalDataBackfillService.js`
- **Size**: 13.66 KB
- **Classes Provided**: HistoricalDataBackfillService
- **Dependency**: Yahoo Finance API.

#### `incrementalUpdateService.js`
- **Path**: `src/services/incrementalUpdateService.js`
- **Size**: 8.63 KB
- **Classes Provided**: IncrementalUpdateService
- **Core Operations**: isCrypto
- **Dependency**: Yahoo Finance API.

#### `indicatorService.js`
- **Path**: `src/services/indicatorService.js`
- **Size**: 4.38 KB
- **Core Operations**: getTechnicalIndicators, getTrendMatrix

#### `macroService.js`
- **Path**: `src/services/macroService.js`
- **Size**: 4.06 KB
- **Core Operations**: fetchFredLatest, fetchWorldBankLatest, getGlobalPulse, getMacroIndicators

#### `mailService.js`
- **Path**: `src/services/mailService.js`
- **Size**: 0.84 KB
- **Core Operations**: sendEmail

#### `marketDataService.js`
- **Path**: `src/services/marketDataService.js`
- **Size**: 1.79 KB
- **Core Operations**: normalizeForexPair, getMarketData

#### `marketHoursService.js`
- **Path**: `src/services/marketHoursService.js`
- **Size**: 5.89 KB
- **Classes Provided**: MarketHoursService

#### `newsService.js`
- **Path**: `src/services/newsService.js`
- **Size**: 9.61 KB
- **Core Operations**: normalizeSymbol, normalizeCategory, toIso, toDisplayTime, mapArticle
- **Dependency**: Finnhub Real-time API.

#### `offlineModeService.js`
- **Path**: `src/services/offlineModeService.js`
- **Size**: 6.16 KB
- **Classes Provided**: OfflineModeService

#### `ohlcService.js`
- **Path**: `src/services/ohlcService.js`
- **Size**: 5.74 KB
- **Classes Provided**: OHLCService

#### `optionsService.js`
- **Path**: `src/services/optionsService.js`
- **Size**: 4.47 KB
- **Core Operations**: toNumber, normalizeSymbol, stripSuffix, findUnderlying, buildChain

#### `patternService.js`
- **Path**: `src/services/patternService.js`
- **Size**: 3.11 KB
- **Core Operations**: detectBullFlag, detectDoubleBottom, detectPatterns

#### `portfolioRiskService.js`
- **Path**: `src/services/portfolioRiskService.js`
- **Size**: 3.55 KB
- **Core Operations**: toNumber, normalizeSymbol, calculatePortfolioRisk

#### `realtimeService.js`
- **Path**: `src/services/realtimeService.js`
- **Size**: 13.46 KB
- **Core Operations**: parseFinnhubSymbols, initRealtimeService, clearCryptoReconnectTimer, cleanupCryptoSocket, scheduleCryptoReconnect
- **Dependency**: Finnhub Real-time API.

#### `scoringService.js`
- **Path**: `src/services/scoringService.js`
- **Size**: 3.78 KB
- **Core Operations**: parseThreshold, getVolumePoints, getRsiPoints, getMacdPoints, getTrendPoints

#### `screenerService.js`
- **Path**: `src/services/screenerService.js`
- **Size**: 8.37 KB
- **Core Operations**: normalizeSymbol, stripStockSuffix, toNumber, isFiniteNumber, inRange

#### `secService.js`
- **Path**: `src/services/secService.js`
- **Size**: 1.55 KB
- **Core Operations**: fetchCompanyFilings, getFilingsForSymbol

#### `sectorService.js`
- **Path**: `src/services/sectorService.js`
- **Size**: 10.59 KB
- **Core Operations**: fetchIndexPrices, computeReturn, resolveIndex, buildFallback, getSectorPerformance

#### `signalTokenService.js`
- **Path**: `src/services/signalTokenService.js`
- **Size**: 2.19 KB
- **Core Operations**: hashToken, issueSignalStreamToken, validateSignalStreamToken

#### `smartRefreshService.js`
- **Path**: `src/services/smartRefreshService.js`
- **Size**: 9.11 KB
- **Classes Provided**: SmartRefreshService
- **Core Operations**: refresh

#### `stockInsightsService.js`
- **Path**: `src/services/stockInsightsService.js`
- **Size**: 16.09 KB
- **Core Operations**: normalizeSymbol, stripSuffix, toNumber, findStock, ensureStockFound

#### `stockService.js`
- **Path**: `src/services/stockService.js`
- **Size**: 51.49 KB
- **Core Operations**: getDefaultSymbols, isProviderBlocked, markProviderFailure, clearProviderFailure, pruneWarningState
- **Dependency**: Finnhub Real-time API.

#### `symbolRegistryService.js`
- **Path**: `src/services/symbolRegistryService.js`
- **Size**: 7.58 KB
- **Core Operations**: escapeRegex, normalizePolygonAssetType, mapPolygonTicker, fetchPolygonTickers, fetchSymbolUniverse

#### `twelveDataService.js`
- **Path**: `src/services/twelveDataService.js`
- **Size**: 5.17 KB
- **Classes Provided**: TwelveDataService

#### `yahooFinanceService.js`
- **Path**: `src/services/yahooFinanceService.js`
- **Size**: 6.34 KB
- **Classes Provided**: YahooFinanceService

### 📁 UTILS Layer
#### `indicators.js`
- **Path**: `src/utils/indicators.js`
- **Size**: 4.14 KB
- **Core Operations**: calculateRSI, calculateEMA, calculateSMA, calculateBollinger, calculateMACD

#### `logger.js`
- **Path**: `src/utils/logger.js`
- **Size**: 0.78 KB

#### `marketStatus.js`
- **Path**: `src/utils/marketStatus.js`
- **Size**: 0.74 KB
- **Core Operations**: getMarketStatus

#### `mockGenerator.js`
- **Path**: `src/utils/mockGenerator.js`
- **Size**: 0.91 KB
- **Core Operations**: generateHistory, timeDeduction

#### `normalizer.js`
- **Path**: `src/utils/normalizer.js`
- **Size**: 1.30 KB
- **Core Operations**: normalizeCrypto, cleanSymbolSuffix, normalizeStock, normalizeForex

#### `runBackfill.js`
- **Path**: `src/utils/runBackfill.js`
- **Size**: 2.76 KB
- **Core Operations**: runBackfill

#### `symbolRegistry.js`
- **Path**: `src/utils/symbolRegistry.js`
- **Size**: 4.92 KB
- **Core Operations**: getModels, getActiveSymbols, stripSuffix, getActiveSymbolsWithSuffix, getRecentlySeenSymbols

## 3. Frontend Component & View Analysis

### 📁 API Domain
#### `adminApi.js`
- **Path**: `src/api/adminApi.js`
- **Size**: 7.03 KB
- **Network**: Directly interfaces with backend APIs.
- **Primary Functions**: fetchMarketStatus, fetchUpdateStatus, fetchUpdateStats, triggerManualUpdate, updateSymbol

#### `analyticsApi.js`
- **Path**: `src/api/analyticsApi.js`
- **Size**: 0.77 KB
- **Network**: Directly interfaces with backend APIs.
- **Primary Functions**: fetchPulse, fetchHeatmap

#### `api.js`
- **Path**: `src/api/api.js`
- **Size**: 3.24 KB
- **Network**: Directly interfaces with backend APIs.
- **Primary Functions**: stripStockSuffixInString, sanitizeStockSuffixes, hasAuthToken, isUnauthorizedError, clearAuthAndRedirect

#### `calendarApi.js`
- **Path**: `src/api/calendarApi.js`
- **Size**: 0.41 KB
- **Network**: Directly interfaces with backend APIs.
- **Primary Functions**: fetchEconomicCalendar

#### `enhancedMarketApi.js`
- **Path**: `src/api/enhancedMarketApi.js`
- **Size**: 6.10 KB
- **Primary Functions**: fetchEnhancedMarketHistory, fetchEnhancedChartData, fetchSimplePriceHistory, hasCachedData, getDataFreshness

#### `fnoApi.js`
- **Path**: `src/api/fnoApi.js`
- **Size**: 0.46 KB
- **Network**: Directly interfaces with backend APIs.
- **Primary Functions**: fetchFnoDashboard

#### `fundamentalApi.js`
- **Path**: `src/api/fundamentalApi.js`
- **Size**: 3.33 KB
- **Network**: Directly interfaces with backend APIs.
- **Primary Functions**: toNumber, fetchDiscoveryShelves, fetchMarketMood, fetchValuation

#### `learningApi.js`
- **Path**: `src/api/learningApi.js`
- **Size**: 1.28 KB
- **Network**: Directly interfaces with backend APIs.
- **Primary Functions**: fetchCourses, fetchCourse, saveProgress, submitQuiz

#### `marketApi.js`
- **Path**: `src/api/marketApi.js`
- **Size**: 6.10 KB
- **Network**: Directly interfaces with backend APIs.
- **Primary Functions**: stripStockSuffix, sanitizeMarketRow, fetchSectorPerformance, fetchMarketData, fetchMarketHistory

#### `notificationApi.js`
- **Path**: `src/api/notificationApi.js`
- **Size**: 0.87 KB
- **Network**: Directly interfaces with backend APIs.
- **Primary Functions**: fetchNotifications, markNotificationsRead, markSingleNotificationRead

#### `ohlcApi.js`
- **Path**: `src/api/ohlcApi.js`
- **Size**: 5.22 KB
- **Network**: Directly interfaces with backend APIs.
- **Primary Functions**: fetchOHLCData, fetchLatestOHLC, fetchAvailableOHLCSymbols, hasOHLCData, fetchOHLCForChart

#### `portfolioApi.js`
- **Path**: `src/api/portfolioApi.js`
- **Size**: 0.82 KB
- **Network**: Directly interfaces with backend APIs.
- **Primary Functions**: fetchPortfolio, executeTrade

#### `quotesApi.js`
- **Path**: `src/api/quotesApi.js`
- **Size**: 7.08 KB
- **Network**: Directly interfaces with backend APIs.
- **Primary Functions**: fetchRealtimeQuote, fetchBatchQuotes, fetchQuoteStats, fetchRateLimits, testQuoteConnections

#### `screenerApi.js`
- **Path**: `src/api/screenerApi.js`
- **Size**: 0.76 KB
- **Network**: Directly interfaces with backend APIs.
- **Primary Functions**: runScreenerScan, createCustomFilter, getCustomFilters, deleteCustomFilter

#### `technicalApi.js`
- **Path**: `src/api/technicalApi.js`
- **Size**: 2.32 KB
- **Network**: Directly interfaces with backend APIs.
- **Primary Functions**: fetchTechnicalSummary, fetchWatchlistTechnicals, fetchBreakoutAlerts, fetchIndicatorSignals, fetchQuickOrderData

#### `userApi.js`
- **Path**: `src/api/userApi.js`
- **Size**: 0.81 KB
- **Network**: Directly interfaces with backend APIs.
- **Primary Functions**: fetchUserProfile, fetchUserMode, updateUserMode

#### `watchlistApi.js`
- **Path**: `src/api/watchlistApi.js`
- **Size**: 1.83 KB
- **Network**: Directly interfaces with backend APIs.
- **Primary Functions**: stripSuffix, fetchUserWatchlist, addSymbolToWatchlist, removeSymbolFromWatchlist, createWatchlist

### 📁 SRC Domain
#### `App.jsx`
- **Path**: `src/App.jsx`
- **Size**: 10.89 KB
- **Type**: Stateful React Component.
- **Primary Functions**: App, AppLoader, RouteStatusPage, DashboardAliasRoute, AssetAliasRoute

### 📁 COMPONENTS Domain
#### `AdminDashboard.jsx`
- **Path**: `src/components/AdminDashboard.jsx`
- **Size**: 17.19 KB
- **Type**: Stateful React Component.
- **Primary Functions**: AdminDashboard, handleTriggerUpdate, handleStartCron, handleStopCron, handleStartRefresh

### 📁 AUTH Domain
#### `AuthLayout.jsx`
- **Path**: `src/components/auth/AuthLayout.jsx`
- **Size**: 5.48 KB
- **Primary Functions**: AuthLayout

### 📁 COMMON Domain
#### `Header.jsx`
- **Path**: `src/components/common/Header.jsx`
- **Size**: 22.93 KB
- **Type**: Stateful React Component.
- **Primary Functions**: displaySymbol, formatNotificationTime, Header, handleLogout, loadTrending

#### `Preloader.jsx`
- **Path**: `src/components/common/Preloader.jsx`
- **Size**: 5.46 KB
- **Type**: Stateful React Component.
- **Primary Functions**: Preloader

#### `ProfileDropdown.jsx`
- **Path**: `src/components/common/ProfileDropdown.jsx`
- **Size**: 6.21 KB
- **Type**: Stateful React Component.
- **Primary Functions**: ProfileDropdown, calculatePosition, handleClickOutside, handleEscape, handleSelectMode

#### `ProfileDropdownPortal.jsx`
- **Path**: `src/components/common/ProfileDropdownPortal.jsx`
- **Size**: 6.77 KB
- **Type**: Stateful React Component.
- **Primary Functions**: ProfileDropdownPortal, calculatePosition, scrollListener, handleClickOutside, handleEscape

#### `RealtimeQuoteCard.jsx`
- **Path**: `src/components/common/RealtimeQuoteCard.jsx`
- **Size**: 4.57 KB
- **Primary Functions**: RealtimeQuoteCard

#### `RealtimeWatchlist.jsx`
- **Path**: `src/components/common/RealtimeWatchlist.jsx`
- **Size**: 6.42 KB
- **Primary Functions**: RealtimeWatchlist

#### `Tilt.jsx`
- **Path**: `src/components/common/Tilt.jsx`
- **Size**: 2.38 KB
- **Type**: Stateful React Component.
- **Primary Functions**: Tilt, toNumber, buildTransform, handleMouseMove, handleMouseLeave

### 📁 DASHBOARD Domain
#### `MarketTicker.jsx`
- **Path**: `src/components/dashboard/MarketTicker.jsx`
- **Size**: 7.66 KB
- **Type**: Stateful React Component.
- **Primary Functions**: displaySymbol, formatPercent, normalizeTickerRow, getBenchmarksFromHistory, rotateRows

### 📁 INVESTOR Domain
#### `MostBoughtStocks.jsx`
- **Path**: `src/components/investor/MostBoughtStocks.jsx`
- **Size**: 10.38 KB
- **Type**: Stateful React Component.
- **Network**: Directly interfaces with backend APIs.
- **Primary Functions**: displaySymbol, MostBoughtStocks, loadPulse, openStockPage

#### `Screeners.jsx`
- **Path**: `src/components/investor/Screeners.jsx`
- **Size**: 51.70 KB
- **Type**: Stateful React Component.
- **Visualization**: Renders dynamic Recharts graphs.
- **Primary Functions**: Screeners, handleFilterChange, handleStrategySelect, addMoreFilter, loadMyFilters

#### `Watchlist.jsx`
- **Path**: `src/components/investor/Watchlist.jsx`
- **Size**: 62.80 KB
- **Type**: Stateful React Component.
- **Network**: Directly interfaces with backend APIs.
- **Visualization**: Renders dynamic Recharts graphs.
- **Primary Functions**: TooltipInfo, EmptyState, AttentionCard, GridCard, handleSave

#### `YourInvestments.jsx`
- **Path**: `src/components/investor/YourInvestments.jsx`
- **Size**: 7.79 KB
- **Type**: Stateful React Component.
- **Primary Functions**: displaySymbol, YourInvestments, loadPortfolio

### 📁 LANDING Domain
#### `AssetExplorer.jsx`
- **Path**: `src/components/landing/AssetExplorer.jsx`
- **Size**: 4.27 KB
- **Type**: Stateful React Component.
- **Primary Functions**: AssetExplorer, FilterTag

#### `FeaturesSection.jsx`
- **Path**: `src/components/landing/FeaturesSection.jsx`
- **Size**: 11.07 KB
- **Type**: Stateful React Component.
- **Primary Functions**: InvestorModeSection

#### `GlobalAssetSection.jsx`
- **Path**: `src/components/landing/GlobalAssetSection.jsx`
- **Size**: 13.64 KB
- **Type**: Stateful React Component.
- **Primary Functions**: formatSignedPercent, findBySymbolHint, VisualComponent, GlobalAssetSection, fetchData

#### `HeroSection.jsx`
- **Path**: `src/components/landing/HeroSection.jsx`
- **Size**: 7.74 KB
- **Primary Functions**: HeroSection

#### `InvestorPortfolioView.jsx`
- **Path**: `src/components/landing/InvestorPortfolioView.jsx`
- **Size**: 3.99 KB
- **Type**: Stateful React Component.
- **Visualization**: Renders dynamic Recharts graphs.
- **Primary Functions**: PortfolioTooltip, InvestorPortfolioView, appendLivePoint

#### `LaptopTradingView.jsx`
- **Path**: `src/components/landing/LaptopTradingView.jsx`
- **Size**: 6.26 KB
- **Type**: Stateful React Component.
- **Primary Functions**: formatSignedPercent, formatPrice, LaptopTradingView, loadRows

#### `MarketFloorAnimation.jsx`
- **Path**: `src/components/landing/MarketFloorAnimation.jsx`
- **Size**: 4.28 KB
- **Primary Functions**: MarketFloorAnimation, MarketBar, OrbitItem

#### `MarketTable.jsx`
- **Path**: `src/components/landing/MarketTable.jsx`
- **Size**: 4.79 KB
- **Type**: Stateful React Component.
- **Primary Functions**: MarketTable, formatSignedPercent, loadMovers

#### `NewsFeed.jsx`
- **Path**: `src/components/landing/NewsFeed.jsx`
- **Size**: 3.90 KB
- **Type**: Stateful React Component.
- **Primary Functions**: NewsFeed, formatRelativeTime, inferTag, loadNews

#### `NewsSentiment.jsx`
- **Path**: `src/components/landing/NewsSentiment.jsx`
- **Size**: 6.22 KB
- **Type**: Stateful React Component.
- **Primary Functions**: NewsSentiment, detectSentiment, detectImpact, loadSentimentNews

#### `PulseIcon.jsx`
- **Path**: `src/components/landing/PulseIcon.jsx`
- **Size**: 0.96 KB
- **Primary Functions**: PulseIcon

#### `RealtimeIcon.jsx`
- **Path**: `src/components/landing/RealtimeIcon.jsx`
- **Size**: 0.39 KB
- **Primary Functions**: RealtimeIcon

#### `SplitScreenSection.jsx`
- **Path**: `src/components/landing/SplitScreenSection.jsx`
- **Size**: 8.22 KB
- **Primary Functions**: cn, SplitScreenSection

#### `StockOrbitAnimation.jsx`
- **Path**: `src/components/landing/StockOrbitAnimation.jsx`
- **Size**: 3.11 KB
- **Primary Functions**: StockOrbitAnimation, OrbitIcon

#### `TickerTape.jsx`
- **Path**: `src/components/landing/TickerTape.jsx`
- **Size**: 7.59 KB
- **Type**: Stateful React Component.
- **Primary Functions**: TickerTape, load

#### `TraderModeSection.jsx`
- **Path**: `src/components/landing/TraderModeSection.jsx`
- **Size**: 19.50 KB
- **Type**: Stateful React Component.
- **Primary Functions**: cn, DualModeSection, TraderOverlayVisual, InvestorOverlayVisual, handleToggle

#### `WatchlistHub.jsx`
- **Path**: `src/components/landing/WatchlistHub.jsx`
- **Size**: 4.38 KB
- **Type**: Stateful React Component.
- **Primary Functions**: WatchlistHub, formatSignedPercent, loadWatchlist

### 📁 LAYOUT Domain
#### `MainLayout.jsx`
- **Path**: `src/components/layout/MainLayout.jsx`
- **Size**: 0.15 KB
- **Primary Functions**: MainLayout

### 📁 RESEARCH Domain
#### `ActionPanel.jsx`
- **Path**: `src/components/research/ActionPanel.jsx`
- **Size**: 1.30 KB
- **Primary Functions**: ActionPanel

#### `EmptyState.jsx`
- **Path**: `src/components/research/EmptyState.jsx`
- **Size**: 0.51 KB
- **Primary Functions**: EmptyState

#### `ResearchStockCard.jsx`
- **Path**: `src/components/research/ResearchStockCard.jsx`
- **Size**: 6.65 KB
- **Primary Functions**: formatPrice, formatPercent, toneForTimeframe, ResearchStockCard

#### `ScanLoader.jsx`
- **Path**: `src/components/research/ScanLoader.jsx`
- **Size**: 0.52 KB
- **Primary Functions**: ScanLoader

#### `ScannerControls.jsx`
- **Path**: `src/components/research/ScannerControls.jsx`
- **Size**: 0.81 KB
- **Primary Functions**: ScannerControls

#### `ScreenerCard.jsx`
- **Path**: `src/components/research/ScreenerCard.jsx`
- **Size**: 8.66 KB
- **Primary Functions**: formatPrice, formatPercent, toneForTimeframe, ScreenerCard

#### `SearchBar.jsx`
- **Path**: `src/components/research/SearchBar.jsx`
- **Size**: 0.69 KB
- **Primary Functions**: SearchBar

#### `SectionPanel.jsx`
- **Path**: `src/components/research/SectionPanel.jsx`
- **Size**: 1.06 KB
- **Primary Functions**: SectionPanel

#### `SectorFilter.jsx`
- **Path**: `src/components/research/SectorFilter.jsx`
- **Size**: 0.79 KB
- **Primary Functions**: SectorFilter

### 📁 SCREENER Domain
#### `ScreenerFilterPanel.jsx`
- **Path**: `src/components/screener/ScreenerFilterPanel.jsx`
- **Size**: 10.91 KB
- **Type**: Stateful React Component.
- **Primary Functions**: ScreenerFilterPanel, toggleSection, handleInputChange, handleMultiSelect, handleReset

#### `ScreenerResultsTable.jsx`
- **Path**: `src/components/screener/ScreenerResultsTable.jsx`
- **Size**: 7.70 KB
- **Primary Functions**: ScreenerResultsTable, getSignalIcon, getSentimentColor, getTrendBadgeColor

#### `ScreenerStockCard.jsx`
- **Path**: `src/components/screener/ScreenerStockCard.jsx`
- **Size**: 10.95 KB
- **Visualization**: Renders dynamic Recharts graphs.
- **Primary Functions**: ScreenerStockCard, getSignalIcon, getTrendIcon

### 📁 AUTH Domain
#### `EmailVerificationStatus.jsx`
- **Path**: `src/components/spec/auth/EmailVerificationStatus.jsx`
- **Size**: 0.30 KB
- **Primary Functions**: EmailVerificationStatus

#### `ForgotPasswordForm.jsx`
- **Path**: `src/components/spec/auth/ForgotPasswordForm.jsx`
- **Size**: 0.29 KB
- **Primary Functions**: ForgotPasswordForm

#### `LoginForm.jsx`
- **Path**: `src/components/spec/auth/LoginForm.jsx`
- **Size**: 0.26 KB
- **Primary Functions**: LoginForm

#### `OAuthButton.jsx`
- **Path**: `src/components/spec/auth/OAuthButton.jsx`
- **Size**: 0.27 KB
- **Primary Functions**: OAuthButton

#### `RegisterForm.jsx`
- **Path**: `src/components/spec/auth/RegisterForm.jsx`
- **Size**: 0.27 KB
- **Primary Functions**: RegisterForm

#### `ResetPasswordForm.jsx`
- **Path**: `src/components/spec/auth/ResetPasswordForm.jsx`
- **Size**: 0.29 KB
- **Primary Functions**: ResetPasswordForm

### 📁 CHARTS Domain
#### `InteractivePriceChart.jsx`
- **Path**: `src/components/spec/charts/InteractivePriceChart.jsx`
- **Size**: 0.30 KB
- **Primary Functions**: InteractivePriceChart

#### `PortfolioAllocationPieChart.jsx`
- **Path**: `src/components/spec/charts/PortfolioAllocationPieChart.jsx`
- **Size**: 0.31 KB
- **Primary Functions**: PortfolioAllocationPieChart

#### `SectorRotationBubbleChart.jsx`
- **Path**: `src/components/spec/charts/SectorRotationBubbleChart.jsx`
- **Size**: 0.31 KB
- **Primary Functions**: SectorRotationBubbleChart

#### `VolumeBarChart.jsx`
- **Path**: `src/components/spec/charts/VolumeBarChart.jsx`
- **Size**: 0.28 KB
- **Primary Functions**: VolumeBarChart

### 📁 DISCOVERY Domain
#### `GlobalSearchBar.jsx`
- **Path**: `src/components/spec/discovery/GlobalSearchBar.jsx`
- **Size**: 0.27 KB
- **Primary Functions**: GlobalSearchBar

#### `ScreenerFilterPanel.jsx`
- **Path**: `src/components/spec/discovery/ScreenerFilterPanel.jsx`
- **Size**: 0.29 KB
- **Primary Functions**: ScreenerFilterPanel

#### `ScreenerResultsGrid.jsx`
- **Path**: `src/components/spec/discovery/ScreenerResultsGrid.jsx`
- **Size**: 0.29 KB
- **Primary Functions**: ScreenerResultsGrid

#### `SearchResultDropdown.jsx`
- **Path**: `src/components/spec/discovery/SearchResultDropdown.jsx`
- **Size**: 0.29 KB
- **Primary Functions**: SearchResultDropdown

### 📁 FEEDBACK Domain
#### `ErrorStateMessage.jsx`
- **Path**: `src/components/spec/feedback/ErrorStateMessage.jsx`
- **Size**: 0.29 KB
- **Primary Functions**: ErrorStateMessage

#### `LoadingSpinner.jsx`
- **Path**: `src/components/spec/feedback/LoadingSpinner.jsx`
- **Size**: 0.28 KB
- **Primary Functions**: LoadingSpinner

#### `OfflineIndicator.jsx`
- **Path**: `src/components/spec/feedback/OfflineIndicator.jsx`
- **Size**: 0.28 KB
- **Primary Functions**: OfflineIndicator

#### `SkeletonLoader.jsx`
- **Path**: `src/components/spec/feedback/SkeletonLoader.jsx`
- **Size**: 0.28 KB
- **Primary Functions**: SkeletonLoader

#### `ToastNotification.jsx`
- **Path**: `src/components/spec/feedback/ToastNotification.jsx`
- **Size**: 0.29 KB
- **Primary Functions**: ToastNotification

#### `WebSocketConnectionStatus.jsx`
- **Path**: `src/components/spec/feedback/WebSocketConnectionStatus.jsx`
- **Size**: 0.31 KB
- **Primary Functions**: WebSocketConnectionStatus

### 📁 FUNDAMENTAL Domain
#### `EarningsHistory.jsx`
- **Path**: `src/components/spec/fundamental/EarningsHistory.jsx`
- **Size**: 0.29 KB
- **Primary Functions**: EarningsHistory

#### `EconomicCalendarList.jsx`
- **Path**: `src/components/spec/fundamental/EconomicCalendarList.jsx`
- **Size**: 0.30 KB
- **Primary Functions**: EconomicCalendarList

#### `MacroIndicatorChart.jsx`
- **Path**: `src/components/spec/fundamental/MacroIndicatorChart.jsx`
- **Size**: 0.30 KB
- **Primary Functions**: MacroIndicatorChart

#### `SECFilingsTable.jsx`
- **Path**: `src/components/spec/fundamental/SECFilingsTable.jsx`
- **Size**: 0.29 KB
- **Primary Functions**: SECFilingsTable

#### `ValuationMetricsGrid.jsx`
- **Path**: `src/components/spec/fundamental/ValuationMetricsGrid.jsx`
- **Size**: 0.30 KB
- **Primary Functions**: ValuationMetricsGrid

### 📁 SPEC Domain
#### `index.js`
- **Path**: `src/components/spec/index.js`
- **Size**: 4.00 KB

### 📁 LAYOUT Domain
#### `ErrorBoundary.jsx`
- **Path**: `src/components/spec/layout/ErrorBoundary.jsx`
- **Size**: 0.78 KB

#### `PersonaToggle.jsx`
- **Path**: `src/components/spec/layout/PersonaToggle.jsx`
- **Size**: 0.27 KB
- **Primary Functions**: PersonaToggle

#### `RootLayout.jsx`
- **Path**: `src/components/spec/layout/RootLayout.jsx`
- **Size**: 0.41 KB
- **Primary Functions**: RootLayout

#### `Sidebar.jsx`
- **Path**: `src/components/spec/layout/Sidebar.jsx`
- **Size**: 0.26 KB
- **Primary Functions**: Sidebar

### 📁 MARKET Domain
#### `AssetPriceHeader.jsx`
- **Path**: `src/components/spec/market/AssetPriceHeader.jsx`
- **Size**: 0.28 KB
- **Primary Functions**: AssetPriceHeader

#### `LiveTickerTape.jsx`
- **Path**: `src/components/spec/market/LiveTickerTape.jsx`
- **Size**: 0.27 KB
- **Primary Functions**: LiveTickerTape

#### `MarketPulseCard.jsx`
- **Path**: `src/components/spec/market/MarketPulseCard.jsx`
- **Size**: 0.28 KB
- **Primary Functions**: MarketPulseCard

#### `MarketSentimentGauge.jsx`
- **Path**: `src/components/spec/market/MarketSentimentGauge.jsx`
- **Size**: 0.29 KB
- **Primary Functions**: MarketSentimentGauge

#### `SectorPerformanceTable.jsx`
- **Path**: `src/components/spec/market/SectorPerformanceTable.jsx`
- **Size**: 0.30 KB
- **Primary Functions**: SectorPerformanceTable

### 📁 PAGES Domain
#### `AlertsManager.jsx`
- **Path**: `src/components/spec/pages/AlertsManager.jsx`
- **Size**: 0.28 KB
- **Primary Functions**: AlertsManager

#### `AssetDetailView.jsx`
- **Path**: `src/components/spec/pages/AssetDetailView.jsx`
- **Size**: 0.28 KB
- **Primary Functions**: AssetDetailView

#### `LandingPage.jsx`
- **Path**: `src/components/spec/pages/LandingPage.jsx`
- **Size**: 0.27 KB
- **Primary Functions**: LandingPage

#### `PortfolioView.jsx`
- **Path**: `src/components/spec/pages/PortfolioView.jsx`
- **Size**: 0.28 KB
- **Primary Functions**: PortfolioView

#### `ScreenerPage.jsx`
- **Path**: `src/components/spec/pages/ScreenerPage.jsx`
- **Size**: 0.27 KB
- **Primary Functions**: ScreenerPage

#### `UserSettingsPanel.jsx`
- **Path**: `src/components/spec/pages/UserSettingsPanel.jsx`
- **Size**: 0.29 KB
- **Primary Functions**: UserSettingsPanel

#### `WatchlistsView.jsx`
- **Path**: `src/components/spec/pages/WatchlistsView.jsx`
- **Size**: 0.28 KB
- **Primary Functions**: WatchlistsView

### 📁 SPEC Domain
#### `ScaffoldCard.jsx`
- **Path**: `src/components/spec/ScaffoldCard.jsx`
- **Size**: 0.47 KB
- **Primary Functions**: ScaffoldCard

### 📁 TECHNICAL Domain
#### `CompositeScoreDial.jsx`
- **Path**: `src/components/spec/technical/CompositeScoreDial.jsx`
- **Size**: 0.29 KB
- **Primary Functions**: CompositeScoreDial

#### `MarketBreadthChart.jsx`
- **Path**: `src/components/spec/technical/MarketBreadthChart.jsx`
- **Size**: 0.29 KB
- **Primary Functions**: MarketBreadthChart

#### `MomentumChart.jsx`
- **Path**: `src/components/spec/technical/MomentumChart.jsx`
- **Size**: 0.28 KB
- **Primary Functions**: MomentumChart

#### `PatternDetectionHighlight.jsx`
- **Path**: `src/components/spec/technical/PatternDetectionHighlight.jsx`
- **Size**: 0.32 KB
- **Primary Functions**: PatternDetectionHighlight

#### `TechnicalIndicatorsPanel.jsx`
- **Path**: `src/components/spec/technical/TechnicalIndicatorsPanel.jsx`
- **Size**: 0.31 KB
- **Primary Functions**: TechnicalIndicatorsPanel

#### `TrendMatrixGrid.jsx`
- **Path**: `src/components/spec/technical/TrendMatrixGrid.jsx`
- **Size**: 0.29 KB
- **Primary Functions**: TrendMatrixGrid

### 📁 USER Domain
#### `AlertConfigurationModal.jsx`
- **Path**: `src/components/spec/user/AlertConfigurationModal.jsx`
- **Size**: 0.30 KB
- **Primary Functions**: AlertConfigurationModal

#### `ExportButtons.jsx`
- **Path**: `src/components/spec/user/ExportButtons.jsx`
- **Size**: 0.27 KB
- **Primary Functions**: ExportButtons

#### `NewsFeedList.jsx`
- **Path**: `src/components/spec/user/NewsFeedList.jsx`
- **Size**: 0.27 KB
- **Primary Functions**: NewsFeedList

#### `NotificationFeed.jsx`
- **Path**: `src/components/spec/user/NotificationFeed.jsx`
- **Size**: 0.28 KB
- **Primary Functions**: NotificationFeed

#### `PortfolioHoldingsTable.jsx`
- **Path**: `src/components/spec/user/PortfolioHoldingsTable.jsx`
- **Size**: 0.30 KB
- **Primary Functions**: PortfolioHoldingsTable

#### `TransactionEntryForm.jsx`
- **Path**: `src/components/spec/user/TransactionEntryForm.jsx`
- **Size**: 0.29 KB
- **Primary Functions**: TransactionEntryForm

#### `WatchlistCard.jsx`
- **Path**: `src/components/spec/user/WatchlistCard.jsx`
- **Size**: 0.27 KB
- **Primary Functions**: WatchlistCard

### 📁 COMPONENTS Domain
#### `StockDetailWithOHLC.jsx`
- **Path**: `src/components/StockDetailWithOHLC.jsx`
- **Size**: 9.58 KB
- **Type**: Stateful React Component.
- **Visualization**: Renders dynamic Recharts graphs.
- **Primary Functions**: StockChartWithOHLC, LatestPriceCard, PriceHistoryTable, StockDetailPage

### 📁 TRADER Domain
#### `AdvancedScreener.jsx`
- **Path**: `src/components/trader/AdvancedScreener.jsx`
- **Size**: 47.42 KB
- **Type**: Stateful React Component.
- **Visualization**: Renders dynamic Recharts graphs.
- **Primary Functions**: AdvancedScreener, handleFilterChange, handleStrategySelect, addMoreFilter, loadMyFilters

#### `AdvancedTradingChart.jsx`
- **Path**: `src/components/trader/AdvancedTradingChart.jsx`
- **Size**: 17.78 KB
- **Type**: Stateful React Component.
- **Primary Functions**: AdvancedTradingChart, handleResize, calculateSMA

#### `AdvancedWatchlist.jsx`
- **Path**: `src/components/trader/AdvancedWatchlist.jsx`
- **Size**: 47.63 KB
- **Type**: Stateful React Component.
- **Network**: Directly interfaces with backend APIs.
- **Primary Functions**: Sparkline, normalizeMarketRow, makeSeed, buildDecoratedRow, AdvancedWatchlist

#### `EnhancedScreenerResults.jsx`
- **Path**: `src/components/trader/EnhancedScreenerResults.jsx`
- **Size**: 10.05 KB
- **Type**: Stateful React Component.
- **Primary Functions**: EnhancedScreenerResults, getSentimentColor, getBiasColor, SortableHeader

#### `EnhancedStockScreener.jsx`
- **Path**: `src/components/trader/EnhancedStockScreener.jsx`
- **Size**: 11.23 KB
- **Type**: Stateful React Component.
- **Primary Functions**: EnhancedStockScreener, doScan, handleScroll, handleActivateScan, handleExport

#### `MultiChartGrid.jsx`
- **Path**: `src/components/trader/MultiChartGrid.jsx`
- **Size**: 13.00 KB
- **Type**: Stateful React Component.
- **Visualization**: Renders dynamic Recharts graphs.
- **Primary Functions**: normalizeChartSymbol, calculateMA, symbolSeed, generateFallbackHistory, MultiChartGrid

#### `MultiChartWorkspace.jsx`
- **Path**: `src/components/trader/MultiChartWorkspace.jsx`
- **Size**: 15.10 KB
- **Type**: Stateful React Component.
- **Network**: Directly interfaces with backend APIs.
- **Primary Functions**: MultiChartWorkspace

#### `NotesIcon.jsx`
- **Path**: `src/components/trader/NotesIcon.jsx`
- **Size**: 0.50 KB
- **Primary Functions**: NotesIcon

#### `RealTimeScanner.jsx`
- **Path**: `src/components/trader/RealTimeScanner.jsx`
- **Size**: 18.59 KB
- **Type**: Stateful React Component.
- **Network**: Directly interfaces with backend APIs.
- **Primary Functions**: RealTimeScanner, getColorClasses

#### `ScreenerVisualizations.jsx`
- **Path**: `src/components/trader/ScreenerVisualizations.jsx`
- **Size**: 11.83 KB
- **Primary Functions**: ScreenerHeatmap, getColor, StockComparison, getBiasColor

### 📁 STOCKPAGE Domain
#### `AnalysisBottom.jsx`
- **Path**: `src/components/trader/stockPage/AnalysisBottom.jsx`
- **Size**: 7.52 KB
- **Primary Functions**: AnalysisBottom, PerformanceCard

#### `AnalysisChart.jsx`
- **Path**: `src/components/trader/stockPage/AnalysisChart.jsx`
- **Size**: 6.17 KB
- **Type**: Stateful React Component.
- **Visualization**: Renders dynamic Recharts graphs.
- **Primary Functions**: AnalysisChart

#### `AnalysisFinancials.jsx`
- **Path**: `src/components/trader/stockPage/AnalysisFinancials.jsx`
- **Size**: 8.10 KB
- **Type**: Stateful React Component.
- **Network**: Directly interfaces with backend APIs.
- **Visualization**: Renders dynamic Recharts graphs.
- **Primary Functions**: AnalysisFinancials

#### `AnalysisHeader.jsx`
- **Path**: `src/components/trader/stockPage/AnalysisHeader.jsx`
- **Size**: 4.08 KB
- **Primary Functions**: AnalysisHeader

#### `AnalysisLevels.jsx`
- **Path**: `src/components/trader/stockPage/AnalysisLevels.jsx`
- **Size**: 1.46 KB
- **Primary Functions**: AnalysisLevels, LevelItem

#### `AnalysisNews.jsx`
- **Path**: `src/components/trader/stockPage/AnalysisNews.jsx`
- **Size**: 10.45 KB
- **Type**: Stateful React Component.
- **Network**: Directly interfaces with backend APIs.
- **Primary Functions**: AnalysisNews, normalize, getSentimentColor, getImpactStyles

#### `AnalysisSidebar.jsx`
- **Path**: `src/components/trader/stockPage/AnalysisSidebar.jsx`
- **Size**: 6.13 KB
- **Primary Functions**: AnalysisSidebar

#### `AnalysisTechnicals.jsx`
- **Path**: `src/components/trader/stockPage/AnalysisTechnicals.jsx`
- **Size**: 7.20 KB
- **Type**: Stateful React Component.
- **Visualization**: Renders dynamic Recharts graphs.
- **Primary Functions**: AnalysisTechnicals

#### `ExecutionPanel.jsx`
- **Path**: `src/components/trader/stockPage/ExecutionPanel.jsx`
- **Size**: 4.69 KB
- **Type**: Stateful React Component.
- **Primary Functions**: ExecutionPanel

#### `OrderFlow.jsx`
- **Path**: `src/components/trader/stockPage/OrderFlow.jsx`
- **Size**: 4.33 KB
- **Primary Functions**: OrderFlow, generateMockDepth, generateLevel, renderLevel

#### `QuickTradePanel.jsx`
- **Path**: `src/components/trader/stockPage/QuickTradePanel.jsx`
- **Size**: 2.10 KB
- **Primary Functions**: QuickTradePanel, QuickCard

#### `TechnicalGauge.jsx`
- **Path**: `src/components/trader/stockPage/TechnicalGauge.jsx`
- **Size**: 4.70 KB
- **Primary Functions**: TechnicalGauge, getRotation

#### `TechnicalPanel.jsx`
- **Path**: `src/components/trader/stockPage/TechnicalPanel.jsx`
- **Size**: 2.00 KB
- **Primary Functions**: TechnicalPanel, SnapshotCard

#### `TradeInsights.jsx`
- **Path**: `src/components/trader/stockPage/TradeInsights.jsx`
- **Size**: 5.49 KB
- **Primary Functions**: TradeInsights

### 📁 STOCKRESEARCH Domain
#### `AdvancedAnalysisChart.jsx`
- **Path**: `src/components/trader/stockResearch/AdvancedAnalysisChart.jsx`
- **Size**: 25.99 KB
- **Type**: Stateful React Component.
- **Primary Functions**: AdvancedAnalysisChart, toSeed, buildOhlcSeries, sma, ema

#### `FundamentalsCompactSection.jsx`
- **Path**: `src/components/trader/stockResearch/FundamentalsCompactSection.jsx`
- **Size**: 1.55 KB
- **Primary Functions**: FundamentalsCompactSection

#### `ImmersiveTraderTerminal.jsx`
- **Path**: `src/components/trader/stockResearch/ImmersiveTraderTerminal.jsx`
- **Size**: 40.09 KB
- **Type**: Stateful React Component.
- **Primary Functions**: buildOhlcv, buildHeikinAshi, Dropdown, GlassPanel, ChartPane

#### `KeyLevelsSection.jsx`
- **Path**: `src/components/trader/stockResearch/KeyLevelsSection.jsx`
- **Size**: 1.29 KB
- **Primary Functions**: KeyLevelsSection

#### `MainChartSection.jsx`
- **Path**: `src/components/trader/stockResearch/MainChartSection.jsx`
- **Size**: 3.16 KB
- **Type**: Stateful React Component.
- **Primary Functions**: buildPath, MainChartSection, toggleIndicator

#### `MinimalTraderChart.jsx`
- **Path**: `src/components/trader/stockResearch/MinimalTraderChart.jsx`
- **Size**: 8.37 KB
- **Type**: Stateful React Component.
- **Primary Functions**: MinimalTraderChart

#### `NewsPanelSection.jsx`
- **Path**: `src/components/trader/stockResearch/NewsPanelSection.jsx`
- **Size**: 0.72 KB
- **Primary Functions**: NewsPanelSection

#### `PerformanceBenchmarksSection.jsx`
- **Path**: `src/components/trader/stockResearch/PerformanceBenchmarksSection.jsx`
- **Size**: 0.79 KB
- **Primary Functions**: PerformanceBenchmarksSection

#### `RelatedSetupsSection.jsx`
- **Path**: `src/components/trader/stockResearch/RelatedSetupsSection.jsx`
- **Size**: 1.04 KB
- **Primary Functions**: RelatedSetupsSection

#### `ResearchAdvancedChartPage.jsx`
- **Path**: `src/components/trader/stockResearch/ResearchAdvancedChartPage.jsx`
- **Size**: 18.54 KB
- **Type**: Stateful React Component.
- **Network**: Directly interfaces with backend APIs.
- **Primary Functions**: ResearchAdvancedChartPage, generateFallbackCandles, calculateMovingAverage, formatNumber, loadRows

#### `ResearchHeaderSection.jsx`
- **Path**: `src/components/trader/stockResearch/ResearchHeaderSection.jsx`
- **Size**: 2.78 KB
- **Primary Functions**: ResearchHeaderSection

#### `SectorStrengthSection.jsx`
- **Path**: `src/components/trader/stockResearch/SectorStrengthSection.jsx`
- **Size**: 0.97 KB
- **Primary Functions**: SectorStrengthSection

#### `SmartInsightsSection.jsx`
- **Path**: `src/components/trader/stockResearch/SmartInsightsSection.jsx`
- **Size**: 0.57 KB
- **Primary Functions**: SmartInsightsSection

#### `TabContent.jsx`
- **Path**: `src/components/trader/stockResearch/TabContent.jsx`
- **Size**: 15.58 KB
- **Primary Functions**: Row, MeterBar, HeatCell, MiniSparkline, InsightsTab

#### `TechnicalSnapshotSection.jsx`
- **Path**: `src/components/trader/stockResearch/TechnicalSnapshotSection.jsx`
- **Size**: 1.95 KB
- **Primary Functions**: TechnicalSnapshotSection

#### `TradeDecisionZone.jsx`
- **Path**: `src/components/trader/stockResearch/TradeDecisionZone.jsx`
- **Size**: 7.91 KB
- **Primary Functions**: TradeDecisionZone, Panel, PanelLabel, Row

#### `TraderChartPanel.jsx`
- **Path**: `src/components/trader/stockResearch/TraderChartPanel.jsx`
- **Size**: 68.10 KB
- **Type**: Stateful React Component.
- **Primary Functions**: ResearchChartViewport, TraderChartPanel, toSeed, clamp, alignTimeToBucket

#### `UnusualActivitySection.jsx`
- **Path**: `src/components/trader/stockResearch/UnusualActivitySection.jsx`
- **Size**: 0.58 KB
- **Primary Functions**: UnusualActivitySection

#### `WhyThisStockSection.jsx`
- **Path**: `src/components/trader/stockResearch/WhyThisStockSection.jsx`
- **Size**: 0.53 KB
- **Primary Functions**: WhyThisStockSection

### 📁 STOCKSCREENER Domain
#### `FiltersPanel.jsx`
- **Path**: `src/components/trader/stockScreener/FiltersPanel.jsx`
- **Size**: 6.12 KB
- **Primary Functions**: FiltersPanel, CheckboxItem, toggleCheckbox

#### `FloatingActionBar.jsx`
- **Path**: `src/components/trader/stockScreener/FloatingActionBar.jsx`
- **Size**: 1.81 KB
- **Primary Functions**: FloatingActionBar

#### `Header.jsx`
- **Path**: `src/components/trader/stockScreener/Header.jsx`
- **Size**: 1.22 KB
- **Primary Functions**: Header

#### `Navbar.jsx`
- **Path**: `src/components/trader/stockScreener/Navbar.jsx`
- **Size**: 3.16 KB
- **Primary Functions**: Navbar

#### `PageControls.jsx`
- **Path**: `src/components/trader/stockScreener/PageControls.jsx`
- **Size**: 1.94 KB
- **Primary Functions**: PageControls

#### `SectorStrengthSection.jsx`
- **Path**: `src/components/trader/stockScreener/SectorStrengthSection.jsx`
- **Size**: 1.79 KB
- **Primary Functions**: SectorStrengthSection

#### `SparklineChart.jsx`
- **Path**: `src/components/trader/stockScreener/SparklineChart.jsx`
- **Size**: 0.58 KB
- **Visualization**: Renders dynamic Recharts graphs.
- **Primary Functions**: SparklineChart

#### `StatsCards.jsx`
- **Path**: `src/components/trader/stockScreener/StatsCards.jsx`
- **Size**: 0.73 KB
- **Primary Functions**: StatsCards

#### `StockCard.jsx`
- **Path**: `src/components/trader/stockScreener/StockCard.jsx`
- **Size**: 4.77 KB
- **Primary Functions**: StockCard, generateSparkline

#### `StockCardGrid.jsx`
- **Path**: `src/components/trader/stockScreener/StockCardGrid.jsx`
- **Size**: 0.69 KB
- **Primary Functions**: StockCardGrid

#### `StockPerformanceSection.jsx`
- **Path**: `src/components/trader/stockScreener/StockPerformanceSection.jsx`
- **Size**: 1.87 KB
- **Visualization**: Renders dynamic Recharts graphs.
- **Primary Functions**: StockPerformanceSection

#### `StockTable.jsx`
- **Path**: `src/components/trader/stockScreener/StockTable.jsx`
- **Size**: 6.98 KB
- **Primary Functions**: StockTable, formatPrice, formatNumber, HeaderCell

#### `Tabs.jsx`
- **Path**: `src/components/trader/stockScreener/Tabs.jsx`
- **Size**: 1.14 KB
- **Primary Functions**: Tabs

#### `TerminalLogs.jsx`
- **Path**: `src/components/trader/stockScreener/TerminalLogs.jsx`
- **Size**: 3.11 KB
- **Type**: Stateful React Component.
- **Primary Functions**: TerminalLogs

#### `TopMoversSection.jsx`
- **Path**: `src/components/trader/stockScreener/TopMoversSection.jsx`
- **Size**: 2.29 KB
- **Primary Functions**: MiniTrend, Bucket, TopMoversSection

### 📁 COMPONENTS Domain
#### `UserDropdown.jsx`
- **Path**: `src/components/UserDropdown.jsx`
- **Size**: 4.78 KB
- **Type**: Stateful React Component.
- **Primary Functions**: UserDropdown, handleClickOutside, handleMenuItemClick

#### `UserDropdownExample.jsx`
- **Path**: `src/components/UserDropdownExample.jsx`
- **Size**: 3.37 KB
- **Primary Functions**: Header, to, UserDropdownExample

### 📁 WATCHLIST Domain
#### `AdvancedWatchlistDashboard.jsx`
- **Path**: `src/components/watchlist/AdvancedWatchlistDashboard.jsx`
- **Size**: 25.02 KB
- **Type**: Stateful React Component.
- **Network**: Directly interfaces with backend APIs.
- **Primary Functions**: AdvancedWatchlistDashboard, normalizeQuote, load

#### `AlertsPanel.jsx`
- **Path**: `src/components/watchlist/AlertsPanel.jsx`
- **Size**: 3.98 KB
- **Type**: Stateful React Component.
- **Primary Functions**: AlertsPanel, handleDismiss

#### `EnhancedWatchlistComponents.jsx`
- **Path**: `src/components/watchlist/EnhancedWatchlistComponents.jsx`
- **Size**: 7.44 KB
- **Primary Functions**: NewsBadge, SentimentDisplay, getSentimentIcon, getSentimentColor, getSentimentLabel

#### `FilterModal.jsx`
- **Path**: `src/components/watchlist/FilterModal.jsx`
- **Size**: 13.49 KB
- **Type**: Stateful React Component.
- **Primary Functions**: FilterModal, handlePriceRangeChange, handleApply, handleReset

#### `index.js`
- **Path**: `src/components/watchlist/index.js`
- **Size**: 0.38 KB

#### `PortfolioSummary.jsx`
- **Path**: `src/components/watchlist/PortfolioSummary.jsx`
- **Size**: 7.27 KB
- **Visualization**: Renders dynamic Recharts graphs.
- **Primary Functions**: PortfolioSummary

#### `StockDetailsPanel.jsx`
- **Path**: `src/components/watchlist/StockDetailsPanel.jsx`
- **Size**: 18.36 KB
- **Type**: Stateful React Component.
- **Visualization**: Renders dynamic Recharts graphs.
- **Primary Functions**: generateChartData, generateOrderBook, generateRecentTrades, StockDetailsPanel, safeNumber

#### `TradingWatchlistGrid.jsx`
- **Path**: `src/components/watchlist/TradingWatchlistGrid.jsx`
- **Size**: 7.36 KB
- **Type**: Stateful React Component.
- **Primary Functions**: TradingWatchlistGrid, currency, compactNumber, sortRows, getTrend

#### `WatchlistTable.jsx`
- **Path**: `src/components/watchlist/WatchlistTable.jsx`
- **Size**: 23.92 KB
- **Type**: Stateful React Component.
- **Primary Functions**: viewMode, compactCurrency, formatMoney, makeSeed, buildSparkSeries

### 📁 CONTEXT Domain
#### `AssetContext.jsx`
- **Path**: `src/context/AssetContext.jsx`
- **Size**: 1.07 KB
- **Type**: Stateful React Component.
- **Primary Functions**: AssetProvider, setAsset, useAsset

### 📁 DATA Domain
#### `researchMockData.js`
- **Path**: `src/data/researchMockData.js`
- **Size**: 10.91 KB

#### `stockResearchMock.js`
- **Path**: `src/data/stockResearchMock.js`
- **Size**: 3.59 KB

### 📁 HOOKS Domain
#### `screenerPresets.js`
- **Path**: `src/hooks/screenerPresets.js`
- **Size**: 6.44 KB
- **Primary Functions**: getPresetsByCategory, saveScreener, getSavedScreeners, deleteSavedScreener

#### `useAdminStatus.js`
- **Path**: `src/hooks/useAdminStatus.js`
- **Size**: 6.60 KB
- **Type**: Stateful React Component.
- **Primary Functions**: useAutoUpdateStatus, useSmartRefreshStatus, useCacheStatus, useOfflineStatus, useSystemStatus

#### `useDebounce.js`
- **Path**: `src/hooks/useDebounce.js`
- **Size**: 0.40 KB
- **Type**: Stateful React Component.
- **Primary Functions**: useDebounce

#### `useHeaderData.js`
- **Path**: `src/hooks/useHeaderData.js`
- **Size**: 6.09 KB
- **Type**: Stateful React Component.
- **Primary Functions**: getStoredUser, buildFallbackProfile, buildFallbackNotifications, useHeaderData

#### `useKeyboardShortcuts.js`
- **Path**: `src/hooks/useKeyboardShortcuts.js`
- **Size**: 2.82 KB
- **Type**: Stateful React Component.
- **Primary Functions**: useKeyboardShortcuts

#### `useOHLCData.js`
- **Path**: `src/hooks/useOHLCData.js`
- **Size**: 6.48 KB
- **Type**: Stateful React Component.
- **Primary Functions**: useOHLCData, useLatestOHLC, useChartData, useHasCachedData, checkCache

#### `useRealtimeQuote.js`
- **Path**: `src/hooks/useRealtimeQuote.js`
- **Size**: 6.78 KB
- **Type**: Stateful React Component.
- **Primary Functions**: useRealtimeQuote, useBatchQuotes, useWatchlistQuotes, usePortfolioQuotes, useQuoteStats

#### `useSocket.js`
- **Path**: `src/hooks/useSocket.js`
- **Size**: 1.25 KB
- **Type**: Stateful React Component.
- **Primary Functions**: useSocket

#### `useWatchlistEnhancements.js`
- **Path**: `src/hooks/useWatchlistEnhancements.js`
- **Size**: 6.20 KB
- **Type**: Stateful React Component.
- **Network**: Directly interfaces with backend APIs.
- **Primary Functions**: useWatchlistEnhancements, fetchNewsSentiment

#### `watchlistSorting.js`
- **Path**: `src/hooks/watchlistSorting.js`
- **Size**: 5.14 KB
- **Primary Functions**: sortStocks, getSentimentColor, getSentimentBgColor, getSentimentLabel

### 📁 SRC Domain
#### `main.jsx`
- **Path**: `src/main.jsx`
- **Size**: 0.37 KB

### 📁 PAGES Domain
#### `ContractPages.jsx`
- **Path**: `src/pages/ContractPages.jsx`
- **Size**: 101.38 KB
- **Type**: Stateful React Component.
- **Network**: Directly interfaces with backend APIs.
- **Visualization**: Renders dynamic Recharts graphs.
- **Primary Functions**: VerifyEmailPage, ResetPasswordPage, GlobalSearchPage, DiscoveryPage, CalendarPage

#### `Dashboard.jsx`
- **Path**: `src/pages/Dashboard.jsx`
- **Size**: 26.66 KB
- **Type**: Stateful React Component.
- **Primary Functions**: Dashboard, displaySymbol, formatNotificationTime, DashboardLoader, ProfileHeader

#### `dashboardData.js`
- **Path**: `src/pages/dashboardData.js`
- **Size**: 3.50 KB
- **Primary Functions**: generatePriceData, generateCandlestickData

#### `ForgotPassword.jsx`
- **Path**: `src/pages/ForgotPassword.jsx`
- **Size**: 4.20 KB
- **Type**: Stateful React Component.
- **Network**: Directly interfaces with backend APIs.
- **Primary Functions**: ForgotPassword, handleSubmit

#### `Home.jsx`
- **Path**: `src/pages/Home.jsx`
- **Size**: 7.67 KB
- **Primary Functions**: Home, Navbar, Footer

#### `InvestorAdvancedCharts.jsx`
- **Path**: `src/pages/InvestorAdvancedCharts.jsx`
- **Size**: 111.33 KB
- **Type**: Stateful React Component.
- **Network**: Directly interfaces with backend APIs.
- **Primary Functions**: calculateSMA, calculateRSI, calculateEMA, calculateMACD, calculateBB

#### `InvestorDashboard.jsx`
- **Path**: `src/pages/InvestorDashboard.jsx`
- **Size**: 92.92 KB
- **Type**: Stateful React Component.
- **Visualization**: Renders dynamic Recharts graphs.
- **Primary Functions**: InvestorView, formatNotificationTime, inferRegionCode, countryFlag, displaySymbol

#### `InvestorStockPage.jsx`
- **Path**: `src/pages/InvestorStockPage.jsx`
- **Size**: 98.51 KB
- **Type**: Stateful React Component.
- **Network**: Directly interfaces with backend APIs.
- **Visualization**: Renders dynamic Recharts graphs.
- **Primary Functions**: InvestorStockPage, checkWatchlist, showToast, handleWatchlistToggle, fetchInsightsData

#### `LearningAcademy.jsx`
- **Path**: `src/pages/LearningAcademy.jsx`
- **Size**: 22.03 KB
- **Type**: Stateful React Component.
- **Primary Functions**: CourseCard, QuizSection, CourseReader, LearningAcademy, renderContent

#### `Login.jsx`
- **Path**: `src/pages/Login.jsx`
- **Size**: 6.92 KB
- **Type**: Stateful React Component.
- **Network**: Directly interfaces with backend APIs.
- **Primary Functions**: Login, handleInputChange, handleSubmit

#### `MarketResearchDashboard.jsx`
- **Path**: `src/pages/MarketResearchDashboard.jsx`
- **Size**: 20.08 KB
- **Type**: Stateful React Component.
- **Network**: Directly interfaces with backend APIs.
- **Primary Functions**: normalizeStock, mapTabToSignal, applyFilters, MarketResearchDashboard, clearFilters

#### `MinimalChartPage.jsx`
- **Path**: `src/pages/MinimalChartPage.jsx`
- **Size**: 0.46 KB
- **Primary Functions**: MinimalChartPage

#### `Onboarding.jsx`
- **Path**: `src/pages/Onboarding.jsx`
- **Size**: 31.84 KB
- **Type**: Stateful React Component.
- **Network**: Directly interfaces with backend APIs.
- **Primary Functions**: QuizTooltip, HighlightedText, Onboarding, startQuiz, selectOption

#### `RealtimeDemoPage.jsx`
- **Path**: `src/pages/RealtimeDemoPage.jsx`
- **Size**: 9.29 KB
- **Type**: Stateful React Component.
- **Network**: Directly interfaces with backend APIs.
- **Primary Functions**: RealtimeDemoPage

#### `Register.jsx`
- **Path**: `src/pages/Register.jsx`
- **Size**: 8.64 KB
- **Type**: Stateful React Component.
- **Network**: Directly interfaces with backend APIs.
- **Primary Functions**: Register, handleInputChange, handleSubmit

#### `ResetPassword.jsx`
- **Path**: `src/pages/ResetPassword.jsx`
- **Size**: 5.87 KB
- **Type**: Stateful React Component.
- **Network**: Directly interfaces with backend APIs.
- **Primary Functions**: ResetPassword, handleSubmit

#### `ScreenerPage.jsx`
- **Path**: `src/pages/ScreenerPage.jsx`
- **Size**: 21.77 KB
- **Type**: Stateful React Component.
- **Primary Functions**: ScreenerPage, handleFilterChange, pushNotice, toggleStockSelection, openResearch

### 📁 SETTINGS Domain
#### `SettingsPage.jsx`
- **Path**: `src/pages/settings/SettingsPage.jsx`
- **Size**: 16.64 KB
- **Type**: Stateful React Component.
- **Primary Functions**: SettingsPage, handleToggle, handleChange, handleSave

### 📁 PAGES Domain
#### `SpecShowcase.jsx`
- **Path**: `src/pages/SpecShowcase.jsx`
- **Size**: 5.67 KB
- **Primary Functions**: SpecShowcasePage, RenderSpecComponent

#### `StockPage.jsx`
- **Path**: `src/pages/StockPage.jsx`
- **Size**: 35.78 KB
- **Type**: Stateful React Component.
- **Network**: Directly interfaces with backend APIs.
- **Visualization**: Renders dynamic Recharts graphs.
- **Primary Functions**: StockPageHeader, TraderPanel, InvestorPanel, StockPage, normalizeSymbol

### 📁 COMPONENTS Domain
#### `ContactForm.jsx`
- **Path**: `src/pages/support/components/ContactForm.jsx`
- **Size**: 3.91 KB
- **Type**: Stateful React Component.
- **Primary Functions**: ContactForm, handleChange, handleSubmit

#### `ContactInfo.jsx`
- **Path**: `src/pages/support/components/ContactInfo.jsx`
- **Size**: 2.24 KB
- **Primary Functions**: ContactInfo

#### `FAQAccordion.jsx`
- **Path**: `src/pages/support/components/FAQAccordion.jsx`
- **Size**: 3.47 KB
- **Type**: Stateful React Component.
- **Primary Functions**: FAQAccordion, toggleAccordion

#### `FaqItem.jsx`
- **Path**: `src/pages/support/components/FaqItem.jsx`
- **Size**: 1.12 KB
- **Primary Functions**: FaqItem

#### `FeedbackForm.jsx`
- **Path**: `src/pages/support/components/FeedbackForm.jsx`
- **Size**: 4.30 KB
- **Type**: Stateful React Component.
- **Primary Functions**: FeedbackForm, handleRatingChange, handleChange, handleSubmit

#### `IssueModal.jsx`
- **Path**: `src/pages/support/components/IssueModal.jsx`
- **Size**: 4.59 KB
- **Type**: Stateful React Component.
- **Primary Functions**: IssueModal, handleChange, resetModal, handleClose, handleSubmit

#### `StatusIndicator.jsx`
- **Path**: `src/pages/support/components/StatusIndicator.jsx`
- **Size**: 0.39 KB
- **Primary Functions**: StatusIndicator

#### `TermTooltip.jsx`
- **Path**: `src/pages/support/components/TermTooltip.jsx`
- **Size**: 0.41 KB
- **Primary Functions**: TermTooltip

### 📁 SUPPORT Domain
#### `HelpSupportPage.jsx`
- **Path**: `src/pages/support/HelpSupportPage.jsx`
- **Size**: 1.97 KB
- **Primary Functions**: HelpSupportPage, handleBackToDashboard

#### `SupportPage.jsx`
- **Path**: `src/pages/support/SupportPage.jsx`
- **Size**: 13.02 KB
- **Type**: Stateful React Component.
- **Primary Functions**: SupportPage, openIssueModal, signOut

### 📁 PAGES Domain
#### `TraderDashboard.jsx`
- **Path**: `src/pages/TraderDashboard.jsx`
- **Size**: 130.26 KB
- **Type**: Stateful React Component.
- **Visualization**: Renders dynamic Recharts graphs.
- **Primary Functions**: ResearchView, getBiasMeta, getImpactColor, formatSignedPercent, formatVolumeStatus

### 📁 COMPONENTS Domain
#### `InsightCard.jsx`
- **Path**: `src/pages/traderProfile/components/InsightCard.jsx`
- **Size**: 0.31 KB
- **Primary Functions**: InsightCard

#### `MetricsCard.jsx`
- **Path**: `src/pages/traderProfile/components/MetricsCard.jsx`
- **Size**: 0.37 KB
- **Primary Functions**: MetricsCard

#### `ProfileHeader.jsx`
- **Path**: `src/pages/traderProfile/components/ProfileHeader.jsx`
- **Size**: 0.73 KB
- **Primary Functions**: ProfileHeader

#### `RiskBar.jsx`
- **Path**: `src/pages/traderProfile/components/RiskBar.jsx`
- **Size**: 0.49 KB
- **Primary Functions**: RiskBar

#### `TimelineItem.jsx`
- **Path**: `src/pages/traderProfile/components/TimelineItem.jsx`
- **Size**: 0.58 KB
- **Primary Functions**: TimelineItem

### 📁 TRADERPROFILE Domain
#### `mockProfileData.js`
- **Path**: `src/pages/traderProfile/mockProfileData.js`
- **Size**: 1.57 KB

#### `TraderProfilePage.jsx`
- **Path**: `src/pages/traderProfile/TraderProfilePage.jsx`
- **Size**: 7.16 KB
- **Type**: Stateful React Component.
- **Network**: Directly interfaces with backend APIs.
- **Primary Functions**: TraderProfilePage, fetchQuotes

### 📁 PAGES Domain
#### `TraderStockPage.jsx`
- **Path**: `src/pages/TraderStockPage.jsx`
- **Size**: 30.40 KB
- **Type**: Stateful React Component.
- **Network**: Directly interfaces with backend APIs.
- **Primary Functions**: TraderStockPage, Card, Lbl, Bar, Spark

#### `TradeTerminalPage.jsx`
- **Path**: `src/pages/TradeTerminalPage.jsx`
- **Size**: 21.68 KB
- **Type**: Stateful React Component.
- **Network**: Directly interfaces with backend APIs.
- **Primary Functions**: TradeTerminalPage, AntigravityCard

### 📁 SERVICES Domain
#### `apiHelpers.js`
- **Path**: `src/services/apiHelpers.js`
- **Size**: 6.14 KB
- **Network**: Directly interfaces with backend APIs.
- **Primary Functions**: fetchStocks, fetchStockDetails, fetchOHLCData, subscribeToLivePrices, placeOrder

### 📁 UTILS Domain
#### `currency.js`
- **Path**: `src/utils/currency.js`
- **Size**: 1.90 KB
- **Primary Functions**: isCryptoAsset, getCurrencySymbol, formatPrice

#### `traderLogic.js`
- **Path**: `src/utils/traderLogic.js`
- **Size**: 2.27 KB
- **Primary Functions**: calculateTradeScore, getSignalTags, calculateTradeLevels, generateAIInsight, calculateRSI


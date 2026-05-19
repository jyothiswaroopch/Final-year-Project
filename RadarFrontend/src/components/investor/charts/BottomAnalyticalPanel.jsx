import React, { useState, useEffect } from 'react';
import { 
  Bell, Activity, BarChart3, Clock, Newspaper, 
  ChevronRight, TrendingUp, TrendingDown, Info, 
  ChevronsUpDown, Sliders, ChevronLeft, CandlestickChart, 
  Bookmark, AlertCircle, Zap, HelpCircle, Search, Building2,
  Database, ShieldCheck, TrendingUp as TrendingUpIcon,
  Target, Users, AlertTriangle
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, 
  ComposedChart, Legend 
} from 'recharts';
import api from '../../../api/api';
import { fetchMarketHistory, fetchMarketData } from '../../../api/marketApi';
import '../../../pages/InvestorStockPage.css';

const METRIC_DESCRIPTIONS = {
    'Valuation Metrics': 'Key ratios used to determine if a stock is fairly priced, undervalued, or overvalued.',
    'Profitability': 'Metrics measuring the company\'s ability to generate earnings relative to its revenue, operating costs, and balance sheet assets.',
    'Growth Profile': 'Historical performance indicators showing the expansion of revenue, profit, and earnings over time.',
    'Financial Health': 'Indicators of the company\'s solvency, liquidity, and ability to manage debt obligations.',
    'Shareholder Metrics': 'Data points specific to shareholder value, including earnings per share and dividend yields.',
    'Peer Comparison': 'Relative analysis comparing company performance against industry-wide averages.',
    'ROE': 'Return on Equity, measuring profitability relative to shareholder equity.',
    'Debt to Equity': 'Ratio of total liabilities to shareholder equity.',
    'Revenue Growth': 'Yearly revenue expansion comparison.',
    'Profit Margin': 'Net efficiency in converting revenue to profit.'
};

const INSIGHTS_TOOLTIPS = {
  trendSignals: "Analysis of price trajectory using moving average crossovers and price action patterns.",
  momentumSignals: "Measures the velocity of price changes to identify overbought/oversold conditions and trend strength.",
  volatilityRisk: "Evaluates price fluctuations and potential risk using ATR and Standard Deviation metrics.",
  keyLevels: "Identification of major support and resistance zones based on historical volume and price pivots.",
  volumeInsights: "Analyzes trading volume relative to historical averages to confirm trend conviction.",
  priceBehavior: "Deep dive into intraday price patterns, gaps, and structural formation.",
  marketParticipation: "Estimates the balance between institutional and retail activity based on delivery data.",
  trendAlignment: "Checks if the current trend is consistent across different timeframes (Synchronization).",
  signalConsistency: "Measures how reliably signals have been sustained over recent trading sessions.",
  riskAlerts: "Critical warnings regarding overextension, liquidity, or extreme volatility.",
  recentChanges: "Chronological log of major technical milestones and signal triggers.",
  indicatorDetail: "Specific technical metric used to analyze current price behavior and momentum.",
  financialPerformance: "Historical revenue and profit trends over multiple business cycles.",
  newsImpact: "Analysis of recent news events and their projected impact on stock performance."
};

const FUNDAMENTALS_TOOLTIPS = {
  companyFundamentals: "Core financial metrics including market capitalization, P/E ratio, and operational efficiency.",
  detailedAnalysis: "Deep dive into valuation, profitability, and growth profiles relative to industry peers.",
  valuationMetrics: "Metrics evaluating the stock price relative to earnings, book value, and cash flow.",
  profitability: "Measures of how effectively the company generates profit relative to equity and revenue.",
  growthProfile: "Analysis of revenue and earnings expansion over multiple timeframes.",
  financialHealth: "Assessment of capital structure, debt levels, and short-term liquidity.",
  shareholderMetrics: "Data relevant to investors including dividends, earnings per share, and book value.",
  peerComparison: "Benchmarks the company against its closest industry competitors across key ratios."
};

const BottomAnalyticalPanel = ({ symbol, isDark }) => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [finTab, setFinTab] = useState('Revenue');
  const [finPeriod, setFinPeriod] = useState('Yearly');
  const [financialData, setFinancialData] = useState(null);
  const [newsImpactData, setNewsImpactData] = useState(null);
  const [quoteData, setQuoteData] = useState(null);
  const [insightsData, setInsightsData] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const [term, setTerm] = useState('medium');
  const [assetType, setAssetType] = useState('STOCK');
  const isCrypto = ['CRYPTO', 'CRYPTOCURRENCY'].includes(assetType);
  const currencyPrefix = isCrypto ? '$' : '₹';

  // --- Fetch Insights ---
  useEffect(() => {
    const fetchInsights = async () => {
      if (activeTab !== 'Signals') return;
      setInsightsLoading(true);
      try {
        const response = await fetch(`/api/stocks/${symbol}/signals?term=${term}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const resData = await response.json();
        if (resData.success) setInsightsData(resData.data);
      } catch (err) {
        console.error("Failed to fetch insights:", err);
      } finally {
        setInsightsLoading(false);
      }
    };
    fetchInsights();
  }, [symbol, term, activeTab]);

  // --- Fetch Main Metrics ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingMetrics(true);
        const INDEX_MAP = { 'NIFTY': '^NSEI', 'SENSEX': '^BSESN', 'BANKNIFTY': '^NSEBANK' };
        const baseSymbol = INDEX_MAP[symbol.toUpperCase()] || symbol;
        const activeSymbol = (baseSymbol.includes('.') || baseSymbol.includes('^') || isCrypto) ? baseSymbol : `${baseSymbol}.NS`;
        
        const [finRes, newsRes, quoteRes] = await Promise.allSettled([
          api.get(`/stocks/financials?symbol=${activeSymbol}`),
          api.get(`/stocks/news?symbol=${activeSymbol}`),
          api.get(`/market/quotes?symbols=${activeSymbol}`)
        ]);

        if (finRes.status === 'fulfilled') setFinancialData(finRes.value.data);
        if (newsRes.status === 'fulfilled') setNewsImpactData(newsRes.value.data);
        if (quoteRes.status === 'fulfilled') setQuoteData(quoteRes.value.data?.data?.[0]);

        // Detect asset type
        const mkt = await fetchMarketData({ search: activeSymbol });
        const item = Array.isArray(mkt) ? mkt[0] : mkt;
        if (item?.type) setAssetType(item.type.toUpperCase());

      } catch (err) {
        console.error("Failed to fetch analytical data:", err);
      } finally {
        setIsLoadingMetrics(false);
      }
    };
    fetchData();
  }, [symbol]);

  const getMetricData = () => {
    // If we have financialData, use it, otherwise return empty
    const data = financialData?.data || financialData;
    if (!data) return [];
    
    // For the side-by-side bar chart
    const rev = data.revenue || [];
    const prof = data.profit || [];
    
    return rev.map((d, i) => ({
      name: d.name,
      revenue: d.value,
      profit: prof[i]?.value || 0
    }));
  };

  const getFundamentalsList = () => {
    const data = financialData?.data || financialData;
    if (data?.fundamentals && data.fundamentals.length > 0) {
      return data.fundamentals;
    }

    // Fallback to quoteData if fundamentals array is missing
    if (!quoteData) return [];

    return [
      { name: 'Market Cap', value: quoteData.marketCap ? `₹${(quoteData.marketCap / 10000000).toLocaleString('en-IN', { maximumFractionDigits: 0 })} Cr` : '—', hint: 'Company Size' },
      { name: 'P/E Ratio', value: quoteData.pe?.toFixed(2) || '—', hint: 'Valuation' },
      { name: 'ROE', value: quoteData.roe ? `${quoteData.roe.toFixed(1)}%` : '15.4%', hint: 'Profitability' },
      { name: 'ROCE', value: quoteData.roce ? `${quoteData.roce.toFixed(1)}%` : '18.2%', hint: 'Capital Efficiency' },
      { name: 'Debt to Equity', value: quoteData.debtToEquity ? Number(quoteData.debtToEquity).toFixed(2) : '0.23', hint: 'Leverage' },
      { name: 'Dividend Yield', value: quoteData.dividendYield ? `${quoteData.dividendYield.toFixed(2)}%` : '0.45%', hint: 'Yield' },
      { name: 'Revenue Growth', value: quoteData.revenueGrowth ? `${quoteData.revenueGrowth}%` : '12.4%', hint: 'YoY' },
      { name: 'Profit Margin', value: quoteData.profitMargins ? `${quoteData.profitMargins}%` : '14.2%', hint: 'Efficiency' },
      { name: 'Book Value', value: quoteData.bookValue || '412.50', hint: 'Intrinsic' },
      { name: 'Price to Book', value: quoteData.priceToBook?.toFixed(2) || '1.45', hint: 'Asset Multiplier' },
      { name: 'Face Value', value: quoteData.faceValue || '10.00', hint: 'Par Value' },
      { name: 'EPS (TTM)', value: quoteData.eps?.toFixed(2) || '54.20', hint: 'Earnings per Share' },
      { name: 'PEG Ratio', value: quoteData.pegRatio || '0.92', hint: 'Growth Adjusted' },
      { name: 'Current Ratio', value: quoteData.currentRatio || '2.45', hint: 'Liquidity' },
      { name: 'Int. Coverage', value: quoteData.interestCoverage || '14.2', hint: 'Solvency' },
      { name: 'Beta', value: quoteData.beta?.toFixed(2) || '1.20', hint: 'Volatility' }
    ];
  };

  const themeClass = isDark ? 'investor-theme-dark' : 'investor-theme-light';

  return (
    <div className={`bottom-analytical-panel p-6 ${themeClass}`}>
      <div className="stock-tabs-nav mb-6">
        {['Overview', 'Fundamentals', 'Signals'].map(tab => (
          <button 
            key={tab} 
            className={`stock-tab-btn ${activeTab === tab ? 'active' : ''} ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500'}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
            {activeTab === tab && <div className="active-tab-line"></div>}
          </button>
        ))}
      </div>

      <div className="tab-content transition-all duration-300">
        {activeTab === 'Overview' && (
          <div className="overview-section animate-fade-in">
            {/* Price Overview Component */}
            <div className="price-overview-fintech mb-8">
                <div className={`po-container-card shadow-premium ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white'}`}>
                  <div className="po-header-row">
                    <div className="po-title-group">
                      <h3 className={`po-main-title ${isDark ? 'text-white' : 'text-slate-800'}`}>Price Overview</h3>
                      <Info size={14} className="po-info-icon" />
                    </div>
                    <div className="po-badge-tag">Trading near upper range</div>
                  </div>
                  
                  <div className="po-ranges-stack">
                    <div className="po-range-item">
                      <div className="po-range-header">
                        <span className="po-range-label">Today's Range</span>
                      </div>
                      <div className="po-visual-track-wrap">
                        <span className="po-limit-price">{currencyPrefix}{(financialData?.data?.stats?.dayLow || (quoteData?.price || 0) * 0.98).toFixed(2)}</span>
                        <div className="po-track-main today-gradient relative h-1.5 flex-1 mx-4 bg-slate-100 rounded-full">
                          <div className="absolute top-0 bottom-0 left-0 right-0 bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-500 opacity-80 rounded-full" />
                          <div className="po-marker-assembly absolute -top-1" style={{ left: '50%' }}>
                            <div className="po-floating-price absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white shadow-md border border-slate-100 px-2 py-1 rounded text-[10px] font-black z-10">
                              {currencyPrefix}{(quoteData?.price || 0).toFixed(2)} • Current
                            </div>
                            <div className="po-marker-v-line w-[2px] h-3 bg-slate-900 mx-auto" />
                            <div className="po-marker-dot w-2 h-2 bg-slate-900 rounded-full mx-auto -mt-1 ring-2 ring-white" />
                          </div>
                        </div>
                        <span className="po-limit-price">{currencyPrefix}{(financialData?.data?.stats?.dayHigh || (quoteData?.price || 0) * 1.02).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="po-range-item mt-6">
                      <div className="po-range-header flex justify-between">
                        <span className="po-range-label">52 Week Range</span>
                        <span className="text-[10px] font-black text-emerald-600 uppercase">Near 52W High</span>
                      </div>
                      <div className="po-visual-track-wrap mt-2">
                        <span className="po-limit-price">{currencyPrefix}{(financialData?.data?.stats?.low52w || (quoteData?.price || 0) * 0.7).toFixed(2)}</span>
                        <div className="po-track-main relative h-1.5 flex-1 mx-4 bg-blue-50 rounded-full overflow-hidden">
                           <div className="absolute inset-0 bg-gradient-to-r from-blue-100 via-blue-300 to-blue-500 opacity-40" />
                           <div className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white" style={{ left: '70%' }} />
                        </div>
                        <span className="po-limit-price">{currencyPrefix}{(financialData?.data?.stats?.high52w || (quoteData?.price || 0) * 1.3).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="po-stats-row-fintech grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                    {[
                      { label: 'Open', val: (financialData?.data?.stats?.open || quoteData?.price || 0).toFixed(2), icon: Clock, color: 'blue' },
                      { label: 'Prev Close', val: (quoteData?.price && quoteData?.change ? (quoteData.price - quoteData.change).toFixed(2) : '—'), icon: TrendingUp, color: 'green' },
                      { label: 'Volume', val: quoteData?.volume?.toLocaleString('en-IN') || '—', icon: Activity, color: 'purple' },
                      { label: 'Market Cap', val: quoteData?.marketCap ? `${(quoteData.marketCap / 10000000).toLocaleString('en-IN', { maximumFractionDigits: 0 })} Cr` : '—', icon: ShieldCheck, color: 'orange' },
                    ].map((stat, i) => (
                      <div key={i} className={`po-stat-card-luxury p-4 rounded-2xl flex items-center gap-3 ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                        <div className={`ps-icon-circle w-10 h-10 rounded-full flex items-center justify-center bg-${stat.color}-50 text-${stat.color}-500 shadow-sm`}><stat.icon size={16} /></div>
                        <div className="ps-data flex flex-col">
                          <span className="ps-label text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
                          <span className={`ps-value font-black text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>{stat.val}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
            </div>

            <div className="key-metrics-compact-row grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
              {[
                { label: 'Market Cap', val: quoteData?.marketCap ? `₹${(quoteData.marketCap / 10000000).toLocaleString('en-IN', { maximumFractionDigits: 0 })} Cr` : 'N/A', tag: quoteData?.marketCap > 200000000000 ? 'Large Cap' : 'Mid Cap', hint: 'Company Size', type: 'neutral' },
                { label: 'P/E Ratio', val: quoteData?.pe ? quoteData.pe.toString() : 'N/A', tag: quoteData?.valStatus || 'Fair Value', hint: 'Trailing 12m', type: quoteData?.valStatus === 'undervalued' ? 'green' : 'neutral' },
                { label: 'ROE', val: quoteData?.roe ? `${quoteData.roe}%` : 'N/A', tag: quoteData?.roe > 15 ? 'Strong' : 'Average', hint: 'Consistent returns', type: quoteData?.roe > 15 ? 'green' : 'neutral' },
                { label: 'Debt to Equity', val: quoteData?.debtToEquity != null ? Number(quoteData.debtToEquity).toFixed(2) : 'N/A', tag: quoteData?.debtToEquity < 1 ? 'Low Risk' : 'High Risk', hint: 'Capital Structure', type: quoteData?.debtToEquity < 1 ? 'green' : 'red' },
                { label: 'Revenue Growth', val: quoteData?.revenueGrowth != null ? `${Number(quoteData.revenueGrowth).toFixed(1)}%` : 'N/A', tag: quoteData?.revenueGrowth > 10 ? 'High Growth' : 'Stable', hint: 'YoY Growth', type: quoteData?.revenueGrowth > 10 ? 'green' : 'neutral' },
                { label: 'Profit Margin', val: quoteData?.profitMargins != null ? `${Number(quoteData.profitMargins).toFixed(1)}%` : 'N/A', tag: quoteData?.profitMargins > 10 ? 'Healthy' : 'Average', hint: 'Post-tax earnings', type: quoteData?.profitMargins > 10 ? 'green' : 'neutral' },
              ].map((m, i) => (
                <div key={i} className={`km-card p-4 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm`}>
                  <span className="km-label text-[10px] font-bold text-slate-400 block mb-2 uppercase tracking-tight">{m.label}</span>
                  <div className="km-val-box flex flex-col gap-1">
                    <span className={`km-value text-lg font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{m.val}</span>
                    <span className={`km-status text-[9px] font-black w-fit px-2 py-0.5 rounded-md tag-${m.type}`}>{m.tag}</span>
                  </div>
                  <span className="km-hint text-[10px] font-medium text-slate-400 mt-2 block">{m.hint}</span>
                </div>
              ))}
            </div>

            <div className="radar-layout-stack space-y-6">
              <div className={`radar-card about-company-row p-6 rounded-3xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm flex flex-col md:flex-row justify-between items-start gap-8`}>
                <div className="about-col-text flex-1">
                  <div className="rc-title-row flex items-center gap-2 mb-4">
                    <Building2 className="rc-icon text-blue-500" size={20} />
                    <h3 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>About {symbol}</h3>
                  </div>
                  <p className={`about-text-clean text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {financialData?.data?.description || `${symbol} is an equity instrument listed on the exchange. Detailed company profiling and business operations data is currently being synced from the latest regulatory filings.`}
                  </p>
                </div>
                <div className="about-col-meta grid grid-cols-2 gap-x-8 gap-y-4 min-w-[240px]">
                   {[
                     { label: 'Sector', val: quoteData?.sector || 'Equity' },
                     { label: 'Industry', val: quoteData?.industry || 'Services' },
                     { label: 'ISIN', val: financialData?.data?.isin || '—' },
                     { label: 'Last Update', val: new Date().toLocaleDateString() },
                   ].map((item, i) => (
                     <div key={i} className="meta-item">
                       <span className="text-[10px] font-bold text-slate-400 uppercase block">{item.label}</span>
                       <span className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{item.val}</span>
                     </div>
                   ))}
                </div>
              </div>

              <div className="radar-quad-grid grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-fr">
                {/* 1. Financial Performance */}
                <div className={`radar-card p-6 rounded-3xl border flex flex-col h-full ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm`}>
                  <div className="rc-header flex flex-col mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>Financial Performance</h3>
                      <div className="flex items-center gap-3">
                        <div className="fin-period-toggles flex bg-slate-100 p-1 rounded-xl">
                          {['Quarterly', 'Yearly'].map(p => (
                            <button 
                              key={p} 
                              onClick={() => setFinPeriod(p)} 
                              className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all ${finPeriod === p ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                        <span className="text-[10px] font-bold text-blue-600 cursor-pointer hover:underline flex items-center gap-1">
                          All Financials <ChevronRight size={12} />
                        </span>
                      </div>
                    </div>

                    <div className="fin-summary-display flex gap-8">
                       <div className="fs-item">
                         <div className="flex items-center gap-2 mb-1">
                           <div className="w-2 h-2 rounded-full bg-slate-300" />
                           <span className="text-[10px] font-bold text-slate-400 uppercase">REVENUE (CR)</span>
                         </div>
                         <div className="flex items-baseline gap-2">
                           <span className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>
                             {currencyPrefix}{financialData?.data?.revenue?.[financialData?.data?.revenue?.length - 1]?.value?.toLocaleString('en-IN') || '—'}
                           </span>
                           <span className="text-[10px] font-black text-emerald-500">+12.5%</span>
                         </div>
                       </div>
                       <div className="fs-item">
                         <div className="flex items-center gap-2 mb-1">
                           <div className="w-2 h-2 rounded-full bg-emerald-500" />
                           <span className="text-[10px] font-bold text-slate-400 uppercase">PROFIT (CR)</span>
                         </div>
                         <div className="flex items-baseline gap-2">
                           <span className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>
                             {currencyPrefix}{financialData?.data?.profit?.[financialData?.data?.profit?.length - 1]?.value?.toLocaleString('en-IN') || '—'}
                           </span>
                           <span className="text-[10px] font-black text-emerald-500">+8.2%</span>
                         </div>
                       </div>
                    </div>
                  </div>
                  
                  <div className="rc-content flex-1 min-h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getMetricData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#f1f5f9'} />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} 
                        />
                        <YAxis 
                          orientation="right"
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }}
                        />
                        <Tooltip 
                          cursor={{ fill: 'transparent' }}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px' }} 
                        />
                        <Bar dataKey="revenue" fill={isDark ? '#475569' : '#cbd5e1'} radius={[4, 4, 0, 0]} barSize={35} />
                        <Bar dataKey="profit" fill="#10b981" radius={[4, 4, 0, 0]} barSize={35} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 2. News & Impact */}
                <div className={`radar-card p-6 rounded-3xl border flex flex-col h-full ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm`}>
                  <div className="rc-header flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                      <Zap size={18} className="text-blue-500" />
                      <h3 className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>News & Impact</h3>
                    </div>
                    <div className="info-trigger-s">
                      <Info size={15} className="text-slate-300 cursor-help" />
                      <div className="ft-dropdown-s">{INSIGHTS_TOOLTIPS.newsImpact}</div>
                    </div>
                  </div>
                  <div className="rc-content flex-1 space-y-6">
                    {(newsImpactData?.data?.newsImpact || []).slice(0, 2).map((n, i) => (
                      <div key={i} className="news-impact-item">
                        <span className={`ni-tag text-[10px] font-black px-2 py-1 rounded bg-blue-50 text-blue-600 uppercase`}>{n.category.toUpperCase()}</span>
                        <div className="news-impact-points mt-3 space-y-2">
                          {(n.points || []).slice(0, 2).map((p, pi) => (
                            <div key={pi} className="ni-interpretation flex items-start gap-2">
                              <div className="ni-dot w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                              <span className={`text-[13px] font-medium leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{p}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    {(!newsImpactData?.data?.newsImpact || newsImpactData.data.newsImpact.length === 0) && (
                      <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2 opacity-50">
                        <Newspaper size={32} />
                        <p className="text-[10px] font-bold uppercase">No recent news impact detected</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Things to Note and 4. Long-Term Signals removed as requested */}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Fundamentals' && (
          <div className="fundamentals-tab-rich animate-fade-in p-2 space-y-12">
            {/* Top snapshot section */}
            <div className={`ft-main-snapshot-card p-8 rounded-[32px] border shadow-premium ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                <div className="ft-header-row-snap flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <Activity size={24} className="text-blue-600" />
                    <h2 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>Company Fundamentals</h2>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">All figures in ₹ Cr unless specified</span>
                    <div className="info-trigger-s">
                      <Info size={15} className="text-slate-300 cursor-help" />
                      <div className="ft-dropdown-s">{FUNDAMENTALS_TOOLTIPS.companyFundamentals}</div>
                    </div>
                  </div>
                </div>
                <div className="ft-rich-table-grid grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                  <div className="ft-table-side space-y-4">
                    {getFundamentalsList().slice(0, 8).map((m, i) => (
                      <div key={i} className="ft-table-row-item flex justify-between items-center py-3 border-b border-slate-50/50">
                        <span className="ft-row-label text-xs font-bold text-slate-500">{m.name}</span>
                        <div className="flex flex-col items-end">
                           <span className={`ft-val-bold font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{m.value}</span>
                           {m.hint && <span className="text-[9px] font-bold text-slate-400 uppercase">{m.hint}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="ft-table-side space-y-4">
                    {getFundamentalsList().slice(8, 16).map((m, i) => (
                      <div key={i} className="ft-table-row-item flex justify-between items-center py-3 border-b border-slate-50/50">
                        <span className="ft-row-label text-xs font-bold text-slate-500">{m.name}</span>
                        <div className="flex flex-col items-end">
                          <span className={`ft-val-bold font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{m.value}</span>
                          {m.hint && <span className="text-[9px] font-bold text-slate-400 uppercase">{m.hint}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
            </div>

            {/* Detailed Analysis section matching Image 2 */}
            <div className="detailed-analysis-section">
                <div className="ft-detailed-header mb-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <TrendingUpIcon size={24} className="text-blue-500" />
                      <h2 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>Detailed Analysis</h2>
                    </div>
                    <div className="info-trigger-s">
                      <Info size={15} className="text-slate-300 cursor-help" />
                      <div className="ft-dropdown-s">{FUNDAMENTALS_TOOLTIPS.detailedAnalysis}</div>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-slate-400 mt-2">Granular breakdown of financial metrics and competitive standing.</p>
                </div>

                <div className="ft-detailed-layout-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                   {/* 1. Valuation Metrics */}
                   <div className={`fac-card p-5 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm`}>
                      <div className="fac-header flex items-center justify-between mb-6">
                        <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider">Valuation Metrics</span>
                        <div className="info-trigger-s">
                          <Info size={14} className="text-slate-300 cursor-help" />
                          <div className="ft-dropdown-s">{FUNDAMENTALS_TOOLTIPS.valuationMetrics}</div>
                        </div>
                      </div>
                      <div className="fac-list space-y-4">
                        {[
                          { n: 'P/E (TTM)', v: quoteData?.pe?.toFixed(2) || '—', sub: 'Trailing 12-month earnings', t: 'emerald' },
                          { n: 'Price to Book', v: quoteData?.priceToBook?.toFixed(2) || '—', sub: 'Fair relative to assets' },
                          { n: 'EV / EBITDA', v: quoteData?.evToEbitda?.toFixed(2) || '—', sub: 'Good cash flow proxy' },
                          { n: 'Beta', v: quoteData?.beta?.toFixed(2) || '—', sub: 'Market sensitivity' },
                        ].map((m, i) => (
                          <div key={i} className="fac-item">
                            <div className="flex justify-between items-baseline mb-1">
                               <span className="text-[10px] font-black text-slate-400">{m.n}</span>
                               <span className={`text-xs font-black ${m.t ? `text-${m.t}-500` : (isDark ? 'text-white' : 'text-slate-800')}`}>{m.v}</span>
                            </div>
                            <span className="text-[9px] font-bold text-slate-300 block">{m.sub}</span>
                          </div>
                        ))}
                      </div>
                   </div>

                   {/* 2. Profitability */}
                   <div className={`fac-card p-5 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm`}>
                      <div className="fac-header flex items-center justify-between mb-6">
                        <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider">Profitability</span>
                        <div className="info-trigger-s">
                          <Info size={14} className="text-slate-300 cursor-help" />
                          <div className="ft-dropdown-s">{FUNDAMENTALS_TOOLTIPS.profitability}</div>
                        </div>
                      </div>
                      <div className="fac-list space-y-4">
                        {[
                          { n: 'ROE', v: `${quoteData?.roe?.toFixed(1) || '—'}%`, sub: 'Efficient equity usage', t: 'emerald' },
                          { n: 'Operating Margin', v: `${quoteData?.operatingMargins?.toFixed(1) || '—'}%`, sub: 'Core business efficiency' },
                          { n: 'Net Profit Margin', v: `${quoteData?.profitMargins?.toFixed(1) || '—'}%`, sub: 'Final post-tax margin' },
                          { n: 'Beta', v: quoteData?.beta?.toFixed(2) || '—', sub: '5-yr monthly vs market' },
                        ].map((m, i) => (
                          <div key={i} className="fac-item">
                            <div className="flex justify-between items-baseline mb-1">
                               <span className="text-[10px] font-black text-slate-400">{m.n}</span>
                               <span className="text-xs font-black text-slate-800">{m.v}</span>
                            </div>
                            <span className="text-[9px] font-bold text-slate-300 block">{m.sub}</span>
                          </div>
                        ))}
                      </div>
                   </div>

                   {/* 3. Growth Profile */}
                   <div className={`fac-card p-5 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm`}>
                      <div className="fac-header flex items-center justify-between mb-6">
                        <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider">Growth Profile</span>
                        <div className="info-trigger-s">
                          <Info size={14} className="text-slate-300 cursor-help" />
                          <div className="ft-dropdown-s">{FUNDAMENTALS_TOOLTIPS.growthProfile}</div>
                        </div>
                      </div>
                      <div className="fac-list space-y-4">
                        {[
                          { n: 'Rev Growth (3Y)', v: `${quoteData?.revenueGrowth?.toFixed(1) || '—'}%`, sub: 'YoY Revenue CAGR' },
                          { n: 'EPS Growth', v: `${quoteData?.epsGrowth?.toFixed(1) || '—'}%`, sub: 'Consistent per-share gain' },
                          { n: 'Profit Margin', v: `${quoteData?.profitMargins?.toFixed(1) || '—'}%`, sub: 'Bottom-line expansion' },
                        ].map((m, i) => (
                          <div key={i} className="fac-item">
                            <div className="flex justify-between items-baseline mb-1">
                               <span className="text-[10px] font-black text-slate-400">{m.n}</span>
                               <span className="text-xs font-black text-slate-800">{m.v}</span>
                            </div>
                            <span className="text-[9px] font-bold text-slate-300 block">{m.sub}</span>
                          </div>
                        ))}
                      </div>
                   </div>

                   {/* 4. Financial Health */}
                   <div className={`fac-card p-5 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm`}>
                      <div className="fac-header flex items-center justify-between mb-6">
                        <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider">Financial Health</span>
                        <div className="info-trigger-s">
                          <Info size={14} className="text-slate-300 cursor-help" />
                          <div className="ft-dropdown-s">{FUNDAMENTALS_TOOLTIPS.financialHealth}</div>
                        </div>
                      </div>
                      <div className="fac-list space-y-4">
                        {[
                          { n: 'Debt to Equity', v: quoteData?.debtToEquity?.toFixed(2) || '—', sub: 'Prudent debt management' },
                          { n: 'Int. Coverage', v: quoteData?.interestCoverage?.toFixed(1) || '—', sub: 'Safe interest repayments' },
                          { n: 'Current Ratio', v: quoteData?.currentRatio?.toFixed(2) || '—', sub: 'Optimal liquidity profile' },
                        ].map((m, i) => (
                          <div key={i} className="fac-item">
                            <div className="flex justify-between items-baseline mb-1">
                               <span className="text-[10px] font-black text-slate-400">{m.n}</span>
                               <span className="text-xs font-black text-slate-800">{m.v}</span>
                            </div>
                            <span className="text-[9px] font-bold text-slate-300 block">{m.sub}</span>
                          </div>
                        ))}
                      </div>
                   </div>

                   {/* 5. Shareholder Metrics */}
                   <div className={`fac-card p-5 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm`}>
                      <div className="fac-header flex items-center justify-between mb-6">
                        <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider">Shareholder Metrics</span>
                        <div className="info-trigger-s">
                          <Info size={14} className="text-slate-300 cursor-help" />
                          <div className="ft-dropdown-s">{FUNDAMENTALS_TOOLTIPS.shareholderMetrics}</div>
                        </div>
                      </div>
                      <div className="fac-list space-y-4">
                        {[
                          { n: 'EPS (TTM)', v: quoteData?.eps?.toFixed(2) || '—', sub: 'Last 12 month earnings' },
                          { n: 'Dividend Yield', v: `${((quoteData?.dividendYield || 0) * 100).toFixed(2)}%`, sub: 'Annual yield percentage' },
                          { n: 'Book Value', v: quoteData?.bookValue?.toFixed(2) || '—', sub: 'Asset value per share' },
                        ].map((m, i) => (
                          <div key={i} className="fac-item">
                            <div className="flex justify-between items-baseline mb-1">
                               <span className="text-[10px] font-black text-slate-400">{m.n}</span>
                               <span className="text-xs font-black text-slate-800">{m.v}</span>
                            </div>
                            <span className="text-[9px] font-bold text-slate-300 block">{m.sub}</span>
                          </div>
                        ))}
                      </div>
                   </div>

                   {/* 6. Peer Comparison Card */}
                   <div className={`fac-card p-5 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm`}>
                      <div className="fac-header flex justify-between items-center mb-6">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider">Peer Comparison</span>
                          <span className="text-[9px] font-bold text-slate-400">Industry: {quoteData?.sector || 'Equity'}</span>
                        </div>
                        <div className="info-trigger-s">
                          <Info size={14} className="text-slate-300 cursor-help" />
                          <div className="ft-dropdown-s">{FUNDAMENTALS_TOOLTIPS.peerComparison}</div>
                        </div>
                      </div>
                      <div className="peer-comp-table space-y-3">
                        <div className="pct-header flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">
                           <span>Metric</span>
                           <span>Company</span>
                           <span>Industry Avg</span>
                        </div>
                        {[
                          { n: 'P/E Ratio', c: quoteData?.pe?.toFixed(1) || '—', i: '—', t: 'rose' },
                          { n: 'ROE', c: `${quoteData?.roe?.toFixed(1) || '—'}%`, i: '—', t: 'emerald' },
                          { n: 'Profit Margin', c: `${quoteData?.profitMargins?.toFixed(1) || '—'}%`, i: '—', t: 'emerald' },
                          { n: 'Rev Growth', c: `${quoteData?.revenueGrowth?.toFixed(1) || '—'}%`, i: '—' },
                        ].map((m, idx) => (
                          <div key={idx} className="pct-row flex justify-between items-center py-1">
                             <span className="text-[10px] font-bold text-slate-500">{m.n}</span>
                             <span className={`text-[10px] font-black ${m.t ? `text-${m.t}-500` : 'text-slate-800'}`}>{m.c}</span>
                             <span className="text-[10px] font-black text-slate-400">{m.i}</span>
                          </div>
                        ))}
                      </div>
                   </div>
                </div>
            </div>
          </div>
        )}

        {activeTab === 'Signals' && (
          <div className="signals-tab-content animate-fade-in p-2">
            {/* Sentiment Section */}
            <div className={`overall-sentiment-summary-card p-8 rounded-[32px] border shadow-premium mb-8 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
              <div className="oss-header flex justify-between items-start mb-10">
                <div className="oss-title-group">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">CURRENT SENTIMENT</span>
                  <h2 className={`text-4xl font-black ${insightsData?.overallSentiment?.label?.toLowerCase().includes('bullish') ? 'text-green-500' : 'text-rose-500'}`}>
                    {insightsData?.overallSentiment?.label || 'Technical Neutral'}
                  </h2>
                </div>
                <div className="oss-score-box flex items-center gap-4">
                   <div className="flex flex-col items-end">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-slate-800">{insightsData?.overallSentiment?.score || '5.0'}</span>
                        <span className="text-sm font-bold text-slate-400">/10</span>
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Signal Strength</span>
                   </div>
                </div>
              </div>
              <div className="oss-gauge-container relative pt-4">
                <div className="oss-gauge-track bg-slate-100 rounded-full h-3 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-500 opacity-30" />
                  <div className="oss-gauge-marker bg-slate-900 w-[3px] h-full absolute top-0 z-10 shadow-[0_0_10px_rgba(0,0,0,0.5)]" style={{ left: `${insightsData?.overallSentiment?.value || 50}%` }}>
                    <div className="absolute -top-1 -left-[3px] w-2.5 h-2.5 bg-slate-900 rounded-full ring-2 ring-white" />
                  </div>
                </div>
              </div>
              <div className="oss-footer-insight mt-8 flex items-start gap-3 bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
                <div className="text-xl">✨</div>
                <p className={`text-sm font-semibold leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {insightsData?.overallSentiment?.insight || 'AI analysis is aggregating current technical patterns...'}
                </p>
              </div>
            </div>

            {/* Timeframe Toggles */}
            <div className="signal-timeframe-toggles mb-8 flex gap-4">
               {['Short Term', 'Medium Term', 'Long Term'].map(t => (
                 <button key={t} onClick={() => setTerm(t.split(' ')[0].toLowerCase())} className={`px-5 py-2.5 rounded-full text-[11px] font-black transition-all ${term === t.split(' ')[0].toLowerCase() ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
                   {t}
                 </button>
               ))}
            </div>

            {/* Signal Grid matching Image 3 layout */}
            <div className="signals-grid-main grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { cat: 'trendSignals', icon: TrendingUp, color: 'blue', label: 'Trend Signals' },
                { cat: 'momentumSignals', icon: Zap, color: 'amber', label: 'Momentum Signals' },
                { cat: 'volatilityRisk', icon: Activity, color: 'rose', label: 'Volatility & Risk' },
              ].map(({ cat, icon: Icon, color, label }) => (
                <div key={cat} className={`sig-category-card p-6 rounded-[24px] border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                  <div className="rc-header border-b border-slate-50 pb-4 mb-6 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                       <Icon size={18} className={`text-${color}-500`} />
                       <h3 className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{label}</h3>
                    </div>
                    <div className="info-trigger-s">
                      <Info size={15} className="text-slate-300 cursor-help" />
                      <div className="ft-dropdown-s">{INSIGHTS_TOOLTIPS[cat]}</div>
                    </div>
                  </div>
                  <div className="sig-list space-y-6">
                    {(insightsData?.[cat]?.items || []).map((s, i) => (
                      <div key={i} className="sig-item-card group">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className={`sig-name text-xs font-black ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>{s.name}</span>
                          <span className={`sig-badge text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider tag-${s.s}`}>{s.status}</span>
                        </div>
                        <p className="text-[11px] font-medium leading-relaxed text-slate-500">{s.imp}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* 4. Key Price Levels */}
              <div className={`sig-category-card p-6 rounded-[24px] border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                 <div className="rc-header border-b border-slate-50 pb-4 mb-6 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                       <BarChart3 size={18} className="text-blue-500" />
                       <h3 className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>Key Price Levels</h3>
                    </div>
                    <div className="info-trigger-s">
                      <Info size={15} className="text-slate-300 cursor-help" />
                      <div className="ft-dropdown-s">{INSIGHTS_TOOLTIPS.keyLevels}</div>
                    </div>
                 </div>
                 <div className="kl-visual-range py-4">
                    <div className="kl-track relative h-1 bg-slate-50 rounded-full">
                       {[
                         { l: 'S2', p: '15%', c: 'rose' },
                         { l: 'S1', p: '35%', c: 'amber' },
                         { l: 'R1', p: '75%', c: 'emerald' },
                         { l: 'R2', p: '90%', c: 'blue' },
                       ].map((m, i) => (
                         <div key={i} className="absolute -top-1 flex flex-col items-center" style={{ left: m.p }}>
                            <div className={`w-[2px] h-3 bg-${m.c}-500`} />
                            <span className="text-[8px] font-black text-slate-400 mt-2 uppercase">{m.l}</span>
                         </div>
                       ))}
                       <div className="absolute -top-4 -translate-x-1/2 flex flex-col items-center z-10" style={{ left: '60%' }}>
                          <span className="text-[10px] font-black text-blue-600 mb-1">{quoteData?.price?.toFixed(2)}</span>
                          <div className="w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white shadow-sm" />
                       </div>
                    </div>
                 </div>
              </div>

              {/* 5. Volume Insights */}
              <div className={`sig-category-card p-6 rounded-[24px] border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                 <div className="rc-header border-b border-slate-50 pb-4 mb-6 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                       <Activity size={18} className="text-emerald-500" />
                       <h3 className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>Volume Insights</h3>
                    </div>
                    <div className="info-trigger-s">
                      <Info size={15} className="text-slate-300 cursor-help" />
                      <div className="ft-dropdown-s">{INSIGHTS_TOOLTIPS.volumeInsights}</div>
                    </div>
                 </div>
                 <div className="vi-metrics-row flex gap-8 mb-6">
                    <div className="flex flex-col">
                       <span className="text-[10px] font-bold text-slate-400 uppercase mb-1">Volume vs Avg</span>
                       <span className="text-sm font-black text-slate-800">+12.5% <small className="text-emerald-500">UP</small></span>
                    </div>
                    <div className="flex flex-col">
                       <span className="text-[10px] font-bold text-slate-400 uppercase mb-1">Conviction</span>
                       <span className="text-sm font-black text-emerald-500 uppercase">Strong</span>
                    </div>
                 </div>
                 <p className="text-[11px] font-medium text-slate-500 leading-relaxed italic">"Volume is trending higher than its 20-day average, confirming price momentum."</p>
              </div>

              {/* 6. Price Behavior */}
              <div className={`sig-category-card p-6 rounded-[24px] border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                 <div className="rc-header border-b border-slate-50 pb-4 mb-6 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                       <Sliders size={18} className="text-indigo-500" />
                       <h3 className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>Price Behavior</h3>
                    </div>
                    <div className="info-trigger-s">
                      <Info size={15} className="text-slate-300 cursor-help" />
                      <div className="ft-dropdown-s">{INSIGHTS_TOOLTIPS.priceBehavior}</div>
                    </div>
                 </div>
                 <ul className="space-y-3">
                    {[
                      { l: 'Gap Activity', v: 'No Major Gaps', c: 'slate' },
                      { l: 'Volatility Rank', v: 'Low (Bottom 20%)', c: 'emerald' },
                      { l: 'Recent Range', v: 'Consolidating', c: 'blue' },
                    ].map((item, i) => (
                      <li key={i} className="flex justify-between text-[11px] font-bold">
                         <span className="text-slate-400">{item.l}</span>
                         <span className={`text-${item.c}-500`}>{item.val || item.v}</span>
                      </li>
                    ))}
                 </ul>
              </div>

              {/* 7. Market Participation */}
              <div className={`sig-category-card p-6 rounded-[24px] border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                 <div className="rc-header border-b border-slate-50 pb-4 mb-6 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                       <ShieldCheck size={18} className="text-blue-500" />
                       <h3 className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>Market Participation</h3>
                    </div>
                    <div className="info-trigger-s">
                      <Info size={15} className="text-slate-300 cursor-help" />
                      <div className="ft-dropdown-s">{INSIGHTS_TOOLTIPS.marketParticipation}</div>
                    </div>
                 </div>
                 <ul className="space-y-3">
                    {[
                      { l: 'Institutional Delivery', v: 'High (65%)', c: 'emerald' },
                      { l: 'Retail Interest', v: 'Moderate', c: 'blue' },
                    ].map((item, i) => (
                      <li key={i} className="flex justify-between text-[11px] font-bold">
                         <span className="text-slate-400">{item.l}</span>
                         <span className={`text-${item.c}-500`}>{item.v}</span>
                      </li>
                    ))}
                 </ul>
              </div>

              {/* 9. Signal Consistency */}
              <div className={`sig-category-card p-6 rounded-[24px] border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                 <div className="rc-header border-b border-slate-50 pb-4 mb-6 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                       <Clock size={18} className="text-slate-500" />
                       <h3 className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>Signal Consistency</h3>
                    </div>
                    <div className="info-trigger-s">
                      <Info size={15} className="text-slate-300 cursor-help" />
                      <div className="ft-dropdown-s">{INSIGHTS_TOOLTIPS.signalConsistency}</div>
                    </div>
                 </div>
                 <div className="sc-dots flex gap-2 mb-4">
                    {[1,1,1,1,1,0.5,1,1,1,1].map((s, i) => (
                      <div key={i} className={`w-2 h-2 rounded-full ${s === 1 ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                    ))}
                 </div>
                 <span className="text-xs font-black text-slate-800">95% Bullish Consistency</span>
              </div>

              {/* 10. Risk Alerts */}
              <div className={`sig-category-card p-6 rounded-[24px] border border-rose-100 bg-rose-50/20`}>
                 <div className="rc-header border-b border-rose-100 pb-4 mb-6 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                       <AlertCircle size={18} className="text-rose-500" />
                       <h3 className="text-sm font-black text-rose-800">Risk Alerts</h3>
                    </div>
                    <div className="info-trigger-s">
                      <Info size={15} className="text-rose-300 cursor-help" />
                      <div className="ft-dropdown-s">{INSIGHTS_TOOLTIPS.riskAlerts || "System warnings and potential risk factors detected."}</div>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <div className="flex gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                       <p className="text-[11px] font-medium text-rose-700">RSI is approaching overbought territory (72.5).</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BottomAnalyticalPanel;

import { useEffect, useMemo, useState, useRef } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/api';
import SupportHubPage from './support/SupportPage';
import HelpSupportPage from './support/HelpSupportPage';
import TradingSettingsPage from './settings/SettingsPage';
import './Profile.css';
import { 
    Bell, 
    MessageCircle, 
    ChevronRight, 
    Zap, 
    Activity, 
    ArrowLeft,
    TrendingUp,
    TrendingDown,
    BarChart3,
    Target,
    User as UserIcon, 
    Clock, 
    CheckCircle, 
    Shield, 
    AlertCircle,
    ArrowRight,
    LayoutDashboard,
    Star,
    Filter,
    Newspaper,
    Search,
    Settings,
    LogOut
} from 'lucide-react';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from 'recharts';

const toPayload = (value, fallback = null) => {
    if (value && typeof value === 'object' && Object.prototype.hasOwnProperty.call(value, 'data')) {
        return value.data ?? fallback;
    }
    return value ?? fallback;
};

const PageShell = ({ title, subtitle, children }) => (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h1 className="text-2xl font-black tracking-tight">{title}</h1>
                <p className="mt-2 text-sm text-slate-300">{subtitle}</p>
                <div className="mt-4">
                    <Link to="/dashboard" className="text-sm font-bold text-cyan-300 hover:text-cyan-200">Back to Dashboard</Link>
                </div>
            </div>
            {children}
        </div>
    </div>
);

const scheduleAsync = (fn) => {
    Promise.resolve().then(fn);
};

const pageMotion = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

const staggerMotion = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.08,
        },
    },
};

const cardMotion = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

export function VerifyEmailPage() {
    const location = useLocation();
    const token = useMemo(() => new URLSearchParams(location.search).get('token'), [location.search]);

    return (
        <PageShell
            title="Email Verification"
            subtitle="Confirm your email address to activate all account features."
        >
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <p className="text-sm">
                    {token
                        ? 'Verification token detected. Your email verification has been acknowledged.'
                        : 'No verification token found. Please open this page using the link from your email.'}
                </p>
            </div>
        </PageShell>
    );
}

export function ResetPasswordPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setMessage('');

        if (!email || !password) {
            setError('Email and new password are required.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setIsSubmitting(true);
        try {
            await api.post('/auth/reset-password', { email, password });
            setMessage('Password updated successfully. You can now log in.');
            setPassword('');
            setConfirmPassword('');
        } catch (submitError) {
            setError(submitError?.response?.data?.message || submitError?.response?.data?.error || 'Failed to reset password.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <PageShell
            title="Reset Password"
            subtitle="Set a new password for your account."
        >
            <form onSubmit={onSubmit} className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
                {error ? <div className="text-sm text-rose-300">{error}</div> : null}
                {message ? <div className="text-sm text-emerald-300">{message}</div> : null}

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-lg bg-slate-900 border border-white/10 px-3 py-2 text-sm"
                />
                <input
                    type="password"
                    placeholder="New Password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-lg bg-slate-900 border border-white/10 px-3 py-2 text-sm"
                />
                <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="w-full rounded-lg bg-slate-900 border border-white/10 px-3 py-2 text-sm"
                />

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-lg bg-cyan-400 text-slate-950 px-4 py-2 font-bold text-sm"
                >
                    {isSubmitting ? 'Updating...' : 'Update Password'}
                </button>
            </form>
        </PageShell>
    );
}

export function GlobalSearchPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const value = query.trim();
        if (!value) {
            setResults([]);
            return undefined;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const response = await api.get('/search', { params: { q: value } });
                const payload = toPayload(response.data, []);
                setResults(Array.isArray(payload) ? payload : []);
            } catch (_error) {
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    return (
        <PageShell
            title="Global Symbol Search"
            subtitle="Debounced search across stocks, crypto, and forex symbols."
        >
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
                <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search symbol or company name..."
                    className="w-full rounded-lg bg-slate-900 border border-white/10 px-3 py-2 text-sm"
                />
                {loading ? <div className="text-xs text-slate-400">Searching...</div> : null}
                <div className="space-y-2">
                    {results.map((row) => (
                        <div key={`${row.symbol}-${row.exchange}`} className="rounded-lg border border-white/10 p-3 text-sm">
                            <div className="font-black">{row.symbol}</div>
                            <div className="text-slate-300">{row.name}</div>
                            <div className="text-xs text-slate-400">{row.type || row.assetType} • {row.exchange}</div>
                        </div>
                    ))}
                </div>
            </div>
        </PageShell>
    );
}

export function DiscoveryPage() {
    const [bullFlags, setBullFlags] = useState([]);
    const [doubleBottoms, setDoubleBottoms] = useState([]);

    useEffect(() => {
        const load = async () => {
            const [bullRes, dblRes] = await Promise.all([
                api.get('/discovery/patterns/bull-flag').catch(() => ({ data: [] })),
                api.get('/discovery/patterns/double-bottom').catch(() => ({ data: [] })),
            ]);
            const bullPayload = toPayload(bullRes.data, []);
            const dblPayload = toPayload(dblRes.data, []);
            setBullFlags(Array.isArray(bullPayload) ? bullPayload : []);
            setDoubleBottoms(Array.isArray(dblPayload) ? dblPayload : []);
        };

        load();
    }, []);

    return (
        <PageShell
            title="Discovery"
            subtitle="Pattern highlights for Bull Flag and Double Bottom setups."
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                    <h2 className="font-black mb-3">Bull Flag</h2>
                    <ul className="space-y-2 text-sm">
                        {bullFlags.map((item) => <li key={item.symbol}>{item.symbol} - {item.name}</li>)}
                    </ul>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                    <h2 className="font-black mb-3">Double Bottom</h2>
                    <ul className="space-y-2 text-sm">
                        {doubleBottoms.map((item) => <li key={item.symbol}>{item.symbol} - {item.name}</li>)}
                    </ul>
                </div>
            </div>
        </PageShell>
    );
}

export function CalendarPage() {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        const load = async () => {
            const response = await api.get('/calendar/events').catch(() => ({ data: [] }));
            const payload = toPayload(response.data, []);
            setEvents(Array.isArray(payload) ? payload : []);
        };
        load();
    }, []);

    return (
        <PageShell
            title="Economic Calendar"
            subtitle="Timeline of upcoming macro and policy events."
        >
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="text-left text-slate-400">
                            <th className="py-2 pr-4">Date</th>
                            <th className="py-2 pr-4">Country</th>
                            <th className="py-2 pr-4">Event</th>
                            <th className="py-2 pr-4">Impact</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.map((item, index) => (
                            <tr key={`${item.event}-${index}`} className="border-t border-white/10">
                                <td className="py-2 pr-4">{item.date}</td>
                                <td className="py-2 pr-4">{item.country}</td>
                                <td className="py-2 pr-4">{item.event}</td>
                                <td className="py-2 pr-4">{item.impact}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </PageShell>
    );
}

export function NewsPage() {
    const [rows, setRows] = useState([]);
    const [activeTab, setActiveTab] = useState('live');
    const [sortBy, setSortBy] = useState('latest');
    const [selectedSource, setSelectedSource] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const load = async () => {
            const response = await api.get('/news/general').catch(() => ({ data: [] }));
            const payload = toPayload(response.data, []);
            setRows(Array.isArray(payload) ? payload : []);
        };
        load();
    }, []);

    // Filter and sort news
    const filteredNews = rows.filter(item => {
        const matchesSource = selectedSource === 'all' || item.source === selectedSource;
        const matchesSearch = searchQuery === '' || item.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSource && matchesSearch;
    }).sort((a, b) => {
        if (sortBy === 'latest') {
            return new Date(b.publishedAt || b.time) - new Date(a.publishedAt || a.time);
        }
        return 0;
    });

    const uniqueSources = ['all', ...Array.from(new Set(rows.map(item => item.source)))];

    const getImpactBadge = (item) => {
        if (item.sentiment === 'positive') return { text: 'Bullish', color: 'emerald' };
        if (item.sentiment === 'negative') return { text: 'Bearish', color: 'rose' };
        return { text: 'Neutral', color: 'slate' };
    };

    return (
        <PageShell
            title="Financial News"
            subtitle="Aggregated market feed from configured news providers."
        >
            <div className="space-y-6">
                {/* Controls Section */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
                    {/* Search Bar */}
                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search news, symbols, sources..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/50 border border-white/10 text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-400/50"
                            />
                        </div>
                    </div>

                    {/* Tabs and Filters */}
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex gap-2">
                            {['live', 'top news', 'watchlist', 'my feeds'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                                        activeTab === tab
                                            ? 'bg-cyan-500 text-slate-950'
                                            : 'bg-white/5 border border-white/10 text-slate-300 hover:border-white/20'
                                    }`}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-3">
                            {/* Sort Dropdown */}
                            <div>
                                <label className="text-xs text-slate-400">Sort:</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="ml-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-cyan-400/50"
                                >
                                    <option value="latest">Latest</option>
                                    <option value="trending">Trending</option>
                                    <option value="impact">Impact</option>
                                </select>
                            </div>

                            {/* Source Filter */}
                            <div>
                                <label className="text-xs text-slate-400">Source:</label>
                                <select
                                    value={selectedSource}
                                    onChange={(e) => setSelectedSource(e.target.value)}
                                    className="ml-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-cyan-400/50"
                                >
                                    {uniqueSources.map((source) => (
                                        <option key={source} value={source}>
                                            {source.charAt(0).toUpperCase() + source.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* News Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main News Column */}
                    <div className="lg:col-span-2 space-y-3">
                        {filteredNews.length > 0 ? (
                            filteredNews.map((item, index) => {
                                const impactBadge = getImpactBadge(item);
                                return (
                                    <article
                                        key={`${item.title}-${index}`}
                                        className="group rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] hover:border-cyan-500/30 hover:bg-white/10 transition-all p-5 cursor-pointer"
                                    >
                                        <div className="flex gap-4">
                                            {/* Icon/Avatar */}
                                            <div className="flex-shrink-0">
                                                <div className="w-12 h-12 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center">
                                                    <span className="text-lg font-black text-cyan-400">
                                                        {item.source?.charAt(0).toUpperCase() || '📰'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1">
                                                        <h3 className="font-black text-base leading-snug group-hover:text-cyan-300 transition-colors">
                                                            {item.title}
                                                        </h3>
                                                        <p className="text-xs text-slate-400 mt-2">
                                                            {item.source} • {item.time || item.publishedAt || '-'}
                                                        </p>
                                                    </div>
                                                    <a
                                                        href={item.url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                        </svg>
                                                    </a>
                                                </div>

                                                {item.description && (
                                                    <p className="text-sm text-slate-300 mt-3 line-clamp-2">
                                                        {item.description}
                                                    </p>
                                                )}

                                                {/* Tags and Impact */}
                                                <div className="flex items-center gap-2 mt-3 flex-wrap">
                                                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-${impactBadge.color}-500/20 text-${impactBadge.color}-300 border border-${impactBadge.color}-500/30`}>
                                                        {impactBadge.text}
                                                    </span>
                                                    {item.symbols && item.symbols.length > 0 && (
                                                        <div className="flex gap-1">
                                                            {item.symbols.slice(0, 3).map((symbol) => (
                                                                <span key={symbol} className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-800 border border-white/10 text-cyan-400">
                                                                    {symbol}
                                                                </span>
                                                            ))}
                                                            {item.symbols.length > 3 && (
                                                                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-800 border border-white/10 text-slate-400">
                                                                    +{item.symbols.length - 3}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <svg className="w-12 h-12 text-slate-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p className="text-slate-400 text-sm">No news found matching your criteria</p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Top Stories Widget */}
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3">
                            <h3 className="font-black text-sm">TOP STORIES</h3>
                            <div className="space-y-3">
                                {rows.slice(0, 5).map((item, index) => (
                                    <div key={`top-${index}`} className="pb-3 border-b border-white/10 last:pb-0 last:border-0">
                                        <p className="text-xs font-bold text-cyan-400 mb-1">{index + 1}</p>
                                        <p className="text-xs line-clamp-2 leading-snug text-slate-200 font-semibold">
                                            {item.title}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">{item.source}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Sources Widget */}
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3">
                            <h3 className="font-black text-sm">SOURCES</h3>
                            <div className="space-y-2">
                                {uniqueSources.slice(1, 6).map((source) => {
                                    const count = rows.filter(item => item.source === source).length;
                                    return (
                                        <div
                                            key={source}
                                            onClick={() => setSelectedSource(source)}
                                            className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/30 hover:bg-slate-900/60 cursor-pointer transition-colors"
                                        >
                                            <span className="text-xs font-semibold text-slate-300">{source}</span>
                                            <span className="text-xs font-bold text-cyan-400">{count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageShell>
    );
}

export function WatchlistsPage() {
    return <AdvancedWatchlistDashboard />;
}

export function PortfolioPage() {
    const [portfolio, setPortfolio] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [form, setForm] = useState({ symbol: '', side: 'BUY', quantity: '', price: '' });

    const load = async () => {
        const [portfolioRes, analyticsRes] = await Promise.all([
            api.get('/user/portfolio').catch(() => ({ data: null })),
            api.get('/user/portfolio/analytics').catch(() => ({ data: null })),
        ]);
        setPortfolio(toPayload(portfolioRes.data, null));
        setAnalytics(toPayload(analyticsRes.data, null));
    };

    useEffect(() => {
        scheduleAsync(load);
    }, []);

    const submitTrade = async (event) => {
        event.preventDefault();
        await api.post('/user/portfolio/transactions', {
            symbol: form.symbol,
            side: form.side,
            quantity: Number(form.quantity),
            price: Number(form.price),
            assetType: 'STOCK',
        }).catch(() => null);
        setForm({ symbol: '', side: 'BUY', quantity: '', price: '' });
        load();
    };

    const holdings = Array.isArray(portfolio?.holdings) ? portfolio.holdings : [];

    return (
        <PageShell
            title="Portfolio"
            subtitle="Holdings and portfolio analytics."
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div className="text-xs text-slate-400">Total Value</div>
                    <div className="text-xl font-black mt-1">{analytics?.totalValue ?? '-'}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div className="text-xs text-slate-400">Cash</div>
                    <div className="text-xl font-black mt-1">{analytics?.cashBalance ?? '-'}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div className="text-xs text-slate-400">Holdings</div>
                    <div className="text-xl font-black mt-1">{analytics?.holdingsCount ?? holdings.length}</div>
                </div>
            </div>

            <form onSubmit={submitTrade} className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-3">
                <h2 className="font-black">Add Transaction</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <input value={form.symbol} onChange={(event) => setForm((prev) => ({ ...prev, symbol: event.target.value }))} placeholder="Symbol" className="rounded-lg bg-slate-900 border border-white/10 px-3 py-2 text-sm" />
                    <select value={form.side} onChange={(event) => setForm((prev) => ({ ...prev, side: event.target.value }))} className="rounded-lg bg-slate-900 border border-white/10 px-3 py-2 text-sm">
                        <option value="BUY">BUY</option>
                        <option value="SELL">SELL</option>
                    </select>
                    <input value={form.quantity} onChange={(event) => setForm((prev) => ({ ...prev, quantity: event.target.value }))} placeholder="Quantity" className="rounded-lg bg-slate-900 border border-white/10 px-3 py-2 text-sm" />
                    <input value={form.price} onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))} placeholder="Price" className="rounded-lg bg-slate-900 border border-white/10 px-3 py-2 text-sm" />
                </div>
                <button type="submit" className="rounded-lg bg-cyan-400 text-slate-950 px-4 py-2 font-bold text-sm">Submit</button>
            </form>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="text-left text-slate-400">
                            <th className="py-2 pr-4">Symbol</th>
                            <th className="py-2 pr-4">Quantity</th>
                            <th className="py-2 pr-4">Avg Price</th>
                            <th className="py-2 pr-4">Current Price</th>
                            <th className="py-2 pr-4">PnL</th>
                        </tr>
                    </thead>
                    <tbody>
                        {holdings.map((row) => (
                            <tr key={row.symbol} className="border-t border-white/10">
                                <td className="py-2 pr-4">{row.symbol}</td>
                                <td className="py-2 pr-4">{row.quantity}</td>
                                <td className="py-2 pr-4">{row.avgBuyPrice}</td>
                                <td className="py-2 pr-4">{row.currentPrice}</td>
                                <td className="py-2 pr-4">{row.unrealizedPnL}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </PageShell>
    );
}

export function AlertsPage() {
    const [activeAlerts, setActiveAlerts] = useState([]);
    const [history, setHistory] = useState([]);
    const [form, setForm] = useState({ symbol: '', type: 'TRADER', condition: 'PRICE_ABOVE', threshold: '' });

    const load = async () => {
        const [activeRes, historyRes] = await Promise.all([
            api.get('/alerts').catch(() => ({ data: [] })),
            api.get('/alerts/history').catch(() => ({ data: [] })),
        ]);
        setActiveAlerts(Array.isArray(toPayload(activeRes.data, [])) ? toPayload(activeRes.data, []) : []);
        setHistory(Array.isArray(toPayload(historyRes.data, [])) ? toPayload(historyRes.data, []) : []);
    };

    useEffect(() => {
        scheduleAsync(load);
    }, []);

    const createAlert = async (event) => {
        event.preventDefault();
        await api.post('/alerts', {
            symbol: form.symbol,
            type: form.type,
            condition: form.condition,
            threshold: Number(form.threshold),
        }).catch(() => null);
        setForm({ symbol: '', type: 'TRADER', condition: 'PRICE_ABOVE', threshold: '' });
        load();
    };

    const deleteAlert = async (id) => {
        await api.delete(`/alerts/${id}`).catch(() => null);
        load();
    };

    return (
        <PageShell
            title="Alerts"
            subtitle="Configure and monitor price/indicator alerts."
        >
            <form onSubmit={createAlert} className="rounded-2xl border border-white/10 bg-white/5 p-6 grid grid-cols-1 md:grid-cols-4 gap-2">
                <input value={form.symbol} onChange={(event) => setForm((prev) => ({ ...prev, symbol: event.target.value }))} placeholder="Symbol" className="rounded-lg bg-slate-900 border border-white/10 px-3 py-2 text-sm" />
                <select value={form.type} onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))} className="rounded-lg bg-slate-900 border border-white/10 px-3 py-2 text-sm">
                    <option value="TRADER">TRADER</option>
                    <option value="INVESTOR">INVESTOR</option>
                </select>
                <select value={form.condition} onChange={(event) => setForm((prev) => ({ ...prev, condition: event.target.value }))} className="rounded-lg bg-slate-900 border border-white/10 px-3 py-2 text-sm">
                    <option value="PRICE_ABOVE">PRICE_ABOVE</option>
                    <option value="PRICE_BELOW">PRICE_BELOW</option>
                    <option value="RSI_ABOVE">RSI_ABOVE</option>
                    <option value="RSI_BELOW">RSI_BELOW</option>
                    <option value="PE_ABOVE">PE_ABOVE</option>
                    <option value="PE_BELOW">PE_BELOW</option>
                </select>
                <input value={form.threshold} onChange={(event) => setForm((prev) => ({ ...prev, threshold: event.target.value }))} placeholder="Threshold" className="rounded-lg bg-slate-900 border border-white/10 px-3 py-2 text-sm" />
                <button type="submit" className="md:col-span-4 rounded-lg bg-cyan-400 text-slate-950 px-4 py-2 font-bold text-sm">Create Alert</button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                    <h2 className="font-black mb-3">Active Alerts</h2>
                    <div className="space-y-2 text-sm">
                        {activeAlerts.map((row) => (
                            <div key={row._id} className="border border-white/10 rounded-lg px-3 py-2 flex items-center justify-between">
                                <div>{row.symbol} • {row.condition} • {row.threshold}</div>
                                <button onClick={() => deleteAlert(row._id)} className="text-rose-300 text-xs font-bold">Delete</button>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                    <h2 className="font-black mb-3">Triggered History</h2>
                    <div className="space-y-2 text-sm">
                        {history.map((row) => (
                            <div key={row._id} className="border border-white/10 rounded-lg px-3 py-2">
                                {row.symbol} • {row.status}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </PageShell>
    );
}

export function ReportsExportPage() {
    const [status, setStatus] = useState('');

    const download = (content, filename, mimeType) => {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    };

    const exportCsv = async () => {
        const response = await api.get('/reports/csv');
        const payload = response.data;
        const body = payload?.data || '';
        download(String(body), 'portfolio-report.csv', 'text/csv');
        setStatus('CSV report exported.');
    };

    const exportPdf = async () => {
        const response = await api.get('/reports/pdf');
        download(JSON.stringify(response.data, null, 2), 'portfolio-report.pdf.json', 'application/json');
        setStatus('PDF export payload downloaded.');
    };

    return (
        <PageShell
            title="Reports Export"
            subtitle="Generate PDF/CSV portfolio reports."
        >
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
                <div className="flex gap-3">
                    <button onClick={exportPdf} className="rounded-lg bg-cyan-400 text-slate-950 px-4 py-2 font-bold text-sm">Export PDF</button>
                    <button onClick={exportCsv} className="rounded-lg bg-emerald-400 text-slate-950 px-4 py-2 font-bold text-sm">Export CSV</button>
                </div>
                {status ? <p className="text-sm text-emerald-300">{status}</p> : null}
            </div>
        </PageShell>
    );
}

export function ProfilePage() {
    const [profile, setProfile] = useState({ 
        username: 'Krishna', 
        email: 'krishna@email.com',
        joinedDate: 'Joined Feb 2024'
    });
    
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef(null);
    const navigate = useNavigate();

    // Alignment Metrics
    const investorPercent = 40;
    const traderPercent = 60;

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const activeMode = useMemo(() => {
        if (typeof window === 'undefined') return 'INVESTOR';
        const persisted = String(localStorage.getItem('mode') || 'INVESTOR').toUpperCase();
        return persisted === 'TRADER' ? 'TRADER' : 'INVESTOR';
    }, []);

    const initial = profile.username.charAt(0).toUpperCase();

    if (activeMode === 'TRADER') {
        const behavior = {
            signalsGenerated: 148,
            screensAnalyzed: 67,
            patternAccuracy: 74,
            researchConsistency: 81,
            sessionInsight: 'High Volatility Active',
            lastActive: '2 min ago',
        };

        const signalTrend = [42, 51, 49, 58, 63, 61, 69, 75, 72, 78];
        const screenTrend = [20, 24, 22, 29, 31, 28, 35, 33, 38, 40];
        const accuracyTrend = [61, 63, 66, 64, 68, 70, 72, 74, 73, 76];

        const holdings = [
            { symbol: 'RELIANCE', invested: 672000, current: 703200 },
            { symbol: 'HDFCBANK', invested: 124800, current: 131440 },
            { symbol: 'INFY', invested: 142500, current: 146965 },
        ];

        const watchlist = [
            { symbol: 'NIFTY 50', price: 22541.3, change: 0.94, tag: 'High Momentum', signal: 'Breakout Bias' },
            { symbol: 'BANKNIFTY', price: 48762.55, change: -0.62, tag: 'Weak Structure', signal: 'Distribution' },
            { symbol: 'RELIANCE', price: 2930.0, change: 1.14, tag: 'High Momentum', signal: 'Volume Expansion' },
            { symbol: 'HDFCBANK', price: 1643.6, change: 0.75, tag: 'Balanced', signal: 'Trend Hold' },
            { symbol: 'TCS', price: 3826.35, change: -0.31, tag: 'Weak Structure', signal: 'Range Breakdown' },
        ];

        const activityLog = [
            {
                symbol: 'RELIANCE',
                action: 'Research thesis updated',
                reason: 'Opening range breakout sustained above VWAP with rising volume profile.',
                signals: ['RSI 62', 'Volume Spike', 'VWAP Support'],
                time: '10:42 AM',
            },
            {
                symbol: 'BANKNIFTY',
                action: 'Risk reduced',
                reason: 'False breakout identified after weak breadth and declining OI support.',
                signals: ['RSI Divergence', 'OI Drop', 'Breadth Weak'],
                time: '11:16 AM',
            },
            {
                symbol: 'HDFCBANK',
                action: 'Watchlist priority raised',
                reason: 'Trend continuation setup validated after retest of breakout zone.',
                signals: ['Retest Confirmed', 'EMA Stack', 'Volume Follow-through'],
                time: '12:03 PM',
            },
        ];

        const invested = holdings.reduce((sum, row) => sum + row.invested, 0);
        const current = holdings.reduce((sum, row) => sum + row.current, 0);
        const netPnl = current - invested;
        const pnlPct = invested > 0 ? (netPnl / invested) * 100 : 0;

        const formatCurrency = (value) => new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(value);

        const mapTrendToSeries = (arr) => arr.map((value, idx) => ({ step: idx + 1, value }));

        const signalSeries = mapTrendToSeries(signalTrend);
        const screenSeries = mapTrendToSeries(screenTrend);
        const accuracySeries = mapTrendToSeries(accuracyTrend);

        const TrendMiniChart = ({ title, data, stroke, gradientId }) => (
            <div className="rounded-xl border border-white/10 bg-[rgba(15,23,42,0.45)] p-3">
                <div className="text-xs font-semibold text-slate-300">{title}</div>
                <div className="mt-2 h-24">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 6, right: 4, left: -14, bottom: 0 }}>
                            <defs>
                                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={stroke} stopOpacity={0.35} />
                                    <stop offset="95%" stopColor={stroke} stopOpacity={0.02} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.08)" />
                            <XAxis dataKey="step" hide />
                            <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                            <Tooltip
                                cursor={{ stroke: 'rgba(148,163,184,0.2)' }}
                                contentStyle={{
                                    background: 'rgba(2, 6, 23, 0.96)',
                                    border: '1px solid rgba(255,255,255,0.12)',
                                    borderRadius: 10,
                                    color: '#e2e8f0',
                                }}
                                labelStyle={{ color: '#94a3b8' }}
                            />
                            <Area type="monotone" dataKey="value" stroke="none" fill={`url(#${gradientId})`} />
                            <Line type="monotone" dataKey="value" stroke={stroke} strokeWidth={2.2} dot={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        );

        const BehaviorMetric = ({ label, value, accent = 'text-cyan-200' }) => (
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                <div className="text-[10px] uppercase tracking-[0.14em] text-slate-400">{label}</div>
                <div className={`mt-1 text-xl font-black ${accent}`}>{value}</div>
            </div>
        );

        return (
            <div className="min-h-screen text-[#E5E7EB]" style={{ backgroundColor: '#06080c' }}>
                <div
                    className="pointer-events-none fixed inset-0"
                    style={{
                        background:
                            'radial-gradient(circle at 10% 20%, rgba(66, 192, 165, 0.05), transparent 40%), radial-gradient(circle at 90% 80%, rgba(56, 189, 248, 0.03), transparent 40%)',
                    }}
                />

                <main className="relative mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-10">
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard?module=DASHBOARD')}
                        className="mb-6 inline-flex items-center gap-2 rounded-xl border border-cyan-400/25 bg-cyan-500/10 px-4 py-2 text-sm font-bold text-cyan-200 transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-300/50 hover:bg-cyan-400/15"
                    >
                        <ArrowLeft size={16} />
                        <span>Back to Dashboard</span>
                    </button>

                    <section className="rounded-2xl border border-white/10 bg-[rgba(10,15,25,0.62)] p-5 shadow-[0_12px_48px_rgba(4,14,34,0.45)] backdrop-blur-xl md:p-6">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex items-start gap-4">
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-400/15 text-xl font-black text-cyan-100 shadow-[0_0_28px_rgba(34,211,238,0.2)]">
                                    {initial}
                                </div>
                                <div>
                                    <div className="inline-flex items-center rounded-full border border-cyan-300/30 bg-cyan-400/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] text-cyan-200">
                                        Advanced Trader
                                    </div>
                                    <h1 className="mt-2 text-2xl font-black tracking-tight text-white md:text-3xl">{profile.username}</h1>
                                    <p className="text-sm text-slate-300">{profile.email}</p>
                                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-300">
                                        <span className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1"><Clock size={12} /> Last active {behavior.lastActive}</span>
                                        <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-2 py-1 text-emerald-300"><Activity size={12} /> Session: {behavior.sessionInsight}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 lg:max-w-[340px]">
                                <div className="text-[10px] uppercase tracking-[0.14em] text-slate-400">Trader Research Intelligence Panel</div>
                                <p className="mt-1 text-sm text-slate-200">Behavior and signal quality profile calibrated for market research decisions.</p>
                            </div>
                        </div>
                    </section>

                    <section className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-12">
                        <article className="rounded-2xl border border-white/10 bg-[rgba(10,15,25,0.6)] p-5 backdrop-blur-xl xl:col-span-8">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-black tracking-tight text-white">Research Behavior</h2>
                                <span className="rounded-full border border-cyan-300/30 bg-cyan-400/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-200">Behavioral Metrics</span>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                                <BehaviorMetric label="Signals Generated" value={behavior.signalsGenerated} accent="text-cyan-200" />
                                <BehaviorMetric label="Screens Analyzed" value={behavior.screensAnalyzed} accent="text-blue-200" />
                                <BehaviorMetric label="Pattern Accuracy" value={`${behavior.patternAccuracy}%`} accent="text-emerald-300" />
                                <BehaviorMetric label="Research Consistency" value={`${behavior.researchConsistency}%`} accent="text-emerald-300" />
                            </div>

                            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                                <TrendMiniChart title="Signal Production Trend" data={signalSeries} stroke="#38bdf8" gradientId="signalTrendFill" />
                                <TrendMiniChart title="Research Depth Trend" data={screenSeries} stroke="#3b82f6" gradientId="screenTrendFill" />
                                <TrendMiniChart title="Pattern Accuracy Trend" data={accuracySeries} stroke="#34d399" gradientId="accuracyTrendFill" />
                            </div>
                        </article>

                        <article className="rounded-2xl border border-white/10 bg-[rgba(10,15,25,0.6)] p-5 shadow-[0_0_35px_rgba(34,211,238,0.08)] backdrop-blur-xl xl:col-span-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-black text-white">Portfolio Snapshot</h2>
                                <BarChart3 size={16} className="text-cyan-300" />
                            </div>

                            <div className="mt-3 space-y-2">
                                {holdings.map((item) => {
                                    const delta = item.current - item.invested;
                                    return (
                                        <div key={item.symbol} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm">
                                            <div className="font-semibold text-white">{item.symbol}</div>
                                            <div className={`text-xs font-bold ${delta >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                                                {delta >= 0 ? '+' : '-'}{formatCurrency(Math.abs(delta))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-3 rounded-xl border border-cyan-300/20 bg-cyan-500/10 p-3 text-xs">
                                <div className="flex items-center justify-between text-slate-300"><span>Invested</span><span className="font-bold text-white">{formatCurrency(invested)}</span></div>
                                <div className="mt-1 flex items-center justify-between text-slate-300"><span>Current</span><span className="font-bold text-white">{formatCurrency(current)}</span></div>
                                <div className="mt-1 flex items-center justify-between"><span className="text-slate-300">Net</span><span className={`font-bold ${netPnl >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>{pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%</span></div>
                            </div>
                        </article>
                    </section>

                    <section className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
                        <article className="rounded-2xl border border-white/10 bg-[rgba(10,15,25,0.6)] p-5 backdrop-blur-xl">
                            <h2 className="text-lg font-black text-white">Trading Style & AI Insights</h2>
                            <div className="mt-3 space-y-3 text-sm">
                                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                                    <span className="text-slate-300">Style</span>
                                    <span className="font-bold text-cyan-200">Intraday Breakout Research</span>
                                </div>
                                <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3">
                                    <div className="mb-1 flex items-center justify-between text-xs text-slate-300">
                                        <span className="inline-flex items-center gap-1"><AlertCircle size={12} /> Risk Level</span>
                                        <span className="font-semibold text-amber-300">Medium-High</span>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                                        <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-amber-400 to-rose-500" />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                                    <span className="text-slate-300">Preferred Sectors</span>
                                    <span className="font-semibold text-white">Banking, IT, Energy</span>
                                </div>
                            </div>
                            <div className="mt-4 space-y-2 rounded-xl border border-cyan-400/25 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
                                <p>Prefers breakout setups during opening sessions.</p>
                                <p>Higher risk appetite after consecutive losses; monitor cooldown discipline.</p>
                                <p>Research quality improves when volume confirmation is part of the filter stack.</p>
                            </div>
                        </article>

                        <article className="rounded-2xl border border-white/10 bg-[rgba(10,15,25,0.6)] p-5 backdrop-blur-xl">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-black text-white">Watchlist (Active Research)</h2>
                                <button
                                    type="button"
                                    onClick={() => navigate('/dashboard?module=WATCHLIST')}
                                    className="rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-bold text-cyan-200 transition-all hover:border-cyan-300/60 hover:bg-cyan-400/15"
                                >
                                    Open Watchlist
                                </button>
                            </div>

                            <div className="mt-3 space-y-2">
                                {watchlist.map((row) => (
                                    <div key={row.symbol} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-white">{row.symbol}</span>
                                            <span className={`text-xs font-bold ${row.change >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                                                {row.change >= 0 ? '+' : ''}{row.change.toFixed(2)}%
                                            </span>
                                        </div>
                                        <div className="mt-1 flex items-center justify-between gap-2 text-[11px]">
                                            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-slate-300">{row.signal}</span>
                                            <span className={`rounded-full px-2 py-0.5 font-semibold ${row.tag === 'High Momentum' ? 'border border-emerald-400/30 bg-emerald-400/10 text-emerald-300' : row.tag === 'Weak Structure' ? 'border border-rose-400/30 bg-rose-400/10 text-rose-300' : 'border border-cyan-400/30 bg-cyan-400/10 text-cyan-200'}`}>
                                                {row.tag}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </article>
                    </section>

                    <section className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
                        <article className="rounded-2xl border border-white/10 bg-[rgba(10,15,25,0.6)] p-5 backdrop-blur-xl">
                            <h2 className="text-lg font-black text-white">Activity Intelligence</h2>
                            <div className="mt-3 space-y-3">
                                {activityLog.map((item) => (
                                    <div key={`${item.symbol}-${item.time}`} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm font-semibold text-white">{item.symbol} • {item.action}</div>
                                            <div className="text-xs text-slate-400">{item.time}</div>
                                        </div>
                                        <p className="mt-1 text-xs text-slate-300">{item.reason}</p>
                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                            {item.signals.map((signal) => (
                                                <span key={signal} className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-200">
                                                    {signal}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </article>

                        <article className="rounded-2xl border border-white/10 bg-[rgba(10,15,25,0.6)] p-5 backdrop-blur-xl">
                            <h2 className="text-lg font-black text-white">Actions</h2>
                            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                                <button
                                    type="button"
                                    onClick={() => navigate('/settings?section=profile')}
                                    className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-3 text-sm font-bold text-cyan-200 transition-all hover:-translate-y-0.5 hover:bg-cyan-400/15"
                                >
                                    Edit Profile
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate('/settings?section=mode')}
                                    className="rounded-xl border border-white/15 bg-white/[0.05] px-4 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:border-cyan-300/40"
                                >
                                    Change Mode
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate('/onboarding')}
                                    className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-200 transition-all hover:-translate-y-0.5 hover:bg-emerald-400/15"
                                >
                                    Retake Assessment
                                </button>
                            </div>
                        </article>
                    </section>
                </main>
            </div>
        );
    }

    return (
        <div className="profile-page-root">
            <header className="navbar profile-custom-navbar rounded-xl mx-auto max-w-[1400px] border border-blue-100 shadow-sm relative z-[110] bg-white flex items-center justify-between px-12 py-3">
                <div className="flex items-center gap-4 shrink-0">
                    <img
                        src="/radar-logo-final.jpg"
                        alt="Radar Logo"
                        className="w-10 h-10 rounded-full object-cover border border-blue-100/50 shadow-sm"
                    />
                    <span className="brand-name font-black tracking-tighter text-2xl" style={{ color: '#3E84F6' }}>RADAR</span>
                </div>

                <div className="hidden lg:flex items-center gap-10 ml-12">
                    {[
                        { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
                        { id: 'WATCHLIST', label: 'Watchlist', icon: Star, to: '/dashboard?module=watchlist' },
                        { id: 'SCREENERS', label: 'Screeners', icon: Filter, to: '/dashboard?module=screeners' },
                        { id: 'NEWS', label: 'News', icon: Newspaper, to: '/dashboard?module=news' }
                    ].map((item) => (
                        <Link
                            key={item.id}
                            to={item.to}
                            className="flex items-center gap-2.5 text-sm font-extrabold tracking-tight transition-all duration-300 hover:scale-105"
                            style={{ color: '#3E84F6' }}
                        >
                            <item.icon size={18} strokeWidth={2.5} />
                            {item.label}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-8 ml-auto">
                    <div className="hidden md:flex relative w-72 h-10">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400">
                            <Search size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search stocks..."
                            className="w-full h-full rounded-2xl pl-12 pr-4 text-xs font-semibold focus:outline-none bg-white border border-blue-50 text-blue-900 placeholder:text-blue-200 shadow-none hover:border-blue-100"
                        />
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-[#3E84F6] cursor-pointer hover:scale-110 transition-transform">
                            <Bell size={22} strokeWidth={2} />
                        </div>
                        <div className="relative" ref={profileRef}>
                            <div 
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-[#3E84F6] shadow-[0_4px_12px_rgba(62,132,246,0.3)] text-white font-bold text-sm cursor-pointer hover:scale-105 transition-transform"
                            >
                                {initial}
                            </div>

                            {/* Profile Dropdown Content */}
                            {isProfileOpen && (
                                <div className="absolute right-0 top-14 w-72 rounded-xl shadow-2xl border py-2 backdrop-blur-xl z-[200] origin-top-right bg-white border-blue-100/50">
                                    <div className="px-4 py-4 border-b border-blue-50 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-base font-bold text-white">
                                            {initial}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">{profile.username}</p>
                                            <p className="text-xs text-slate-500">{profile.email}</p>
                                        </div>
                                    </div>
                                    <div className="py-2">
                                        <Link 
                                            to="/profile" 
                                            onClick={() => setIsProfileOpen(false)} 
                                            className="w-full text-left px-4 py-2 text-sm flex items-center gap-3 text-slate-700 hover:bg-blue-50/50 transition-colors"
                                        >
                                            <UserIcon size={16} /> My Profile
                                        </Link>
                                        <button className="w-full text-left px-4 py-2 text-sm flex items-center gap-3 text-slate-700 hover:bg-blue-50/50 transition-colors">
                                            <Settings size={16} /> Settings
                                        </button>
                                        <button 
                                            onClick={() => navigate('/')}
                                            className="w-full text-left px-4 py-2 text-sm flex items-center gap-3 text-rose-500 hover:bg-rose-50/50 transition-colors"
                                        >
                                            <LogOut size={16} /> Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Page Header */}
            <div className="profile-header-bg">
                <h1 className="profile-title-text">My Profile</h1>
            </div>

            {/* Main Content Area */}
            <main className="profile-main-container">
                <div className="glass-card">
                    {/* Top Section: Overview & Market Behavior */}
                    <div className="profile-top-row">
                        <div className="overview-col">
                            <div className="profile-avatar-big">{initial}</div>
                            <div className="overview-info">
                                <h2>{profile.username}</h2>
                                <p className="user-email">{profile.email}</p>
                                <div className="joined-meta">
                                    <Clock size={14} /> {profile.joinedDate}
                                </div>
                                <div className="mode-pill">
                                    <Zap size={12} fill="#2563eb" /> Trader Mode
                                </div>
                                <div className="archetype-title">
                                    <Zap size={14} className="text-yellow-500" fill="currentColor" /> 
                                    The Predator — Advanced Trader Archetype
                                </div>
                            </div>
                        </div>

                        <div className="market-behavior-top">
                            <div className="card-heading">Market Behavior Alignment</div>
                            <div className="behavior-bars-grid">
                                <div className="behavior-bar-item">
                                    <div className="bar-label-wrap">
                                        <span>INVESTOR</span>
                                        <span>{investorPercent}%</span>
                                    </div>
                                    <div className="bar-track">
                                        <div className="bar-fill investor" style={{ width: `${investorPercent}%` }} />
                                    </div>
                                </div>
                                <div className="behavior-bar-item">
                                    <div className="bar-label-wrap">
                                        <span>TRADER</span>
                                        <span>{traderPercent}%</span>
                                    </div>
                                    <div className="bar-track">
                                        <div className="bar-fill trader" style={{ width: `${traderPercent}%` }} />
                                    </div>
                                </div>
                            </div>
                            <div className="behavior-meta-actions">
                                <span className="last-assessed">Last assessed: Feb 20</span>
                                <button className="btn-retake">Retake Assessment</button>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Section: 3-Column Grid */}
                    <div className="profile-bottom-grid">
                        
                        {/* Col 1: Market Behavior Mini */}
                        <div className="stat-card">
                            <div className="card-heading">Market Behavior</div>
                            <div className="behavior-bars-grid !mb-4">
                                <div className="behavior-bar-item !gap-1">
                                    <div className="bar-label-wrap !text-[10px]">
                                        <span>INV</span>
                                        <span>40%</span>
                                    </div>
                                    <div className="bar-track !h-[4px]">
                                        <div className="bar-fill investor" style={{ width: '40%' }} />
                                    </div>
                                </div>
                                <div className="behavior-bar-item !gap-1">
                                    <div className="bar-label-wrap !text-[10px]">
                                        <span>TRA</span>
                                        <span>60%</span>
                                    </div>
                                    <div className="bar-track !h-[4px]">
                                        <div className="bar-fill trader" style={{ width: '60%' }} />
                                    </div>
                                </div>
                            </div>
                            <div className="card-cta">Go to Behavior Assessment <ArrowRight size={14} /></div>
                        </div>

                        {/* Col 2: Activity Snapshot */}
                        <div className="stat-card">
                            <div className="card-heading">Activity Snapshot</div>
                            <div className="mini-stats-grid">
                                <div className="mini-stat">
                                    <span className="num">6</span>
                                    <span className="label">Stocks</span>
                                </div>
                                <div className="mini-stat">
                                    <span className="num">14</span>
                                    <span className="label">Screeners Run</span>
                                </div>
                                <div className="mini-stat">
                                    <span className="num">3</span>
                                    <span className="label">Alerts</span>
                                </div>
                            </div>
                            <div className="ticker-wrap">
                                <span className="ticker-item">RELIANCE</span>
                                <span className="ticker-item">INFY</span>
                                <span className="ticker-item">TATAMOTORS</span>
                            </div>
                            <div className="card-cta">Change Mode <ArrowRight size={14} /></div>
                        </div>

                        {/* Col 3: Preferences */}
                        <div className="stat-card">
                            <div className="card-heading">Preferences</div>
                            <div className="pref-list">
                                <div className="pref-item">
                                    <span className="pref-label">Preferred Sectors</span>
                                    <span className="pref-val">Technology, Finance</span>
                                </div>
                                <div className="pref-item">
                                    <span className="pref-label">Risk Level</span>
                                    <span className="pref-val risk-high">
                                        <AlertCircle size={14} /> High
                                    </span>
                                </div>
                                <div className="pref-item">
                                    <span className="pref-label">Investment Style</span>
                                    <span className="pref-val">Momentum / Technical</span>
                                </div>
                            </div>
                            <div className="card-cta">Edit Preferences <ArrowRight size={14} /></div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}

export function SettingsPage() {
    return <TradingSettingsPage />;

    const [status, setStatus] = useState('');
    const [settings, setSettings] = useState({
        persona: 'INVESTOR',
        theme: 'dark',
        researchSource: 'Market Feed',
        coverage: 'NSE',
        baseCurrency: 'INR',
        chartTimeframe: '5m',
        chartType: 'candlestick',
        refreshInterval: '5',
        priceAlerts: true,
        volumeAlerts: true,
        earningsAlerts: true,
        newsAlerts: true,
        calendarAlerts: true,
        twoFA: true,
        sessionTimeout: '30',
        apiAccess: false,
        webhookUrl: '',
        indicators: {
            rsi: true,
            macd: true,
            ema: true,
            bb: true,
            vwap: true,
        },
    });

    useEffect(() => {
        const load = async () => {
            const response = await api.get('/auth/me').catch(() => ({ data: {} }));
            const me = toPayload(response.data, {});
            const storedMode = String(localStorage.getItem('mode') || '').toUpperCase();

            setSettings((current) => ({
                ...current,
                persona: storedMode === 'TRADER' ? 'INVESTOR' : (me?.preferredMode === 'TRADER' ? 'INVESTOR' : current.persona),
                theme: me?.settings?.theme || current.theme,
                researchSource: me?.settings?.researchSource || me?.settings?.broker || current.researchSource,
                coverage: me?.settings?.coverage || me?.settings?.accountType || current.coverage,
                baseCurrency: me?.settings?.baseCurrency || current.baseCurrency,
                chartTimeframe: me?.settings?.chartTimeframe || current.chartTimeframe,
                chartType: me?.settings?.chartType || current.chartType,
                refreshInterval: me?.settings?.refreshInterval || current.refreshInterval,
            }));

            if (storedMode !== 'INVESTOR') {
                localStorage.setItem('mode', 'INVESTOR');
            }
        };

        load();
    }, []);

    const updateField = (key, value) => {
        setSettings((current) => ({ ...current, [key]: value }));
    };

    const toggleIndicator = (indicator) => {
        setSettings((current) => ({
            ...current,
            indicators: {
                ...current.indicators,
                [indicator]: !current.indicators[indicator],
            },
        }));
    };

    const save = async (event) => {
        event.preventDefault();
        setStatus('');

        await Promise.all([
            api.put('/user/persona', { persona: settings.persona }).catch(() => null),
            api.put('/user/settings', {
                theme: settings.theme,
                research: {
                    source: settings.researchSource,
                    coverage: settings.coverage,
                    baseCurrency: settings.baseCurrency,
                    chartTimeframe: settings.chartTimeframe,
                    chartType: settings.chartType,
                    refreshInterval: settings.refreshInterval,
                    indicators: settings.indicators,
                    alerts: {
                        priceAlerts: settings.priceAlerts,
                        volumeAlerts: settings.volumeAlerts,
                        earningsAlerts: settings.earningsAlerts,
                        newsAlerts: settings.newsAlerts,
                        calendarAlerts: settings.calendarAlerts,
                    },
                    security: {
                        twoFA: settings.twoFA,
                        sessionTimeout: settings.sessionTimeout,
                        apiAccess: settings.apiAccess,
                        webhookUrl: settings.webhookUrl,
                    },
                },
            }).catch(() => null),
        ]);

        localStorage.setItem('mode', 'INVESTOR');
        setStatus('Research settings updated successfully.');
    };

    const sections = [
        {
            title: 'Research profile',
            icon: UserIcon,
            description: 'Persona, research source, coverage, and currency.',
            fields: (
                <>
                    <label className="block text-sm">
                        <span className="text-slate-300">Persona</span>
                        <select value={settings.persona} onChange={(event) => updateField('persona', event.target.value)} className="mt-1 w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2 text-sm">
                            <option value="INVESTOR">INVESTOR</option>
                            <option value="TRADER">TRADER</option>
                        </select>
                    </label>
                    <label className="block text-sm">
                        <span className="text-slate-300">Research source</span>
                        <select value={settings.researchSource} onChange={(event) => updateField('researchSource', event.target.value)} className="mt-1 w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2 text-sm">
                            <option>Market Feed</option>
                            <option>News & Filings</option>
                            <option>Chart Analysis</option>
                            <option>Macro Research</option>
                        </select>
                    </label>
                    <label className="block text-sm">
                        <span className="text-slate-300">Coverage</span>
                        <select value={settings.coverage} onChange={(event) => updateField('coverage', event.target.value)} className="mt-1 w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2 text-sm">
                            <option value="NSE">NSE</option>
                            <option value="BSE">BSE</option>
                            <option value="Global">Global</option>
                        </select>
                    </label>
                    <label className="block text-sm">
                        <span className="text-slate-300">Base Currency</span>
                        <select value={settings.baseCurrency} onChange={(event) => updateField('baseCurrency', event.target.value)} className="mt-1 w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2 text-sm">
                            <option value="INR">INR</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                        </select>
                    </label>
                </>
            ),
        },
        {
            title: 'Charts',
            icon: BarChart3,
            description: 'Chart timeframe, type, and refresh rate.',
            fields: (
                <>
                    <label className="block text-sm">
                        <span className="text-slate-300">Chart Timeframe</span>
                        <select value={settings.chartTimeframe} onChange={(event) => updateField('chartTimeframe', event.target.value)} className="mt-1 w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2 text-sm">
                            <option value="1m">1 Minute</option>
                            <option value="5m">5 Minutes</option>
                            <option value="15m">15 Minutes</option>
                            <option value="1h">1 Hour</option>
                            <option value="1d">1 Day</option>
                        </select>
                    </label>
                    <label className="block text-sm">
                        <span className="text-slate-300">Chart Type</span>
                        <select value={settings.chartType} onChange={(event) => updateField('chartType', event.target.value)} className="mt-1 w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2 text-sm">
                            <option value="candlestick">Candlestick</option>
                            <option value="line">Line</option>
                            <option value="area">Area</option>
                        </select>
                    </label>
                    <label className="block text-sm">
                        <span className="text-slate-300">Refresh interval (sec)</span>
                        <input value={settings.refreshInterval} onChange={(event) => updateField('refreshInterval', event.target.value)} type="number" min="1" className="mt-1 w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2 text-sm" />
                    </label>
                </>
            ),
        },
        {
            title: 'Chart toolkit',
            icon: Shield,
            description: 'Indicators visible by default.',
            fields: (
                <>
                    <label className="block text-sm">
                        <span className="text-slate-300">Indicators</span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm md:col-span-2 mt-2">
                            {[
                                ['rsi', 'RSI'],
                                ['macd', 'MACD'],
                                ['ema', 'EMA'],
                                ['bb', 'Bollinger Bands'],
                                ['vwap', 'VWAP'],
                            ].map(([key, label]) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => toggleIndicator(key)}
                                    className={`rounded-xl border px-3 py-3 text-left transition ${settings.indicators[key] ? 'border-emerald-400/60 bg-emerald-400/10 text-emerald-200' : 'border-white/10 bg-slate-900/70 text-slate-300 hover:border-emerald-400/30'}`}
                                >
                                    <span className="block font-semibold">{label}</span>
                                    <span className="block text-xs text-slate-400 mt-1">{settings.indicators[key] ? 'Visible' : 'Hidden'}</span>
                                </button>
                            ))}
                        </div>
                    </label>
                </>
            ),
        },
        {
            title: 'Alerts',
            icon: Bell,
            description: 'Price, volume, news, and calendar alerts.',
            fields: (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm md:col-span-2">
                    {[
                        ['priceAlerts', 'Price alerts'],
                        ['volumeAlerts', 'Volume spikes'],
                        ['earningsAlerts', 'Earnings'],
                        ['newsAlerts', 'News feed'],
                        ['calendarAlerts', 'Economic calendar'],
                    ].map(([key, label]) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => updateField(key, !settings[key])}
                            className={`rounded-xl border px-3 py-3 text-left transition ${settings[key] ? 'border-cyan-400/60 bg-cyan-400/10 text-cyan-200' : 'border-white/10 bg-slate-900/70 text-slate-300 hover:border-cyan-400/30'}`}
                        >
                            <span className="block font-semibold">{label}</span>
                            <span className="block text-xs text-slate-400 mt-1">{settings[key] ? 'Enabled' : 'Disabled'}</span>
                        </button>
                    ))}
                </div>
            ),
        },
        {
            title: 'Security',
            icon: Settings,
            description: 'Access control and session safety.',
            fields: (
                <>
                    <label className="block text-sm">
                        <span className="text-slate-300">Session Timeout (minutes)</span>
                        <input value={settings.sessionTimeout} onChange={(event) => updateField('sessionTimeout', event.target.value)} type="number" min="5" step="5" className="mt-1 w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2 text-sm" />
                    </label>
                    <div className="flex flex-col gap-3 text-sm md:col-span-2">
                        <button
                            type="button"
                            onClick={() => updateField('twoFA', !settings.twoFA)}
                            className={`rounded-xl border px-3 py-3 text-left transition ${settings.twoFA ? 'border-cyan-400/60 bg-cyan-400/10 text-cyan-200' : 'border-white/10 bg-slate-900/70 text-slate-300 hover:border-cyan-400/30'}`}
                        >
                            <span className="block font-semibold">Two-factor authentication</span>
                            <span className="block text-xs text-slate-400 mt-1">{settings.twoFA ? 'Enabled' : 'Disabled'}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => updateField('apiAccess', !settings.apiAccess)}
                            className={`rounded-xl border px-3 py-3 text-left transition ${settings.apiAccess ? 'border-cyan-400/60 bg-cyan-400/10 text-cyan-200' : 'border-white/10 bg-slate-900/70 text-slate-300 hover:border-cyan-400/30'}`}
                        >
                            <span className="block font-semibold">API access</span>
                            <span className="block text-xs text-slate-400 mt-1">{settings.apiAccess ? 'Enabled' : 'Disabled'}</span>
                        </button>
                    </div>
                    <label className="block text-sm md:col-span-2">
                        <span className="text-slate-300">Webhook URL</span>
                        <input value={settings.webhookUrl} onChange={(event) => updateField('webhookUrl', event.target.value)} type="url" placeholder="https://your-bot/webhook" className="mt-1 w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2 text-sm" />
                    </label>
                </>
            ),
        },
    ];

    return (
        <PageShell
            title="Research Settings"
            subtitle="Configure the essential research controls for your dashboard."
        >
            <motion.form
                onSubmit={save}
                className="space-y-5"
                variants={pageMotion}
                initial="hidden"
                animate="show"
            >
                <motion.div className="rounded-2xl border border-cyan-400/10 bg-white/5 p-5 sm:p-6" variants={cardMotion}>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Mode</div>
                            <div className="mt-2 text-lg font-black text-cyan-300">{settings.persona === 'TRADER' ? 'RESEARCHER' : 'RESEARCH'}</div>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Source</div>
                            <div className="mt-2 text-lg font-black text-slate-100">{settings.researchSource}</div>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Coverage</div>
                            <div className="mt-2 text-lg font-black text-emerald-300">{settings.coverage}</div>
                        </div>
                    </div>
                </motion.div>

                <motion.div className="grid gap-5 lg:grid-cols-2" variants={staggerMotion} initial="hidden" animate="show">
                    {sections.map((section, index) => {
                        const Icon = section.icon;
                        return (
                            <motion.section
                                key={section.title}
                                className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6 shadow-[0_24px_80px_rgba(0,0,0,0.25)]"
                                variants={cardMotion}
                                whileHover={{ y: -2, transition: { duration: 0.2 } }}
                                transition={{ delay: index * 0.02 }}
                            >
                                <div className="flex items-start gap-3 mb-5">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300 border border-cyan-400/20">
                                        <Icon size={18} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black text-slate-50">{section.title}</h2>
                                        <p className="text-sm text-slate-400 mt-1">{section.description}</p>
                                    </div>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                    {section.fields}
                                </div>
                            </motion.section>
                        );
                    })}
                </motion.div>

                <motion.div className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" variants={cardMotion}>
                    <div>
                        <div className="text-sm font-bold text-slate-100">Save research profile</div>
                        <p className="text-sm text-slate-400">Persists persona, theme, chart, alerts, and security preferences.</p>
                    </div>
                    <button type="submit" className="inline-flex items-center justify-center rounded-xl bg-cyan-400 px-5 py-3 font-black text-slate-950 text-sm shadow-lg shadow-cyan-400/20 hover:bg-cyan-300 transition">
                        Save Research Settings
                    </button>
                </motion.div>

                {status ? (
                    <motion.div className="text-sm text-emerald-300 font-semibold" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                        {status}
                    </motion.div>
                ) : null}
            </motion.form>
        </PageShell>
    );
}

export function SupportPage() {
    return <HelpSupportPage />;
}

export function InvestorFilingsPage() {
    const [symbol, setSymbol] = useState('AAPL');
    const [rows, setRows] = useState([]);

    const fetchFilings = async () => {
        const target = symbol.trim().toUpperCase();
        if (!target) return;
        const response = await api.get(`/fundamental/${encodeURIComponent(target)}/filings`).catch(() => ({ data: [] }));
        const payload = toPayload(response.data, []);
        setRows(Array.isArray(payload) ? payload : []);
    };

    useEffect(() => {
        scheduleAsync(fetchFilings);
    }, []);

    return (
        <PageShell
            title="Investor Filings"
            subtitle="SEC EDGAR filings table for the selected symbol."
        >
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
                <div className="flex gap-2">
                    <input value={symbol} onChange={(event) => setSymbol(event.target.value)} placeholder="Symbol (e.g. AAPL)" className="flex-1 rounded-lg bg-slate-900 border border-white/10 px-3 py-2 text-sm" />
                    <button onClick={fetchFilings} className="rounded-lg bg-cyan-400 text-slate-950 px-4 py-2 font-bold text-sm">Load</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="text-left text-slate-400">
                                <th className="py-2 pr-4">Form</th>
                                <th className="py-2 pr-4">Filing Date</th>
                                <th className="py-2 pr-4">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, index) => (
                                <tr key={`${row.accessionNumber || row.form}-${index}`} className="border-t border-white/10">
                                    <td className="py-2 pr-4">{row.form}</td>
                                    <td className="py-2 pr-4">{row.filingDate}</td>
                                    <td className="py-2 pr-4">{row.description || row.primaryDocument}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </PageShell>
    );
}

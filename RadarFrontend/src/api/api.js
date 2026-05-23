import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
const STOCK_SUFFIX_REGEX = /\b([A-Z0-9^_-]+)\.(NS|BO)\b/g;

const stripStockSuffixInString = (value) => String(value || '').replace(STOCK_SUFFIX_REGEX, '$1');

const sanitizeStockSuffixes = (value) => {
    if (Array.isArray(value)) {
        return value.map((item) => sanitizeStockSuffixes(item));
    }

    if (value && typeof value === 'object') {
        return Object.entries(value).reduce((acc, [key, item]) => {
            acc[key] = sanitizeStockSuffixes(item);
            return acc;
        }, {});
    }

    if (typeof value === 'string') {
        return stripStockSuffixInString(value);
    }

    return value;
};

export const hasAuthToken = () => {
    if (typeof window === 'undefined') {
        return false;
    }

    return Boolean(localStorage.getItem('token'));
};

export const isUnauthorizedError = (error) => error?.response?.status === 401;

const api = axios.create({
    baseURL: apiBaseUrl,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

const AUTH_KEYS = ['token', 'user', 'mode', 'userId', 'userEmail'];

const clearAuthAndRedirect = () => {
    AUTH_KEYS.forEach(k => localStorage.removeItem(k));
    // Only redirect if not already on an auth page
    if (typeof window !== 'undefined') {
        const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password'];
        const isPublicPath = publicPaths.some(p => window.location.pathname.startsWith(p));
        if (!isPublicPath) {
            window.location.href = '/login';
        }
    }
};

api.interceptors.response.use(
    (response) => {
        if (response && typeof response === 'object' && response.data !== undefined) {
            //response.data = sanitizeStockSuffixes(response.data);
        }
        return response;
    },
    (error) => {
        const status = error.response?.status;
        const msg = error.response?.data?.error || '';
        const requestAuthHeader = error.config?.headers?.Authorization || error.config?.headers?.authorization || error.config?.headers?.['x-auth-token'];

<<<<<<< HEAD
        // Only force a re-login when the failing request actually carried auth credentials.
        // This avoids bouncing public route navigation back to /login because of optional background fetches.
        if (status === 401) {
            if (requestAuthHeader) {
                clearAuthAndRedirect();
            }
=======
        // Stale / invalid token — wipe it and force re-login
        // DISABLED for development bypass
        /*
        if (status === 401 && (msg.includes('token failed') || msg.includes('invalid signature') || msg.includes('Not authorized'))) {
            clearAuthAndRedirect();
>>>>>>> repo2/main
            return Promise.reject(error);
        }
        */

        // Dispatch api-error event for non-auth errors only (avoids spurious error popups on 401)
        if (typeof window !== 'undefined' && msg && status !== 401) {
            const event = new CustomEvent('api-error', { detail: { message: msg } });
            window.dispatchEvent(event);
        }
        return Promise.reject(error);
    }
);

export const toggleWatchlist = async (symbol, mode) => {
    try {
        const params = mode ? { mode } : {};
        const watchlistsRes = await api.get('/watchlist', { params });
        let watchlists = watchlistsRes.data?.data || watchlistsRes.data || [];
        
        let defaultId = null;
        if (!watchlists || watchlists.length === 0) {
            const createRes = await api.post('/watchlist', { name: mode === 'investor' ? 'Investor Portfolio' : 'Trader Watchlist', mode });
            defaultId = createRes.data?._id;
            watchlists = [createRes.data];
        } else {
            defaultId = watchlists[0]._id;
        }

        const isWatched = (watchlists[0].items || []).some(
            i => String(i.symbol || i).replace(/\.(NS|BO)$/i, '') === String(symbol).replace(/\.(NS|BO)$/i, '')
        );

        if (isWatched) {
            const removeRes = await api.delete(`/watchlist/${defaultId}/remove/${encodeURIComponent(symbol)}`);
            return { action: 'removed', watchlist: removeRes.data };
        } else {
            const addRes = await api.post(`/watchlist/${defaultId}/add`, { symbol });
            return { action: 'added', watchlist: addRes.data };
        }
    } catch (error) {
        console.error('Watchlist toggle failed:', error);
        throw error;
    }
};

export default api;

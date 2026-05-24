import api from './api';

const stripSuffix = (v) => String(v || '').replace(/\.(NS|BO)$/i, '');

export const fetchUserWatchlist = async () => {
    try {
        const res = await api.get('/watchlist');
        const lists = Array.isArray(res.data) ? res.data : [];
        // Return flat list of symbols from the first (default) watchlist
        if (lists.length === 0) return [];
        return (lists[0].items || []).map(i => stripSuffix(i.symbol));
    } catch (err) {
        console.warn('fetchUserWatchlist failed:', err.message);
        return [];
    }
};

export const addSymbolToWatchlist = async (watchlistId, symbol) => {
    try {
        const res = await api.post(`/watchlist/${watchlistId}/add`, { symbol });
        return res.data;
    } catch (err) {
        console.error('addSymbolToWatchlist failed:', err.message);
        throw err;
    }
};

export const removeSymbolFromWatchlist = async (watchlistId, symbol) => {
    try {
        const res = await api.delete(`/watchlist/${watchlistId}/remove/${encodeURIComponent(symbol)}`);
        return res.data;
    } catch (err) {
        console.error('removeSymbolFromWatchlist failed:', err.message);
        throw err;
    }
};

export const createWatchlist = async (name) => {
    try {
        const res = await api.post('/watchlist', { name });
        return res.data;
    } catch (err) {
        console.error('createWatchlist failed:', err.message);
        throw err;
    }
};

// Ensure a default watchlist exists; returns the full watchlist object
// Accepts optional (type, name) args for compatibility with WatchlistContext
export const ensureWatchlist = async (type = 'default', name = 'My Watchlist') => {
    try {
        const res = await api.get('/watchlist');
        const lists = Array.isArray(res.data) ? res.data : [];
        if (lists.length > 0) return lists[0]; // return full object
        // None exists — create one
        const created = await api.post('/watchlist', { name });
        return created.data || null;
    } catch (err) {
        console.warn('ensureWatchlist failed:', err.message);
        return null;
    }
};

// Fetch live price + technical data for a list of symbols in one call
export const fetchWatchlistLiveData = async () => {
    try {
        const res = await api.get('/technical/watchlist');
        const payload = res.data?.data ?? res.data;
        return Array.isArray(payload) ? payload : [];
    } catch (err) {
        console.warn('fetchWatchlistLiveData failed:', err.message);
        return [];
    }
};

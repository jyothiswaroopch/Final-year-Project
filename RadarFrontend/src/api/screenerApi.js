import api from './api';

export const runScreenerScan = async (filters) => {
    try {
        const response = await api.post('/screener/run', filters);
        return response.data;
    } catch (error) {
        console.error('Failed to run screener scan:', error);
        throw error;
    }
};

export const createCustomFilter = async ({ name, options, logicQuery }) => {
    const response = await api.post('/screener/filters', { name, options, logicQuery });
    return response.data;
};

export const getCustomFilters = async () => {
    const response = await api.get('/screener/filters');
    return response.data;
};

export const deleteCustomFilter = async (id) => {
    const response = await api.delete(`/screener/filters/${id}`);
    return response.data;
};

export const createSavedScreener = async ({ name, purpose, filters, visibleFilters, strategyId }) => {
    const response = await api.post('/screener/saved', {
        name,
        purpose,
        filters,
        visibleFilters,
        strategyId,
    });
    return response.data;
};

export const getSavedScreeners = async () => {
    const response = await api.get('/screener/saved');
    return response.data;
};

export const deleteSavedScreener = async (id) => {
    const response = await api.delete(`/screener/saved/${id}`);
    return response.data;
};

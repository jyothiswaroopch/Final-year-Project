import api from './api';

export const fetchEconomicCalendar = async () => {
    try {
        const response = await api.get('/calendar/economic');
        const payload = response.data?.data ?? response.data;
        return Array.isArray(payload) ? payload : [];
    } catch (error) {
        // Fallback to alternate endpoint
        try {
            const response = await api.get('/calendar/events');
            const payload = response.data?.data ?? response.data;
            return Array.isArray(payload) ? payload : [];
        } catch (_) {
            console.warn('Economic calendar unavailable:', error?.message || error);
            return [];
        }
    }
};


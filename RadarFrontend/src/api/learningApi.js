import api from './api';

export const getProgressKey = (courseId, mode = '') => {
    const prefix = mode ? `${mode.toLowerCase()}_` : '';
    return `radar_academy_progress_${prefix}${courseId}`;
};

export const fetchCourses = async (audience = '') => {
    try {
        const url = audience ? `/learning?audience=${audience}` : '/learning';
        const res = await api.get(url);
        return Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
    } catch (err) {
        console.error('Failed to fetch courses:', err);
        return [];
    }
};

export const fetchCourse = async (id) => {
    try {
        const res = await api.get(`/learning/${id}`);
        return res.data?.data ?? res.data ?? null;
    } catch (err) {
        console.error(`Failed to fetch course ${id}:`, err);
        return null;
    }
};

export const fetchProgress = async () => {
    try {
        const res = await api.get('/learning/progress');
        return res.data?.data || {};
    } catch (err) {
        console.error('Failed to fetch learning progress:', err);
        return {};
    }
};

export const saveProgress = async (courseId, chapterId, completed = true) => {
    try {
        await api.post('/learning/progress', { courseId, chapterId, completed });
    } catch (err) {
        // silently fail — progress is also tracked locally
    }
};

export const submitQuiz = async (courseId, answers) => {
    try {
        const res = await api.post('/learning/quiz', { courseId, answers });
        return res.data?.data ?? null;
    } catch (err) {
        console.error('Failed to submit quiz:', err);
        return null;
    }
};

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to add the auth token to headers
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const authAPI = {
    login: (data) => api.post('/auth/login', data),
    register: (data) => api.post('/auth/register', data),
    getMe: () => api.get('/auth/me'),
    completeOnboarding: (data) => api.post('/auth/onboarding', data),
    updateProfile: (data) => api.put('/auth/profile', data),
    changePassword: (data) => api.put('/auth/password', data),
};

export const userAPI = {
    getDashboard: () => api.get(`/user/dashboard?t=${Date.now()}`),
    getLeaderboard: (filter = 'all') => api.get(`/user/leaderboard?filter=${filter}`),
    searchUsers: (query) => api.get(`/user/search?q=${encodeURIComponent(query)}`),
    getPublicProfile: (id) => api.get(`/user/profile/${id}`),
    syncGfg: () => api.post('/user/sync-gfg'),
    toggleStar: (id) => api.post(`/user/star/${id}`),
    getNotifications: () => api.get('/user/notifications'),
};

export const trackerAPI = {
    getToday: () => api.get('/tracker/today'),
    updateTracker: (id, data) => api.put(`/tracker/${id}`, data),
};

export const walletAPI = {
    dailyLogin: () => api.post('/wallet/daily-login'),
    platformSync: () => api.post('/wallet/platform-sync'),
    dailyTracker: () => api.post('/wallet/daily-tracker'),
    redeemBadge: (badgeType) => api.post('/wallet/redeem-badge', { badgeType }),
    getHistory: () => api.get('/wallet/history'),
    getBalance: () => api.get('/wallet/balance'),
};

export default api;

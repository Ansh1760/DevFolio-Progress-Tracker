import axios from 'axios';

const adminApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests
adminApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const adminService = {
    login: (credentials) => adminApi.post('/admin/login', credentials),
    getStats: () => adminApi.get('/admin/stats'),
    getUsers: () => adminApi.get('/admin/users'),
    deleteUser: (id, adminPassword) => adminApi.delete(`/admin/users/${id}`, { data: { adminPassword } }),
    pushNotification: (data) => adminApi.post('/admin/notifications', data),
};

export default adminApi;

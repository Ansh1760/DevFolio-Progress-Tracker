import { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

// Module-level singleton - created once, never recreated
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
});

// Interceptor: always reads the LATEST token from localStorage before every request
// This guarantees the Authorization header is present even if the header was
// cleared by a prior error or an HMR re-render reset the state.
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    } else {
        delete config.headers['Authorization'];
    }
    return config;
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);
    const [rewardEvent, setRewardEvent] = useState(null); // { amount: number, reason: string }

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
            setLoading(true); // Prevent PublicRoute from kicking user back to login before user is fetched
            fetchUser();
        } else {
            localStorage.removeItem('token');
            setUser(null);
            setLoading(false);
        }
    }, [token]);

    const fetchUser = async () => {
        try {
            const res = await api.get('/auth/me');
            setUser(res.data.data);
        } catch (error) {
            console.error('Error fetching user', error);
            // Only destroy the session if the server explicitly rejects the token (401).
            // Network errors (ERR_CONNECTION_REFUSED, etc.) must NOT wipe the token,
            // because they would prevent the onboarding POST from being authenticated.
            if (error.response && error.response.status === 401) {
                setToken(null);
            }
        } finally {
            setLoading(false);
        }
    };

    const login = useCallback(async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        setToken(res.data.token);
        return res.data;
    }, []);

    const register = useCallback(async (email, password) => {
        const res = await api.post('/auth/register', { email, password });
        setToken(res.data.token);
        return res.data;
    }, []);

    const logout = useCallback(() => {
        setToken(null);
    }, []);

    const updateUser = useCallback((updatedFields) => {
        setUser((prev) => ({ ...prev, ...updatedFields }));
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, token, loading, login, register, logout, api, fetchUser, updateUser, rewardEvent, setRewardEvent }}>
            {children}
        </AuthContext.Provider>
    );
};

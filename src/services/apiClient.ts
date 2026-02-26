// ============================================
// API CLIENT - Axios instance with JWT interceptors
// ============================================

import axios from 'axios';
import { STORAGE_KEYS } from '../constants/storageKeys';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
});

// Request interceptor — auto-attach JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

// Response interceptor — handle 401 redirect
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
            // Redirect to login if not already there
            if (!window.location.hash.includes('/login')) {
                window.location.hash = '#/login';
            }
        }
        return Promise.reject(error);
    },
);

export default api;

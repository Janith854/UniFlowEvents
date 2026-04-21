import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002/api';
const API = axios.create({ baseURL: API_BASE_URL });
const AUTH_STORAGE_KEY = 'uniflow_auth';

// Attach token to every request if available
API.interceptors.request.use((req) => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    let token = null;

    if (stored) {
        try {
            token = JSON.parse(stored)?.token || null;
        } catch (error) {
            localStorage.removeItem(AUTH_STORAGE_KEY);
        }
    }

    if (token) req.headers.Authorization = `Bearer ${token}`;
    return req;
});

// Auto-clear stale tokens on 401 (e.g. after in-memory DB restart)
API.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response && err.response.status === 401) {
            const msg = err.response.data?.msg || '';
            if (msg.includes('user not found') || msg.includes('token failed')) {
                localStorage.removeItem(AUTH_STORAGE_KEY);
                // Only redirect if not already on login page
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(err);
    }
);

export default API;

import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });
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

export default API;

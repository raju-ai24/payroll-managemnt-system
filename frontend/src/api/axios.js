import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Request Interceptor — Attach JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('payroll_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor — Handle errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        if (status === 401) {
            localStorage.removeItem('payroll_token');
            localStorage.removeItem('payroll_user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;

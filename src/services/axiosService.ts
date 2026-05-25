import axios from 'axios';

export const httpClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
    timeout: 10_000,
    headers: {
        'Content-Type': 'application/json',
    },
});

httpClient.interceptors.request.use((config) => {
    try {
        const raw = localStorage.getItem('kicksneak_auth_user');
        if (raw) {
            const user = JSON.parse(raw);
            if (user?.token) {
                config.headers.Authorization = `Bearer ${user.token}`;
            }
        }
    } catch {
    }
    return config;
});

httpClient.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('[HTTP Error]', error?.response?.status, error?.message);
        return Promise.reject(error);
    }
);
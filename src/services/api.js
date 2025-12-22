import axios from 'axios';

// URL de base de l'API - À changer selon l'environnement
const API_BASE_URL = 'https://872598f50fae.ngrok-free.app/api';

const api = axios.create({
    baseURL: API_BASE_URL,

    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Intercepteur pour ajouter le token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        const isAuthEndpoint = config.url.includes('/creer-compte-user') || config.url.includes('/connexion-user');

        if (token && !isAuthEndpoint) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error);
        return Promise.reject(error);
    }
);

export default api;

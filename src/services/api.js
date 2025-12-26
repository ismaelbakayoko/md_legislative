import axios from 'axios';
import config from '../config';
import toast from 'react-hot-toast';

// URL de base de l'API - Maintenant gérée par config centralisé
const API_BASE_URL = config.API_URL;

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
    (response) => {
        // Certains endpoints renvoient 200 OK mais avec { success: false, message: "..." }
        if (response.data && response.data.success === false) {
            const errorMessage = response.data.message || response.data.error || "Une opération a échoué.";
            toast.error(errorMessage);
        }
        return response;
    },
    (error) => {
        // Log l'erreur pour le débogage
        const errorData = error.response?.data;
        console.error('API Error:', errorData || error.message);

        // Afficher le message d'erreur dans une notification
        let errorMessage = "Une erreur est survenue lors de la communication avec le serveur.";

        if (error.response) {
            // Le serveur a répondu avec un code d'erreur (4xx, 5xx)
            // On essaie d'extraire le message le plus pertinent
            errorMessage = errorData?.message || errorData?.error || (typeof errorData === 'string' ? errorData : null) || `Erreur: ${error.response.status}`;
        } else if (error.request) {
            // La requête a été faite mais aucune réponse n'a été reçue
            errorMessage = "Impossible de contacter le serveur. Veuillez vérifier votre connexion.";
        } else {
            // Quelque chose s'est passé lors de la configuration de la requête
            errorMessage = error.message;
        }

        // Ne pas afficher de toast pour les erreurs 401 car elles sont gérées par la redirection
        // ou si c'est une erreur de "No token" qui arrive lors du check de statut
        if (error.response?.status !== 401 && errorMessage !== 'No token') {
            toast.error(errorMessage);
        }

        // Si le serveur renvoie 401 (Non autorisé), cela signifie que le token est expiré ou invalide
        if (error.response && error.response.status === 401) {
            console.warn('Session expirée ou Token invalide. Redirection vers la page de connexion...');

            import('../app/store').then(({ store }) => {
                store.dispatch({ type: 'auth/logout' });
            });

            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default api;

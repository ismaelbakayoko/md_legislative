// Configuration centralisée pour l'application
// Cette configuration permet de gérer facilement les URL API et WebSocket

/**
 * Fonction pour extraire l'URL de base de l'API
 * En développement, on utilise une chaîne vide pour exploiter le proxy Vite (vite.config.js)
 * En production, on utilise l'URL définie dans les variables d'environnement
 */
const getBaseURL = () => {
    if (import.meta.env.DEV) {
        return '';
    }
    return import.meta.env.VITE_API_URL || '';
};

/**
 * Fonction pour convertir une URL HTTP(S) en WS(S)
 * Force l'utilisation de WSS si l'URL est en HTTPS
 */
const convertToWebSocketURL = (url) => {
    // Si l'URL est vide (cas du mode dev), on essaie d'utiliser l'URL du .env 
    // pour que le WebSocket se connecte directement au serveur distant
    const effectiveUrl = url || import.meta.env.VITE_API_URL || '';

    if (!effectiveUrl) {
        // En dernier recours, on utilise l'hôte actuel (pourrait ne pas fonctionner avec certains proxies)
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        return `${protocol}//${window.location.host}`;
    }

    // Nettoyer l'URL (supprimer les espaces et slashs de fin)
    const cleanUrl = effectiveUrl.trim().replace(/\/+$/, '');

    // Conversion forcée
    if (cleanUrl.startsWith('https://')) {
        return cleanUrl.replace('https://', 'wss://');
    } else if (cleanUrl.startsWith('http://')) {
        // Optionnel : on pourrait forcer wss même ici si le certificat SSL est géré par un load balancer
        return cleanUrl.replace('http://', 'ws://');
    }

    // Si l'URL ne commence pas par http, on s'assure qu'elle a le bon préfixe
    if (!cleanUrl.startsWith('ws')) {
        return `wss://${cleanUrl}`;
    }

    return cleanUrl;
};

const BASE_URL = getBaseURL();

// Configuration exportée
export const config = {
    // URL complète de l'API (relative en dev via proxy, absolue en prod)
    API_URL: `${BASE_URL}/api`,

    // URL pour WebSocket natif - Configurée pour utiliser WSS
    SOCKET_URL: convertToWebSocketURL(BASE_URL),

    // Options complémentaires pour Socket.IO (si migré plus tard)
    SOCKET_OPTIONS: {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 3000,
    },

    // Drapeaux d'environnement
    IS_PRODUCTION: import.meta.env.PROD,
    IS_DEVELOPMENT: import.meta.env.DEV,
};

export default config;

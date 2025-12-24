// Configuration centralisée pour l'application
// Cette configuration permet de gérer facilement les URL API et WebSocket

// Fonction pour extraire l'URL de base (sans /api)
const getBaseURL = () => {
    // Priorité 1: Variable d'environnement
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }

    // Priorité 2: URL par défaut (ngrok ou locale)
    return 'https://d5bd77b6aedf.ngrok-free.app';
};

// Fonction pour convertir HTTP(S) en WS(S) pour WebSocket natif
const convertToWebSocketURL = (url) => {
    // Nettoyer l'URL des espaces ou slashs de fin
    const cleanUrl = url.trim().replace(/\/+$/, '');

    if (cleanUrl.startsWith('https://')) {
        return cleanUrl.replace('https://', 'wss://');
    } else if (cleanUrl.startsWith('http://')) {
        return cleanUrl.replace('http://', 'ws://');
    }
    return cleanUrl;
};

const BASE_URL = getBaseURL();

// Configuration exportée
export const config = {
    // URL complète de l'API (avec /api)
    API_URL: `${BASE_URL}/api`,

    // URL pour WebSocket natif (utilisé par react-use-websocket)
    SOCKET_URL: convertToWebSocketURL(BASE_URL),

    // Options pour Socket.IO (si utilisé via socket.io-client)
    // Note: react-use-websocket utilise des WebSockets standards, pas Socket.IO
    SOCKET_OPTIONS: {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 3000,
    },

    // Environnement
    IS_PRODUCTION: import.meta.env.PROD,
    IS_DEVELOPMENT: import.meta.env.DEV,
};

export default config;


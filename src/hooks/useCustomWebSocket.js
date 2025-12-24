import { useEffect, useCallback, useRef } from 'react';
import useWebSocket from 'react-use-websocket';
import config from '../config';

/**
 * Hook personnalisé pour gérer les connexions WebSocket avec react-use-websocket
 * 
 * @param {function} onMessage - Fonction appelée quand un message est reçu
 * @returns {object} - { sendMessage, lastMessage, readyState, isConnected, connectionStatus }
 */
const useCustomWebSocket = (onMessage) => {
    // pattern "latest value ref" pour éviter que le useEffect ne dépende de onMessage
    // et ne se redéclenche à chaque re-render si la fonction n'est pas mémoïsée.
    const onMessageRef = useRef(onMessage);

    useEffect(() => {
        onMessageRef.current = onMessage;
    }, [onMessage]);

    const {
        sendJsonMessage,
        lastMessage,
        lastJsonMessage,
        readyState,
        getWebSocket,
    } = useWebSocket(config.SOCKET_URL, {
        onOpen: () => {
            console.log('[WebSocket] ✅ Connexion établie');
        },
        onClose: () => {
            console.log('[WebSocket] ❌ Connexion fermée');
        },
        onError: (event) => {
            console.error('[WebSocket] ⚠️ Erreur:', event);
        },
        shouldReconnect: (closeEvent) => {
            console.log('[WebSocket] 🔄 Tentative de reconnexion...');
            return true;
        },
        reconnectAttempts: 10,
        reconnectInterval: 3000,
        // Évite de parser manuellement le JSON si react-use-websocket peut le faire
        filter: () => true,
        retryOnError: true,
    });

    // Gérer les messages entrants via le ref
    useEffect(() => {
        if (lastMessage !== null) {
            try {
                // Si c'est déjà un objet JSON (via lastJsonMessage), on pourrait l'utiliser
                // mais on garde la logique de parsing pour être sûr du format natif
                const data = JSON.parse(lastMessage.data);
                console.log('[WebSocket] 📨 Message reçu:', data);

                if (onMessageRef.current) {
                    onMessageRef.current(data);
                }
            } catch (error) {
                console.error('[WebSocket] Erreur parsing message:', error);
                if (onMessageRef.current) {
                    onMessageRef.current(lastMessage.data);
                }
            }
        }
    }, [lastMessage]);

    // États de connexion
    const connectionStatus = {
        0: 'Connexion en cours...',
        1: 'Connecté (Live)',
        2: 'Fermeture...',
        3: 'Déconnecté',
    }[readyState] || 'Inconnu';

    const isConnected = readyState === 1; // OPEN = 1

    // Fonction pour envoyer des messages JSON
    const sendData = useCallback((data) => {
        if (isConnected) {
            sendJsonMessage(data);
        } else {
            console.warn('[WebSocket] Impossible d\'envoyer - Non connecté');
        }
    }, [isConnected, sendJsonMessage]);

    return {
        sendMessage: sendData,
        sendJsonMessage,
        lastMessage,
        lastJsonMessage,
        readyState,
        connectionStatus,
        isConnected,
        getWebSocket,
    };
};

export default useCustomWebSocket;

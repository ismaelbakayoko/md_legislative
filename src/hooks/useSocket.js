// import { useEffect, useRef, useState } from 'react';
// import { io } from 'socket.io-client';
// import config from '../config';

// /**
//  * Hook personnalisé pour gérer les connexions WebSocket avec Socket.IO
//  *
//  * @param {string} eventName - Nom de l'événement à écouter
//  * @param {function} callback - Fonction appelée quand l'événement est reçu
//  * @param {object} options - Options supplémentaires pour Socket.IO
//  * @returns {object} - { socket, isConnected, error }
//  */
// const useSocket = (eventName, callback, options = {}) => {
//   const socketRef = useRef(null);
//   const callbackRef = useRef(callback);

//   const [isConnected, setIsConnected] = useState(false);
//   const [error, setError] = useState(null);

//   // Toujours garder le callback à jour
//   useEffect(() => {
//     callbackRef.current = callback;
//   }, [callback]);

//   /**
//    * 🔌 Initialisation de la connexion Socket (UNE SEULE FOIS)
//    */
//   useEffect(() => {
//     if (socketRef.current) return;

//     const socketOptions = {
//       ...config.SOCKET_OPTIONS,
//       ...options,
//     };

//     console.log('[WebSocket] Connexion à:', config.SOCKET_URL);
//     socketRef.current = io(config.SOCKET_URL, socketOptions);

//     const socket = socketRef.current;

//     // === Événements système ===
//     socket.on('connect', () => {
//       console.log('[WebSocket] ✅ Connecté - ID:', socket.id);
//       setIsConnected(true);
//       setError(null);
//     });

//     socket.on('disconnect', (reason) => {
//       console.log('[WebSocket] ❌ Déconnecté:', reason);
//       setIsConnected(false);

//       if (reason === 'io server disconnect') {
//         socket.connect();
//       }
//     });

//     socket.on('connect_error', (err) => {
//       console.error('[WebSocket] ⚠️ Erreur connexion:', err.message);
//       setError(err.message);
//       setIsConnected(false);
//     });

//     socket.on('reconnect_attempt', (attempt) => {
//       console.log(`[WebSocket] 🔄 Tentative reconnexion #${attempt}`);
//     });

//     socket.on('reconnect', (attempt) => {
//       console.log(`[WebSocket] ✅ Reconnecté après ${attempt} tentatives`);
//       setIsConnected(true);
//       setError(null);
//     });

//     socket.on('reconnect_error', (err) => {
//       console.error('[WebSocket] ❌ Erreur reconnexion:', err.message);
//       setError(err.message);
//     });

//     socket.on('reconnect_failed', () => {
//       console.error('[WebSocket] ❌ Reconnexion impossible');
//       setError('Impossible de se reconnecter au serveur.');
//     });

//     return () => {
//       console.log('[WebSocket] 🧹 Fermeture socket');
//       socket.disconnect();
//       socketRef.current = null;
//     };
//   }, []);

//   /**
//    * 🎧 Écoute dynamique des événements métiers
//    */
//   useEffect(() => {
//     if (!socketRef.current || !eventName) return;

//     const socket = socketRef.current;

//     const handler = (data) => {
//       console.log(`[WebSocket] 📨 ${eventName}`, data);
//       callbackRef.current?.(data);
//     };

//     socket.on(eventName, handler);

//     return () => {
//       socket.off(eventName, handler);
//     };
//   }, [eventName]);

//   return {
//     socket: socketRef.current,
//     isConnected,
//     error,
//   };
// };

// export default useSocket;

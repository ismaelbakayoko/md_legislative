// Exemple d'utilisation de useCustomWebSocket avec react-use-websocket

import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useCustomWebSocket from '../hooks/useCustomWebSocket';
import {
    fetchResultatsByDepartement,
    fetchTotauxCirconscription,
    getLieuxVoteByDepartement,
    fetchCandidatesInfo
} from '../features/resultats/resultatsSlice';

/**
 * Exemple 1: Composant simple avec WebSocket
 */
export function SimpleWebSocketExample() {
    const handleMessage = useCallback((data) => {
        console.log('Message WebSocket reçu:', data);

        // Traiter le message selon son type
        if (data.event === 'nouvelle_saisie') {
            // Rafraîchir les données
        } else if (data.event === 'resultats_groupes') {
            // Mettre à jour les résultats groupés
        }
    }, []);

    const { isConnected, connectionStatus, sendMessage } = useCustomWebSocket(handleMessage);

    return (
        <div>
            <div className="status">
                État: {isConnected ? '🟢' : '🔴'} {connectionStatus}
            </div>
            <button onClick={() => sendMessage({ action: 'ping' })}>
                Envoyer Ping
            </button>
        </div>
    );
}

/**
 * Exemple 2: Intégration avec Redux pour ResultatsDepartement
 */
export function ResultatsDepartementWithWebSocket() {
    const dispatch = useDispatch();
    const { elections, selectedCirconscription } = useSelector(state => state.settings);
    const selectedDepartement = useSelector(state => state.settings.selectedDepartement);
    const effectiveId = selectedDepartement?.id_departement;

    // Handler pour les messages WebSocket
    const handleWebSocketMessage = useCallback((data) => {
        console.log('📨 WebSocket message:', data);

        // Vérifier le type d'événement
        const eventType = data.event || data.type;

        switch (eventType) {
            case 'nouvelle_saisie':
            case 'resultats_bv_update':
                console.log('🔄 Mise à jour des résultats BV');

                // Rafraîchir les résultats du département
                if (effectiveId) {
                    dispatch(fetchResultatsByDepartement(effectiveId));
                }

                // Rafraîchir les totaux
                if (elections.length > 0 && selectedCirconscription) {
                    dispatch(fetchTotauxCirconscription({
                        id_election: elections[0].id_election,
                        id_cir: selectedCirconscription.id_cir,
                        nb_tour: 1,
                        annee: new Date().getFullYear().toString()
                    }));
                }

                // Rafraîchir les candidats
                if (elections.length > 0 && selectedCirconscription) {
                    dispatch(fetchCandidatesInfo({
                        id_election: elections[0].id_election,
                        id_cir: selectedCirconscription.id_cir,
                        nb_tour: 1,
                        annee: new Date().getFullYear().toString()
                    }));
                }
                break;

            case 'resultats_groupes':
            case 'resultats_groupes_update':
                console.log('🔄 Mise à jour des résultats groupés');

                // Rafraîchir les lieux de vote
                if (selectedDepartement?.nom_departement) {
                    dispatch(getLieuxVoteByDepartement(selectedDepartement.nom_departement));
                }

                // Rafraîchir les totaux
                if (elections.length > 0 && selectedCirconscription) {
                    dispatch(fetchTotauxCirconscription({
                        id_election: elections[0].id_election,
                        id_cir: selectedCirconscription.id_cir,
                        nb_tour: 1,
                        annee: new Date().getFullYear().toString()
                    }));
                }
                break;

            default:
                console.log('📬 Événement non géré:', eventType);
        }
    }, [dispatch, effectiveId, elections, selectedCirconscription, selectedDepartement]);

    // Utiliser le hook WebSocket
    const { isConnected, connectionStatus } = useCustomWebSocket(handleWebSocketMessage);

    return (
        <div>
            {/* Indicateur de connexion */}
            {!isConnected && (
                <div className="alert alert-warning">
                    ⚠️ WebSocket: {connectionStatus}
                </div>
            )}

            {/* Votre contenu existant */}
        </div>
    );
}

/**
 * Exemple 3: Intégration avec ResultatsParLieu
 */
export function ResultatsParLieuWithWebSocket() {
    const dispatch = useDispatch();
    const selectedDepartement = useSelector(state => state.settings.selectedDepartement);

    const handleWebSocketMessage = useCallback((data) => {
        const eventType = data.event || data.type;

        if (eventType === 'resultats_groupes' || eventType === 'resultats_groupes_update') {
            console.log('📨 Mise à jour lieux de vote');

            if (selectedDepartement?.nom_departement) {
                dispatch(getLieuxVoteByDepartement(selectedDepartement.nom_departement));
            }
        }
    }, [dispatch, selectedDepartement]);

    const { isConnected } = useCustomWebSocket(handleWebSocketMessage);

    return (
        <div>
            {!isConnected && (
                <div className="offline-indicator">
                    Mode hors ligne - Reconnexion en cours...
                </div>
            )}
            {/* Reste du composant */}
        </div>
    );
}

/**
 * Notes importantes:
 * 
 * 1. Format des messages du serveur:
 *    Le serveur doit envoyer des messages JSON avec ce format:
 *    { event: 'nouvelle_saisie', data: {...} }
 *    ou
 *    { type: 'resultats_groupes', payload: {...} }
 * 
 * 2. Reconnexion automatique:
 *    Le hook se reconnecte automatiquement avec 10 tentatives
 *    et un délai de 3 secondes entre chaque tentative
 * 
 * 3. États de connexion:
 *    - readyState 0: CONNECTING
 *    - readyState 1: OPEN (connecté)
 *    - readyState 2: CLOSING
 *    - readyState 3: CLOSED
 */

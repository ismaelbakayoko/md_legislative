// Exemple : Comment écouter plusieurs événements WebSocket
// Dans votre composant (ex: ResultatsParLieu.jsx)

import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useSocket from '../hooks/useSocket';
import { fetchLieuxVoteByDepartementAPI } from '../features/resultats/resultatsSlice';

function ResultatsParLieu() {
    const dispatch = useDispatch();
    const selectedDepartement = useSelector((state) => state.settings.selectedDepartement);

    // Handler pour l'événement resultats_groupes_update
    const handleResultatsUpdate = useCallback((data) => {
        console.log('Mise à jour des résultats reçue:', data);

        // Rafraîchir les données
        if (selectedDepartement?.nom_departement) {
            dispatch(fetchLieuxVoteByDepartementAPI(selectedDepartement.nom_departement));
        }
    }, [dispatch, selectedDepartement]);

    // Écouter l'événement WebSocket
    const { isConnected, error } = useSocket('resultats_groupes_update', handleResultatsUpdate);

    return (
        <div>
            {/* Indicateur de connexion */}
            {!isConnected && (
                <div className="alert alert-warning">
                    Mode hors ligne - Reconnexion en cours...
                </div>
            )}

            {error && (
                <div className="alert alert-danger">
                    Erreur WebSocket: {error}
                </div>
            )}

            {/* Votre contenu */}
        </div>
    );
}

// ============================================
// Exemple 2: Écouter PLUSIEURS événements
// ============================================

function Dashboard() {
    const dispatch = useDispatch();

    // Événement 1: Nouvelle saisie
    const handleNouvelleSaisie = useCallback((data) => {
        dispatch(refreshResultats(data));
    }, [dispatch]);

    // Événement 2: Mise à jour des groupes
    const handleGroupesUpdate = useCallback((data) => {
        dispatch(refreshGroupes(data));
    }, [dispatch]);

    // Événement 3: Notification
    const handleNotification = useCallback((data) => {
        showNotification(data.message);
    }, []);

    // Écouter plusieurs événements
    const socket1 = useSocket('nouvelle_saisie', handleNouvelleSaisie);
    const socket2 = useSocket('resultats_groupes_update', handleGroupesUpdate);
    const socket3 = useSocket('notification', handleNotification);

    return (
        <div>
            {/* Afficher le statut */}
            <div className="connection-status">
                Connexion: {socket1.isConnected ? '🟢' : '🔴'}
            </div>
            {/* Contenu */}
        </div>
    );
}

export default ResultatsParLieu;

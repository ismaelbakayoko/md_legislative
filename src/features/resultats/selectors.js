import { createSelector } from '@reduxjs/toolkit';

const selectResultatsState = (state) => state.resultats;

export const selectResultatsLoading = createSelector(
    [selectResultatsState],
    (resultats) => resultats.loading
);

export const selectResultatsError = createSelector(
    [selectResultatsState],
    (resultats) => resultats.error
);

export const selectCurrentDepartementResultats = createSelector(
    [selectResultatsState],
    (resultats) => resultats.currentDepartement
);

export const selectCurrentCandidatResultats = createSelector(
    [selectResultatsState],
    (resultats) => resultats.currentCandidat
);

// Sélecteur pour trier les candidats par nombre de voix (décroissant)
export const selectSortedCandidats = createSelector(
    [selectCurrentDepartementResultats],
    (departementData) => {
        if (!departementData || !departementData.candidats) return [];

        // Copie pour éviter la mutation
        return [...departementData.candidats].sort((a, b) => b.voix - a.voix);
    }
);

// Sélecteur pour les statistiques globales du département
export const selectDepartementStats = createSelector(
    [selectCurrentDepartementResultats],
    (departementData) => {
        if (!departementData) return null;
        return {
            votants: departementData.votants,
            exprimes: departementData.exprimes,
            participation: departementData.participation, // Pourcentage
            blancs: departementData.blancs,
            nuls: departementData.nuls
        };
    }
);

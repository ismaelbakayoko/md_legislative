import api from '../../services/api';

export const fetchTotauxCirconscriptionAPI = async (data) => {
    const response = await api.post('resultats/totaux-pourcentages-circonscription', data);
    if (response.data && response.data.success) {
        return response.data;
    }
    throw new Error(response.data?.message || "Erreur lors de la récupération des totaux");
};

export const listResultatsGroupesAPI = async (data) => {
    const response = await api.post('resultats/lister-resultats-groupes', { data });
    if (response.data && response.data.success) {
        return response.data.resultats;
    }
    throw new Error(response.data?.message || "Erreur lors de la récupération des résultats du bureau");
};

export const fetchLieuxVoteByDepartementAPI = async (nom_departement) => {
    console.log("API Request - fetchLieuxVoteByDepartementAPI:", { nom_departement });
    try {
        const response = await api.post('importations/lv-bv-dun-departement', { nom_departement });
        console.log("API Response - fetchLieuxVoteByDepartementAPI:", response.data);

        if (response.data && response.data.success) {
            return response.data.dataMap;
        }
        throw new Error(response.data?.message || "Erreur lors de la récupération des lieux de vote");
    } catch (error) {
        console.error("API Error - fetchLieuxVoteByDepartementAPI:", error);
        throw error;
    }
};

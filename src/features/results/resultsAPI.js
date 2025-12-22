import api from '../../services/api';

export const addGlobalResultsAPI = async (data) => {
    // data is a plain object, not FormData since we removed the file upload
    const response = await api.post('/ajouter-resultats-groupes', data);
    if (response.data && response.data.success) {
        return response.data;
    }
    throw new Error(response.data?.message || "Erreur lors de l'ajout des résultats");
};

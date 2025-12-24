import api from '../../services/api';

export const addGlobalResultsAPI = async (data) => {
    console.log('data', data);
    const formData = new FormData();
    Object.keys(data).forEach(key => {
        if (key === 'pv_pdf' && data[key]) {
            formData.append('pv_pdf', data[key]);
        } else if (data[key] !== null && data[key] !== undefined) {
            formData.append(key, data[key]);
        }
    });

    const response = await api.post('resultats/ajouter-resultats-groupes', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    if (response.data && response.data.success) {
        return response.data;
    }
    throw new Error(response.data?.message || "Erreur lors de l'ajout des résultats");
};

export const addDetailedResultsAPI = async (data) => {
    const response = await api.post('resultats/ajouter-resultats-bv', data);
    if (response.data && response.data.success) {
        return response.data;
    }
    throw new Error(response.data?.message || "Erreur lors de l'ajout des résultats détaillés");
};

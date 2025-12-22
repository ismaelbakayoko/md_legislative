import api from '../../services/api';

export const fetchDepartementsAPI = async () => {
    const response = await api.post('/importations/liste-departements');
    if (response.data && response.data.success) {
        return response.data.departements.map(dep => ({
            code: dep.id_departement,
            nom: dep.nom_departement,
            ...dep
        }));
    }
    return [];
};

export const fetchLieuxVoteAPI = async (nomDepartement) => {
    const response = await api.post('/importations/lv-bv-dun-departement', { nom_departement: nomDepartement });
    if (response.data && response.data.success) {
        return response.data;
    }
    return { dataMap: [] };
};

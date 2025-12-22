import api from '../../services/api';

export const fetchRegionsAPI = async () => {
    const response = await api.post('/importations/liste-regions');
    // Assuming response format: { success: true, regions: [...] } or { success: true, data: [...] }
    // User didn't specify exact response structure for list, assuming standard
    if (response.data && response.data.success) {
        return response.data.regions || response.data.data || [];
    }
    return [];
};

export const fetchDepartementsByRegionAPI = async (codeRegion) => {
    const response = await api.post('/importations/liste-departements', { code_region: codeRegion });
    if (response.data && response.data.success) {
        return response.data.departements || response.data.data || [];
    }
    return [];
};

export const fetchCirconscriptionsByRegionAPI = async (idRegion) => {
    const response = await api.post('/importations/liste-circonscriptions', { id_region: idRegion });
    if (response.data && response.data.success) {
        return response.data.circonscriptions || response.data.data || [];
    }
    return [];

};

export const fechelectionsAPI = async () => {
    const response = await api.post('/importations/liste-elections');
    if (response.data && response.data.success) {
        return response.data.elections || response.data.data || [];
    }
    return [];
};

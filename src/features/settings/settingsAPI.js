import api from '../../services/api';

export const fetchRegionsAPI = async () => {
    try {
        const response = await api.post('importations/liste-regions');
        if (response.data && response.data.success) {
            return response.data.regions || response.data.data || [];
        }
        return [];
    } catch (error) {
        console.warn("fetchRegionsAPI failed:", error.message);
        return [];
    }
};

export const fetchDepartementsByRegionAPI = async (codeRegion) => {
    try {
        const response = await api.post('importations/liste-departements', { code_region: codeRegion });
        if (response.data && response.data.success) {
            return response.data.departements || response.data.data || [];
        }
        return [];
    } catch (error) {
        console.warn("fetchDepartementsByRegionAPI failed:", error.message);
        return [];
    }
};

export const fetchCirconscriptionsByRegionAPI = async (idRegion) => {
    try {
        const response = await api.post('importations/liste-circonscriptions', { id_region: idRegion });
        if (response.data && response.data.success) {
            return response.data.circonscriptions || response.data.data || [];
        }
        return [];
    } catch (error) {
        console.warn("fetchCirconscriptionsByRegionAPI failed:", error.message);
        return [];
    }
};

export const fetchElectionsAPI = async () => {
    try {
        const response = await api.post('importations/liste-elections');
        if (response.data && response.data.success) {
            console.log("elections : ", response.data.elections);
            return response.data.elections || response.data.data || [];
        }
        return [];
    } catch (error) {
        console.warn("fetchElectionsAPI failed (Expected if no elections exist):", error.message);
        return [];
    }
};

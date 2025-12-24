import api from '../../services/api';

export const fetchCandidatesInfoAPI = async (data) => {
    const response = await api.post('candidats/liste-partis-candidats-election-en-cours', data);
    console.log("candidates : ",  data , response.data);
    if (response.data && response.data.success) {
        console.log("candidates : ", response.data);
        return response.data;
    }
    throw new Error(response.data?.message || "Erreur lors de la récupération des candidats");
};

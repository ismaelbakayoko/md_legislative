import { getMockResultatsDepartement, getMockCandidat } from '../../services/mockData';

export const fetchResultatsDepartementAPI = async (departementId) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return getMockResultatsDepartement(departementId);
};

export const fetchResultatsCandidatAPI = async (candidatId) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return getMockCandidat(candidatId);
};

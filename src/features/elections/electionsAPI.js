import api from '../../services/api';
import { MOCK_DATA } from '../../services/mockData';

export const fetchActiveElectionAPI = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_DATA.activeElection;
};

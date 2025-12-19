import { MOCK_DATA } from '../../services/mockData';

export const fetchDepartementsAPI = async () => {
    // Simulation délai réseau
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_DATA.departements;
};

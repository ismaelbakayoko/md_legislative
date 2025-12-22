import api from '../../services/api';

export const registerUser = async (userData) => {
    const response = await api.post('/connexion/creer-compte-user', userData);
    return response.data;
};

export const loginUserAPI = async (credentials) => {
    const response = await api.post('/connexion/connexion-user', credentials);
    console.log(response);
    return response.data;
};

export const verifyTokenAPI = async (token) => {
    const response = await api.post('/connexion/comprare-token', { token });
    return response.data;
};

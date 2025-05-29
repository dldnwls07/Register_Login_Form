import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const authService = {
    checkUsername: async (username) => {
        const response = await axios.post(`${API_URL}/auth/check-username`, { username });
        return response.data;
    },

    sendVerificationEmail: async (email) => {
        const response = await axios.post(`${API_URL}/auth/verify-email`, { email });
        return response.data;
    },

    verifyCode: async (email, code) => {
        const response = await axios.post(`${API_URL}/auth/verify-code`, { email, code });
        return response.data;
    },

    register: async (userData) => {
        const response = await axios.post(`${API_URL}/auth/register`, userData);
        return response.data;
    },

    login: async (credentials) => {
        const response = await axios.post(`${API_URL}/auth/login`, credentials);
        return response.data;
    }
};

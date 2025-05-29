import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const authService = {
    checkUsername: async (username) => {
        const response = await axios.post(`${API_URL}/auth/check-username`, { username });
        return response.data;
    },

    sendVerificationEmail: async (email) => {
        return axios.post(`${API_URL}/auth/send-otp`, { email });
    },

    verifyCode: async (email, code) => {
        return axios.post(`${API_URL}/auth/verify-otp`, { email, code });
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

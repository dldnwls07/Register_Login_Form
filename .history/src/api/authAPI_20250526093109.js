import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export const checkUsername = async (username) => {
    const response = await axios.post(`${API_URL}/auth/check-username`, { username });
    return response.data;
};

export const sendVerificationEmail = async (email) => {
    const response = await axios.post(`${API_URL}/auth/send-verification`, { email });
    return response.data;
};

export const verifyEmailCode = async (code) => {
    const response = await axios.post(`${API_URL}/auth/verify-code`, { code });
    return response.data;
};

export const register = async (userData) => {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    return response.data;
};

export const login = async (credentials) => {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    return response.data;
};

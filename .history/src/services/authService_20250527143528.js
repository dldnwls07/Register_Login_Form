import api from '../utils/apiService';

// 모든 인증 관련 요청은 api 인스턴스를 사용하도록 통일
export const authService = {
    checkUsername: async (username) => {
        // GET 방식으로 일관성 있게 변경
        const response = await api.get(`/auth/check-username?username=${encodeURIComponent(username)}`);
        return response.data;
    },

    sendVerificationEmail: async (email) => {
        return api.post('/auth/send-otp', { email });
    },

    verifyCode: async (email, code) => {
        return api.post('/auth/verify-otp', { email, code });
    },

    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    }
};

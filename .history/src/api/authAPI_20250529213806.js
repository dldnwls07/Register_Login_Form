import axios from './axiosConfig';

const API_URL = process.env.REACT_APP_API_URL;

export const checkUsername = async (username) => {
    const response = await axios.get(`${API_URL}/auth/check-username`, {
        params: { username }
    });
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
    console.log('authAPI register 함수 - 입력 userData:', userData);
    // 중첩된 username 객체를 평탄화하여 전송
    const flatData = {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        confirmPassword: userData.confirmPassword,
        isEmailVerified: userData.isEmailVerified,
        emailVerificationToken: userData.emailVerificationToken,
        role: userData.role
    };
    console.log('authAPI register 함수 - 평탄화된 flatData:', flatData);

    const response = await axios.post('/auth/register', flatData);
    return response.data;
};

export const login = async (credentials) => {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    return response.data;
};

export const updateUserProfile = async (userData) => {
    try {
        const response = await api.put(`/auth/profile`, userData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || '프로필 업데이트 실패');
    }
};

export const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await api.post('/api/auth/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || '비밀번호 변경에 실패했습니다.');
  }
};

export const checkEmail = async (email) => {
    const response = await axios.get(`${API_URL}/auth/check-email`, {
        params: { email }
    });
    return response.data;
};

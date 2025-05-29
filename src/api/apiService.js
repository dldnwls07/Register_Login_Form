import axios from 'axios';

const BASE_URL = 'http://localhost:4000'; // API 서버 URL

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 요청 인터셉터
axiosInstance.interceptors.request.use(
    (config) => {
        // 요청 전에 필요한 작업 수행 (예: 토큰 추가)
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 응답 인터셉터
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // 오류 처리
        return Promise.reject(error);
    }
);

export const post = async (url, data) => {
    try {
        console.log(`[DEBUG] POST 요청: ${url}`, data);
        const response = await axiosInstance.post(url, data);
        
        if (response.data) {
            console.log(`[DEBUG] 응답 데이터:`, response.data);
            return response.data;
        }
        
        return { success: false, message: '응답 데이터가 없습니다.' };
    } catch (error) {
        console.error(`❌ API 오류 ${error.response?.status}: ${url}`);
        console.error(error.response?.data || error.message);
        
        if (error.response?.data) {
            return error.response.data;
        }
        
        throw error;
    }
};

export const get = async (url, params) => {
    try {
        const response = await axiosInstance.get(url, { params });
        return response.data;
    } catch (error) {
        console.error(`❌ API 오류 ${error.response?.status}: ${url}`);
        console.error(error.response?.data || error.message);
        
        if (error.response?.data) {
            return error.response.data;
        }
        
        throw error;
    }
};

export const put = async (url, data) => {
    try {
        const response = await axiosInstance.put(url, data);
        return response.data;
    } catch (error) {
        console.error(`❌ API 오류 ${error.response?.status}: ${url}`);
        console.error(error.response?.data || error.message);
        
        if (error.response?.data) {
            return error.response.data;
        }
        
        throw error;
    }
};

export const del = async (url) => {
    try {
        const response = await axiosInstance.delete(url);
        return response.data;
    } catch (error) {
        console.error(`❌ API 오류 ${error.response?.status}: ${url}`);
        console.error(error.response?.data || error.message);
        
        if (error.response?.data) {
            return error.response.data;
        }
        
        throw error;
    }
};
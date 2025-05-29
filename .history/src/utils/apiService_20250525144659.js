// src/utils/apiService.js
import axios from 'axios';

// API 기본 URL 설정
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// axios 인스턴스 생성
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true, // 쿠키 전송을 위해 필요
  timeout: 10000, // 10초 타임아웃 설정
});

const getToken = async () => {
  const response = await fetch('/api/auth/token');
  const data = await response.json();
  return data.token;
};

// 요청 인터셉터 - 인증 토큰 포함
api.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 - 인증 오류 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 토큰 만료 또는 인증 오류 처리
    if (error.response?.status === 401) {
      // 로그아웃 처리
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // 로그인 페이지로 리디렉션 (현재 URL 저장)
      const currentPath = window.location.pathname;
      if (currentPath !== '/login') {
        window.location = `/login?redirect=${currentPath}`;
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;

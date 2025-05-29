// src/utils/apiService.js
import axios from 'axios';

// API 기본 URL 설정 (로깅 추가)
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
console.log('API 서비스 초기화 - 기본 URL:', API_URL);

// axios 인스턴스 생성
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10000, // 10초 타임아웃 추가
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    const { method, url, data, params } = config;
    console.log(`⭐️ API 요청: ${method?.toUpperCase()} ${url}`, {
      데이터: method !== 'get' ? data : undefined,
      파라미터: params,
    });

    // 전체 URL 로깅
    const fullUrl = `${config.baseURL}${config.url}`;
    console.log('요청 전체 URL:', fullUrl);

    return config;
  },
  (error) => {
    console.error('⚠️ API 요청 오류:', error.message);
    return Promise.reject(error);
  }
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API 응답 성공: ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    if (error.response) {
      // 서버 응답이 있는 경우
      console.error(
        `❌ API 오류 ${error.response.status}: ${error.response.config.url}`,
        error.response.data
      );
    } else if (error.request) {
      // 요청은 보냈으나 응답이 없는 경우
      console.error('❌ 서버 응답 없음:', error.request);
      console.error('요청 정보:', error.config);
    } else {
      // 요청 자체에 문제가 있는 경우
      console.error('❌ 요청 설정 오류:', error.message);
    }
    return Promise.reject(error);
  }
);

// 서버 상태 확인 함수
export const checkServerStatus = async () => {
  try {
    const response = await api.get('/status');
    return response.data;
  } catch (error) {
    console.error('서버 상태 확인 실패');
    return { status: 'error', message: '서버 연결 실패' };
  }
};

export default api;

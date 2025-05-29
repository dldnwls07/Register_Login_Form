// src/utils/apiService.js
import axios from 'axios';

// API 기본 URL 설정
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

console.log('[API] 서비스 초기화, 기본 URL:', API_URL);

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
    console.log(
      `[API] 요청: ${config.method?.toUpperCase()} ${config.url}`,
      config.params || config.data || '데이터 없음'
    );
    return config;
  },
  (error) => {
    console.error('[API] 요청 오류:', error.message);
    return Promise.reject(error);
  }
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    console.log(`[API] 응답: ${response.config.url} 성공:`, response.data);
    return response;
  },
  (error) => {
    if (error.response) {
      // 서버 응답이 있는 경우
      console.error(
        `[API] 오류 ${error.response.status}:`,
        error.response.data || error.message
      );
    } else if (error.request) {
      // 요청은 보냈으나 응답이 없는 경우
      console.error('[API] 서버 응답 없음:', error.request);
    } else {
      // 요청 자체에 오류가 있는 경우
      console.error('[API] 요청 설정 오류:', error.message);
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
    console.error('[API] 서버 상태 확인 실패');
    return { status: 'error', message: '서버 연결 실패' };
  }
};

export default api;

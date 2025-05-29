/**
 * 중앙화된 로컬스토리지 키 관리
 * 애플리케이션 전체에서 사용되는 스토리지 키를 한 곳에서 관리합니다.
 */

// 앱 네임스페이스 (모든 키에 공통적으로 적용)
const APP_NAMESPACE = 'my-money-app-';

// 사용자 인증 관련 키
export const AUTH_KEYS = {
  USERS: `${APP_NAMESPACE}auth-users`,
  CURRENT_USER: `${APP_NAMESPACE}auth-current-user`,
  TOKENS: `${APP_NAMESPACE}auth-tokens`,
  SECRET_KEY: `${APP_NAMESPACE}secret-key`,
  LOGIN_ATTEMPTS: `${APP_NAMESPACE}login-attempts`
};

// 데이터베이스 관련 키
export const DB_KEYS = {
  TRANSACTIONS: `${APP_NAMESPACE}transactions`,
  CATEGORIES: {
    MAIN: `${APP_NAMESPACE}categories-main`,
    SUB: `${APP_NAMESPACE}categories-sub`,
    DETAIL: `${APP_NAMESPACE}categories-detail`
  },
  GOALS: `${APP_NAMESPACE}financial-goals`
};

// 유틸리티 및 설정 관련 키
export const UTILITY_KEYS = {
  THEME: `${APP_NAMESPACE}theme`,
  LANGUAGE: `${APP_NAMESPACE}language`,
  USER_PREFERENCES: `${APP_NAMESPACE}user-preferences`,
  LAST_ACTIVITY: `${APP_NAMESPACE}last-activity`
};

// 캐싱 관련 키
export const CACHE_KEYS = {
  TRANSACTIONS_CACHE: `${APP_NAMESPACE}cache-transactions`,
  ANALYSIS_CACHE: `${APP_NAMESPACE}cache-analysis`,
  CATEGORIES_CACHE: `${APP_NAMESPACE}cache-categories`
};

// 전체 키 목록 접근 유틸리티 함수
export const getAllStorageKeys = () => {
  return [
    ...Object.values(AUTH_KEYS),
    ...Object.values(DB_KEYS.CATEGORIES),
    DB_KEYS.TRANSACTIONS,
    DB_KEYS.GOALS,
    ...Object.values(UTILITY_KEYS),
    ...Object.values(CACHE_KEYS)
  ];
};

// 스토리지 클리어 함수
export const clearAppStorage = () => {
  getAllStorageKeys().forEach(key => {
    localStorage.removeItem(key);
  });
};

// 스토리지 데이터 크기 확인 함수
export const getStorageUsage = () => {
  let totalBytes = 0;
  getAllStorageKeys().forEach(key => {
    const data = localStorage.getItem(key);
    if (data) {
      totalBytes += new Blob([data]).size;
    }
  });
  
  return {
    bytes: totalBytes,
    kilobytes: Math.round(totalBytes / 1024),
    megabytes: Math.round(totalBytes / 1024 / 1024 * 100) / 100
  };
};

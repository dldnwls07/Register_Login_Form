/**
 * 스토리지 키 상수 정의
 * 애플리케이션 전체에서 일관된 스토리지 키 사용을 위한 모듈
 */

// 애플리케이션 네임스페이스 - 다른 앱과의 키 충돌 방지
const APP_NAMESPACE = 'money_app';

// 인증 관련 키
export const AUTH_KEYS = {
  USERS: 'users',
  CURRENT_USER: 'current_user',
  TOKENS: 'auth_tokens',
  LOGIN_ATTEMPTS: 'login_attempts',
  VERIFICATION_CODES: 'verification_codes'
};

// 설정 관련 키
export const SETTINGS_KEYS = {
  THEME: 'theme',
  LANGUAGE: 'language',
  NOTIFICATIONS: 'notifications'
};

// 트랜잭션 관련 키
export const TRANSACTION_KEYS = {
  RECENT: 'recent_transactions',
  DRAFTS: 'transaction_drafts'
};

/**
 * 키에 네임스페이스 추가하는 함수
 * @param {string} key - 원본 키 이름
 * @returns {string} - 네임스페이스가 추가된 키 이름
 */
export const namespaceKey = (key) => `${APP_NAMESPACE}_${key}`;

export default {
  AUTH_KEYS,
  SETTINGS_KEYS,
  TRANSACTION_KEYS,
  namespaceKey
};

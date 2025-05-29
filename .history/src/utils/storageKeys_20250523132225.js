/**
 * 애플리케이션에서 사용하는 모든 localStorage 키를 관리하는 파일
 * 이렇게 중앙화하면 키 관리가 용이하고 충돌을 방지할 수 있습니다.
 */

// 인증 관련 키
export const AUTH_KEYS = {
  USERS: 'auth_users',
  CURRENT_USER: 'auth_current_user',
  TOKENS: 'auth_tokens',
  LOGIN_ATTEMPTS: 'auth_login_attempts',
  SESSION_DATA: 'auth_session_data'
};

// 데이터베이스 관련 키
export const DB_KEYS = {
  TRANSACTIONS: 'db_transactions',
  CATEGORIES: {
    MAIN: 'db_main_categories',
    SUB: 'db_sub_categories',
    DETAIL: 'db_detail_categories'
  },
  GOALS: 'db_financial_goals',
  SETTINGS: 'db_user_settings'
};

// 사용자 설정 관련 키
export const SETTINGS_KEYS = {
  THEME: 'settings_theme',
  LANGUAGE: 'settings_language',
  CURRENCY: 'settings_currency',
  NOTIFICATIONS: 'settings_notifications'
};

// 임시 데이터 저장 관련 키
export const TEMP_KEYS = {
  DRAFT_ENTRIES: 'temp_draft_entries',
  FORM_DATA: 'temp_form_data',
  MIGRATION_STATUS: 'temp_migration_status'
};

// 앱 상태 관련 키
export const APP_STATE_KEYS = {
  LAST_ACTIVE: 'app_last_active',
  VERSION: 'app_version',
  TOUR_COMPLETED: 'app_tour_completed',
  INITIAL_SETUP: 'app_initial_setup'
};

/**
 * 키 앞에 앱 네임스페이스를 붙여서 다른 앱과 충돌하지 않도록 하는 함수
 * @param {string} key - 원본 키 이름
 * @returns {string} 네임스페이스가 추가된 키 이름
 */
export function namespaceKey(key) {
  const APP_NAMESPACE = 'my_money_app_';
  return `${APP_NAMESPACE}${key}`;
}

/**
 * 사용자별 데이터 키를 생성하는 함수
 * @param {string} baseKey - 기본 키 이름
 * @param {string} userId - 사용자 ID
 * @returns {string} 사용자별 고유 키
 */
export function getUserSpecificKey(baseKey, userId) {
  return `${baseKey}_user_${userId}`;
}
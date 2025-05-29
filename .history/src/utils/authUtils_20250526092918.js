/**
 * 인증 관련 유틸리티 함수들과 상수들
 * 보안 강화 및 로그인 시도 관리를 위한 기능 제공
 */

/**
 * 인증 관련 에러 코드 정의
 */
export const AUTH_ERROR_CODES = {
  INVALID_CREDENTIALS: 'auth/invalid-credentials',
  USER_NOT_FOUND: 'auth/user-not-found',
  WRONG_PASSWORD: 'auth/wrong-password',
  EMAIL_IN_USE: 'auth/email-already-in-use',
  USERNAME_IN_USE: 'auth/username-already-in-use',
  WEAK_PASSWORD: 'auth/weak-password',
  ACCOUNT_LOCKED: 'auth/account-locked',
  INVALID_TOKEN: 'auth/invalid-token',
  TOKEN_EXPIRED: 'auth/token-expired',
  SESSION_EXPIRED: 'auth/session-expired',
  UNAUTHORIZED: 'auth/unauthorized',
  TOO_MANY_ATTEMPTS: 'auth/too-many-attempts'
};

/**
 * 인증 관련 에러 클래스
 */
export class AuthError extends Error {
  constructor(code, message) {
    super(message || getDefaultMessageForCode(code));
    this.code = code;
    this.name = 'AuthError';
  }
}

/**
 * 에러 코드에 따른 기본 메시지 반환
 */
function getDefaultMessageForCode(code) {
  switch (code) {
    case AUTH_ERROR_CODES.INVALID_CREDENTIALS:
      return '아이디 또는 비밀번호가 일치하지 않습니다.';
    case AUTH_ERROR_CODES.USER_NOT_FOUND:
      return '사용자를 찾을 수 없습니다.';
    case AUTH_ERROR_CODES.WRONG_PASSWORD:
      return '잘못된 비밀번호입니다.';
    case AUTH_ERROR_CODES.EMAIL_IN_USE:
      return '이미 사용 중인 이메일 주소입니다.';
    case AUTH_ERROR_CODES.USERNAME_IN_USE:
      return '이미 사용 중인 사용자 이름입니다.';
    case AUTH_ERROR_CODES.WEAK_PASSWORD:
      return '보안에 취약한 비밀번호입니다. 더 강력한 비밀번호를 사용하세요.';
    case AUTH_ERROR_CODES.ACCOUNT_LOCKED:
      return '로그인 시도 횟수를 초과하여 계정이 잠겼습니다. 나중에 다시 시도하세요.';
    case AUTH_ERROR_CODES.INVALID_TOKEN:
      return '유효하지 않은 인증 토큰입니다. 다시 로그인하세요.';
    case AUTH_ERROR_CODES.TOKEN_EXPIRED:
      return '인증 토큰이 만료되었습니다. 다시 로그인하세요.';
    case AUTH_ERROR_CODES.SESSION_EXPIRED:
      return '세션이 만료되었습니다. 다시 로그인하세요.';
    case AUTH_ERROR_CODES.UNAUTHORIZED:
      return '접근 권한이 없습니다.';
    case AUTH_ERROR_CODES.TOO_MANY_ATTEMPTS:
      return '너무 많은 로그인 시도가 있었습니다. 잠시 후 다시 시도하세요.';
    default:
      return '인증 오류가 발생했습니다.';
  }
}

/**
 * 로그인 시도를 기록하는 함수
 * @param {string} usernameOrEmail - 시도한 사용자명 또는 이메일
 * @param {boolean} success - 로그인 성공 여부
 * @param {string} ipOrFingerprint - IP 또는 브라우저 지문 정보
 */
export function trackLoginAttempt(usernameOrEmail, success, ipOrFingerprint) {
  try {
    // 기존 로그인 시도 기록 가져오기
    const loginAttemptsKey = AUTH_KEYS.LOGIN_ATTEMPTS;
    const existingAttempts = JSON.parse(localStorage.getItem(loginAttemptsKey) || '{}');
    
    // 사용자별 시도 기록
    const userAttempts = existingAttempts[usernameOrEmail] || [];
    
    // 새로운 시도 기록 추가
    userAttempts.push({
      timestamp: Date.now(),
      success,
      ipOrFingerprint: ipOrFingerprint || getBrowserFingerprint(),
      userAgent: navigator.userAgent
    });
    
    // 30일이 지난 기록은 제거 (오래된 기록 정리)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const filteredAttempts = userAttempts.filter(attempt => attempt.timestamp > thirtyDaysAgo);
    
    // 업데이트된 시도 기록 저장
    existingAttempts[usernameOrEmail] = filteredAttempts;
    localStorage.setItem(loginAttemptsKey, JSON.stringify(existingAttempts));
    
    return true;
  } catch (error) {
    console.error('로그인 시도 기록 중 오류 발생:', error);
    return false;
  }
}

/**
 * 계정 잠금 상태 확인
 * @param {string} usernameOrEmail - 확인할 사용자명 또는 이메일
 * @returns {Object} - 잠금 상태와 남은 시간 정보
 */
export function checkLoginLock(usernameOrEmail) {
  try {
    // 기존 로그인 시도 기록 가져오기
    const loginAttemptsKey = AUTH_KEYS.LOGIN_ATTEMPTS;
    const existingAttempts = JSON.parse(localStorage.getItem(loginAttemptsKey) || '{}');
    
    // 사용자의 시도 기록
    const userAttempts = existingAttempts[usernameOrEmail] || [];
    
    // 최근 30분 이내의 실패한 로그인 시도 횟수
    const thirtyMinutesAgo = Date.now() - (30 * 60 * 1000);
    const recentFailedAttempts = userAttempts.filter(
      attempt => !attempt.success && attempt.timestamp > thirtyMinutesAgo
    ).length;
    
    // 최근 실패 횟수가 5회 이상인 경우 계정 잠금 (5회 실패 시 15분 잠금)
    if (recentFailedAttempts >= 5) {
      // 마지막 실패 시도 시간
      const lastFailedAttempt = userAttempts
        .filter(attempt => !attempt.success)
        .sort((a, b) => b.timestamp - a.timestamp)[0];
      
      // 잠금 해제까지 남은 시간 계산 (15분)
      const lockDuration = 15 * 60 * 1000; // 15분
      const unlockTime = lastFailedAttempt.timestamp + lockDuration;
      const remainingTime = Math.max(0, unlockTime - Date.now());
      
      return {
        locked: remainingTime > 0,
        remainingTime,
        attempts: recentFailedAttempts
      };
    }
    
    return { locked: false, remainingTime: 0, attempts: recentFailedAttempts };
  } catch (error) {
    console.error('계정 잠금 상태 확인 중 오류 발생:', error);
    return { locked: false, remainingTime: 0, attempts: 0 };
  }
}

/**
 * 보안 이벤트 로깅
 * @param {string} eventType - 이벤트 유형
 * @param {Object} data - 이벤트 관련 데이터
 */
export function logSecurityEvent(eventType, data = {}) {
  try {
    // 보안 이벤트 기록 키
    const securityLogKey = 'security_events_log';
    
    // 기존 로그 가져오기
    const existingLogs = JSON.parse(localStorage.getItem(securityLogKey) || '[]');
    
    // 새 이벤트 추가
    existingLogs.push({
      timestamp: Date.now(),
      eventType,
      ...data,
      userAgent: navigator.userAgent,
      fingerprint: getBrowserFingerprint()
    });
    
    // 로그 크기 제한 (최근 100개만 유지)
    const trimmedLogs = existingLogs.slice(-100);
    
    // 업데이트된 로그 저장
    localStorage.setItem(securityLogKey, JSON.stringify(trimmedLogs));
    
    // 심각한 보안 이벤트는 사용자에게 알림
    if (['password_change', 'account_locked', 'suspicious_login', 'token_reuse'].includes(eventType)) {
      // 실제 구현에서는 여기서 사용자에게 알림을 보낼 수 있음
      console.warn(`보안 이벤트 발생: ${eventType}`);
    }
    
    return true;
  } catch (error) {
    console.error('보안 이벤트 로깅 중 오류 발생:', error);
    return false;
  }
}

/**
 * 간단한 브라우저 지문 생성
 * 실제 프로덕션 환경에서는 더 강력한 지문 생성 라이브러리 사용 권장
 * @returns {string} - 브라우저 지문
 */
function getBrowserFingerprint() {
  const components = [
    navigator.userAgent,
    navigator.language,
    window.screen.colorDepth,
    new Date().getTimezoneOffset(),
    !!window.sessionStorage,
    !!window.localStorage,
    window.screen.width + 'x' + window.screen.height,
    (navigator.hardwareConcurrency || 'unknown') + 'cores'
  ];
  
  return btoa(components.join('###')).substr(0, 32);
}

/**
 * 최대 로그인 시도 횟수를 초과했는지 확인
 * @param {string} usernameOrEmail - 사용자명 또는 이메일
 * @returns {boolean} - 최대 시도 횟수 초과 여부
 */
export function hasExceededMaxLoginAttempts(usernameOrEmail) {
  const lockStatus = checkLoginLock(usernameOrEmail);
  return lockStatus.locked;
}

/**
 * 인증 토큰의 유효성을 검증
 * @param {string} token - 검증할 토큰
 * @returns {Object} - 검증 결과
 */
export function checkTokenValidity(token) {
  if (!token) return { valid: false, reason: 'no_token' };
  
  try {
    // 토큰 데이터 가져오기
    const tokens = JSON.parse(localStorage.getItem(AUTH_KEYS.TOKENS) || '{}');
    const tokenData = tokens[token];
    
    if (!tokenData) return { valid: false, reason: 'invalid_token' };
    if (tokenData.expiresAt < Date.now()) return { valid: false, reason: 'expired' };
    if (tokenData.userAgent !== navigator.userAgent) return { valid: false, reason: 'user_agent_mismatch' };
    
    return { valid: true };
  } catch (error) {
    console.error('토큰 유효성 검증 중 오류:', error);
    return { valid: false, reason: 'validation_error' };
  }
}
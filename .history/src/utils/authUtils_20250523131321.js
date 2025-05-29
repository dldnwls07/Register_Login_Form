/**
 * 인증 관련 오류 클래스 및 유틸리티
 */

// 사용자 인증 관련 오류 클래스
export class AuthError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
  }
}

// 인증 오류 코드
export const AUTH_ERROR_CODES = {
  INVALID_CREDENTIALS: 'auth/invalid-credentials',
  USER_NOT_FOUND: 'auth/user-not-found',
  EMAIL_ALREADY_EXISTS: 'auth/email-already-in-use',
  USERNAME_ALREADY_EXISTS: 'auth/username-already-in-use',
  WEAK_PASSWORD: 'auth/weak-password',
  SESSION_EXPIRED: 'auth/session-expired',
  INVALID_TOKEN: 'auth/invalid-token',
  DEVICE_CHANGED: 'auth/device-changed',
  GENERAL_ERROR: 'auth/general-error'
};

// 로그인 시도 횟수 추적 및 제한 기능
const LOGIN_ATTEMPTS_KEY = 'auth_login_attempts';
const MAX_LOGIN_ATTEMPTS = 5; // 최대 5회 시도
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15분 잠금

/**
 * 로그인 시도 추적
 * @param {string} identifier - 사용자 식별자 (이메일, 아이디 또는 IP)
 * @param {boolean} successful - 로그인 성공 여부
 * @returns {Object} - 로그인 시도 상태
 */
export function trackLoginAttempt(identifier, successful) {
  // 식별자 익명화 (보안)
  const hashedIdentifier = btoa(identifier).slice(0, 10);
  
  try {
    // 기존 시도 기록 가져오기
    const attemptsData = JSON.parse(localStorage.getItem(LOGIN_ATTEMPTS_KEY) || '{}');
    const now = Date.now();
    
    // 만료된 기록 제거
    Object.keys(attemptsData).forEach(key => {
      if (attemptsData[key].lockUntil && attemptsData[key].lockUntil < now) {
        delete attemptsData[key];
      }
    });
    
    // 해당 사용자의 이전 시도 기록
    const userAttempts = attemptsData[hashedIdentifier] || {
      count: 0,
      lastAttempt: 0,
      lockUntil: null
    };
    
    // 잠금 상태 확인
    if (userAttempts.lockUntil && userAttempts.lockUntil > now) {
      const remainingTime = Math.ceil((userAttempts.lockUntil - now) / 1000 / 60);
      return {
        locked: true,
        attemptsLeft: 0,
        remainingLockTime: remainingTime,
        message: `계정이 잠겼습니다. ${remainingTime}분 후에 다시 시도해주세요.`
      };
    }
    
    // 성공적인 로그인 시 시도 횟수 초기화
    if (successful) {
      delete attemptsData[hashedIdentifier];
      localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(attemptsData));
      return { locked: false, attemptsLeft: MAX_LOGIN_ATTEMPTS };
    }
    
    // 실패한 경우 시도 횟수 증가
    userAttempts.count += 1;
    userAttempts.lastAttempt = now;
    
    // 최대 시도 횟수 초과 시 계정 잠금
    if (userAttempts.count >= MAX_LOGIN_ATTEMPTS) {
      userAttempts.lockUntil = now + LOCKOUT_DURATION;
      attemptsData[hashedIdentifier] = userAttempts;
      localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(attemptsData));
      
      return {
        locked: true,
        attemptsLeft: 0,
        remainingLockTime: LOCKOUT_DURATION / 1000 / 60,
        message: `로그인 시도 횟수를 초과했습니다. 15분 후에 다시 시도해주세요.`
      };
    }
    
    // 아직 시도 횟수가 남은 경우
    attemptsData[hashedIdentifier] = userAttempts;
    localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(attemptsData));
    
    return {
      locked: false,
      attemptsLeft: MAX_LOGIN_ATTEMPTS - userAttempts.count,
      message: `로그인에 실패했습니다. 남은 시도 횟수: ${MAX_LOGIN_ATTEMPTS - userAttempts.count}회`
    };
  } catch (error) {
    console.error('로그인 시도 추적 오류:', error);
    return { locked: false, attemptsLeft: MAX_LOGIN_ATTEMPTS - 1 };
  }
}

/**
 * 사용자의 로그인 시도 잠금 확인
 * @param {string} identifier - 사용자 식별자
 * @returns {Object} - 잠금 상태 정보
 */
export function checkLoginLock(identifier) {
  const hashedIdentifier = btoa(identifier).slice(0, 10);
  
  try {
    const attemptsData = JSON.parse(localStorage.getItem(LOGIN_ATTEMPTS_KEY) || '{}');
    const userAttempts = attemptsData[hashedIdentifier];
    const now = Date.now();
    
    if (!userAttempts) {
      return { locked: false, attemptsLeft: MAX_LOGIN_ATTEMPTS };
    }
    
    if (userAttempts.lockUntil && userAttempts.lockUntil > now) {
      const remainingTime = Math.ceil((userAttempts.lockUntil - now) / 1000 / 60);
      return {
        locked: true,
        attemptsLeft: 0,
        remainingLockTime: remainingTime,
        message: `계정이 잠겼습니다. ${remainingTime}분 후에 다시 시도해주세요.`
      };
    }
    
    return {
      locked: false,
      attemptsLeft: MAX_LOGIN_ATTEMPTS - (userAttempts.count || 0)
    };
  } catch (error) {
    return { locked: false, attemptsLeft: MAX_LOGIN_ATTEMPTS };
  }
}

// 보안 감사 로그
const AUDIT_LOG_KEY = 'auth_audit_log';
const MAX_LOG_ENTRIES = 100;

/**
 * 보안 감사 로그 기록
 * @param {string} eventType - 이벤트 유형
 * @param {string} userId - 사용자 ID
 * @param {Object} details - 추가 세부 정보
 */
export function logSecurityEvent(eventType, userId, details = {}) {
  try {
    // 기존 로그 가져오기
    const logs = JSON.parse(localStorage.getItem(AUDIT_LOG_KEY) || '[]');
    
    // 새 로그 항목 생성
    const logEntry = {
      timestamp: new Date().toISOString(),
      eventType,
      userId: userId || 'anonymous',
      userAgent: window.navigator.userAgent,
      details
    };
    
    // 로그 앞에 추가
    logs.unshift(logEntry);
    
    // 최대 항목 수 제한
    while (logs.length > MAX_LOG_ENTRIES) {
      logs.pop();
    }
    
    // 로그 저장
    localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(logs));
  } catch (error) {
    console.error('보안 로그 기록 오류:', error);
  }
}

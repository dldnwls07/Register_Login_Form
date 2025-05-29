/**
 * 사용자 인증 관련 기능을 처리하는 서비스
 * 서버 API 기반 구현
 */

import api from './apiService';
import { checkPasswordStrength } from './cryptoUtils';
import { AuthError, AUTH_ERROR_CODES, logSecurityEvent } from './authUtils';

/**
 * 사용자 로그인
 * @param {string} usernameOrEmail - 사용자 이름 또는 이메일
 * @param {string} password - 비밀번호
 * @param {boolean} autoLogin - 자동 로그인 옵션 (7일)
 * @returns {Promise<Object>} - 로그인된 사용자 정보와 토큰
 */
export async function loginUser(usernameOrEmail, password, autoLogin = false) {
  try {
    const response = await api.post('/auth/login', { 
      usernameOrEmail,
      password,
      autoLogin
    });
    
    if (response.data.token) {
      // 보안 이벤트 기록
      try {
        logSecurityEvent('user_login', { 
          username: response.data.user.username,
          timestamp: Date.now()
        });
      } catch (e) {
        console.warn('보안 이벤트 기록 중 오류:', e);
      }
    }
    
    return response.data;
  } catch (error) {
    // 오류 발생 시 보안 이벤트 기록
    try {
      logSecurityEvent('login_failure', {
        usernameOrEmail,
        errorCode: error.response?.data?.code || 'unknown',
        timestamp: Date.now()
      });
    } catch (e) {
      console.warn('보안 이벤트 기록 중 오류:', e);
    }
    
    // API 응답 오류에 따른 AuthError 생성
    if (error.response?.data?.code === 'ACCOUNT_LOCKED') {
      throw new AuthError('계정이 잠겼습니다. 관리자에게 문의하세요.', AUTH_ERROR_CODES.ACCOUNT_LOCKED);
    }
    
    throw error.response?.data || { message: '로그인 처리 중 오류가 발생했습니다.' };
  }
}

/**
 * 사용자 회원가입
 * @param {Object} userData - 사용자 정보
 * @param {string} userData.username - 사용자 이름
 * @param {string} userData.email - 이메일 주소
 * @param {string} userData.password - 비밀번호
 * @returns {Promise<Object>} - 등록된 사용자 정보
 */
export async function registerUser(userData) {
  try {
    // 비밀번호 강도 검증
    const strength = checkPasswordStrength(userData.password);
    if (!strength.isValid) {
      throw new Error(`비밀번호가 안전하지 않습니다: ${strength.reasons.join(' ')}`);
    }

    const response = await api.post('/auth/register', userData);
    
    // 보안 이벤트 기록
    try {
      logSecurityEvent('user_registered', { 
        username: userData.username, 
        email: userData.email, 
        timestamp: Date.now() 
      });
    } catch (e) {
      console.warn('보안 이벤트 기록 중 오류:', e);
    }
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: '회원가입 처리 중 오류가 발생했습니다.' };
  }
}

/**
 * 사용자 로그아웃
 * @returns {Promise<Object>} - 로그아웃 결과
 */
export async function logoutUser() {
  try {
    await api.post('/auth/logout');
    return { success: true };
  } catch (error) {
    console.error('로그아웃 오류:', error);
    
    throw error.response?.data || { message: '로그아웃 처리 중 오류가 발생했습니다.' };
  }
}

/**
 * 토큰 검증
 * @returns {Promise<Object>} - 검증 결과
 */
export async function verifyToken() {
  try {
    const response = await api.get('/auth/verify');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: '토큰 검증 중 오류가 발생했습니다.' };
  }
}

/**
 * 현재 사용자 정보 가져오기
 * @returns {Promise<Object>} - 사용자 정보
 */
export async function getCurrentUser() {
  try {
    const response = await api.get('/auth/me');
    return response.data.data;
  } catch (error) {
    throw error.response?.data || { message: '사용자 정보 조회 중 오류가 발생했습니다.' };
  }
}

/**
 * 비밀번호 변경
 * @param {string} currentPassword - 현재 비밀번호
 * @param {string} newPassword - 새 비밀번호
 * @returns {Promise<Object>} - 변경 결과
 */
export async function updatePassword(currentPassword, newPassword) {
  try {
    // 비밀번호 강도 검증
    const strength = checkPasswordStrength(newPassword);
    if (!strength.isValid) {
      throw new Error(`비밀번호가 안전하지 않습니다: ${strength.reasons.join(' ')}`);
    }
    
    const response = await api.put('/auth/update-password', {
      currentPassword,
      newPassword
    });
    
    // 보안 이벤트 기록
    try {
      logSecurityEvent('password_changed', { 
        timestamp: Date.now()
      });
    } catch (e) {
      console.warn('보안 이벤트 기록 중 오류:', e);
    }
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: '비밀번호 변경 중 오류가 발생했습니다.' };
  }
}

/**
 * 비밀번호 재설정 요청
 * @param {string} email - 사용자 이메일
 * @returns {Promise<Object>} - 요청 결과
 */
export async function requestPasswordReset(email) {
  try {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: '비밀번호 재설정 요청 중 오류가 발생했습니다.' };
  }
}

/**
 * 비밀번호 재설정
 * @param {string} token - 재설정 토큰
 * @param {string} password - 새 비밀번호
 * @returns {Promise<Object>} - 재설정 결과
 */
export async function resetPassword(token, password) {
  try {
    // 비밀번호 강도 검증
    const strength = checkPasswordStrength(password);
    if (!strength.isValid) {
      throw new Error(`비밀번호가 안전하지 않습니다: ${strength.reasons.join(' ')}`);
    }
    
    const response = await api.put(`/auth/reset-password/${token}`, { password });
    
    // 보안 이벤트 기록
    try {
      logSecurityEvent('password_reset', { 
        timestamp: Date.now()
      });
    } catch (e) {
      console.warn('보안 이벤트 기록 중 오류:', e);
    }
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: '비밀번호 재설정 중 오류가 발생했습니다.' };
  }
}

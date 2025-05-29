/**
 * cryptoUtils.js
 * 암호화 및 보안 관련 기능을 제공하는 유틸리티
 */

import bcrypt from 'bcryptjs';
import { AUTH_KEYS, getUserSpecificKey, namespaceKey } from './storageKeys';

// 암호화 상수
const SALT_ROUNDS = 12;
const ENCRYPTION_KEY_LENGTH = 32;
const PBKDF2_ITERATIONS = 10000;

/**
 * 비밀번호 해싱
 * @param {string} password 해싱할 원본 비밀번호
 * @returns {Promise<string>} 해싱된 비밀번호
 */
export async function hashPassword(password) {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch (error) {
    console.error('비밀번호 해싱 실패:', error);
    throw new Error('비밀번호 해싱 과정에서 오류가 발생했습니다.');
  }
}

/**
 * 비밀번호 검증
 * @param {string} password 입력된 원본 비밀번호
 * @param {string} hash 저장된 해싱된 비밀번호
 * @returns {Promise<boolean>} 일치 여부
 */
export async function verifyPassword(password, hash) {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error('비밀번호 검증 실패:', error);
    throw new Error('비밀번호 검증 과정에서 오류가 발생했습니다.');
  }
}

/**
 * 안전한 난수 생성
 * @param {number} length 생성할 난수의 길이
 * @returns {string} 안전한 난수 문자열
 */
export function generateSecureRandom(length = 32) {
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  return Array.from(array, byte => ('0' + (byte & 0xFF).toString(16)).slice(-2)).join('');
}

/**
 * 세션 ID 생성
 * @returns {string} 새로 생성된 세션 ID
 */
export function generateSessionId() {
  return generateSecureRandom(32);
}

/**
 * 안전한 비밀번호 정책 검사
 * @param {string} password 검사할 비밀번호
 * @returns {{isValid: boolean, reasons: string[]}} 유효성 및 이유
 */
export function checkPasswordStrength(password) {
  const reasons = [];
  
  if (!password || password.length < 10) {
    reasons.push('비밀번호는 최소 10자 이상이어야 합니다.');
  }
  
  if (!/[A-Z]/.test(password)) {
    reasons.push('비밀번호에는 최소 1개의 대문자가 포함되어야 합니다.');
  }
  
  if (!/[a-z]/.test(password)) {
    reasons.push('비밀번호에는 최소 1개의 소문자가 포함되어야 합니다.');
  }
  
  if (!/[0-9]/.test(password)) {
    reasons.push('비밀번호에는 최소 1개의 숫자가 포함되어야 합니다.');
  }
  
  if (!/[^A-Za-z0-9]/.test(password)) {
    reasons.push('비밀번호에는 최소 1개의 특수문자가 포함되어야 합니다.');
  }
  
  const isValid = reasons.length === 0;
  
  return { isValid, reasons };
}

/**
 * 보안 토큰 생성
 * @param {string} userId 사용자 ID
 * @param {number} expirationMinutes 만료 시간(분)
 * @returns {string} 생성된 토큰
 */
export function generateSecurityToken(userId, expirationMinutes = 15) {
  const token = generateSecureRandom(32);
  const expiration = Date.now() + (expirationMinutes * 60 * 1000);
  
  const tokenData = {
    token,
    userId,
    expiration
  };
  
  // 토큰 저장
  const tokensKey = namespaceKey(AUTH_KEYS.TOKENS);
  const storedTokens = JSON.parse(localStorage.getItem(tokensKey) || '{}');
  storedTokens[token] = tokenData;
  localStorage.setItem(tokensKey, JSON.stringify(storedTokens));
  
  return token;
}

/**
 * 토큰 검증
 * @param {string} token 검증할 토큰
 * @returns {{ isValid: boolean, userId: string|null, reason: string|null }}
 */
export function validateSecurityToken(token) {
  try {
    const tokensKey = namespaceKey(AUTH_KEYS.TOKENS);
    const storedTokens = JSON.parse(localStorage.getItem(tokensKey) || '{}');
    
    if (!storedTokens[token]) {
      return { isValid: false, userId: null, reason: '토큰이 존재하지 않습니다.' };
    }
    
    const tokenData = storedTokens[token];
    
    // 만료 확인
    if (Date.now() > tokenData.expiration) {
      // 만료된 토큰 제거
      delete storedTokens[token];
      localStorage.setItem(tokensKey, JSON.stringify(storedTokens));
      return { isValid: false, userId: null, reason: '토큰이 만료되었습니다.' };
    }
    
    return { isValid: true, userId: tokenData.userId, reason: null };
  } catch (error) {
    console.error('토큰 검증 오류:', error);
    return { isValid: false, userId: null, reason: '토큰 검증 중 오류가 발생했습니다.' };
  }
}

/**
 * 지정된 사용자의 모든 토큰 무효화
 * @param {string} userId 사용자 ID
 */
export function invalidateAllUserTokens(userId) {
  try {
    const tokensKey = namespaceKey(AUTH_KEYS.TOKENS);
    const storedTokens = JSON.parse(localStorage.getItem(tokensKey) || '{}');
    
    // 사용자 관련 토큰 필터링
    const updatedTokens = {};
    for (const [token, data] of Object.entries(storedTokens)) {
      if (data.userId !== userId) {
        updatedTokens[token] = data;
      }
    }
    
    localStorage.setItem(tokensKey, JSON.stringify(updatedTokens));
  } catch (error) {
    console.error('토큰 무효화 오류:', error);
    throw new Error('토큰 무효화 중 오류가 발생했습니다.');
  }
}
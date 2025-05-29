/**
 * Web Crypto API를 사용한 암호화 유틸리티
 * 최신 브라우저에서 보다 안전하고 효율적인 암호화 기능 제공
 */

/**
 * Web Crypto API를 사용하여 비밀번호 해시 생성 (SHA-256 기반)
 * @param {string} password - 해싱할 비밀번호
 * @returns {Promise<string>} - salt:hash 형식의 해시 문자열
 */
export async function hashPasswordWithCrypto(password) {
  try {
    // 안전한 salt 생성
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    
    // 인코딩
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);
    
    // salt와 비밀번호 결합
    const combinedData = new Uint8Array(salt.length + passwordData.length);
    combinedData.set(salt);
    combinedData.set(passwordData, salt.length);
    
    // SHA-256 해시 생성
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', combinedData);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // salt와 해시 결합하여 반환
    const saltHex = Array.from(salt, b => b.toString(16).padStart(2, '0')).join('');
    return `${saltHex}:${hashHex}`;
  } catch (error) {
    console.error('Web Crypto API 해싱 오류:', error);
    // 폴백: 기본 해싱 방식 사용
    return null;
  }
}

/**
 * Web Crypto API를 사용하여 비밀번호 검증
 * @param {string} password - 검증할 비밀번호
 * @param {string} storedHash - 저장된 해시 (salt:hash 형식)
 * @returns {Promise<boolean>} - 비밀번호 일치 여부
 */
export async function verifyPasswordWithCrypto(password, storedHash) {
  try {
    const [saltHex, storedHashHex] = storedHash.split(':');
    
    // salt를 바이트 배열로 변환
    const salt = new Uint8Array(saltHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    
    // 인코딩
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);
    
    // salt와 비밀번호 결합
    const combinedData = new Uint8Array(salt.length + passwordData.length);
    combinedData.set(salt);
    combinedData.set(passwordData, salt.length);
    
    // 해시 생성 및 비교
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', combinedData);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex === storedHashHex;
  } catch (error) {
    console.error('Web Crypto API 검증 오류:', error);
    return false;
  }
}

/**
 * 브라우저가 안전한 Web Crypto API를 지원하는지 확인
 * @returns {boolean} - 지원 여부
 */
export function isSecureCryptoAvailable() {
  return window && window.crypto && window.crypto.subtle && typeof window.crypto.subtle.digest === 'function';
}

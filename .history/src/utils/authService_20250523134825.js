/**
 * 사용자 인증 관련 기능을 처리하는 서비스
 * 브라우저 환경용 구현 (MySQL 대신 localStorage 사용)
 */

// 암호화 관련 기능 import
import { 
  hashPassword as cryptoHashPassword,
  verifyPassword as cryptoVerifyPassword,
  checkPasswordStrength
} from './cryptoUtils';

// 인증 관련 유틸리티 및 오류 클래스
import { 
  AuthError, 
  AUTH_ERROR_CODES,
  trackLoginAttempt,
  checkLoginLock,
  logSecurityEvent
} from './authUtils';

// Storage Key 관리 가져오기
import { AUTH_KEYS, namespaceKey } from './storageKeys';

// 브라우저 환경에 최적화된 인증 로직
// 주의: 이 구현은 클라이언트 측에서만 사용됩니다.

// 네임스페이스 적용된 스토리지 키
const USERS_STORAGE_KEY = namespaceKey(AUTH_KEYS.USERS);
const CURRENT_USER_KEY = namespaceKey(AUTH_KEYS.CURRENT_USER);
const TOKENS_KEY = namespaceKey(AUTH_KEYS.TOKENS);

// 간단한 ID 생성
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

// 초기 사용자 목록 로드
const loadUsers = () => {
  const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
  return usersJson ? JSON.parse(usersJson) : [];
};

// 사용자 목록 저장
const saveUsers = (users) => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

// 강력한 비밀번호 해싱 (cryptoUtils.js 활용)
const hashPassword = async (password) => {
  try {
    // 새로운 해싱 방식 사용
    const hash = await cryptoHashPassword(password);
    return `crypto:${hash}`;
  } catch (error) {
    console.error('해싱 오류:', error);
    // 폴백 메커니즘
    const randomBytes = new Uint8Array(16);
    window.crypto.getRandomValues(randomBytes);
    const salt = Array.from(randomBytes, b => b.toString(16).padStart(2, '0')).join('');
    return `fallback:${btoa(`${password}_${salt}_${Date.now()}`)}`;
  }
};

// 비밀번호 비교 (cryptoUtils.js 활용)
const comparePassword = async (password, storedHash) => {
  try {
    // 해시 유형 확인
    if (storedHash.startsWith('crypto:')) {
      // 새로운 방식으로 생성된 해시 검증
      const cryptoHash = storedHash.substring(7); // 'crypto:' 접두사 제거
      return await cryptoVerifyPassword(password, cryptoHash);
    }
    else if (storedHash.startsWith('legacy:') || storedHash.includes(':')) {
      // 기존 방식의 해시는 일치하지 않는 것으로 처리하고 업그레이드 유도
      console.warn('레거시 비밀번호 해시가 감지되었습니다. 업그레이드가 필요합니다.');
      // 동일한 시간이 걸리도록 가짜 검증 진행 (타이밍 공격 방지)
      await new Promise(r => setTimeout(r, 500));
      return false;
    }
    else if (storedHash.startsWith('fallback:')) {
      // 폴백 방식으로 생성된 해시 검증 (임시 조치)
      console.warn('안전하지 않은 해시 방식이 사용되었습니다. 재설정을 권장합니다.');
      const encoded = storedHash.substring(9); // 'fallback:' 접두사 제거
      const decoded = atob(encoded);
      return decoded.startsWith(password + '_');
    }
    else {
      // 알 수 없는 해시 형식
      console.error('알 수 없는 해시 형식:', storedHash);
      return false;
    }
  } catch (error) {
    console.error('비밀번호 비교 오류:', error);
    return false;
  }
};

// 보다 안전한 토큰 생성
const generateToken = (userData) => {
  // userData에서 중요한 정보만 선택
  const payload = {
    id: userData.id,
    username: userData.username,
    role: userData.role || 'user',
    iat: Math.floor(Date.now() / 1000)
  };
  
  // 토큰 시크릿 키 (실제로는 환경 변수에서 로드)
  const secretKey = process.env.REACT_APP_JWT_SECRET || 'your-256-bit-secret';
  
  // 헤더
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };
  
  // Base64 인코딩
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));
  
  // 서명 생성 (향상된 보안)
  const signature = btoa(
    generateHmacSignature(
      `${encodedHeader}.${encodedPayload}`, 
      secretKey + window.navigator.userAgent
    )
  );
  
  // 토큰 조합
  const token = `${encodedHeader}.${encodedPayload}.${signature}`;
  
  // 토큰 저장 (네임스페이스 적용된 키 사용)
  const tokens = JSON.parse(localStorage.getItem(TOKENS_KEY) || '{}');
  tokens[token] = {
    userId: userData.id,
    expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24시간
    userAgent: window.navigator.userAgent, // 사용자 에이전트 저장
    createdAt: Date.now()
  };
  localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
  
  return token;
};

// 간단한 HMAC 시그니처 시뮬레이션 (브라우저 환경에서 가능한 방식)
function generateHmacSignature(data, key) {
  // 실제로는 HMAC-SHA256을 사용해야 함
  // 여기서는 간단한 시뮬레이션
  let signature = '';
  for (let i = 0; i < data.length; i++) {
    signature += String.fromCharCode(
      data.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    );
  }
  return signature;
}

/**
 * 새 사용자 등록(회원가입)
 * @param {Object} userData - 사용자 데이터 (username, email, password)
 * @returns {Promise<Object>} - 등록된 사용자 정보(비밀번호 제외)
 */
export async function registerUser(userData) {
  return new Promise(async (resolve, reject) => {
    try {
      const { username, email, password } = userData;
      const users = loadUsers();
      
      // 이미 등록된 사용자인지 확인
      const existingUser = users.find(u => u.username === username || u.email === email);
      if (existingUser) {
        if (existingUser.username === username) {
          return reject(new Error('이미 사용 중인 사용자 이름입니다.'));
        } else {
          return reject(new Error('이미 등록된 이메일 주소입니다.'));
        }
      }
      
      // 향상된 비밀번호 강도 검증 (새로운 기능 활용)
      const strength = checkPasswordStrength(password);
      if (!strength.isValid) {
        return reject(new Error(`비밀번호가 안전하지 않습니다: ${strength.reasons.join(' ')}`));
      }
      
      // 비밀번호 해싱 (새로운 해싱 함수 사용)
      const passwordHash = await hashPassword(password);
      
      // 새 사용자 생성 (보안 정보 추가)
      const newUser = {
        id: generateId(),
        username,
        email,
        password_hash: passwordHash,
        created_at: new Date().toISOString(),
        failed_login_attempts: 0,
        last_login: null,
        account_locked: false
      };
      
      users.push(newUser);
      saveUsers(users);
      
      // 보안 이벤트 기록
      try {
        logSecurityEvent('user_registered', { 
          username, 
          email, 
          timestamp: Date.now() 
        });
      } catch (e) {
        console.warn('보안 이벤트 기록 중 오류:', e);
      }
      
      const { password_hash, ...userWithoutPassword } = newUser;
      resolve(userWithoutPassword);
    } catch (error) {
      reject(new Error(`회원가입 오류: ${error.message}`));
    }
  });
}

/**
 * 사용자 로그인
 * @param {string} usernameOrEmail - 사용자 이름 또는 이메일
 * @param {string} password - 비밀번호
 * @returns {Promise<Object>} - 로그인된 사용자 정보와 토큰
 */
export async function loginUser(usernameOrEmail, password) {
  return new Promise(async (resolve, reject) => {
    try {
      // 입력 유효성 검증
      if (!usernameOrEmail || !password) {
        return reject(new Error('사용자 이름/이메일과 비밀번호를 모두 입력해주세요.'));
      }
      
      // 브라우저 지문 수집 (보안용)
      const browserFingerprint = getUserAgent();
      
      // 로그인 잠금 확인
      try {
        const isLocked = await checkLoginLock(usernameOrEmail);
        if (isLocked) {
          trackLoginAttempt(usernameOrEmail, false, browserFingerprint);
          return reject(new AuthError('계정이 일시적으로 잠겼습니다. 나중에 다시 시도하세요.', AUTH_ERROR_CODES.ACCOUNT_LOCKED));
        }
      } catch (e) {
        console.warn('로그인 잠금 확인 오류:', e);
      }
      
      const users = loadUsers();
      
      const user = users.find(u => 
        u.username === usernameOrEmail || u.email === usernameOrEmail
      );
      
      if (!user) {
        // 실패 기록
        trackLoginAttempt(usernameOrEmail, false, browserFingerprint);
        // 보안을 위해 지연 시간 추가 (타이밍 공격 방지)
        await new Promise(r => setTimeout(r, 500 + Math.random() * 500));
        return reject(new Error('아이디 또는 비밀번호가 일치하지 않습니다.'));
      }
      
      // 계정 잠금 확인
      if (user.account_locked) {
        trackLoginAttempt(usernameOrEmail, false, browserFingerprint);
        return reject(new AuthError('이 계정은 잠겼습니다. 관리자에게 문의하세요.', AUTH_ERROR_CODES.ACCOUNT_LOCKED));
      }
      
      // 비동기 비밀번호 검증
      const isPasswordValid = await comparePassword(password, user.password_hash);
      
      if (!isPasswordValid) {
        // 실패 기록
        trackLoginAttempt(usernameOrEmail, false, browserFingerprint);
        
        // 실패 카운트 증가
        user.failed_login_attempts = (user.failed_login_attempts || 0) + 1;
        
        // 일정 횟수 이상 실패 시 계정 잠금
        if (user.failed_login_attempts >= 5) {
          user.account_locked = true;
          logSecurityEvent('account_locked', { 
            username: user.username, 
            reason: 'too_many_failed_attempts',
            attempts: user.failed_login_attempts
          });
        }
        
        saveUsers(users);
        
        // 보안을 위해 지연 시간 추가 (타이밍 공격 방지)
        await new Promise(r => setTimeout(r, 500 + Math.random() * 500));
        return reject(new Error('아이디 또는 비밀번호가 일치하지 않습니다.'));
      }
      
      // 성공한 경우 실패 카운트 초기화
      user.failed_login_attempts = 0;
      user.account_locked = false;
      
      // 로그인 성공 기록
      trackLoginAttempt(usernameOrEmail, true, browserFingerprint);
      
      // 비밀번호 해싱 방식이 구버전인 경우 새 방식으로 업그레이드
      if (!user.password_hash.startsWith('crypto:')) {
        // 비밀번호 재해싱 (최신 방식으로 업그레이드)
        user.password_hash = await hashPassword(password);
      }
      
      // 현재 사용자 정보 저장
      const { password_hash, ...userWithoutPassword } = user;
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
      
      // 토큰 생성
      const token = generateToken(userWithoutPassword);
      
      // 마지막 로그인 시간 업데이트
      user.last_login = new Date().toISOString();
      saveUsers(users);
      
      // 로그인 성공 이벤트 기록
      logSecurityEvent('user_login', { 
        username: user.username,
        timestamp: Date.now()
      });
      
      resolve({
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      reject(new Error('로그인 처리 중 오류가 발생했습니다.'));
    }
  });
}

// 브라우저 지문 획득
function getUserAgent() {
  return window.navigator.userAgent;
}

/**
 * JWT 토큰 검증
 * @param {string} token - JWT 토큰
 * @returns {Promise<Object>} - 검증된 사용자 정보
 */
export function verifyToken(token) {
  return new Promise((resolve, reject) => {
    try {
      // 토큰 형식 검증
      if (!token || typeof token !== 'string' || !token.includes('.')) {
        throw new AuthError('유효하지 않은 토큰 형식입니다.', AUTH_ERROR_CODES.INVALID_TOKEN);
      }
      
      // 토큰 분해
      const [encodedHeader, encodedPayload, signature] = token.split('.');
      
      // 위변조 검증
      const secretKey = process.env.REACT_APP_JWT_SECRET || 'your-256-bit-secret';
      const calculatedSignature = btoa(
        generateHmacSignature(
          `${encodedHeader}.${encodedPayload}`, 
          secretKey + window.navigator.userAgent
        )
      );
      
      if (calculatedSignature !== signature) {
        throw new AuthError('토큰 서명이 유효하지 않습니다.', AUTH_ERROR_CODES.INVALID_SIGNATURE);
      }
      
      // 토큰 데이터 확인
      const tokens = JSON.parse(localStorage.getItem(TOKENS_KEY) || '{}');
      const tokenData = tokens[token];
      
      if (!tokenData) {
        throw new AuthError('저장된 토큰 정보를 찾을 수 없습니다.', AUTH_ERROR_CODES.TOKEN_NOT_FOUND);
      }
      
      // 만료 확인
      if (tokenData.expiresAt < Date.now()) {
        // 만료된 토큰 제거
        delete tokens[token];
        localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
        throw new AuthError('토큰이 만료되었습니다. 다시 로그인해주세요.', AUTH_ERROR_CODES.TOKEN_EXPIRED);
      }
      
      // 사용자 에이전트 확인 (세션 하이재킹 방지)
      if (tokenData.userAgent !== window.navigator.userAgent) {
        // 보안 이벤트 기록
        logSecurityEvent('token_hijacking_attempt', {
          userId: tokenData.userId,
          expectedUserAgent: tokenData.userAgent,
          actualUserAgent: window.navigator.userAgent
        });
        throw new AuthError('다른 브라우저나 기기에서의 접근이 감지되었습니다.', AUTH_ERROR_CODES.USER_AGENT_MISMATCH);
      }
      
      // 페이로드 디코딩
      let payload;
      try {
        payload = JSON.parse(atob(encodedPayload));
      } catch (e) {
        throw new AuthError('토큰 페이로드를 디코딩할 수 없습니다.', AUTH_ERROR_CODES.INVALID_PAYLOAD);
      }
      
      // 사용자 존재 여부 확인
      const users = loadUsers();
      const user = users.find(u => u.id === payload.id);
      
      if (!user) {
        throw new AuthError('토큰에 해당하는 사용자를 찾을 수 없습니다.', AUTH_ERROR_CODES.USER_NOT_FOUND);
      }
      
      // 계정 잠금 확인
      if (user.account_locked) {
        throw new AuthError('이 계정은 현재 잠겨 있습니다.', AUTH_ERROR_CODES.ACCOUNT_LOCKED);
      }
      
      // 토큰 만료 시간 연장 (필요한 경우)
      tokenData.expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24시간 연장
      localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
      
      // 사용자 정보 반환 (비밀번호 해시 제외)
      const { password_hash, ...userWithoutPassword } = user;
      resolve(userWithoutPassword);
    } catch (error) {
      console.error('토큰 검증 오류:', error);
      if (error instanceof AuthError) {
        reject(error);
      } else {
        reject(new AuthError(error.message || '유효하지 않은 토큰입니다.', AUTH_ERROR_CODES.UNKNOWN_ERROR));
      }
    }
  });
}

/**
 * 현재 사용자 정보 가져오기 (보안 강화 버전)
 * @param {string} userId - 사용자 ID
 * @returns {Promise<Object>} - 사용자 정보
 */
export async function getCurrentUser(userId) {
  return new Promise((resolve, reject) => {
    try {
      // 유효한 ID인지 검증
      if (!userId || typeof userId !== 'string') {
        throw new Error('유효하지 않은 사용자 ID입니다.');
      }
      
      // 사용자 데이터 로드
      const users = loadUsers();
      const user = users.find(u => u.id === userId);
      
      if (!user) {
        throw new Error('사용자를 찾을 수 없습니다.');
      }
      
      // 마지막 활동 시간 업데이트
      user.last_active = new Date().toISOString();
      saveUsers(users);
      
      // 활성 세션 확인
      const tokens = JSON.parse(localStorage.getItem(TOKENS_KEY) || '{}');
      const hasActiveSession = Object.values(tokens).some(t => 
        t.userId === userId && t.expiresAt > Date.now()
      );
      
      if (!hasActiveSession) {
        throw new Error('활성화된 세션이 없습니다. 다시 로그인해주세요.');
      }
      
      // 민감한 정보 제외하고 반환
      const { password_hash, security_question, security_answer, ...userWithoutSensitiveInfo } = user;
      resolve(userWithoutSensitiveInfo);
      
    } catch (error) {
      console.error('사용자 정보 조회 오류:', error);
      reject(new Error(error.message || '사용자 정보를 조회할 수 없습니다.'));
    }
  });
}

/**
 * 사용자 로그아웃 처리
 * @param {string} token - 현재 사용자 토큰
 * @returns {Promise<void>}
 */
export async function logoutUser(token) {
  return new Promise((resolve) => {
    try {
      // 토큰이 제공된 경우 해당 토큰만 무효화
      if (token) {
        const tokens = JSON.parse(localStorage.getItem(TOKENS_KEY) || '{}');
        
        // 사용자 ID 저장 (로깅용)
        let userId = null;
        if (tokens[token]) {
          userId = tokens[token].userId;
          delete tokens[token];
          localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
        }
        
        // 로그아웃 이벤트 기록
        if (userId) {
          try {
            logSecurityEvent('user_logout', { userId, timestamp: Date.now() });
          } catch (e) {
            console.warn('로그아웃 이벤트 기록 중 오류:', e);
          }
        }
      }
      
      // 항상 현재 사용자 정보 삭제
      localStorage.removeItem(CURRENT_USER_KEY);
      
      resolve();
    } catch (error) {
      console.error('로그아웃 처리 중 오류:', error);
      resolve(); // 로그아웃은 항상 성공으로 처리
    }
  });
}

/**
 * 모든 사용자 세션 무효화 (관리자 기능)
 * @param {string} userId - 사용자 ID
 * @returns {Promise<void>}
 */
export async function invalidateAllSessions(userId) {
  return new Promise((resolve, reject) => {
    try {
      const tokens = JSON.parse(localStorage.getItem(TOKENS_KEY) || '{}');
      
      // 해당 사용자의 모든 토큰 찾기
      Object.keys(tokens).forEach(tokenKey => {
        if (tokens[tokenKey].userId === userId) {
          delete tokens[tokenKey];
        }
      });
      
      // 업데이트된 토큰 저장
      localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
      resolve();
    } catch (error) {
      reject(new Error('세션 무효화 중 오류가 발생했습니다.'));
    }
  });
}

/**
 * 비밀번호 강도 측정 함수
 * @param {string} password - 측정할 비밀번호
 * @returns {Object} - 비밀번호 강도 정보
 */
export function measurePasswordStrength(password) {
  // 비밀번호가 없는 경우
  if (!password) {
    return { score: 0, feedback: '비밀번호를 입력해주세요.' };
  }
  
  // 비밀번호 길이 점수 (최대 5점)
  const lengthScore = Math.min(5, Math.floor(password.length / 2));
  
  // 문자 다양성 점수 (최대 5점)
  let varietyScore = 0;
  if (/[a-z]/.test(password)) varietyScore++; // 소문자
  if (/[A-Z]/.test(password)) varietyScore++; // 대문자
  if (/[0-9]/.test(password)) varietyScore++; // 숫자 
  if (/[^a-zA-Z0-9]/.test(password)) varietyScore += 2; // 특수문자
  
  // 총점 (10점 만점)
  const totalScore = lengthScore + varietyScore;
  
  // 피드백 생성
  let feedback = '';
  if (totalScore < 4) {
    feedback = '매우 약한 비밀번호입니다. 더 길고 다양한 문자를 사용하세요.';
  } else if (totalScore < 6) {
    feedback = '약한 비밀번호입니다. 특수문자를 추가하세요.';
  } else if (totalScore < 8) {
    feedback = '적당한 비밀번호입니다. 더 다양한 종류의 문자를 사용하면 좋습니다.';
  } else {
    feedback = '강력한 비밀번호입니다!';
  }
  
  return {
    score: totalScore,
    strength: totalScore < 4 ? '매우 약함' : 
              totalScore < 6 ? '약함' : 
              totalScore < 8 ? '중간' : '강함',
    feedback
  };
}

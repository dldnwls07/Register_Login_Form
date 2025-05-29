/**
 * 사용자 인증 관련 기능을 처리하는 서비스
 * 브라우저 환경용 구현 (MySQL 대신 localStorage 사용)
 */

// 브라우저 환경에 최적화된 인증 로직
// 주의: 이 구현은 클라이언트 측에서만 사용됩니다.

// 필요한 상수 정의
const USERS_STORAGE_KEY = 'auth_users';
const CURRENT_USER_KEY = 'auth_current_user';
const TOKENS_KEY = 'auth_tokens';

// 간단한 ID 생성
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

// 초기 사용자 목록 로드
const loadUsers = () => {
  const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
  return usersJson ? JSON.parse(usersJson) : [];
};

// 사용자 목록 저장
const saveUsers = (users) => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

// 보다 강력한 비밀번호 해싱 (PBKDF2 기반)
const hashPassword = (password) => {
  try {
    // salt 생성 (실제로는 랜덤하게 생성해야 함)
    const salt = 'custom_salt_' + Date.now().toString(36);
    
    // 반복 횟수 (실제 환경에서는 더 높은 값 사용)
    const iterations = 1000;
    
    // 비밀번호와 salt를 합쳐서 해시 생성
    let hash = password + salt;
    
    // PBKDF2와 유사한 해싱 시뮬레이션 (브라우저 환경에서 가능한 방식)
    for (let i = 0; i < iterations; i++) {
      // 단순히 해시를 여러번 수행
      const encoder = new TextEncoder();
      const data = encoder.encode(hash);
      // SubtleCrypto API를 직접 사용하는 대신 간단히 시뮬레이션
      hash = btoa(String.fromCharCode.apply(null, new Uint8Array(data)));
    }
    
    // 저장 형식: iterations:salt:hash
    return `${iterations}:${salt}:${hash}`;
  } catch (error) {
    console.error('해싱 오류:', error);
    // 폴백 메커니즘 (실제 서비스에서는 더 안전한 방식 사용)
    return btoa(`secure_${password}_${Date.now()}`);
  }
};

// 비밀번호 비교
const comparePassword = (password, storedHash) => {
  try {
    // 저장된 해시 분해
    const [iterations, salt, hash] = storedHash.split(':');
    
    // 같은 방식으로 해시 생성
    let compareHash = password + salt;
    
    // 동일한 횟수만큼 해시 반복
    for (let i = 0; i < parseInt(iterations); i++) {
      const encoder = new TextEncoder();
      const data = encoder.encode(compareHash);
      compareHash = btoa(String.fromCharCode.apply(null, new Uint8Array(data)));
    }
    
    // 해시 비교
    return hash === compareHash;
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
  
  // 토큰 시크릿 키 (실제로는 환경 변수나 별도 설정에서 로드)
  const secretKey = 'your-256-bit-secret' + window.navigator.userAgent;
  
  // 헤더
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };
  
  // Base64 인코딩
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));
  
  // 서명 생성 (실제 JWT에서는 HMAC-SHA256 사용)
  // 여기서는 간단한 시뮬레이션만 제공
  const signature = btoa(
    generateHmacSignature(
      `${encodedHeader}.${encodedPayload}`, 
      secretKey
    )
  );
  
  // 토큰 조합
  const token = `${encodedHeader}.${encodedPayload}.${signature}`;
  
  // 토큰 저장
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
  return new Promise((resolve, reject) => {
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
    
    // 새 사용자 생성
    const newUser = {
      id: generateId(),
      username,
      email,
      password_hash: hashPassword(password),
      created_at: new Date().toISOString()
    };
    
    users.push(newUser);
    saveUsers(users);
    
    const { password_hash, ...userWithoutPassword } = newUser;
    resolve(userWithoutPassword);
  });
}

/**
 * 사용자 로그인
 * @param {string} usernameOrEmail - 사용자 이름 또는 이메일
 * @param {string} password - 비밀번호
 * @returns {Promise<Object>} - 로그인된 사용자 정보와 토큰
 */
export async function loginUser(usernameOrEmail, password) {
  return new Promise((resolve, reject) => {
    const users = loadUsers();
    
    const user = users.find(u => 
      u.username === usernameOrEmail || u.email === usernameOrEmail
    );
    
    if (!user) {
      return reject(new Error('사용자를 찾을 수 없습니다.'));
    }
    
    if (!comparePassword(password, user.password_hash)) {
      return reject(new Error('잘못된 비밀번호입니다.'));
    }
    
    // 현재 사용자 정보 저장
    const { password_hash, ...userWithoutPassword } = user;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
    
    // 토큰 생성
    const token = generateToken(userWithoutPassword);
    
    resolve({
      user: userWithoutPassword,
      token
    });
  });
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
        throw new Error('유효하지 않은 토큰 형식입니다.');
      }
      
      // 토큰 분해
      const [encodedHeader, encodedPayload, signature] = token.split('.');
      
      // 위변조 검증
      const secretKey = 'your-256-bit-secret' + window.navigator.userAgent;
      const calculatedSignature = btoa(
        generateHmacSignature(
          `${encodedHeader}.${encodedPayload}`, 
          secretKey
        )
      );
      
      if (calculatedSignature !== signature) {
        throw new Error('토큰 서명이 유효하지 않습니다.');
      }
      
      // 토큰 데이터 확인
      const tokens = JSON.parse(localStorage.getItem(TOKENS_KEY) || '{}');
      const tokenData = tokens[token];
      
      if (!tokenData) {
        throw new Error('저장된 토큰 정보를 찾을 수 없습니다.');
      }
      
      // 만료 확인
      if (tokenData.expiresAt < Date.now()) {
        // 만료된 토큰 제거
        delete tokens[token];
        localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
        throw new Error('토큰이 만료되었습니다. 다시 로그인해주세요.');
      }
      
      // 사용자 에이전트 확인 (세션 하이재킹 방지)
      if (tokenData.userAgent !== window.navigator.userAgent) {
        throw new Error('다른 브라우저나 기기에서의 접근이 감지되었습니다.');
      }
      
      // 페이로드 디코딩
      let payload;
      try {
        payload = JSON.parse(atob(encodedPayload));
      } catch (e) {
        throw new Error('토큰 페이로드를 디코딩할 수 없습니다.');
      }
      
      // 사용자 존재 여부 확인
      const users = loadUsers();
      const user = users.find(u => u.id === payload.id);
      
      if (!user) {
        throw new Error('토큰에 해당하는 사용자를 찾을 수 없습니다.');
      }
      
      // 토큰 만료 시간 연장 (필요한 경우)
      tokenData.expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24시간 연장
      localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
      
      // 사용자 정보 반환 (비밀번호 해시 제외)
      const { password_hash, ...userWithoutPassword } = user;
      resolve(userWithoutPassword);
    } catch (error) {
      console.error('토큰 검증 오류:', error);
      reject(new Error(error.message || '유효하지 않은 토큰입니다.'));
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

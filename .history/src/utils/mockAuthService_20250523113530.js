/**
 * 브라우저 환경에서 사용할 수 있는 대체 인증 서비스
 * JWT와 bcrypt를 사용하는 원래 구현 대신 localStorage 기반 단순화된 인증 로직을 제공합니다.
 */

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

// 간단한 비밀번호 해싱 (실제 해싱이 아니라 단순 인코딩)
// 실제 제품에서는 절대 이런 방식을 사용하면 안됨
const hashPassword = (password) => {
  return btoa(password + '_hashed'); // 단순 base64 인코딩
};

// 비밀번호 비교
const comparePassword = (password, hash) => {
  return hash === hashPassword(password);
};

// 토큰 생성 (간단한 고유 문자열)
const generateToken = (userData) => {
  const token = btoa(JSON.stringify(userData)) + '.' + generateId();
  
  // 토큰 저장
  const tokens = JSON.parse(localStorage.getItem(TOKENS_KEY) || '{}');
  tokens[token] = {
    userId: userData.id,
    expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24시간
  };
  localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
  
  return token;
};

// 토큰 검증
const verifyToken = (token) => {
  try {
    const tokens = JSON.parse(localStorage.getItem(TOKENS_KEY) || '{}');
    const tokenData = tokens[token];
    
    if (!tokenData) return null;
    if (tokenData.expiresAt < Date.now()) {
      // 만료된 토큰 제거
      delete tokens[token];
      localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
      return null;
    }
    
    const users = loadUsers();
    return users.find(u => u.id === tokenData.userId);
  } catch (error) {
    return null;
  }
};

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
 * @returns {Object} - 검증된 사용자 정보
 */
export function verifyUserToken(token) {
  return verifyToken(token);
}

/**
 * 현재 사용자 정보 가져오기
 * @param {number} userId - 사용자 ID
 * @returns {Promise<Object>} - 사용자 정보
 */
export async function getCurrentUser(userId) {
  return new Promise((resolve, reject) => {
    const users = loadUsers();
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return reject(new Error('사용자를 찾을 수 없습니다.'));
    }
    
    const { password_hash, ...userWithoutPassword } = user;
    resolve(userWithoutPassword);
  });
}

// 인터페이스 호환성을 위해 원래 함수와 이름이 동일한 함수 내보내기
export { verifyUserToken as verifyToken };

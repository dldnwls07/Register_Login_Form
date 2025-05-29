/**
 * 사용자 인증 관련 기능을 처리하는 서비스
 */

import { executeQuery } from './dbService';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// JWT 시크릿 키 (실제 프로덕션에서는 환경 변수로 관리해야 함)
const JWT_SECRET = 'money-app-secret-key';
const TOKEN_EXPIRY = '24h';

/**
 * 새 사용자 등록(회원가입)
 * @param {Object} userData - 사용자 데이터 (username, email, password)
 * @returns {Promise<Object>} - 등록된 사용자 정보(비밀번호 제외)
 */
export async function registerUser(userData) {
  const { username, email, password } = userData;
  
  // 이미 등록된 사용자인지 확인
  const existingUser = await executeQuery(
    'SELECT * FROM users WHERE username = ? OR email = ?', 
    [username, email]
  );
  
  if (existingUser.length > 0) {
    if (existingUser[0].username === username) {
      throw new Error('이미 사용 중인 사용자 이름입니다.');
    } else {
      throw new Error('이미 등록된 이메일 주소입니다.');
    }
  }
  
  // 비밀번호 해시화
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  
  // 사용자 등록
  const result = await executeQuery(
    'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
    [username, email, passwordHash]
  );
  
  // 생성된 사용자 정보 반환 (비밀번호 제외)
  return { 
    id: result.insertId, 
    username, 
    email, 
    created_at: new Date() 
  };
}

/**
 * 사용자 로그인
 * @param {string} usernameOrEmail - 사용자 이름 또는 이메일
 * @param {string} password - 비밀번호
 * @returns {Promise<Object>} - 로그인된 사용자 정보와 토큰
 */
export async function loginUser(usernameOrEmail, password) {
  // 사용자 찾기
  const users = await executeQuery(
    'SELECT * FROM users WHERE username = ? OR email = ?', 
    [usernameOrEmail, usernameOrEmail]
  );
  
  if (users.length === 0) {
    throw new Error('사용자를 찾을 수 없습니다.');
  }
  
  const user = users[0];
  
  // 비밀번호 확인
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    throw new Error('잘못된 비밀번호입니다.');
  }
  
  // JWT 토큰 생성
  const token = jwt.sign(
    { id: user.id, username: user.username, email: user.email }, 
    JWT_SECRET, 
    { expiresIn: TOKEN_EXPIRY }
  );
  
  // 사용자 정보와 토큰 반환 (비밀번호 제외)
  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      created_at: user.created_at
    },
    token
  };
}

/**
 * JWT 토큰 검증
 * @param {string} token - JWT 토큰
 * @returns {Promise<Object>} - 검증된 사용자 정보
 */
export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new Error('유효하지 않은 토큰입니다.');
  }
}

/**
 * 현재 사용자 정보 가져오기
 * @param {number} userId - 사용자 ID
 * @returns {Promise<Object>} - 사용자 정보
 */
export async function getCurrentUser(userId) {
  const users = await executeQuery(
    'SELECT id, username, email, created_at FROM users WHERE id = ?', 
    [userId]
  );
  
  if (users.length === 0) {
    throw new Error('사용자를 찾을 수 없습니다.');
  }
  
  return users[0];
}

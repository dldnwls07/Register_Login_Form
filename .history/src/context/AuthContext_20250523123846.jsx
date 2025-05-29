import React, { createContext, useState, useEffect } from 'react';
import { loginUser, registerUser, verifyToken, getCurrentUser, logoutUser } from '../utils/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());

  // 활동 감지 및 자동 로그아웃 기능
  useEffect(() => {
    const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30분
    
    const resetActivityTimer = () => setLastActivityTime(Date.now());
    
    // 사용자 활동 이벤트 감지
    window.addEventListener('mousemove', resetActivityTimer);
    window.addEventListener('keydown', resetActivityTimer);
    window.addEventListener('click', resetActivityTimer);
    
    // 비활성 체크 타이머
    const checkInactivity = setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastActivityTime;
      if (user && timeSinceLastActivity > INACTIVITY_TIMEOUT) {
        console.log('장시간 활동이 없어 자동 로그아웃됩니다.');
        logout();
      }
    }, 60000); // 1분마다 체크
    
    return () => {
      window.removeEventListener('mousemove', resetActivityTimer);
      window.removeEventListener('keydown', resetActivityTimer);
      window.removeEventListener('click', resetActivityTimer);
      clearInterval(checkInactivity);
    };
  }, [user, lastActivityTime]);

  // 초기 인증 상태 확인
  useEffect(() => {
    // 토큰이 있으면 사용자 정보 확인
    const token = localStorage.getItem('token');
    if (token) {
      setLoading(true);
      
      verifyToken(token)
        .then(decoded => {
          // 사용자 정보 가져오기
          return getCurrentUser(decoded.id);
        })
        .then(userData => {
          setUser(userData);
          setError(null);
        })
        .catch(err => {
          console.error('인증 오류:', err);
          setError('세션이 만료되었습니다. 다시 로그인해주세요.');
          
          // 토큰이 유효하지 않으면 제거
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);
  // 보안 강화된 로그인 함수
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      // 입력 유효성 검증
      if (!credentials.usernameOrEmail || !credentials.password) {
        throw new Error('사용자 이름/이메일과 비밀번호를 모두 입력해주세요.');
      }
      
      const response = await loginUser(credentials.usernameOrEmail, credentials.password);
      
      // 로그인 시도 기록 (보안용, 필요시 구현)
      const loginAttempt = {
        timestamp: new Date().toISOString(),
        userId: response.user.id,
        success: true,
        ipAddress: '사용자IP', // 실제로는 서버에서 확인
        userAgent: navigator.userAgent
      };
      
      console.log('로그인 성공:', loginAttempt);
      
      // 토큰 및 사용자 정보 저장
      localStorage.setItem('token', response.token);
      
      // 민감한 정보 제거 후 저장
      const userToStore = { ...response.user };
      delete userToStore.role; // 역할 정보는 토큰에만 저장
      
      localStorage.setItem('user', JSON.stringify(userToStore));
      
      setUser(response.user);
      setLastActivityTime(Date.now());
      return response.user;
    } catch (error) {
      console.error('로그인 실패:', error);
      
      // 실패한 로그인 시도 기록 (보안용)
      const failedLoginAttempt = {
        timestamp: new Date().toISOString(),
        usernameOrEmail: credentials.usernameOrEmail,
        success: false,
        error: error.message,
        userAgent: navigator.userAgent
      };
      
      console.log('로그인 실패 기록:', failedLoginAttempt);
      setError(error.message || '로그인에 실패했습니다.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 회원가입 함수
  const register = async (userData) => {
    try {
      return await registerUser(userData);
    } catch (error) {
      throw error;
    }
  };
  // 보안 강화된 로그아웃 함수
  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      await logoutUser(token);
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setError(null);
      
      // 성공적인 로그아웃 처리
      console.log('로그아웃 성공');
    } catch (err) {
      console.error('로그아웃 오류:', err);
      
      // 오류가 발생해도 로컬에서는 로그아웃 처리
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import {
  loginUser,
  registerUser,
  verifyToken,
  getCurrentUser,
  logoutUser
} from '../utils/serverAuthService';

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
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        await verifyToken(); // 토큰 유효성 검사
        const userData = await getCurrentUser(); // 사용자 정보 가져오기
        setUser(userData);
        setError(null);
      } catch (err) {
        console.error('인증 오류:', err);
        setError('세션이 만료되었습니다. 다시 로그인해주세요.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();
  }, []);  // 로그인 함수
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      // 입력 유효성 검증
      if (!credentials.usernameOrEmail || !credentials.password) {
        throw new Error('사용자 이름/이메일과 비밀번호를 모두 입력해주세요.');
      }
      
      const response = await loginUser(
        credentials.usernameOrEmail, 
        credentials.password,
        credentials.autoLogin // 자동 로그인 옵션 전달
      );
      
      setUser(response.user);
      setLastActivityTime(Date.now());
      
      // 기존 localStorage 데이터가 있는지 확인 (마이그레이션 지원)
      checkForDataMigration(response.user.id);
      
      return response.user;
    } catch (error) {
      console.error('로그인 실패:', error);
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
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error,
      login, 
      register, 
      logout,
      setError // 에러 상태를 수동으로 설정하기 위한 함수
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

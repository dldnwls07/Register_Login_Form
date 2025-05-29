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

  // 로그인 함수
  const login = async (credentials) => {
    try {
      const response = await loginUser(credentials.usernameOrEmail, credentials.password);
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setUser(response.user);
      return response.user;
    } catch (error) {
      throw error;
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

  // 로그아웃 함수
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

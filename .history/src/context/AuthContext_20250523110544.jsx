import React, { createContext, useState, useEffect } from 'react';
import { loginUser, registerUser, verifyToken, getCurrentUser } from '../utils/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 토큰이 있으면 사용자 정보 확인
    const token = localStorage.getItem('token');
    if (token) {
      try {
        verifyToken(token)
          .then(decoded => {
            // 사용자 정보 가져오기
            return getCurrentUser(decoded.id);
          })
          .then(userData => {
            setUser(userData);
          })
          .catch(() => {
            // 토큰이 유효하지 않으면 제거
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          })
          .finally(() => setLoading(false));
      } catch (err) {
        setLoading(false);
      }
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

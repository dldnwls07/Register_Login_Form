// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useCallback } from 'react';
import {
  loginUser,
  registerUser,
  verifyToken,
  getCurrentUser,
  logoutUser,
  updateUserProfile,
  changeUserPassword
} from '../utils/serverAuthService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());

  // 초기 인증 상태 확인
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('🔍 [DEBUG] No token found in localStorage.');
        setLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('🔍 [DEBUG] Token expired or invalid:', error);
        localStorage.removeItem('token');
        alert('세션이 만료되었습니다. 다시 로그인하세요.');
        window.location.href = '/login?expired';
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // 활동 감지 및 자동 로그아웃 기능
  useEffect(() => {
    const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30분
    
    const resetActivityTimer = () => setLastActivityTime(Date.now());
    
    window.addEventListener('mousemove', resetActivityTimer);
    window.addEventListener('keydown', resetActivityTimer);
    window.addEventListener('click', resetActivityTimer);
    
    const checkInactivity = setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastActivityTime;
      if (user && timeSinceLastActivity > INACTIVITY_TIMEOUT) {
        console.log('장시간 활동이 없어 자동 로그아웃됩니다.');
        logout();
      }
    }, 60000);
    
    return () => {
      window.removeEventListener('mousemove', resetActivityTimer);
      window.removeEventListener('keydown', resetActivityTimer);
      window.removeEventListener('click', resetActivityTimer);
      clearInterval(checkInactivity);
    };
  }, [user, lastActivityTime]);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const response = await loginUser(credentials);
      setUser(response.user);
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  const register = async (userData) => {
    setLoading(true);
    try {
      // registerUser 호출 전에 데이터 구조 확인
      if (typeof userData !== 'object' || Array.isArray(userData)) {
        throw new Error('잘못된 사용자 데이터 형식입니다.');
      }
      const response = await registerUser(userData);
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await logoutUser();
      setUser(null);
      localStorage.removeItem('token');
    } catch (error) {
      console.error('로그아웃 오류:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (userData) => {
    setLoading(true);
    try {
      const response = await updateUserProfile(userData);
      setUser((prevUser) => ({
        ...prevUser,
        ...response.data,
        preferences: response.data.preferences,
      }));
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePassword = useCallback(async (currentPassword, newPassword) => {
    setLoading(true);
    try {
      const response = await changeUserPassword(currentPassword, newPassword);
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      login,
      register,
      logout,
      updateUser,
      updatePassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

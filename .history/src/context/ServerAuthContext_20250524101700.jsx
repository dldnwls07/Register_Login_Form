// src/context/ServerAuthContext.jsx
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
  }, []);
  // 로그인 함수
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

  // 로그아웃 함수
  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
      setError(null);
      console.log('로그아웃 성공');
    } catch (err) {
      console.error('로그아웃 오류:', err);
      // 오류가 발생해도 로컬에서는 로그아웃 처리
      setUser(null);
    }
  };
    // 데이터 마이그레이션 확인 함수
  const checkForDataMigration = async (userId) => {
    try {
      // 로컬 스토리지에 데이터가 있는지 확인
      const hasLocalTransactions = localStorage.getItem('entries') !== null;
      const hasLocalGoals = localStorage.getItem('goal') !== null;
      
      if (hasLocalTransactions || hasLocalGoals) {
        // 이미 마이그레이션했는지 확인
        const migrated = localStorage.getItem('dataMigrated');
        if (migrated) return;
        
        // 사용자에게 데이터 마이그레이션 제안
        const confirmMigration = window.confirm(
          '기존에 저장된 가계부 데이터가 있습니다. 서버에 데이터를 이전하시겠습니까?\n' +
          '이전하지 않으면 기존 데이터에 접근할 수 없게 됩니다.'
        );
        
        if (confirmMigration) {
          // 마이그레이션 모듈 동적 로드 (코드 스플리팅)
          const { migrateTransactionsToDb, migrateGoalToDb } = await import('../utils/migrationUtil');
          console.log('데이터 마이그레이션 시작...');
          
          if (hasLocalTransactions) {
            const result = await migrateTransactionsToDb(userId);
            if (result.success) {
              console.log(`${result.successCount}/${result.total} 거래 기록 마이그레이션 성공`);
            } else {
              console.error('거래 데이터 마이그레이션 실패:', result.error);
            }
          }
          
          if (hasLocalGoals) {
            const result = await migrateGoalToDb(userId);
            if (result.success && result.migrated) {
              console.log('재무 목표 마이그레이션 성공');
            } else if (result.success && !result.migrated) {
              console.log(result.message);
            } else {
              console.error('목표 데이터 마이그레이션 실패:', result.error);
            }
          }
          
          // 마이그레이션 완료 표시
          localStorage.setItem('dataMigrated', 'true');
          console.log('데이터 마이그레이션 완료!');
          
          // 사용자에게 알림
          alert('데이터 마이그레이션이 완료되었습니다. 이제 여러 기기에서 데이터를 안전하게 사용할 수 있습니다.');
        } else {
          // 사용자가 마이그레이션을 거부한 경우도 표시
          localStorage.setItem('dataMigrationSkipped', 'true');
        }
      }
    } catch (error) {
      console.error('데이터 마이그레이션 확인 중 오류:', error);
      alert('데이터 마이그레이션 중 오류가 발생했습니다. 설정 페이지에서 다시 시도하세요.');
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
      setError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  // 로딩 중일 때는 로딩 상태 표시
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>로딩 중...</p>
      </div>
    );
  }
    // 사용자가 로그인하지 않았으면 메인 페이지(로그인)로 리디렉션
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // 로그인한 사용자는 원래 의도한 컴포넌트 표시
  return children;
};

export default PrivateRoute;

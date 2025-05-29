import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Navigation = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  return (
    <nav className="main-navigation">
      <ul className="nav-links">
        {user ? (
          // 로그인된 사용자용 메뉴
          <>
            <li>
              <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
                대시보드
              </Link>
            </li>
            <li>
              <Link to="/spending" className={location.pathname === '/spending' ? 'active' : ''}>
                지출 관리
              </Link>
            </li>
            <li>
              <Link to="/goal" className={location.pathname === '/goal' ? 'active' : ''}>
                목표 설정
              </Link>
            </li>
            <li>
              <Link to="/analysis" className={location.pathname === '/analysis' ? 'active' : ''}>
                지출 분석
              </Link>
            </li>
            <li>
              <Link to="/profile" className={location.pathname === '/profile' ? 'active' : ''}>
                프로필
              </Link>
            </li>
          </>
        ) : (
          // 로그인되지 않은 사용자용 메뉴
          <>
            <li>
              <Link to="/login" className={location.pathname === '/login' ? 'active' : ''}>
                로그인
              </Link>
            </li>
            <li>
              <Link to="/register" className={location.pathname === '/register' ? 'active' : ''}>
                회원가입
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navigation;

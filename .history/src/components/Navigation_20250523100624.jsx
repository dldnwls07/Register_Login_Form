import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();
  
  return (
    <nav className="main-navigation">
      <div className="nav-links">
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
          대시보드
        </Link>
        <Link to="/spending" className={location.pathname === '/spending' ? 'active' : ''}>
          지출 관리
        </Link>
        <Link to="/goal" className={location.pathname === '/goal' ? 'active' : ''}>
          목표 설정
        </Link>
        <Link to="/analysis" className={location.pathname === '/analysis' ? 'active' : ''}>
          지출 분석
        </Link>
      </div>
    </nav>
  );
};

export default Navigation;

import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();
  
  return (
    <nav className="main-navigation">
      <ul className="nav-links">
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
      </ul>
    </nav>
  );
};

export default Navigation;

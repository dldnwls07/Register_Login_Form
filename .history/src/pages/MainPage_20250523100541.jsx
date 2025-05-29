import React from 'react';
import { Link } from 'react-router-dom';
import Summary from '../components/Summary';

const MainPage = ({ entries }) => {
  return (
    <div className="main-page">
      <h1>가계부 앱 대시보드</h1>
      
      <Summary entries={entries} />
      
      <div className="navigation-links">
        <Link to="/spending" className="nav-link">
          <div className="nav-card">
            <h2>지출 관리</h2>
            <p>지출 내역 조회 및 추가하기</p>
          </div>
        </Link>
        
        <Link to="/goal" className="nav-link">
          <div className="nav-card">
            <h2>목표 설정</h2>
            <p>재정 목표 설정 및 진행 상황 확인하기</p>
          </div>
        </Link>
        
        <Link to="/analysis" className="nav-link">
          <div className="nav-card">
            <h2>지출 분석</h2>
            <p>지출 패턴과 카테고리별 분석 확인하기</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default MainPage;

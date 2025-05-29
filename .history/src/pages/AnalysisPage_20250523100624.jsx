import React from 'react';
import { Link } from 'react-router-dom';
import SpendingAnalysis from '../components/SpendingAnalysis';
import PieChart from '../components/PieChart';

const AnalysisPage = ({ entries }) => {
  return (
    <div className="analysis-page">
      <h1>지출 분석</h1>
      
      <div className="back-link">
        <Link to="/">← 대시보드로 돌아가기</Link>
      </div>
      
      <div className="analysis-content">
        <div className="chart-section">
          <h2>카테고리별 지출</h2>
          <PieChart data={entries} />
        </div>
        
        <div className="analysis-section">
          <SpendingAnalysis entries={entries} />
        </div>
      </div>
    </div>
  );
};

export default AnalysisPage;

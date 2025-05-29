import React from 'react';
import { Link } from 'react-router-dom';
import GoalSetter from '../components/GoalSetter';
import PieChart from '../components/PieChart';
import '../styles/pages/GoalPage.css';

const GoalPage = ({ entries, goal, setGoal, totalSpending }) => {
  return (
    <div className="goal-page">
      <h1>재정 목표 설정</h1>
      
      <div className="back-link">
        <Link to="/">← 대시보드로 돌아가기</Link>
      </div>
      
      <div className="goal-content">
        <div className="goal-section">
          <GoalSetter goal={goal} setGoal={setGoal} totalSpending={totalSpending} />
        </div>
        
        <div className="chart-section">
          <h2>지출 분포</h2>
          <PieChart data={entries} />
        </div>
      </div>
    </div>
  );
};

export default GoalPage;

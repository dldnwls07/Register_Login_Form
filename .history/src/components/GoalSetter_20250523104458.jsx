import React, { useState, useEffect } from 'react';
import '../styles/components/GoalSetter.css';

const GoalSetter = ({ goal: propGoal, setGoal: propSetGoal, totalSpending: propTotalSpending }) => {
    const [localGoal, setLocalGoal] = useState(propGoal || '');
    const [isAchieved, setIsAchieved] = useState(false);
    const [totalSpending, setTotalSpending] = useState(propTotalSpending || 0);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(getEndOfMonth());

    useEffect(() => {
        setLocalGoal(propGoal || '');
    }, [propGoal]);

    useEffect(() => {
        setTotalSpending(propTotalSpending || 0);
    }, [propTotalSpending]);
    
    // 현재 달의 마지막 날짜를 구하는 함수
    function getEndOfMonth() {
        const date = new Date();
        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        return lastDay.toISOString().split('T')[0];
    }
    
    const handleGoalChange = (e) => {
        setLocalGoal(e.target.value);
    };

    const handleGoalSubmit = (e) => {
        e.preventDefault();
        const numericGoal = parseFloat(localGoal);
        if (!isNaN(numericGoal)) {
            propSetGoal(numericGoal);
            console.log('목표 설정:', numericGoal, '기간:', startDate, '~', endDate);
        }
    };

    const toggleAchievement = () => {
        setIsAchieved(!isAchieved);
    };

    // 목표 대비 지출 상황 계산
    const remainingPercentage = propGoal ? Math.min(100, Math.max(0, (totalSpending / propGoal) * 100)) : 0;
    const isExceeded = totalSpending > propGoal;
    
    const remainingOrExceeded = isExceeded
        ? `초과 금액: ${(totalSpending - propGoal).toLocaleString()}원`
        : `남은 금액: ${(propGoal - totalSpending).toLocaleString()}원`;

    return (
        <div className="goal-setter">
            <h2>재정 목표 설정</h2>
            <form onSubmit={handleGoalSubmit} className="goal-form">
                <div className="form-group">
                    <label htmlFor="goal-amount">목표 금액:</label>
                    <div className="input-with-icon">
                        <input
                            type="text"
                            id="goal-amount"
                            value={localGoal}
                            onChange={handleGoalChange}
                            placeholder="목표 금액을 입력하세요"
                        />
                        <span className="currency-symbol">원</span>
                    </div>
                </div>
                
                <div className="form-group">
                    <label htmlFor="goal-start">시작일:</label>
                    <input
                        type="date"
                        id="goal-start"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="goal-end">종료일:</label>
                    <input
                        type="date"
                        id="goal-end"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>
                
                <button type="submit" className="goal-submit-button">목표 설정</button>
            </form>
            
            {propGoal ? (
                <div className="goal-status">
                    <div className="goal-header">
                        <h3>목표 상태</h3>
                        <div className="achievement-toggle">
                            <label className="switch">
                                <input 
                                    type="checkbox" 
                                    checked={isAchieved} 
                                    onChange={toggleAchievement}
                                />
                                <span className="slider round"></span>
                            </label>
                            <span>{isAchieved ? '달성됨' : '진행중'}</span>
                        </div>
                    </div>
                    
                    <div className="goal-progress">
                        <div className="progress-bar-container">
                            <div 
                                className={`progress-bar ${isExceeded ? 'exceeded' : ''}`} 
                                style={{ width: `${remainingPercentage}%` }}
                            ></div>
                        </div>
                        <div className="progress-details">
                            <p className="progress-percentage">
                                {Math.floor(remainingPercentage)}% 사용
                            </p>
                            <p className="progress-numbers">
                                <span>{totalSpending.toLocaleString()}원</span>
                                <span>{propGoal.toLocaleString()}원</span>
                            </p>
                        </div>
                    </div>
                    
                    <div className={`goal-status-message ${isExceeded ? 'exceeded' : 'remaining'}`}>
                        {isExceeded ? (
                            <div className="alert">
                                <span className="icon">⚠️</span>
                                <span className="message">목표를 초과했습니다! {remainingOrExceeded}</span>
                            </div>
                        ) : (
                            <div className="success">
                                <span className="icon">✅</span>
                                <span className="message">목표 내에 있습니다. {remainingOrExceeded}</span>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="no-goal-message">
                    <p>목표를 설정해주세요.</p>
                    <p>재정 목표를 설정하면 지출 관리가 더욱 쉬워집니다.</p>
                </div>
            )}
        </div>
    );
};

export default GoalSetter;
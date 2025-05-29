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
        <div>
            <h2>재정 목표 설정</h2>
            <form onSubmit={handleGoalSubmit}>
                <input
                    type="text"
                    value={localGoal}
                    onChange={handleGoalChange}
                    placeholder="목표 금액을 입력하세요"
                />
                <button type="submit">목표 설정</button>
            </form>
            <div>
                <h3>목표 상태: {isAchieved ? '달성됨' : '달성되지 않음'}</h3>
                <button onClick={toggleAchievement}>
                    {isAchieved ? '달성되지 않음으로 표시' : '달성됨으로 표시'}
                </button>
            </div>
            <div>
                {propGoal ? (
                    <p style={{ color: totalSpending > propGoal ? 'red' : 'green' }}>
                        현재 지출 {totalSpending.toLocaleString()}원, 목표 {propGoal.toLocaleString()}원
                        {totalSpending > propGoal ? ' - 목표를 초과했습니다!' : ' - 목표 내에 있습니다.'}
                        <br />
                        {remainingOrExceeded}
                    </p>
                ) : (
                    <p>목표를 설정해주세요.</p>
                )}
            </div>
        </div>
    );
};

export default GoalSetter;
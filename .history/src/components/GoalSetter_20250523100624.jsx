import React, { useState, useEffect } from 'react';

const GoalSetter = ({ goal: propGoal, setGoal: propSetGoal, totalSpending: propTotalSpending }) => {
    const [localGoal, setLocalGoal] = useState(propGoal || '');
    const [isAchieved, setIsAchieved] = useState(false);
    const [totalSpending, setTotalSpending] = useState(propTotalSpending || 0);

    useEffect(() => {
        setLocalGoal(propGoal || '');
    }, [propGoal]);

    useEffect(() => {
        setTotalSpending(propTotalSpending || 0);
    }, [propTotalSpending]);
    
    const handleGoalChange = (e) => {
        setLocalGoal(e.target.value);
    };

    const handleGoalSubmit = (e) => {
        e.preventDefault();
        const numericGoal = parseFloat(localGoal);
        if (!isNaN(numericGoal)) {
            propSetGoal(numericGoal);
            console.log('목표 설정:', numericGoal);
        }
    };

    const toggleAchievement = () => {
        setIsAchieved(!isAchieved);
    };

    return (
        <div>
            <h2>재정 목표 설정</h2>
            <form onSubmit={handleGoalSubmit}>
                <input
                    type="text"
                    value={goal}
                    onChange={handleGoalChange}
                    placeholder="목표 금액을 입력하세요"
                />
                <button type="submit">Set Goal</button>
            </form>
            <div>
                <h3>Goal Status: {isAchieved ? 'Achieved' : 'Not Achieved'}</h3>
                <button onClick={toggleAchievement}>
                    {isAchieved ? 'Mark as Not Achieved' : 'Mark as Achieved'}
                </button>
            </div>
            <div>
                {goal ? (
                    <p style={{ color: totalSpending > goal ? 'red' : 'green' }}>
                        현재 지출 {totalSpending.toLocaleString()}원, 목표 {goal.toLocaleString()}원
                        {totalSpending > goal ? ' - 목표 초과!' : ' - 목표 내입니다.'}
                    </p>
                ) : (
                    <p>목표를 설정해주세요.</p>
                )}
            </div>
        </div>
    );
};

export default GoalSetter;
import React, { useState } from 'react';

const GoalSetter = () => {
    const [goal, setGoal] = useState('');
    const [isAchieved, setIsAchieved] = useState(false);
    const [totalSpending, setTotalSpending] = useState(0); // Assuming you have totalSpending state

    const handleGoalChange = (e) => {
        setGoal(e.target.value);
    };

    const handleGoalSubmit = (e) => {
        e.preventDefault();
        // Logic to save the goal can be added here
        console.log('Goal set:', goal);
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
                <button type="submit">목표 설정</button>
            </form>
            <div>
                <h3>목표 상태: {isAchieved ? '달성됨' : '달성되지 않음'}</h3>
                <button onClick={toggleAchievement}>
                    {isAchieved ? '달성되지 않음으로 표시' : '달성됨으로 표시'}
                </button>
            </div>
            <div>
                {goal ? (
                    <p style={{ color: totalSpending > goal ? 'red' : 'green' }}>
                        현재 지출 {totalSpending.toLocaleString()}원, 목표 {goal.toLocaleString()}원
                        {totalSpending > goal ? ' - 목표를 초과했습니다!' : ' - 목표 내에 있습니다.'}
                    </p>
                ) : (
                    <p>목표를 설정해주세요.</p>
                )}
            </div>
        </div>
    );
};

export default GoalSetter;
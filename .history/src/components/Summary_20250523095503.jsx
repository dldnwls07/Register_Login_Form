import React from 'react';

const Summary = ({ entries = [] }) => {
    const totalSpending = entries
        .filter(e => e.type === '지출')
        .reduce((sum, e) => sum + e.amount, 0);

    const totalIncome = entries
        .filter(e => e.type === '수입')
        .reduce((sum, e) => sum + e.amount, 0);

    const netTotal = totalIncome - totalSpending;

    return (
        <div className="summary">
            <h2>요약</h2>
            <h3>총 지출: {totalSpending.toLocaleString()}원</h3>
            <h3>총 수입: {totalIncome.toLocaleString()}원</h3>
            <h3>순이익: {netTotal.toLocaleString()}원</h3>
        </div>
    );
};

export default Summary;
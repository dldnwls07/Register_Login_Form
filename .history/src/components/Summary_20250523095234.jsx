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
            <h2>Summary</h2>
            <p>Total Income: ${totalIncome.toFixed(2)}</p>
            <p>Total Expense: ${totalSpending.toFixed(2)}</p>
            <p>Balance: ${netTotal.toFixed(2)}</p>
        </div>
    );
};

export default Summary;
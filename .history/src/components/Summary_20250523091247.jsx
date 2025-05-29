import React from 'react';

const Summary = ({ totalSpending = 0, totalIncome = 0, netTotal = 0 }) => {
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
import React, { useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';

Chart.register(ArcElement, Tooltip, Legend);

const groupDataByPeriod = (entries, period) => {
    const groupedData = {};

    entries.forEach(entry => {
        const date = new Date(entry.date);
        if (isNaN(date.getTime())) {
            console.warn(`유효하지 않은 날짜 값: ${entry.date}`); // 디버깅용 경고
            return; // 유효하지 않은 날짜는 무시
        }

        let key;
        switch (period) {
            case 'year':
                key = date.getFullYear();
                break;
            case 'month':
                key = `${date.getFullYear()}-${date.getMonth() + 1}`;
                break;
            case 'week':
                const startOfWeek = new Date(date.setDate(date.getDate() - date.getDay()));
                key = startOfWeek.toISOString().split('T')[0];
                break;
            case 'day':
                key = date.toISOString().split('T')[0];
                break;
            default:
                key = '알 수 없음';
        }

        if (!groupedData[key]) {
            groupedData[key] = [];
        }
        groupedData[key].push(entry);
    });

    return groupedData;
};

const calculateCategoryPercentages = (entries) => {
    const total = entries.reduce((sum, entry) => sum + entry.amount, 0);
    const categorySums = entries.reduce((acc, entry) => {
        acc[entry.category] = (acc[entry.category] || 0) + entry.amount;
        return acc;
    }, {});

    return Object.keys(categorySums).map(category => ({
        category,
        percentage: ((categorySums[category] / total) * 100).toFixed(2),
    }));
};

const calculateItemPercentages = (entries) => {
    const total = entries.reduce((sum, entry) => sum + entry.amount, 0);
    return entries.map(entry => ({
        ...entry,
        percentage: ((entry.amount / total) * 100).toFixed(2),
    }));
};

const SpendingAnalysis = ({ entries }) => {
    const [period, setPeriod] = useState('month');
    const validEntries = entries.filter(entry => !isNaN(new Date(entry.date).getTime()));
    const groupedData = groupDataByPeriod(validEntries, period);

    const currentPeriod = Object.keys(groupedData)[0];
    const currentEntries = groupedData[currentPeriod] || [];
    const categoryPercentages = calculateCategoryPercentages(currentEntries);
    const itemPercentages = calculateItemPercentages(currentEntries);

    const data = {
        labels: categoryPercentages.map(item => item.category),
        datasets: [
            {
                label: '카테고리별 비율',
                data: categoryPercentages.map(item => item.percentage),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#81C784', '#FF9F40', '#4BC0C0'],
                hoverOffset: 20,
            },
        ],
    };

    return (
        <div className="spending-analysis">
            <h3>지출 분석</h3>
            <div>
                <label>
                    기간 선택:
                    <select value={period} onChange={(e) => setPeriod(e.target.value)}>
                        <option value="year">년별</option>
                        <option value="month">월별</option>
                        <option value="week">주별</option>
                        <option value="day">일별</option>
                    </select>
                </label>
            </div>
            {currentEntries.length > 0 ? (
                <>
                    <Pie data={data} />
                    <ul>
                        {itemPercentages.map((entry, index) => (
                            <li key={index}>
                                {entry.category} - {entry.amount.toLocaleString()}원 ({entry.percentage}%)
                            </li>
                        ))}
                    </ul>
                </>
            ) : (
                <p>선택한 기간에 해당하는 지출 데이터가 없습니다.</p>
            )}
        </div>
    );
};

export default SpendingAnalysis;

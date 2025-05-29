import React from 'react';
import { Pie } from 'react-chartjs-2';

const PieChart = ({ data = [] }) => { // 기본값 설정
  if (!data || data.length === 0) { // 데이터가 없을 경우 처리
    return (
      <div>
        <h2>Budget Distribution</h2>
        <p>지출 데이터가 없습니다. 데이터를 추가해주세요.</p>
      </div>
    );
  }

  const chartData = {
    labels: data.map(entry => entry.category),
    datasets: [
      {
        data: data.map(entry => entry.amount),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#81C784', '#FF9F40', '#4BC0C0'
        ],
        hoverBackgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
        ],
      },
    ],
  };

  return (
    <div>
      <h2>Budget Distribution</h2>
      <Pie data={chartData} />
    </div>
  );
};

export default PieChart;
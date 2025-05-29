import React from 'react';

const EntryTable = ({ entries }) => {
    return (
        <table>
            <thead>
                <tr>
                    <th>날짜</th>
                    <th>유형</th>
                    <th>항목</th>
                    <th>카테고리</th>
                    <th>금액</th>
                    <th>메모</th>
                </tr>
            </thead>
            <tbody>
                {entries.length === 0 ? (
                    <tr>
                        <td colSpan="6">데이터가 없습니다.</td>
                    </tr>
                ) : (
                    entries.map((e, index) => (
                        <tr key={index}>
                            <td>{e.date}</td>
                            <td>{e.type}</td>
                            <td>{e.item}</td>
                            <td>{e.category}</td>
                            <td>{e.type === '지출' ? '-' : '+'}{e.amount.toLocaleString()}원</td>
                            <td>{e.memo}</td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    );
};

export default EntryTable;
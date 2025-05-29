import React from 'react';

const EntryTable = ({ entries }) => {
    return (
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                {entries.length === 0 ? (
                    <tr>
                        <td colSpan="3">데이터가 없습니다.</td>
                    </tr>
                ) : (
                    entries.map((entry) => (
                        <tr key={entry.id || entry.date + entry.item}>
                            <td>{entry.date}</td>
                            <td>{entry.type}</td>
                            <td>{entry.item}</td>
                            <td>{entry.category}</td>
                            <td>{entry.type === '지출' ? '-' : '+'}{entry.amount.toLocaleString()}원</td>
                            <td>{entry.memo}</td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    );
};

export default EntryTable;
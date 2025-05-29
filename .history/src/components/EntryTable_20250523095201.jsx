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
                    entries.map((entry, index) => (
                        <tr key={index}>
                            <td>{entry.date}</td>
                            <td>{entry.description}</td>
                            <td>{entry.type === '지출' ? '-' : '+'}{entry.amount.toLocaleString()}원</td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    );
};

export default EntryTable;
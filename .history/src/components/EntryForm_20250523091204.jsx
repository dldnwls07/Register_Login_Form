import React, { useState } from 'react';

const EntryForm = ({ onAddEntry }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (description && amount) {
            onAddEntry({ description, amount: parseFloat(amount) });
            e.target.reset();
            setDescription('');
            setAmount('');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="description">Description:</label>
                <input
                    type="text"
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor="amount">Amount:</label>
                <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                />
            </div>
            <button type="submit">Add Entry</button>
        </form>
    );
};

export default EntryForm;
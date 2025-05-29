import React, { useState } from 'react';
import CategorySelector from './CategorySelector';

const EntryForm = ({ onAddEntry }) => {
    const [item, setItem] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [memo, setMemo] = useState('');
    const [category, setCategory] = useState(null);
    
    const handleCategorySelect = (selectedCategory) => {
        setCategory(selectedCategory);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (item && amount && category) {
            const newEntry = {
                item,
                amount: parseFloat(amount),
                date,
                memo,
                category: category.detailCategory.name,
                categoryInfo: category,
                timestamp: new Date().getTime()
            };
            
            onAddEntry(newEntry);
            
            // 폼 초기화
            setItem('');
            setAmount('');
            setDate(new Date().toISOString().split('T')[0]);
            setMemo('');
            setCategory(null);
        } else {
            alert('항목, 금액, 카테고리는 필수 입력 항목입니다.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="entry-form">
            <div className="form-group">
                <label htmlFor="item">항목:</label>
                <input
                    type="text"
                    id="item"
                    value={item}
                    onChange={(e) => setItem(e.target.value)}
                    placeholder="지출 항목"
                    required
                />
            </div>
            
            <div className="form-group">
                <label htmlFor="amount">금액:</label>
                <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    required
                />
            </div>
            
            <div className="form-group">
                <label htmlFor="date">날짜:</label>
                <input
                    type="date"
                    id="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                />
            </div>
            
            <div className="form-group">
                <label htmlFor="memo">메모:</label>
                <textarea
                    id="memo"
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    placeholder="부가 설명 (선택사항)"
                    rows="2"
                />
            </div>
            
            <div className="form-group category-group">
                <label>카테고리:</label>
                <CategorySelector onCategorySelect={handleCategorySelect} />
            </div>
            
            <div className="selected-category">
                {category && (
                    <p>선택된 카테고리: {category.mainCategory.name} &gt; {category.subCategory.name} &gt; {category.detailCategory.name}</p>
                )}
            </div>
            
            <button type="submit" className="submit-button">항목 추가</button>
        </form>
    );
};

export default EntryForm;
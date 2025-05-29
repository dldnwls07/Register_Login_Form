import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
    const [query, setQuery] = useState('');

    const handleInputChange = (event) => {
        setQuery(event.target.value);
        onSearch(event.target.value);
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            onSearch(query);
        }
    };

    return (
        <div className="search-bar">
            <input
                type="text"
                placeholder="항목 검색..."
                value={query}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
            />
        </div>
    );
};

export default SearchBar;
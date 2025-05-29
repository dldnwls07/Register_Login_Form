import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import EntryForm from '../components/EntryForm';
import EntryTable from '../components/EntryTable';
import SearchBar from '../components/SearchBar';

const SpendingPage = ({ entries, addEntry }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredEntries = entries.filter(entry =>
    entry.description && entry.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="spending-page">
      <h1>지출 관리</h1>
      
      <div className="back-link">
        <Link to="/">← 대시보드로 돌아가기</Link>
      </div>
      
      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      
      <div className="spending-content">
        <div className="form-section">
          <h2>새 항목 추가</h2>
          <EntryForm onAddEntry={addEntry} />
        </div>
        
        <div className="table-section">
          <h2>거래 내역</h2>
          <EntryTable entries={filteredEntries} />
        </div>
      </div>
    </div>
  );
};

export default SpendingPage;

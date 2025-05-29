import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage';
import SpendingPage from './pages/SpendingPage';
import GoalPage from './pages/GoalPage';
import AnalysisPage from './pages/AnalysisPage';
import Navigation from './components/Navigation';
import { getEntries, saveEntries, getGoal, saveGoal } from './utils/localStorageUtil';
import './styles/App.css';

const App = () => {
    const [entries, setEntries] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [goal, setGoal] = useState(0);

    // 초기화: localStorage에서 데이터 불러오기
    useEffect(() => {
        setEntries(getEntries());
        setGoal(getGoal() || 0);
    }, []);

    const addEntry = (entry) => {
        const updatedEntries = [...entries, { ...entry, type: '지출' }];
        setEntries(updatedEntries);
        saveEntries(updatedEntries);
    };

    const updateGoal = (newGoal) => {
        setGoal(newGoal);
        saveGoal(newGoal);
    };

    const filteredEntries = entries.filter(entry =>
        entry.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalSpending = entries.filter(e => e.type === '지출').reduce((sum, e) => sum + e.amount, 0);

    return (
        <div className="App">
            <h1>가계부 앱</h1>
            <GoalSetter goal={goal} setGoal={updateGoal} totalSpending={totalSpending} />
            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            <EntryForm onAddEntry={addEntry} />
            <EntryTable entries={filteredEntries} />
            <Summary
                totalSpending={totalSpending}
                totalIncome={entries.filter(e => e.type === '수입').reduce((sum, e) => sum + e.amount, 0)}
                netTotal={entries.reduce((sum, e) => sum + (e.type === '수입' ? e.amount : -e.amount), 0)}
            />
            <PieChart entries={entries} />
            <SpendingAnalysis entries={entries} />
        </div>
    );
};

export default App;
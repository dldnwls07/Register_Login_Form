import React, { useState } from 'react';
import SpendingAnalysis from './components/SpendingAnalysis';
import EntryForm from './components/EntryForm';
import EntryTable from './components/EntryTable';
import Summary from './components/Summary';
import GoalSetter from './components/GoalSetter';
import SearchBar from './components/SearchBar';
import PieChart from './components/PieChart';
import { getEntries, saveEntries } from './utils/localStorageUtil';
import './styles/App.css';

const App = () => {
    const [entries, setEntries] = useState(getEntries());
    const [searchTerm, setSearchTerm] = useState('');
    const [goal, setGoal] = useState('');

    const addEntry = (entry) => {
        const updatedEntries = [...entries, entry];
        setEntries(updatedEntries);
        saveEntries(updatedEntries);
    };

    const filteredEntries = entries.filter(entry =>
        entry.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="App">
            <h1>가계부 앱</h1>
            <GoalSetter goal={goal} setGoal={setGoal} />
            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            <EntryForm addEntry={addEntry} />
            <EntryTable entries={filteredEntries} />
            <Summary
                totalSpending={entries.filter(e => e.type === '지출').reduce((sum, e) => sum + e.amount, 0)}
                totalIncome={entries.filter(e => e.type === '수입').reduce((sum, e) => sum + e.amount, 0)}
                netTotal={entries.reduce((sum, e) => sum + (e.type === '수입' ? e.amount : -e.amount), 0)}
            />
            <PieChart entries={entries} />
            <SpendingAnalysis entries={entries} />
        </div>
    );
};

export default App;
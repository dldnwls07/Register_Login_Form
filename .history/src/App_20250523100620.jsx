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
        <Router>
            <div className="App">
                <header className="App-header">
                    <h1>가계부 앱</h1>
                    <Navigation />
                </header>
                
                <main className="App-content">
                    <Routes>
                        <Route path="/" element={<MainPage entries={entries} />} />
                        <Route 
                            path="/spending" 
                            element={<SpendingPage 
                                entries={entries} 
                                addEntry={addEntry}
                            />} 
                        />
                        <Route 
                            path="/goal" 
                            element={<GoalPage 
                                entries={entries}
                                goal={goal}
                                setGoal={updateGoal}
                                totalSpending={totalSpending}
                            />} 
                        />
                        <Route 
                            path="/analysis" 
                            element={<AnalysisPage entries={entries} />} 
                        />
                    </Routes>
                </main>
                
                <footer className="App-footer">
                    <p>© 2025 가계부 앱 - 내 돈 관리를 위한 최고의 도우미</p>
                </footer>
            </div>
        </Router>
    );
};

export default App;
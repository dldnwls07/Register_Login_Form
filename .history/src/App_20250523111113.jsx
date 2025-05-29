import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage';
import SpendingPage from './pages/SpendingPage';
import GoalPage from './pages/GoalPage';
import AnalysisPage from './pages/AnalysisPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProfilePage from './pages/auth/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import Navigation from './components/Navigation';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { getEntries, saveEntries, getGoal, saveGoal } from './utils/localStorageUtil';
import { getTransactions, addTransaction, getCurrentGoal, setFinancialGoal } from './utils/dbService';
import './styles/Common.css';

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
        <AuthProvider>
            <Router>
                <div className="App">
                    <header className="App-header">
                        <div className="header-container">
                            <h1>가계부 앱</h1>
                            <Navigation />
                        </div>
                    </header>
                    
                    <main className="App-content">
                        <Routes>
                            {/* 인증 관련 라우트 */}
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/register" element={<RegisterPage />} />
                            
                            {/* 보호된 라우트 (로그인 필요) */}
                            <Route path="/" element={
                                <PrivateRoute>
                                    <MainPage entries={entries} />
                                </PrivateRoute>
                            } />
                            <Route path="/spending" element={
                                <PrivateRoute>
                                    <SpendingPage entries={entries} addEntry={addEntry} />
                                </PrivateRoute>
                            } />
                            <Route path="/goal" element={
                                <PrivateRoute>
                                    <GoalPage 
                                        entries={entries}
                                        goal={goal}
                                        setGoal={updateGoal}
                                        totalSpending={totalSpending}
                                    />
                                </PrivateRoute>
                            } />
                            <Route path="/analysis" element={
                                <PrivateRoute>
                                    <AnalysisPage entries={entries} />
                                </PrivateRoute>
                            } />
                            <Route path="/profile" element={
                                <PrivateRoute>
                                    <ProfilePage />
                                </PrivateRoute>
                            } />
                            <Route path="/settings" element={
                                <PrivateRoute>
                                    <SettingsPage />
                                </PrivateRoute>
                            } />
                        </Routes>
                    </main>
                    
                    <footer className="App-footer">
                        <p>© 2025 가계부 앱 - 내 돈 관리를 위한 최고의 도우미</p>
                    </footer>
                </div>
            </Router>
        </AuthProvider>
    );
};

export default App;
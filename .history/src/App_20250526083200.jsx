import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

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
import { getTransactions, addTransaction, getCurrentGoal, setFinancialGoal } from './utils/dbServiceWrapper';
import './styles/Common.css';

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <AppContent />
            </Router>
        </AuthProvider>
    );
};

// AppContent 컴포넌트 - 인증 컨텍스트를 사용하기 위한 래퍼
const AppContent = () => {
    // 인증 컨텍스트 사용
    const [entries, setEntries] = useState([]);
    const [goal, setGoal] = useState(0);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    // 사용자가 로그인되어 있으면 DB에서 데이터 로드
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            
            if (user) {
                // DB에서 사용자 데이터 로드
                try {
                    // 거래 내역 로드
                    const transactions = await getTransactions({}, user.id);
                    setEntries(transactions.map(t => ({
                        id: t.id,
                        amount: t.amount,
                        date: t.date,
                        description: t.memo,
                        categoryInfo: {
                            detailCategory: { id: t.detail_category_id, name: t.detail_name },
                            subCategory: { name: t.sub_name },
                            mainCategory: { name: t.main_name }
                        },
                        type: '지출'
                    })));
                    
                    // 목표 로드
                    const userGoal = await getCurrentGoal(user.id);
                    setGoal(userGoal ? userGoal.amount : 0);
                } catch (error) {
                    console.error('데이터 로드 오류:', error);
                }
            } else {
                // 사용자가 로그인하지 않은 경우 빈 데이터로 초기화
                setEntries([]);
                setGoal(0);
            }
            
            setLoading(false);
        };
        
        loadData();
    }, [user]);

    // 지출 항목 추가
    const addEntry = async (entry) => {
        // 사용자 로그인 확인
        if (!user) {
            alert('로그인이 필요한 기능입니다.');
            return;
        }

        const newEntry = { ...entry, type: '지출' };
        
        try {
            const transactionData = {
                detailCategoryId: entry.categoryInfo?.detailCategory?.id,
                amount: entry.amount,
                date: entry.date,
                memo: entry.description || ''
            };
            
            const result = await addTransaction(transactionData, user.id);
            newEntry.id = result.id;
            
            setEntries(prev => [...prev, newEntry]);
        } catch (error) {
            console.error('거래 저장 오류:', error);
            alert('거래 저장 중 오류가 발생했습니다.');
        }
    };

    // 목표 업데이트
    const updateGoal = async (newGoal) => {
        setGoal(newGoal);
        
        if (user) {
            // DB에 저장
            try {
                const today = new Date();
                const startDate = today.toISOString().split('T')[0];
                
                // 한 달 후 날짜 계산
                const endDate = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate())
                    .toISOString().split('T')[0];
                
                await setFinancialGoal({
                    amount: newGoal,
                    startDate,
                    endDate,
                    isAchieved: false
                }, user.id);
            } catch (error) {
                console.error('목표 저장 오류:', error);
            }
        } else {
            // 사용자가 로그인하지 않은 경우 알림
            alert('목표를 저장하려면 로그인이 필요합니다.');
        }
    };

    const totalSpending = entries
        .filter(e => e.type === '지출')
        .reduce((sum, e) => sum + Number(e.amount), 0);
        
    return (
        <div className="App">
            {user && <header className="App-header">
                <div className="header-container">
                    <h1>가계부 앱</h1>
                    <Navigation />
                </div>
            </header>}
            
            <main className="App-content">
                {loading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>데이터를 불러오는 중...</p>
                    </div>
                ) : (
                    <Routes>
                        {/* 인증 관련 라우트 */}
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/" element={<Navigate to="/login" />} />
                        
                        {/* 보호된 라우트 (로그인 필요) */}
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
                )}
            </main>
            
            <footer className="App-footer">
                <p>© 2025 가계부 앱 - 내 돈 관리를 위한 최고의 도우미</p>
            </footer>
        </div>
    );
};

export default App;
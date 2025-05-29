import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import { AuthProvider } from './context/AuthContext';

import './styles/Common.css';

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <div className="App"> 
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/" element={<Navigate to="/login" />} /> 
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
};

export default App;
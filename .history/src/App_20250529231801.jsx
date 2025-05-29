import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProfilePage from './pages/auth/ProfilePage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import './styles/Common.css';

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <div className="App">
                    <Routes>
                        <Route path="/" element={<Navigate to="/login" replace />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route
                            path="/profile"
                            element={
                                <PrivateRoute>
                                    <ProfilePage />
                                </PrivateRoute>
                            }
                        />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
};

export default App;
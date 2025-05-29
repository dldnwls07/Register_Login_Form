import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Header.css';

const Header = () => {
    const location = useLocation();
    const { user, toggleDarkMode, darkMode } = useContext(AuthContext);

    return (
        <header className="App-header">
            <div className="header-container">
                <h1>가계부</h1>
                <nav className="auth-nav">
                    <div className="auth-buttons">
                        <Link 
                            to="/login" 
                            className={`auth-button ${location.pathname === '/login' ? 'active' : ''}`}
                        >
                            로그인
                        </Link>
                        <Link 
                            to="/register" 
                            className={`auth-button ${location.pathname === '/register' ? 'active' : ''}`}
                        >
                            회원가입
                        </Link>
                    </div>
                </nav>
                <div className="header-actions">
                    {user && (
                        <button
                            className={`dark-mode-toggle ${darkMode ? 'active' : ''}`}
                            onClick={toggleDarkMode}
                        >
                            {darkMode ? '다크 모드 활성화됨' : '다크 모드 비활성화됨'}
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
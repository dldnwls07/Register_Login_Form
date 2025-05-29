import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
    const location = useLocation();

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
            </div>
        </header>
    );
};

export default Header;
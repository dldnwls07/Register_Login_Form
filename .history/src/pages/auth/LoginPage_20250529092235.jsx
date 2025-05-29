import React from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '../../components/LoginForm';
import '../../styles/Common.css';

const LoginPage = () => {
    return (
        <div className="auth-page">
            <div className="auth-tabs">
                <Link to="/login" className="auth-tab active">로그인</Link>
                <Link to="/register" className="auth-tab">회원가입</Link>
            </div>
            <div className="auth-container">
                <LoginForm />
            </div>
        </div>
    );
};

export default LoginPage;

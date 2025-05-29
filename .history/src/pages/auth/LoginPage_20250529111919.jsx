import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoginForm from '../../components/LoginForm';
import '../../styles/Common.css';
import '../../styles/RegisterForm.css';

const LoginPage = () => {
    const navigate = useNavigate();
    const [showSuccess, setShowSuccess] = useState(false);

    const handleLoginSuccess = () => {
        setShowSuccess(true);
        setTimeout(() => {
            setShowSuccess(false);
            navigate('/profile');
        }, 1500);
    };

    return (
        <div className="auth-page">
            {showSuccess && (
                <div className="login-success">
                    로그인 성공! 👋
                </div>
            )}
            <div className="auth-nav">
                <Link to="/login" className="auth-link active">로그인</Link>
                <Link to="/register" className="auth-link">회원가입</Link>
            </div>
            <div className="auth-container">
                <LoginForm onLoginSuccess={handleLoginSuccess} />
            </div>
        </div>
    );
};

export default LoginPage;

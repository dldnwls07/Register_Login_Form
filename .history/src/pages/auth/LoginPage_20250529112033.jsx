import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoginForm from '../../components/LoginForm';
import '../../styles/Common.css';
import '../../styles/RegisterForm.css';

const LoginPage = () => {
    const navigate = useNavigate();
    const [loginStatus, setLoginStatus] = useState({ show: false, success: false, message: '' });

    const handleLoginSuccess = () => {
        setLoginStatus({ show: true, success: true, message: '로그인 성공! 👋' });
        setTimeout(() => {
            setLoginStatus({ show: false, success: false, message: '' });
            navigate('/profile');
        }, 1500);
    };

    const handleLoginFailure = (error) => {
        setLoginStatus({ show: true, success: false, message: error || '로그인 실패' });
        setTimeout(() => {
            setLoginStatus({ show: false, success: false, message: '' });
        }, 1500);
    };

    return (
        <div className="auth-page">
            {loginStatus.show && (
                <div className={`login-result ${loginStatus.success ? 'login-success' : 'login-failure'}`}>
                    {loginStatus.message}
                </div>
            )}
            <div className="auth-nav">
                <Link to="/login" className="auth-link active">로그인</Link>
                <Link to="/register" className="auth-link">회원가입</Link>
            </div>
            <div className="auth-container">
                <LoginForm onLoginSuccess={handleLoginSuccess} onLoginFailure={handleLoginFailure} />
            </div>
        </div>
    );
};

export default LoginPage;

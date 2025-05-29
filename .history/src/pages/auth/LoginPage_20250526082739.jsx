import React from 'react';
import LoginForm from '../../components/LoginForm';
import '../../styles/Common.css';

const LoginPage = () => {
    return (
        <div className="auth-page">
            <div className="auth-container">
                <h2>로그인</h2>
                <LoginForm />
            </div>
        </div>
    );
};

export default LoginPage;

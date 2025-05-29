import React from 'react';
import { Link } from 'react-router-dom';
import RegisterForm from '../../components/RegisterForm';
import '../../styles/Common.css';

const RegisterPage = () => {
    return (
        <div className="auth-page">
            <div className="auth-tabs">
                <Link to="/login" className="auth-tab">로그인</Link>
                <Link to="/register" className="auth-tab active">회원가입</Link>
            </div>
            <div className="auth-container">
                <RegisterForm />
            </div>
        </div>
    );
};

export default RegisterPage;

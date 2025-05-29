import React from 'react';
import { Link } from 'react-router-dom';
import RegisterForm from '../../components/RegisterForm';
import '../../styles/Common.css';
import '../../styles/RegisterForm.css'; // RegisterForm.css 추가

const RegisterPage = () => {
    return (
        <div className="auth-page">
            <div className="auth-nav">
                <Link to="/login" className="auth-link">로그인</Link>
                <Link to="/register" className="auth-link active">회원가입</Link>
            </div>
            <div className="auth-container">
                <RegisterForm />
            </div>
        </div>
    );
};

export default RegisterPage;

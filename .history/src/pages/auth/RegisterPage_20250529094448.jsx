import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import RegisterForm from '../../components/RegisterForm';
import '../../styles/Common.css';
import '../../styles/RegisterForm.css';

const RegisterPage = () => {
    const navigate = useNavigate();

    const handleRegistrationSuccess = () => {
        alert('회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.');
        navigate('/login');
    };

    return (
        <div className="auth-page">
            <div className="auth-nav">
                <Link to="/login" className="auth-link">로그인</Link>
                <Link to="/register" className="auth-link active">회원가입</Link>
            </div>
            <div className="auth-container">
                <RegisterForm onRegistrationSuccess={handleRegistrationSuccess} />
            </div>
        </div>
    );
};

export default RegisterPage;

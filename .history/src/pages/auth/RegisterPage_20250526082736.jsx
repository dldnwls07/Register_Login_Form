import React from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterForm from '../../components/RegisterForm';
import '../../styles/Common.css';

const RegisterPage = () => {
    const navigate = useNavigate();

    const handleRegistrationSuccess = () => {
        // 회원가입 성공 시 로그인 페이지로 이동
        navigate('/login');
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <h2>회원가입</h2>
                <RegisterForm onRegistrationSuccess={handleRegistrationSuccess} />
            </div>
        </div>
    );
};

export default RegisterPage;

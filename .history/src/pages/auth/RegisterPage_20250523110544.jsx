import React from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterForm from '../../components/RegisterForm';
import '../../styles/pages/AuthPage.css';

const RegisterPage = () => {
  const navigate = useNavigate();

  const handleRegisterSuccess = () => {
    navigate('/login', { 
      state: { message: '회원가입에 성공했습니다. 로그인해주세요.' } 
    });
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>가계부 앱</h1>
        <p className="auth-description">회원가입하여 가계부를 시작하세요</p>
        <RegisterForm onRegisterSuccess={handleRegisterSuccess} />
      </div>
    </div>
  );
};

export default RegisterPage;

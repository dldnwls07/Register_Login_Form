import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../../components/LoginForm';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/pages/AuthPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLoginSuccess = (user) => {
    navigate('/');
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>가계부 앱</h1>
        <p className="auth-description">로그인하여 가계부를 관리하세요</p>
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      </div>
    </div>
  );
};

export default LoginPage;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterForm from '../../components/RegisterForm';
import StepperRegisterForm from '../../components/StepperRegisterForm';
import '../../styles/pages/AuthPage.css';
import '../../styles/components/StepperRegisterForm.css';

const RegisterPage = () => {
  const [useSimpleForm, setUseSimpleForm] = useState(false);
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
        <div className="form-toggle">
          <button 
            className={!useSimpleForm ? 'active' : ''}
            onClick={() => setUseSimpleForm(false)}
          >
            단계별 가입
          </button>
          <button 
            className={useSimpleForm ? 'active' : ''}
            onClick={() => setUseSimpleForm(true)}
          >
            간단 가입
          </button>
        </div>
        {useSimpleForm ? (
          <RegisterForm onRegisterSuccess={handleRegisterSuccess} />
        ) : (
          <StepperRegisterForm />
        )}
      </div>
    </div>
  );
};

export default RegisterPage;

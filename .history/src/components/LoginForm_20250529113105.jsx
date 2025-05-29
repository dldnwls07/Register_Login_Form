import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/RegisterForm.css';

const LoginForm = ({ onLoginSuccess, onLoginFailure }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [autoLogin, setAutoLogin] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  // 회원가입 성공 메시지 표시
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // URL에서 메시지 상태 제거
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // 필드 변경 시 해당 필드의 오류 메시지 초기화
    if (error) {
      setError('');
    }
  };
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const handleAutoLoginChange = (e) => {
    setAutoLogin(e.target.checked);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = '사용자 아이디를 입력하세요.';
    }

    if (!formData.password) {
      newErrors.password = '비밀번호를 입력하세요.';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
        onLoginFailure('아이디와 비밀번호를 다시 한번 확인해 주세요');
        return;
    }
    try {
        const response = await login(formData.username, formData.password, autoLogin);
        if (response.success) {
            onLoginSuccess();
        } else {
            onLoginFailure('아이디와 비밀번호를 다시 한번 확인해 주세요');
        }
    } catch (err) {
        console.error('로그인 오류:', err);
        onLoginFailure('아이디와 비밀번호를 다시 한번 확인해 주세요');
    }
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">로그인</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">아이디</label>
          <input
            id="username"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="아이디를 입력하세요"
            disabled={isLoading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">비밀번호</label>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="비밀번호를 입력하세요"
            disabled={isLoading}
          />
        </div>

        {error && <div className="error-message">{error}</div>}
        
        <label className="auto-login">
          <input
            type="checkbox"
            checked={autoLogin}
            onChange={(e) => setAutoLogin(e.target.checked)}
          />
          <span>로그인 상태 유지</span>
        </label>

        <button
          type="submit"
          className="auth-button"
          disabled={isLoading}
        >
          {isLoading ? '로그인 중...' : '로그인'}
        </button>
      </form>

      <div className="auth-links">
        <Link to="/forgot-password">비밀번호를 잊으셨나요?</Link>
        <p>
          계정이 없으신가요? <Link to="/register">회원가입</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;

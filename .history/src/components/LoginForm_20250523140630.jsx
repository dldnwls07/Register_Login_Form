import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../styles/components/AuthForm.css';
import { useAuth } from '../hooks/useAuth';

const LoginForm = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  
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
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.usernameOrEmail.trim()) {
      newErrors.usernameOrEmail = '사용자 아이디 또는 이메일을 입력하세요.';
    }

    if (!formData.password) {
      newErrors.password = '비밀번호를 입력하세요.';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsLoading(true);
    
    try {
      // AuthContext를 통해 로그인 시도
      await login({
        usernameOrEmail: formData.usernameOrEmail,
        password: formData.password,
      });
      
      // 로그인 성공 후 콜백 함수 호출
      if (onLoginSuccess) {
        onLoginSuccess();
      }
      
      // 메인 페이지로 리디렉션
      navigate('/');
    } catch (error) {
      console.error('로그인 오류:', error);
      // 실패한 로그인 시도 횟수 증가
      setLoginAttempts(prev => prev + 1);
      
      // 오류 메시지 표시
      if (error.code === 'auth/too-many-attempts') {
        setErrors({ general: '너무 많은 로그인 시도가 있었습니다. 잠시 후 다시 시도해주세요.' });
      } else if (error.code === 'auth/account-locked') {
        setErrors({ general: '계정이 잠겼습니다. 잠시 후 다시 시도해주세요.' });
      } else if (error.code === 'auth/user-not-found') {
        setErrors({ usernameOrEmail: '등록되지 않은 계정입니다.' });
      } else if (error.code === 'auth/wrong-password') {
        setErrors({ password: '잘못된 비밀번호입니다.' });
      } else {
        setErrors({ general: error.message || '로그인에 실패했습니다. 다시 시도해주세요.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <h2 className="auth-title">로그인</h2>
      
      {successMessage && (
        <div className="auth-success-message">{successMessage}</div>
      )}
      
      {errors.general && (
        <div className="auth-error-message">{errors.general}</div>
      )}
      
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="usernameOrEmail">아이디 또는 이메일</label>
          <input
            type="text"
            id="usernameOrEmail"
            name="usernameOrEmail"
            value={formData.usernameOrEmail}
            onChange={handleChange}
            placeholder="사용자 이름 또는 이메일"
            disabled={isLoading}
            className={errors.usernameOrEmail ? 'input-error-field' : ''}
            autoComplete="username"
          />
          {errors.usernameOrEmail && (
            <div className="input-error">{errors.usernameOrEmail}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password">비밀번호</label>
          <div className="password-input-container">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="비밀번호"
              disabled={isLoading}
              className={errors.password ? 'input-error-field' : ''}
              autoComplete="current-password"
            />
            <button 
              type="button" 
              className="toggle-password-btn"
              onClick={togglePasswordVisibility}
              aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 표시"}
            >
              {showPassword ? "숨기기" : "표시"}
            </button>
          </div>
          {errors.password && <div className="input-error">{errors.password}</div>}
        </div>

        <div className="form-options">
          <div className="remember-me">
            <label>
              <input type="checkbox" name="remember" /> 로그인 상태 유지
            </label>
          </div>
          <Link to="/forgot-password" className="forgot-password-link">비밀번호 찾기</Link>
        </div>

        <button
          type="submit"
          className={`auth-button ${isLoading ? 'loading' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? '로그인 중...' : '로그인'}
        </button>

        {loginAttempts > 2 && (
          <div className="auth-warning-message">
            여러 번의 로그인 실패 시 계정이 일시적으로 잠길 수 있습니다.
          </div>
        )}
      </form>

      <div className="auth-links">
        <p>
          계정이 없으신가요? <Link to="/register">회원가입</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;

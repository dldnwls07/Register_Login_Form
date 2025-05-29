import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../styles/components/AuthForm.css';

const LoginForm = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.usernameOrEmail.trim()) {
      newErrors.usernameOrEmail = '사용자 이름 또는 이메일을 입력하세요.';
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
      // API 호출 예시
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usernameOrEmail: formData.usernameOrEmail,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '로그인 중 오류가 발생했습니다.');
      }

      const data = await response.json();
      
      // 로컬 스토리지에 토큰 저장
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // 로그인 성공 후 콜백 함수 호출
      if (onLoginSuccess) {
        onLoginSuccess(data.user);
      }
      
      // 메인 페이지로 리디렉션
      navigate('/');
    } catch (error) {
      console.error('로그인 오류:', error);
      setErrors({ general: error.message });
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
          <label htmlFor="usernameOrEmail">사용자 이름 또는 이메일</label>
          <input
            type="text"
            id="usernameOrEmail"
            name="usernameOrEmail"
            value={formData.usernameOrEmail}
            onChange={handleChange}
            placeholder="사용자 이름 또는 이메일"
            disabled={isLoading}
          />
          {errors.usernameOrEmail && (
            <div className="input-error">{errors.usernameOrEmail}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password">비밀번호</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="비밀번호"
            disabled={isLoading}
          />
          {errors.password && <div className="input-error">{errors.password}</div>}
        </div>

        <button
          type="submit"
          className={`auth-button ${isLoading ? 'loading' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? '로그인 중...' : '로그인'}
        </button>
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

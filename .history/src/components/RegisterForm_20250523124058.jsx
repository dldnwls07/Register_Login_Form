import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/components/AuthForm.css';
import { useAuth } from '../hooks/useAuth';
import { measurePasswordStrength } from '../utils/authService';

const RegisterForm = ({ onRegisterSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(null);
  const navigate = useNavigate();
  const { register } = useAuth();

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

    // 사용자 이름 검증
    if (!formData.username.trim()) {
      newErrors.username = '사용자 이름을 입력하세요.';
    } else if (formData.username.length < 3) {
      newErrors.username = '사용자 이름은 3자 이상이어야 합니다.';
    }

    // 이메일 검증
    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력하세요.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = '유효한 이메일 주소를 입력하세요.';
      }
    }

    // 비밀번호 검증
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력하세요.';
    } else if (formData.password.length < 6) {
      newErrors.password = '비밀번호는 6자 이상이어야 합니다.';
    }

    // 비밀번호 확인 검증
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
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
      // AuthContext를 통해 회원가입 시도
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      
      console.log('회원가입 성공');
      
      // 회원가입 성공 콜백 호출
      if (onRegisterSuccess) {
        onRegisterSuccess();
      } else {
        // 기본 동작: 로그인 페이지로 리디렉션
        navigate('/login', { state: { message: '회원가입에 성공했습니다. 로그인해주세요.' } });
      }
    } catch (error) {
      console.error('회원가입 오류:', error);
      setErrors({ general: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <h2 className="auth-title">회원가입</h2>
      
      {errors.general && (
        <div className="auth-error-message">{errors.general}</div>
      )}
      
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">사용자 이름</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="사용자 이름"
            disabled={isLoading}
          />
          {errors.username && <div className="input-error">{errors.username}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="email">이메일</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your@email.com"
            disabled={isLoading}
          />
          {errors.email && <div className="input-error">{errors.email}</div>}
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

        <div className="form-group">
          <label htmlFor="confirmPassword">비밀번호 확인</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="비밀번호 확인"
            disabled={isLoading}
          />
          {errors.confirmPassword && (
            <div className="input-error">{errors.confirmPassword}</div>
          )}
        </div>

        <button
          type="submit"
          className={`auth-button ${isLoading ? 'loading' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? '처리 중...' : '회원가입'}
        </button>
      </form>

      <div className="auth-links">
        <p>
          이미 계정이 있으신가요? <Link to="/login">로그인</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;

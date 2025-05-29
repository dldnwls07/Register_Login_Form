import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/components/AuthForm.css';
import { useAuth } from '../hooks/useAuth';
import { checkPasswordStrength } from '../utils/cryptoUtils';

const RegisterForm = ({ onRegisterSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    emailPrefix: '',
    emailDomain: '',
    customDomain: '',
    password: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [emailDomains] = useState([
    { label: '직접 입력', value: 'custom' },
    { label: 'gmail.com', value: 'gmail.com' },
    { label: 'naver.com', value: 'naver.com' },
    { label: 'daum.net', value: 'daum.net' },
    { label: 'kakao.com', value: 'kakao.com' },
    { label: 'nate.com', value: 'nate.com' },
    { label: 'icloud.com', value: 'icloud.com' },
    { label: 'outlook.com', value: 'outlook.com' }
  ]);
  
  const navigate = useNavigate();
  const { register } = useAuth();
  
  // 이메일 전체 값 계산
  const getFullEmail = () => {
    const domain = formData.emailDomain === 'custom' ? formData.customDomain : formData.emailDomain;
    return formData.emailPrefix && domain ? `${formData.emailPrefix}@${domain}` : '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // 비밀번호 필드인 경우 강도 측정
    if (name === 'password') {
      const strengthResult = checkPasswordStrength(value);
      setPasswordStrength({
        isValid: strengthResult.isValid,
        reasons: strengthResult.reasons,
        strength: getPasswordStrengthLabel(strengthResult),
        score: getPasswordScore(strengthResult)
      });
    }
    
    // 필드 변경 시 해당 필드의 오류 메시지 초기화
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
    
    // 이메일 도메인이 변경되면 커스텀 도메인 필드 오류도 초기화
    if (name === 'emailDomain' && errors.customDomain) {
      setErrors({
        ...errors,
        customDomain: '',
      });
    }

    // 이메일 접두사가 변경되면 이메일 오류도 초기화
    if ((name === 'emailPrefix' || name === 'emailDomain' || name === 'customDomain') && errors.email) {
      setErrors({
        ...errors,
        email: '',
      });
    }
  };

  // 비밀번호 강도에 따른 레이블 설정
  const getPasswordStrengthLabel = (strengthResult) => {
    if (!strengthResult.isValid) {
      if (strengthResult.reasons.length > 3) return '매우 약함';
      if (strengthResult.reasons.length > 1) return '약함';
      return '중간';
    }
    return '강함';
  };

  // 비밀번호 점수 계산 (0-10)
  const getPasswordScore = (strengthResult) => {
    if (!strengthResult.isValid) {
      // 문제가 많을수록 낮은 점수
      return Math.max(2, 10 - strengthResult.reasons.length * 2.5);
    }
    return 10; // 완벽한 비밀번호
  };

  const validateForm = () => {
    const newErrors = {};
    const email = getFullEmail();

    // 사용자 이름 검증
    if (!formData.username.trim()) {
      newErrors.username = '사용자 아이디를를 입력하세요.';
    } else if (formData.username.length < 3) {
      newErrors.username = '사용자 아이디는 3자 이상이어야 합니다.';
    }

    // 이메일 검증
    if (!formData.emailPrefix.trim()) {
      newErrors.emailPrefix = '이메일 주소를 입력하세요.';
    }
    
    if (!formData.emailDomain) {
      newErrors.emailDomain = '이메일 도메인을 선택하세요.';
    } else if (formData.emailDomain === 'custom' && !formData.customDomain.trim()) {
      newErrors.customDomain = '도메인을 입력하세요.';
    }
    
    if (email) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        newErrors.email = '유효한 이메일 주소 형식이 아닙니다.';
      }
    }

    // 비밀번호 검증
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력하세요.';
    } else {
      const strengthResult = checkPasswordStrength(formData.password);
      if (!strengthResult.isValid) {
        newErrors.password = strengthResult.reasons.join(' ');
      }
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
      const email = getFullEmail();
      
      // AuthContext를 통해 회원가입 시도
      await register({
        username: formData.username,
        email: email,
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
          <label htmlFor="username">사용자 아이디</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="사용자 이름"
            disabled={isLoading}
            className={errors.username ? 'input-error-field' : ''}
          />
          {errors.username && <div className="input-error">{errors.username}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="emailPrefix">이메일</label>
          <div className="email-group">
            <input
              type="text"
              id="emailPrefix"
              name="emailPrefix"
              value={formData.emailPrefix}
              onChange={handleChange}
              placeholder="이메일 주소"
              disabled={isLoading}
              className={`email-prefix ${errors.emailPrefix ? 'input-error-field' : ''}`}
            />
            <span className="email-at">@</span>
            <select
              name="emailDomain"
              value={formData.emailDomain}
              onChange={handleChange}
              disabled={isLoading}
              className={`email-domain ${errors.emailDomain ? 'input-error-field' : ''}`}
            >
              <option value="">선택</option>
              {emailDomains.map(domain => (
                <option key={domain.value} value={domain.value}>{domain.label}</option>
              ))}
            </select>
          </div>
          {errors.emailPrefix && <div className="input-error">{errors.emailPrefix}</div>}
          {errors.emailDomain && <div className="input-error">{errors.emailDomain}</div>}
          
          {formData.emailDomain === 'custom' && (
            <div className="custom-domain">
              <input
                type="text"
                name="customDomain"
                value={formData.customDomain}
                onChange={handleChange}
                placeholder="직접 입력 (예: example.com)"
                disabled={isLoading}
                className={errors.customDomain ? 'input-error-field' : ''}
              />
              {errors.customDomain && <div className="input-error">{errors.customDomain}</div>}
            </div>
          )}
          
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
            className={errors.password ? 'input-error-field' : ''}
          />
          {/* 비밀번호 정책 안내 */}
          <div className="password-policy">
            <p>비밀번호는 다음 조건을 만족해야 합니다:</p>
            <ul>
              <li className={formData.password && formData.password.length >= 10 ? 'met' : 'not-met'}>
                최소 10자 이상
              </li>
              <li className={formData.password && /[A-Z]/.test(formData.password) ? 'met' : 'not-met'}>
                영문 대문자 1개 이상 포함
              </li>
              <li className={formData.password && /[a-z]/.test(formData.password) ? 'met' : 'not-met'}>
                영문 소문자 1개 이상 포함
              </li>
              <li className={formData.password && /[0-9]/.test(formData.password) ? 'met' : 'not-met'}>
                숫자 1개 이상 포함
              </li>
              <li className={formData.password && /[^A-Za-z0-9]/.test(formData.password) ? 'met' : 'not-met'}>
                특수문자 1개 이상 포함
              </li>
            </ul>
          </div>
          
          {/* 비밀번호 강도 표시 */}
          {formData.password && passwordStrength && (
            <div className="password-strength">
              <div className="strength-meter">
                <div 
                  className={`strength-bar strength-${passwordStrength.strength}`}
                  style={{ width: `${(passwordStrength.score / 10) * 100}%` }}
                ></div>
              </div>
              <span className={`strength-text strength-${passwordStrength.strength}`}>
                {passwordStrength.strength}
              </span>
            </div>
          )}
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
            className={errors.confirmPassword ? 'input-error-field' : ''}
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

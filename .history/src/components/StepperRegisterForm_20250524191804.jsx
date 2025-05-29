import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import apiService from '../utils/apiService';
import '../styles/components/StepperRegisterForm.css';

const StepperRegisterForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    verificationCode: '',
    password: '',
    confirmPassword: '',
  });  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [validUsername, setValidUsername] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  // 단계별 제목과 설명
  const STEPS = [
    {
      title: '아이디',
      description: '사용하실 아이디를 입력해주세요',
    },
    {
      title: '이메일',
      description: '가입하실 이메일을 입력해주세요',
    },
    {
      title: '인증',
      description: '이메일로 전송된 인증코드를 입력해주세요',
    },
    {
      title: '비밀번호',
      description: '안전한 비밀번호를 설정해주세요',
    }
  ];

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const measurePasswordStrength = (password) => {
    let score = 0;
    if (!password) return 0;

    // 길이 점수 (8자 이상일 때 만점)
    if (password.length >= 8) score += 25;
    else if (password.length >= 6) score += 10; // 6-7자

    // 대문자 포함 점수
    if (/[A-Z]/.test(password)) score += 25;

    // 숫자 포함 점수
    if (/[0-9]/.test(password)) score += 25;

    // 특수문자 포함 점수
    if (/[@$!%*?&]/.test(password)) score += 25;

    return Math.min(score, 100); // 최대 100점
  };

  const getPasswordStrengthColor = (score) => {
    if (score === 0) return '';
    if (score < 40) return 'red';
    if (score < 70) return 'orange';
    return 'green';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 에러 메시지 초기화
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // 비밀번호 강도 측정
    if (name === 'password') {
      setPasswordStrength(measurePasswordStrength(value));
    }
  };

  // 실시간 유효성 검사를 위한 디바운스 효과
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };  const checkUsername = async () => {
    try {
      setIsLoading(true);
      if (!formData.username || formData.username.length < 4) {
        setErrors(prev => ({
          ...prev,
          username: '사용자 이름은 4자 이상이어야 합니다.'
        }));
        setValidUsername(false);
        return false;
      }

      // 특수문자 검사
      const specialChars = /[!@#$%^&*(),.?":{}|<>]/;
      if (specialChars.test(formData.username)) {
        setErrors(prev => ({
          ...prev,
          username: '사용자 이름에 특수문자를 포함할 수 없습니다.'
        }));
        setValidUsername(false);
        return false;
      }

      const response = await apiService.post('/auth/check-username', { 
        username: formData.username 
      });

      // 성공적으로 검증이 완료된 경우
      if (response.data.success) {
        setErrors(prev => ({
          ...prev,
          username: ''
        }));
        setValidUsername(true);
        return true;
      }

      setValidUsername(false);
      setErrors(prev => ({
        ...prev,
        username: '이미 사용 중인 사용자 이름입니다.'
      }));
      return false;
    } catch (error) {
      setValidUsername(false);
      // 서버에서 오류 응답이 온 경우 (이미 사용 중인 사용자 이름 등)
      if (error.response?.data?.message) {
        setErrors(prev => ({
          ...prev,
          username: error.response.data.message
        }));
      } else {
        // 네트워크 오류 등 기타 오류
        setErrors(prev => ({
          ...prev,
          username: '사용자 이름 확인 중 오류가 발생했습니다. 다시 시도해주세요.'
        }));
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  const debouncedCheckUsername = debounce(async () => {
    // 입력값이 있을 때만 검증 실행
    if (formData.username.trim()) {
      await checkUsername();
    }
  }, 800); // 디바운스 시간을 800ms로 늘림

  const checkEmail = async () => {
    try {
      await apiService.post('/auth/check-email', { email: formData.email });
      return true;
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        email: error.response?.data?.message || '이메일 확인 중 오류가 발생했습니다.'
      }));
      return false;
    }
  };

  const debouncedCheckEmail = debounce(async () => {
    if (formData.email.includes('@')) {
      await checkEmail();
    }
  }, 500);

  const sendVerification = async () => {
    try {
      await apiService.post('/auth/send-verification', { email: formData.email });
      setCountdown(180); // 3분
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        verification: error.response?.data?.message || '인증 코드 발송 중 오류가 발생했습니다.'
      }));
    }
  };

  const verifyEmail = async () => {
    try {
      await apiService.post('/auth/verify-email', {
        email: formData.email,
        code: formData.verificationCode
      });
      return true;
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        verificationCode: error.response?.data?.message || '인증 코드가 일치하지 않습니다.'
      }));
      return false;
    }
  };

  // 키보드 접근성
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleNextStep();
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCodeInput) {
      setVerificationError('인증 코드를 입력해주세요.');
      return;
    }
    setIsVerifying(true);
    setVerificationError('');
    setVerificationSuccess('');

    try {
      // Ensure the payload consistently uses "verificationCode"
      const response = await apiService.post('/auth/verify-email', {
        email: formData.email,
        verificationCode: verificationCodeInput, // Consistently use verificationCode
      });
      setVerificationSuccess(response.data.message || '이메일 인증에 성공했습니다.');
      setFormData((prev) => ({ ...prev, isVerified: true }));
      setVerificationError(''); // Clear error on success
      // Optionally, disable the button or move to the next step
    } catch (error) {
      console.error('Verification error:', error.response ? error.response.data : error.message);
      setVerificationError(
        error.response?.data?.error || '인증 코드 확인 중 오류가 발생했습니다.'
      );
      setVerificationSuccess(''); // Clear success message on error
    } finally {
      setIsVerifying(false);
    }
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.username) {
          setErrorMessage('사용자 이름을 입력해주세요.');
          return false;
        }
        if (formData.username.length < 4) {
          setErrorMessage('사용자 이름은 4자 이상이어야 합니다.');
          return false;
        }
        break;

      case 2:
        if (!formData.email) {
          setErrorMessage('이메일을 입력해주세요.');
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          setErrorMessage('유효한 이메일 주소를 입력해주세요.');
          return false;
        }
        break;

      case 3:
        if (!formData.verificationCode) {
          setErrorMessage('인증 코드를 입력해주세요.');
          return false;
        }
        break;

      case 4: // 비밀번호 및 비밀번호 확인
        if (!formData.password || !formData.confirmPassword) {
          setErrorMessage('비밀번호와 비밀번호 확인을 모두 입력해주세요.');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setErrorMessage('비밀번호가 일치하지 않습니다.');
          return false;
        }
        // 비밀번호 강도 검증 (8자로 변경)
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(formData.password)) {
          setErrorMessage('비밀번호는 최소 8자 이상이며, 대문자, 숫자, 특수문자를 각각 하나 이상 포함해야 합니다.');
          return false;
        }
        break;
    }
    setErrorMessage(''); // 유효성 검사 통과 시 에러 메시지 초기화
    return true;
  };

  const handleNextStep = async () => {
    setErrors({});
    setIsLoading(true);

    try {
      switch (step) {
        case 1:
          if (!formData.username) {
            setErrors({ username: '사용자 이름을 입력해주세요.' });
            return;
          }
          if (formData.username.length < 4) {
            setErrors({ username: '사용자 이름은 4자 이상이어야 합니다.' });
            return;
          }
          if (await checkUsername()) {
            setStep(2);
          }
          break;

        case 2:
          if (!formData.email) {
            setErrors({ email: '이메일을 입력해주세요.' });
            return;
          }
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setErrors({ email: '유효한 이메일 주소를 입력해주세요.' });
            return;
          }
          if (await checkEmail()) {
            await sendVerification();
            setStep(3);
          }
          break;

        case 3:
          if (!formData.verificationCode) {
            setErrors({ verificationCode: '인증 코드를 입력해주세요.' });
            return;
          }
          if (await verifyEmail()) {
            setStep(4);
          }
          break;

        case 4:
          if (!formData.password) {
            setErrors({ password: '비밀번호를 입력해주세요.' });
            return;
          }
          if (formData.password.length < 8) {
            setErrors({ password: '비밀번호는 8자 이상이어야 합니다.' });
            return;
          }
          if (passwordStrength === 'weak') {
            setErrors({ password: '더 강력한 비밀번호를 사용해주세요.' });
            return;
          }
          if (!formData.confirmPassword) {
            setErrors({ confirmPassword: '비밀번호 확인을 입력해주세요.' });
            return;
          }
          if (formData.password !== formData.confirmPassword) {
            setErrors({ confirmPassword: '비밀번호가 일치하지 않습니다.' });
            return;
          }

          try {
            await register({
              username: formData.username,
              email: formData.email,
              password: formData.password,
              verificationCode: formData.verificationCode
            });

            navigate('/login', {
              state: { message: '회원가입이 완료되었습니다. 로그인해주세요.' }
            });
          } catch (error) {
            setErrors({ submit: '회원가입 중 오류가 발생했습니다. 다시 시도해주세요.' });
          }
          break;
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        submit: '서버와의 통신 중 오류가 발생했습니다. 다시 시도해주세요.'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="form-group" role="group" aria-labelledby="username-label">
            <label id="username-label" htmlFor="username">사용자 이름</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={(e) => {
                handleChange(e);
                debouncedCheckUsername();
              }}
              onKeyDown={handleKeyDown}              placeholder="4자 이상의 아이디를 입력하세요"
              disabled={isLoading}
              className={`form-input ${errors.username ? 'input-error' : formData.username.length >= 4 ? 'input-success' : ''}`}
              aria-invalid={!!errors.username}
              aria-describedby={errors.username ? 'username-error' : 'username-help'}
            />              <div className="input-status">
                <small id="username-help" className="input-help">
                  {!formData.username && "영문, 숫자를 포함한 4자 이상의 아이디를 입력해주세요"}
                  {formData.username && !errors.username && !validUsername && "아이디 검증 중..."}
                  {validUsername && <span className="success-text">✓ 사용 가능한 아이디입니다</span>}
                </small>
                {errors.username && (
                  <div id="username-error" className="error-text" role="alert">
                    {errors.username}
                  </div>
                )}
              </div>
          </div>
        );

      case 2:
        return (
          <div className="form-group" role="group" aria-labelledby="email-label">
            <label id="email-label" htmlFor="email">이메일</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={(e) => {
                handleChange(e);
                debouncedCheckEmail();
              }}
              onKeyDown={handleKeyDown}
              placeholder="이메일 주소를 입력하세요"
              disabled={isLoading}
              className={errors.email ? 'input-error' : ''}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />            {errors.email && (
              <div id="email-error" className="error-text" role="alert">
                {errors.email}
              </div>
            )}
          </div>
        );

      case 3:
        return (          <div className="form-group" role="group" aria-labelledby="verification-label">
            <label id="verification-label" htmlFor="verificationCode">인증 코드</label>
            <div className="verification-code-group">
              <input
                type="text"
                id="verificationCode"
                name="verificationCode"
                value={formData.verificationCode}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="인증 코드 6자리를 입력하세요"
                disabled={isLoading}
                className={errors.verificationCode ? 'input-error' : ''}
                aria-invalid={!!errors.verificationCode}
                aria-describedby={errors.verificationCode ? 'verification-error' : undefined}
                maxLength="6"
              />
              <button
                type="button"
                onClick={sendVerification}
                disabled={isLoading || countdown > 0}
                className="resend-button"
                aria-label="인증코드 재전송"
              >
                {countdown > 0 ? `재전송 (${countdown}초)` : '재전송'}
              </button>
              {countdown > 0 && (
                <div className="countdown" role="timer" aria-live="polite">
                  {`${Math.floor(countdown / 60)}:${(countdown % 60).toString().padStart(2, '0')}`}
                </div>
              )}
            </div>
            {errors.verificationCode && (
              <div id="verification-error" className="error-text" role="alert">
                {errors.verificationCode}
              </div>
            )}
            <button
              type="button"
              onClick={handleVerifyCode}
              disabled={isLoading || verificationSuccess}
              className="verify-button"
              aria-label="인증 코드 확인"
            >
              {isLoading ? '확인 중...' : verificationSuccess ? '인증 완료' : '인증 코드 확인'}
            </button>
            {errorMessage && (
              <div className="error-text" role="alert">
                {errorMessage}
              </div>
            )}
            {successMessage && verificationSuccess && (
              <div className="success-text" role="alert">
                {successMessage}
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <>
            <div className="form-group" role="group" aria-labelledby="password-label">
              <label id="password-label" htmlFor="password">비밀번호</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="비밀번호를 입력하세요"
                disabled={isLoading}
                className={errors.password ? 'input-error' : ''}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : 'password-requirements'}
              />
              <div id="password-requirements" className="password-requirements">
                비밀번호는 8자 이상이며, 숫자, 대소문자, 특수문자를 포함해야 합니다.
              </div>              {passwordStrength && (
                <div className="password-strength">
                  <div className={`password-strength-bar strength-${passwordStrength}`} />
                </div>
              )}
              {errors.password && (
                <div id="password-error" className="error-text" role="alert">
                  {errors.password}
                </div>
              )}
            </div>
            <div className="form-group" role="group" aria-labelledby="confirm-password-label">
              <label id="confirm-password-label" htmlFor="confirmPassword">비밀번호 확인</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="비밀번호를 다시 입력하세요"
                disabled={isLoading}
                className={errors.confirmPassword ? 'input-error' : ''}
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
              />
              {errors.confirmPassword && (
                <div id="confirm-password-error" className="error-text" role="alert">
                  {errors.confirmPassword}
                </div>
              )}
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="stepper-register-form" role="form">
      <div className="stepper-progress" role="navigation" aria-label="회원가입 단계">
        {STEPS.map((stepInfo, index) => (
          <div
            key={index}
            className={`step ${step > index + 1 ? 'completed' : ''} ${step === index + 1 ? 'active' : ''}`}
            data-title={stepInfo.title}
            role="tab"
            aria-selected={step === index + 1}
            aria-label={`${index + 1}단계: ${stepInfo.title}`}
          >
            {step > index + 1 ? '✓' : index + 1}
          </div>
        ))}
      </div>

      <form 
        onSubmit={(e) => { 
          e.preventDefault(); 
          handleNextStep(); 
        }}
        role="tabpanel"
        aria-label={`${step}단계: ${STEPS[step - 1].title}`}
      >
        <h3 id={`step-${step}-title`}>{STEPS[step - 1].description}</h3>
        {renderStep()}
        
        {errors.submit && (
          <div className="error-text" role="alert">{errors.submit}</div>
        )}

        <div className="form-actions">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              disabled={isLoading}
              className="back-button"
              aria-label="이전 단계로"
            >
              이전
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="next-button"
            aria-label={step === 4 ? '회원가입 완료' : '다음 단계로'}
          >
            {isLoading ? '처리 중...' : step === 4 ? '가입 완료' : '다음'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StepperRegisterForm;

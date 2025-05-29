import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // 여기 수정!
import api from '../../utils/apiService';
import '../../styles/auth/RegisterForm.css';

const RegisterForm = () => {
    // 상태 관리
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        verificationCode: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sendingCode, setSendingCode] = useState(false);
    const [verificationSent, setVerificationSent] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState({ verified: false, message: '' });
    
    const { register, sendVerificationEmail, verifyCode } = useAuth(); // 필요한 함수들 가져오기

    useEffect(() => {
        let timer;
        if (verificationSent) {
            timer = setTimeout(() => {
                setVerificationSent(false);
            }, 60000); // 60초 후 재발송 가능
        }
        return () => clearTimeout(timer);
    }, [verificationSent]);

    // 입력 변경 처리
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // 입력값 변경 시 해당 필드 에러 초기화
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // 폼 유효성 검사
    const validateForm = () => {
        const newErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const usernameRegex = /^[a-zA-Z0-9_]{4,20}$/;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

        if (!formData.username) {
            newErrors.username = '사용자명을 입력하세요';
        } else if (!usernameRegex.test(formData.username)) {
            newErrors.username = '사용자명은 4-20자의 영문, 숫자, 언더스코어만 사용 가능합니다';
        }

        if (!formData.email) {
            newErrors.email = '이메일을 입력하세요';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = '유효한 이메일을 입력하세요';
        }        if (!formData.password) {
            newErrors.password = '비밀번호를 입력하세요';
        } else if (formData.password.length < 8) {
            newErrors.password = '비밀번호는 최소 8자 이상이어야 합니다';
        } else if (!/[A-Z]/.test(formData.password)) {
            newErrors.password = '비밀번호는 최소 하나의 대문자를 포함해야 합니다';
        } else if (!/[a-z]/.test(formData.password)) {
            newErrors.password = '비밀번호는 최소 하나의 소문자를 포함해야 합니다';
        } else if (!/[0-9]/.test(formData.password)) {
            newErrors.password = '비밀번호는 최소 하나의 숫자를 포함해야 합니다';
        } else if (!/[!@#$%^&*]/.test(formData.password)) {
            newErrors.password = '비밀번호는 최소 하나의 특수문자(!@#$%^&*)를 포함해야 합니다';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = '비밀번호 확인을 입력하세요';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = '비밀번호가 일치하지 않습니다';
        }

        if (!verificationStatus.verified) {
            newErrors.verificationCode = '이메일 인증이 필요합니다';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // 아이디 중복 확인
    const checkDuplicateUsername = async () => {
        try {
            const response = await api.get(`/auth/check-username?username=${formData.username}`);
            if (!response.data.available) {
                setErrors(prev => ({ ...prev, username: '이미 사용 중인 사용자명입니다' }));
                return false;
            }
            return true;
        } catch (error) {
            console.error('아이디 중복 확인 오류:', error);
            setErrors(prev => ({ ...prev, username: '아이디 확인 중 오류가 발생했습니다' }));
            return false;
        }
    };

    // 이메일 중복 확인
    const checkDuplicateEmail = async () => {
        try {
            const response = await api.get(`/auth/check-email?email=${formData.email}`);
            if (!response.data.available) {
                setErrors(prev => ({ ...prev, email: '이미 사용 중인 이메일입니다' }));
                return false;
            }
            return true;
        } catch (error) {
            console.error('이메일 중복 확인 오류:', error);
            setErrors(prev => ({ ...prev, email: '이메일 확인 중 오류가 발생했습니다' }));
            return false;
        }
    };

    // 인증 코드 전송
    const handleSendVerification = async (e) => {
        e.preventDefault();
        
        // 이메일 유효성 검사
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email || !emailRegex.test(formData.email)) {
            setErrors(prev => ({ ...prev, email: '유효한 이메일을 입력하세요' }));
            return;
        }
        
        try {
            setSendingCode(true);
            console.log('🔍 [DEBUG] 인증코드 발송 시도:', formData.email);
            
            // 모든 가능한 방법으로 시도 - axios
            try {
                console.log('🔍 [DEBUG] axios 방식으로 요청 시도');
                const axiosResponse = await api.post('/auth/send-otp', { email: formData.email });
                console.log('🔍 [DEBUG] axios 응답:', axiosResponse.data);
                
                setVerificationSent(true);
                setErrors(prev => ({ ...prev, email: '' }));
                alert('인증 코드가 이메일로 발송되었습니다. 이메일을 확인해주세요.');
                return; // 성공 시 여기서 종료
            } catch (axiosError) {
                console.error('🔍 [DEBUG] axios 요청 실패:', axiosError);
            }
            
            // fetch 방식 시도
            console.log('🔍 [DEBUG] fetch 방식으로 요청 시도');
            const fetchResponse = await fetch('http://localhost:5001/api/auth/send-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: formData.email }),
                credentials: 'include'
            });
            
            if (!fetchResponse.ok) {
                const errorData = await fetchResponse.json();
                throw new Error(errorData.message || '인증 코드 발송 중 오류가 발생했습니다');
            }
            
            const data = await fetchResponse.json();
            console.log('🔍 [DEBUG] fetch 응답:', data);
            
            setVerificationSent(true);
            setErrors(prev => ({ ...prev, email: '' }));
            alert('인증 코드가 이메일로 발송되었습니다. 이메일을 확인해주세요.');
        } catch (error) {
            console.error('🔍 [DEBUG] 최종 오류:', error);
            setErrors(prev => ({
                ...prev,
                email: error.message || '인증 코드 발송 중 오류가 발생했습니다'
            }));
        } finally {
            setSendingCode(false);
        }
    };

    // 인증 코드 확인
    const handleVerifyCode = async (e) => {
        e.preventDefault();
        
        if (!formData.verificationCode) {
            setErrors(prev => ({ ...prev, verificationCode: '인증 코드를 입력하세요' }));
            return;
        }
        
        try {
            console.log('[DEBUG] 인증코드 확인 요청 시작:', {
                email: formData.email,
                code: formData.verificationCode
            });
            
            // AuthContext의 verifyCode 함수 사용
            const response = await verifyCode(formData.email, formData.verificationCode);
            
            console.log('[DEBUG] 인증코드 확인 응답:', response.data);
            
            if (response.data.success) {
                setVerificationStatus({
                    verified: true,
                    message: '이메일이 성공적으로 인증되었습니다'
                });
                setErrors(prev => ({ ...prev, verificationCode: '' }));
            }
        } catch (error) {
            console.error('❌ 인증 코드 확인 오류:', error);
            setVerificationStatus({
                verified: false,
                message: ''
            });
            setErrors(prev => ({ 
                ...prev, 
                verificationCode: error.response?.data?.message || '인증 코드 확인 중 오류가 발생했습니다'
            }));
        }
    };
    
    // 폼 제출 처리
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // 폼 유효성 검사
        if (!validateForm()) {
            return;
        }
        
        // 아이디, 이메일 중복 확인
        const isUsernameValid = await checkDuplicateUsername();
        const isEmailValid = await checkDuplicateEmail();
        
        if (!isUsernameValid || !isEmailValid) {
            return;
        }        setIsSubmitting(true);        try {            // 회원가입 요청 
            const response = await api.post('/auth/register', {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                confirmPassword: formData.confirmPassword,
                isEmailVerified: true,  // 이미 OTP로 인증됨
                role: 'user'
            });
            
            if (response.data.success) {
                // 성공 메시지 표시
                alert('회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.');
                // 로그인 페이지로 이동
                window.location.href = '/login';
            }
        } catch (error) {
            console.error('회원가입 오류:', error);
            setErrors(prev => ({
                ...prev,
                submit: error.response?.data?.message || '회원가입 중 오류가 발생했습니다'
            }));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="register-form-container">
            <h2>회원가입</h2>
            <form className="register-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="username">사용자명</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className={errors.username ? 'error' : ''}
                        placeholder="사용자명 (4-20자, 영문, 숫자, _)"
                    />
                    {errors.username && <div className="error-message">{errors.username}</div>}
                </div>

                <div className="form-group email-group">
                    <label htmlFor="email">이메일</label>
                    <div className="email-input-group">
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={errors.email ? 'error' : ''}
                            placeholder="이메일 주소"
                        />
                        <button 
                            type="button" 
                            onClick={handleSendVerification}
                            disabled={sendingCode || verificationSent}
                            className="verification-button"
                        >
                            {sendingCode ? '발송 중...' : verificationSent ? '재발송 60초 대기' : '인증코드 발송'}
                        </button>
                    </div>
                    {errors.email && <div className="error-message">{errors.email}</div>}
                </div>

                <div className="form-group verification-group">
                    <label htmlFor="verificationCode">인증 코드</label>
                    <div className="verification-input-group">
                        <input
                            type="text"
                            id="verificationCode"
                            name="verificationCode"
                            value={formData.verificationCode}
                            onChange={handleChange}
                            className={errors.verificationCode ? 'error' : ''}
                            placeholder="이메일로 받은 인증 코드 입력"
                        />
                        <button 
                            type="button" 
                            onClick={handleVerifyCode}
                            disabled={!formData.verificationCode || verificationStatus.verified}
                            className="verification-button"
                        >
                            {verificationStatus.verified ? '인증 완료' : '인증 확인'}
                        </button>
                    </div>
                    {errors.verificationCode && <div className="error-message">{errors.verificationCode}</div>}
                    {verificationStatus.verified && (
                        <div className="success-message">{verificationStatus.message}</div>
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
                        className={errors.password ? 'error' : ''}
                        placeholder="비밀번호 (최소 8자, 대소문자, 숫자 포함)"
                    />
                    {errors.password && <div className="error-message">{errors.password}</div>}
                </div>

                <div className="form-group">
                    <label htmlFor="confirmPassword">비밀번호 확인</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={errors.confirmPassword ? 'error' : ''}
                        placeholder="비밀번호 재입력"
                    />
                    {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
                </div>

                {errors.submit && <div className="error-message submit-error">{errors.submit}</div>}

                <button 
                    type="submit" 
                    className="register-button" 
                    disabled={isSubmitting}
                >
                    {isSubmitting ? '처리 중...' : '회원가입'}
                </button>

                <div className="login-link">
                    이미 계정이 있으신가요? <Link to="/login">로그인</Link>
                </div>
            </form>
        </div>
    );
};

export default RegisterForm;

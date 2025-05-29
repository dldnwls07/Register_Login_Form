import React, { useState } from 'react';
import '../styles/RegisterForm.css';
import { useAuth } from '../hooks/useAuth';
import axios from '../api/axiosConfig';

const RegisterForm = ({ onRegistrationSuccess }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        verificationCode: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [verificationSent, setVerificationSent] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState('');
    const { register, sendVerificationEmail, verifyCode } = useAuth();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handlePasswordChange = (e) => {
        const password = e.target.value;
        setFormData({ ...formData, password });
        setError('');

        // 비밀번호 강도 계산
        const strength = calculatePasswordStrength(password);
        setPasswordStrength(strength);
    };

    // 유효성 검사 함수들
    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const validatePassword = (password) => {
        const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
        if (!regex.test(password)) {
            return {
                isValid: false,
                message: '비밀번호는 8자 이상, 영문, 숫자, 특수문자를 모두 포함해야 합니다.'
            };
        }
        return { isValid: true };
    };    const checkDuplicateUsername = async () => {
        try {
            const response = await axios.get('/auth/check-username', {
                params: { username: formData.username }
            });
            
            console.log('서버 응답:', response.data);
            return response.data;
        } catch (error) {
            console.error('아이디 중복 확인 오류:', error);
            throw new Error(error.response?.data?.message || '아이디 확인 중 오류가 발생했습니다.');
        }
    };

    const checkDuplicateEmail = async () => {
        if (!formData.email) {
            setError('이메일을 입력해주세요.');
            return false;
        }
        if (!validateEmail(formData.email)) {
            setError('유효한 이메일 형식이 아닙니다.');
            return false;
        }        try {
            const response = await axios.get('/auth/check-email', {
                params: { email: formData.email }
            });
            
            if (!response.data.available) {
                setError('이미 사용 중인 이메일입니다.');
                return false;
            }
            return true;
        } catch (err) {
            setError('이메일 중복 확인 중 오류가 발생했습니다.');
            return false;
        }
    };

    const handlePrevious = () => {
        setStep(step > 1 ? step - 1 : 1);
        setError('');
    };

    const handleUsernameSubmit = async (e) => {
        e.preventDefault();
        if (!formData.username) {
            setError('아이디를 입력해주세요.');
            return;
        }

        try {
            const result = await checkDuplicateUsername();
            if (result.available) {
                setStep(2);
            } else {
                setError(result.message || '이미 사용 중인 아이디입니다.');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        const isAvailable = await checkDuplicateEmail();
        if (isAvailable) {
            try {
                await sendVerificationEmail(formData.email);
                setVerificationSent(true);
                setStep(3);
            } catch (err) {
                setError('인증번호 발송에 실패했습니다.');
            }
        }
    };

    const handleVerificationSubmit = async (e) => {
        e.preventDefault();
        if (!formData.verificationCode) {
            setError('인증번호를 입력해주세요.');
            return;
        }
        try {
            await verifyCode(formData.email, formData.verificationCode);
            setStep(4);
        } catch (err) {
            setError('인증번호가 일치하지 않습니다.');
        }
    };

    const handleFinalSubmit = async (e) => {
        e.preventDefault();
        if (!formData.password) {
            setError('비밀번호를 입력해주세요.');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }
        try {
            // 데이터 구조 수정
            const userData = {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                isEmailVerified: true,
                emailVerificationToken: formData.verificationCode,
                role: 'user'
            };
            
            await register(userData);
            onRegistrationSuccess();
        } catch (err) {
            setError('회원가입에 실패했습니다.');
        }
    };

    const calculatePasswordStrength = (password) => {
        if (password.length < 8) return '위험';
        if (/[A-Za-z]/.test(password) && /\d/.test(password) && /[@$!%*#?&]/.test(password)) {
            return '안전';
        }
        return '경고';
    };

    // renderStepIndicator 함수 수정
    const renderStepIndicator = () => {
        // 연결선에 사용할 스타일 계산
        const progressStyle = {
            '--step': step
        };

        return (
            <div className="step-indicator-container" style={progressStyle}>
                {[1, 2, 3, 4].map((num) => (
                    <div
                        key={num}
                        className={`step-circle ${step >= num ? 'completed' : ''}`}
                    >
                        {num}
                    </div>
                ))}
            </div>
        );
    };

    // 폼 컨테이너 부분 수정
    return (
        <div className="auth-container">
            {renderStepIndicator()}
            <h2 className="auth-title">회원가입</h2>
            <div className="form-container">
                <div className={`form-step ${step === 1 ? 'active' : ''}`}>
                    <form onSubmit={handleUsernameSubmit}>
                        <div className="form-group">
                            <label>아이디</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="아이디를 입력하세요"
                                minLength={4}
                            />
                        </div>
                        {error && <div className="error-message">{error}</div>}
                        <div className="button-group">
                            <button type="submit" className="auth-button">다음</button>
                        </div>
                    </form>
                </div>
                <div className={`form-step ${step === 2 ? 'active' : ''}`}>
                    <form onSubmit={handleEmailSubmit}>
                        <div className="form-group">
                            <label>이메일</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="이메일을 입력하세요"
                            />
                        </div>
                        {error && <div className="error-message">{error}</div>}
                        <div className="button-group">
                            <button type="button" onClick={handlePrevious} className="auth-button secondary">이전</button>
                            <button type="submit" className="auth-button">인증번호 발송</button>
                        </div>
                    </form>
                </div>

                <div className={`form-step ${step === 3 ? 'active' : ''}`}>
                    <form onSubmit={handleVerificationSubmit}>
                        <div className="form-group">
                            <label>인증번호</label>
                            <input
                                type="text"
                                name="verificationCode"
                                value={formData.verificationCode}
                                onChange={handleChange}
                                placeholder="인증번호를 입력하세요"
                            />
                        </div>
                        {error && <div className="error-message">{error}</div>}
                        <button type="submit" className="auth-button">인증번호 확인</button>
                    </form>
                </div>

                <div className={`form-step ${step === 4 ? 'active' : ''}`}>
                    <form onSubmit={handleFinalSubmit} className="password-form">
                        <div className="form-group">
                            <label>비밀번호</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handlePasswordChange}
                                placeholder="비밀번호를 입력하세요"
                            />
                            <div className="password-conditions">
                                <p>비밀번호는 8자 이상, 영문, 숫자, 특수문자를 포함해야 합니다.</p>
                            </div>
                            <div className={`password-strength ${passwordStrength}`}>
                                {passwordStrength && `비밀번호 강도: ${passwordStrength}`}
                            </div>
                        </div>
                        <div className="form-group">
                            <label>비밀번호 확인</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="비밀번호를 다시 입력하세요"
                            />
                        </div>
                        {error && <div className="error-message">{error}</div>}
                        <button type="submit" className="auth-button">회원가입</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterForm;

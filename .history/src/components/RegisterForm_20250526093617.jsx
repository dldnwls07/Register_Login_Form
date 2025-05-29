import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

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
    const { register, verifyEmail } = useAuth();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleUsernameSubmit = async (e) => {
        e.preventDefault();
        if (!formData.username) {
            setError('아이디를 입력해주세요.');
            return;
        }
        // TODO: 아이디 중복 체크
        setStep(2);
    };

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        if (!formData.email) {
            setError('이메일을 입력해주세요.');
            return;
        }
        try {
            // 이메일로 인증번호 발송
            await verifyEmail(formData.email);
            setVerificationSent(true);
            setStep(3);
        } catch (err) {
            setError('인증번호 발송에 실패했습니다.');
        }
    };

    const handleVerificationSubmit = async (e) => {
        e.preventDefault();
        if (!formData.verificationCode) {
            setError('인증번호를 입력해주세요.');
            return;
        }
        try {
            // TODO: 인증번호 확인 API 호출
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
            await register(formData);
            onRegistrationSuccess();
        } catch (err) {
            setError('회원가입에 실패했습니다.');
        }
    };

    return (
        <div className="auth-container">
            <h2 className="auth-title">회원가입 {step}/4</h2>
            
            {step === 1 && (
                <form onSubmit={handleUsernameSubmit}>
                    <div className="form-group">
                        <label>아이디</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="아이디를 입력하세요"
                        />
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    <button type="submit" className="auth-button">다음</button>
                </form>
            )}
            
            {step === 2 && (
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
                    <button type="submit" className="auth-button">인증번호 발송</button>
                </form>
            )}

            {step === 3 && (
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
            )}

            {step === 4 && (
                <form onSubmit={handleFinalSubmit}>
                    <div className="form-group">
                        <label>비밀번호</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="비밀번호를 입력하세요"
                        />
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
            )}
        </div>
    );
};

export default RegisterForm;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Common.css';

const RegisterPage = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        verificationCode: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            switch(step) {
                case 1: // 아이디 검증
                    const userExists = await checkUsername(formData.username);
                    if (!userExists) {
                        setStep(2);
                    }
                    break;
                    
                case 2: // 이메일 인증번호 발송
                    await sendVerificationEmail(formData.email);
                    setStep(3);
                    break;
                    
                case 3: // 인증번호 확인
                    const isValid = await verifyEmailCode(formData.verificationCode);
                    if (isValid) {
                        setStep(4);
                    }
                    break;
                    
                case 4: // 최종 회원가입
                    await register(formData);
                    navigate('/login');
                    break;
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <h2 className="auth-title">회원가입 {step}/4</h2>
                <form onSubmit={handleSubmit}>
                    {step === 1 && (
                        <div className="form-group">
                            <label htmlFor="username">아이디</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                placeholder="아이디를 입력하세요"
                                value={formData.username}
                                onChange={(e) => setFormData({...formData, username: e.target.value})}
                            />
                        </div>
                    )}
                    {step === 2 && (
                        <div className="form-group">
                            <label htmlFor="email">이메일</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="이메일을 입력하세요"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                            />
                        </div>
                    )}
                    {/* ...각 단계별 입력 필드... */}
                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? '처리중...' : '다음'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;

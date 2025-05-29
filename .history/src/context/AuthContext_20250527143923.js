import React, { createContext, useState, useContext } from 'react';
import { authService } from '../services/authService';
import api from '../utils/apiService';

// 컨텍스트 생성
export const AuthContext = createContext(null);

// 컨텍스트 제공자 컴포넌트
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);

    // 로그인 함수
    const login = async (username, password) => {
        try {
            setLoading(true);
            const response = await authService.login({ username, password });
            setUser(response.user);
            localStorage.setItem('token', response.token);
            return response;
        } finally {
            setLoading(false);
        }
    };

    // 회원가입 함수
    const register = async (username, email, password) => {
        try {
            setLoading(true);
            const response = await authService.register({ username, email, password });
            return response;
        } finally {
            setLoading(false);
        }
    };

    // 사용자명 중복 체크
    const checkUsername = async (username) => {
        return await authService.checkUsername(username);
    };

    // 이메일 인증코드 발송 - 직접 API 호출로 수정
    const sendVerificationEmail = async (email) => {
        console.log('[DEBUG] AuthContext.sendVerificationEmail 호출:', email);
        return await api.post('/auth/send-otp', { email });
    };

    // 인증코드 확인 - 직접 API 호출로 수정
    const verifyCode = async (email, code) => {
        console.log('[DEBUG] AuthContext.verifyCode 호출:', { email, code });
        return await api.post('/auth/verify-otp', { email, code });
    };

    // 제공할 값들
    const value = {
        user,
        loading,
        login,
        register,
        checkUsername,
        sendVerificationEmail,
        verifyCode
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 커스텀 훅 생성 - 사용 시: const { user, login, register, ...  } = useAuth();
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// useAuthContext라는 이름으로도 export (기존 코드 호환성)
export const useAuthContext = useAuth;

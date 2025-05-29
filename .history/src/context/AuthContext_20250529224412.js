import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/apiService';

// 컨텍스트 생성
export const AuthContext = createContext(null);

// 컨텍스트 제공자 컴포넌트
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [darkMode, setDarkMode] = useState(false); // 다크 모드 상태 추가

    // 초기화 로직 추가
    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem('token');
            console.log('🔍 [DEBUG] 저장된 토큰:', token);
            if (token) {
                try {
                    const response = await api.get('/auth/me', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    console.log('🔍 [DEBUG] 사용자 정보:', response.data);
                    setUser(response.data.user);
                } catch (error) {
                    console.error('🔍 [DEBUG] 초기화 중 오류 발생:', error);
                    localStorage.removeItem('token');
                }
            }
        };

        initializeAuth();
    }, []);

    // 로그인 함수
    const login = async (username, password) => {
        try {
            setLoading(true);
            const response = await api.post('/auth/login', { username, password });
            
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                setUser(response.data.user);
            }
            
            return response.data;
        } catch (error) {
            console.error('로그인 오류:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // 회원가입 함수
    const register = async (userData) => { // Modified to accept userData object
        try {
            setLoading(true);
            // Pass the whole userData object to the API call
            const response = await api.post('/auth/register', userData);
            return response.data;
        } catch (error) {
            console.error('회원가입 오류:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // 이메일 인증코드 발송 함수
    const sendVerificationEmail = async (email) => {
        console.log('🔍 [DEBUG] AuthContext.sendVerificationEmail 호출:', email);
        try {
            const response = await api.post('/auth/send-otp', { email });
            console.log('🔍 [DEBUG] 인증코드 발송 응답:', response.data);
            return response;
        } catch (error) {
            console.error('🔍 [DEBUG] 인증코드 발송 오류:', error);
            throw error;
        }
    };

    // 인증코드 검증 함수
    const verifyCode = async (email, code) => {
        console.log('🔍 [DEBUG] AuthContext.verifyCode 호출:', { email, code });
        try {
            const response = await api.post('/auth/verify-otp', { email, code });
            console.log('🔍 [DEBUG] 인증코드 확인 응답:', response.data);
            return response;
        } catch (error) {
            console.error('🔍 [DEBUG] 인증코드 확인 오류:', error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    // 다크 모드 토글 함수
    const toggleDarkMode = () => {
        setDarkMode((prevMode) => {
            const newMode = !prevMode;
            document.documentElement.classList.toggle('dark-mode', newMode);
            return newMode;
        });
    };

    // 제공할 컨텍스트 값
    const value = {
        user,
        loading,
        login,
        register,
        logout,
        sendVerificationEmail,
        verifyCode,
        darkMode, // 다크 모드 상태 추가
        toggleDarkMode // 다크 모드 토글 함수 추가
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 커스텀 훅
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// 이름 일관성을 위한 별칭
export const useAuthContext = useAuth;

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

const register = async (userData) => {
    try {
        // userData를 직접 전달 (중첩 구조 제거)
        const response = await apiService.post('/auth/register', userData);
        
        if (response.success) {
            // 회원가입 성공 처리
            // ...existing code...
        } else {
            throw new Error(response.message || '회원가입에 실패했습니다.');
        }
    } catch (error) {
        console.error('회원가입 오류:', error);
        throw error;
    }
};

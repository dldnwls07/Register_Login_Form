import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

const register = async (userData) => {
    try {
        // users 테이블 구조에 맞게 데이터 전송
        const response = await axios.post('/auth/register', userData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.data.success) {
            return response.data;
        } else {
            throw new Error(response.data.message || '회원가입에 실패했습니다.');
        }
    } catch (error) {
        console.error('회원가입 요청 오류:', error);
        throw error;
    }
};

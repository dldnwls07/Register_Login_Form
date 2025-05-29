import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';  // default import를 named import로 변경

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default useAuth;

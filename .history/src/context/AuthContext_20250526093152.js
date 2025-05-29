import React, { createContext, useState, useContext } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);

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

    const register = async (userData) => {
        try {
            setLoading(true);
            const response = await authService.register(userData);
            return response;
        } finally {
            setLoading(false);
        }
    };

    const checkUsername = async (username) => {
        return await authService.checkUsername(username);
    };

    const sendVerificationEmail = async (email) => {
        return await authService.sendVerificationEmail(email);
    };

    const verifyCode = async (email, code) => {
        return await authService.verifyCode(email, code);
    };

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

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

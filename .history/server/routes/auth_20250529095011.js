// server/routes/auth.js
const express = require('express');
const router = express.Router();
const { sequelize } = require('../config/db');
const { QueryTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/auth');
const authController = require('../controllers/auth');

// 아이디 중복 확인
router.get('/check-username', authController.checkUsername);

// 이메일 중복 체크
router.get('/check-email', async (req, res) => {
    try {
        const { email } = req.query;
        
        const users = await sequelize.query(
            'SELECT id FROM users WHERE email = :email',
            {
                replacements: { email },
                type: QueryTypes.SELECT
            }
        );
        
        res.json({ 
            available: users.length === 0,
            message: users.length > 0 ? '이미 사용 중인 이메일입니다.' : '사용 가능한 이메일입니다.'
        });
    } catch (error) {
        console.error('이메일 중복 확인 오류:', error);
        res.status(500).json({ 
            message: '이메일 확인 중 오류가 발생했습니다.' 
        });
    }
});

// 회원가입
router.post('/register', async (req, res) => {
    try {
        // 데이터 구조 수정
        const userData = req.body.username;  // 중첩된 구조 제거

        // Sequelize를 사용한 쿼리
        const result = await sequelize.query(
            `INSERT INTO users (
                username,
                email,
                password,
                role,
                isEmailVerified,
                emailVerificationToken,
                createdAt,
                updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            {
                replacements: [
                    userData.username,
                    userData.email,
                    userData.password,
                    userData.role || 'user',
                    userData.isEmailVerified,
                    userData.emailVerificationToken
                ],
                type: sequelize.QueryTypes.INSERT
            }
        );
        
        res.json({ success: true, message: '회원가입이 완료되었습니다.' });
    } catch (error) {
        console.error('회원가입 처리 오류:', error);
        res.status(500).json({
            success: false,
            message: '회원가입 처리 중 오류가 발생했습니다.'
        });
    }
});

// 로그인 - 수정: replacements 옵션 사용
router.post('/login', async (req, res) => {
    try {
        // 중첩된 구조 제거
        const { username, password, autoLogin } = req.body;

        // 로그인 쿼리 수정
        const [user] = await sequelize.query(
            'SELECT * FROM users WHERE username = ?',
            {
                replacements: [username],
                type: QueryTypes.SELECT
            }
        );

        if (!user) {
            return res.status(401).json({
                success: false,
                message: '아이디 또는 비밀번호가 일치하지 않습니다.'
            });
        }

        // 비밀번호 검증
        if (user.password !== password) { // 실제로는 bcrypt.compare 사용 필요
            return res.status(401).json({
                success: false,
                message: '아이디 또는 비밀번호가 일치하지 않습니다.'
            });
        }

        // JWT 토큰 생성
        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: autoLogin ? '7d' : '1d' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('로그인 오류:', error);
        res.status(500).json({
            success: false,
            message: '로그인 처리 중 오류가 발생했습니다.'
        });
    }
});

// 로그아웃
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true, message: '로그아웃되었습니다.' });
});

// 사용자 정보 조회 - 수정: replacements 옵션 사용
router.get('/me', protect, async (req, res) => {
    try {
        const users = await sequelize.query(
            'SELECT id, username, email, created_at FROM users WHERE id = ?',
            { replacements: [req.user.id], type: QueryTypes.SELECT }
        );

        if (users.length === 0) {
            return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
        }

        res.json({
            success: true,
            data: users[0]
        });
    } catch (error) {
        res.status(500).json({ message: '사용자 정보 조회 중 오류가 발생했습니다.' });
    }
});

// 토큰 검증
router.get('/verify', protect, (req, res) => {
    res.json({ success: true, user: req.user });
});

// 이메일 인증 코드 발송
router.post('/send-verification-code', authController.sendVerificationCode);

// 이메일 인증 코드 확인
router.post('/verify-email-code', authController.verifyEmailCode);

// OTP 발송 (별도 엔드포인트)
router.post('/send-otp', authController.sendOtp);

// OTP 확인 (별도 엔드포인트)
router.post('/verify-otp', authController.verifyOtp);

module.exports = router;

// server/routes/auth.js
const express = require('express');
const router = express.Router();
const { db } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authController = require('../controllers/auth'); // authController 전체를 가져옵니다.
const { protect } = require('../middleware/auth');

// OTP 전송 및 검증 라우트
router.post('/send-otp', authController.sendOtp);
router.post('/verify-otp', authController.verifyOtp);

// 아이디 중복 확인 라우트
router.get('/check-username', authController.checkUsernameAvailability); // authController에서 가져오도록 수정

// 이메일 인증 라우트
router.post('/send-verification', authController.sendVerification);
router.post('/verify-email', authController.verifyEmailCode); // 핸들러 이름 변경

// 인증 라우트
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', protect, authController.getMe);
router.get('/verify', protect, authController.verifyToken);
router.post('/forgot-password', authController.forgotPassword);
router.put('/reset-password/:resetToken', authController.resetPassword);
router.put('/update-password', protect, authController.updatePassword);

// 로그인
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        
        if (!user[0]) {
            return res.status(401).json({ message: '아이디 또는 비밀번호가 일치하지 않습니다.' });
        }

        const isMatch = await bcrypt.compare(password, user[0].password);
        if (!isMatch) {
            return res.status(401).json({ message: '아이디 또는 비밀번호가 일치하지 않습니다.' });
        }

        const token = jwt.sign({ id: user[0].id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user[0].id, username: user[0].username } });
    } catch (error) {
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// 회원가입
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        await db.query(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',

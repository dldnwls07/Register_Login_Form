// serve// 인증 라우트
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', protect, authController.getMe);
router.get('/verify', protect, authController.verifyToken);
router.get('/check-username', authController.checkUsername);
router.get('/check-email', authController.checkEmail);s/auth.js
const express = require('express');
const router = express.Router();
const { QueryTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const authController = require('../controllers/auth');
const { protect } = require('../middleware/auth');

// 인증 라우트
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', protect, authController.getMe);
router.get('/verify', protect, authController.verifyToken);
router.get('/check-username', authController.checkUsername);

// 비밀번호 관리 라우트
router.post('/forgot-password', authController.forgotPassword);
router.put('/reset-password/:resetToken', authController.resetPassword);
router.put('/update-password', protect, authController.updatePassword);

// 이메일 인증 라우트
router.post('/send-verification-code', authController.sendVerificationCode);
router.post('/verify-email-code', authController.verifyEmailCode);

// OTP 라우트
router.post('/send-otp', authController.sendOtp);
router.post('/verify-otp', authController.verifyOtp);

module.exports = router;

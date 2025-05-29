const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const { protect } = require('../middleware/auth');

// 인증 라우트
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', protect, authController.getMe);
router.get('/verify', protect, authController.verifyToken);
router.get('/check-username', authController.checkUsername);
router.get('/check-email', authController.checkEmail);

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

// 추가된 라우트
router.post('/find-username', authController.findUsernameByEmail);

module.exports = router;

// server/routes/auth.js
const express = require('express');
const { 
  register, 
  login, 
  logout, 
  getMe, 
  forgotPassword, 
  resetPassword, 
  updatePassword, 
  verifyToken,
  checkEmail,
  checkUsername,
  sendVerificationEmail,
  verifyEmail
} = require('../controllers/auth');
const { protect } = require('../middleware/auth');

const router = express.Router();

// 회원가입 관련 라우트
router.post('/check-email', checkEmail);
router.post('/check-username', checkUsername);
router.post('/send-verification', sendVerificationEmail);
router.post('/verify-email', verifyEmail);
router.post('/register', register);

// 로그인/로그아웃 라우트
router.post('/login', login);
router.post('/logout', logout);

// 인증된 사용자 라우트
router.get('/me', protect, getMe);
router.get('/verify', protect, verifyToken);

// 비밀번호 관리 라우트
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.put('/update-password', protect, updatePassword);

module.exports = router;

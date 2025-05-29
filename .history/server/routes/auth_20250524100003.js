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
  verifyToken 
} = require('../controllers/auth');
const { protect } = require('../middleware/auth');

const router = express.Router();

// 인증 라우트
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.get('/verify', protect, verifyToken);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resetToken', resetPassword);
router.put('/update-password', protect, updatePassword);

module.exports = router;

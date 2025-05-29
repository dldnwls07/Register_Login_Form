// server/middleware/auth.js
const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

// 인증된 사용자인지 확인하는 미들웨어
exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  
  // 토큰 가져오기 (쿠키 또는 헤더에서)
  if (
    req.headers.authorization && 
    req.headers.authorization.startsWith('Bearer')
  ) {
    // 헤더에서 토큰 가져오기
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    // 쿠키에서 토큰 가져오기
    token = req.cookies.token;
  }
  
  // 토큰 확인
  if (!token) {
    return next(new ErrorResponse('인증이 필요한 서비스입니다', 401));
  }
  
  try {
    // 토큰 검증
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 해당 사용자 조회
    req.user = await User.findByPk(decoded.id);
    
    if (!req.user) {
      return next(new ErrorResponse('사용자를 찾을 수 없습니다', 404));
    }
    
    console.log('🔍 [DEBUG] Authorization Header:', req.headers.authorization);
    console.log('🔍 [DEBUG] Token from Cookie:', req.cookies.token);
    console.log('🔍 [DEBUG] Decoded Token:', decoded);
    console.log('🔍 [DEBUG] User from DB:', req.user);

    next();
  } catch (err) {
    return next(new ErrorResponse('인증 오류가 발생했습니다', 401));
  }
});

// 특정 역할의 사용자만 접근 가능하도록 하는 미들웨어
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(`${req.user.role} 권한으로는 접근할 수 없습니다`, 403)
      );
    }
    next();
  };
};

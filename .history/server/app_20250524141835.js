// server/app.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const errorHandler = require('./middleware/error');
const path = require('path');

// 환경 변수 로드
dotenv.config({ path: path.resolve(__dirname, 'config/config.env') });

// 데이터베이스 연결
const { connectDB } = require('./config/db'); // 수정: connectDB만 가져오도록 변경
connectDB();

// Express 앱 초기화
const app = express();

// 미들웨어
app.use(express.json());
app.use(cookieParser());

// 세션 설정
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 10 * 60 * 1000 // 10분
  }
}));

// CORS 설정
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// API 라우트
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/transactions', require('./routes/transactions'));
app.use('/api/v1/categories', require('./routes/categories'));
app.use('/api/v1/goals', require('./routes/goals'));

// 404 처리
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: '요청한 리소스를 찾을 수 없습니다.'
  });
});

// 오류 처리 미들웨어
app.use(errorHandler);

module.exports = app;

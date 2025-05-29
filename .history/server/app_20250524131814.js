// server/app.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/error');
const path = require('path');

// 환경 변수 로드
dotenv.config({ path: path.resolve(__dirname, 'config/config.env') });

// 데이터베이스 연결
const { connectDB } = require('./config/db');
connectDB();

// Express 앱 초기화
const app = express();

// 미들웨어
app.use(express.json());
app.use(cookieParser());

// CORS 설정
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// API 라우트
// 문제 진단을 위해 하나씩 주석 처리하고 테스트합니다
app.use('/api/auth', require('./routes/auth'));
// app.use('/api/transactions', require('./routes/transactions'));
// app.use('/api/categories', require('./routes/categories'));
// app.use('/api/goals', require('./routes/goals'));

// 404 처리
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '요청한 리소스를 찾을 수 없습니다.'
  });
});

// 오류 처리 미들웨어
app.use(errorHandler);

module.exports = app;

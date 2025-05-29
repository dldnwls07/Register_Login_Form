// server/app.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const errorHandler = require('./middleware/error');
const path = require('path');

// 환경 변수 로드
dotenv.config({ path: path.join(__dirname, 'config', 'config.env') });

// 데이터베이스 연결
const { connectDB } = require('./config/db');
connectDB();

// Express 앱 초기화
const app = express();

// 미들웨어
app.use(express.json());
app.use(cookieParser());

// CORS 설정
const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['set-cookie']
};
app.use(cors(corsOptions));

// 세션 설정
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24시간
    }
}));

// 라우트 설정
app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));

// 에러 핸들러
app.use(errorHandler);

// 세부 오류 로깅 미들웨어 추가
app.use((err, req, res, next) => {
  console.error('서버 오류:', err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || '서버 내부 오류가 발생했습니다.',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 프로덕션 환경에서 React 앱 제공
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '..', 'client', 'build')));
    app.get('*', (req, res) => res.sendFile(path.resolve(__dirname, '..', 'client', 'build', 'index.html')));
} else {
    app.get('/', (req, res) => {
        res.send('API is running...');
    });
}

module.exports = app;

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
const { connectDB } = require('./config/db'); // sequelize 제거
connectDB();

// Express 앱 초기화
const app = express();

// 미들웨어
app.use(express.json());
app.use(cookieParser());

// CORS 설정 수정
const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['set-cookie']
};

app.use(cors(corsOptions));

// 세션 미들웨어 설정 (라우트 설정 전에 추가)
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-strong-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24시간
    },
    name: 'sessionId'
}));

// 세션 디버깅 미들웨어 추가
app.use((req, res, next) => {
  console.log('[DEBUG] Session:', {
    id: req.sessionID,
    otp: req.session.otp,
    cookie: req.session.cookie
  });
  next();
});

// API 라우트
app.use('/api/auth', require('./routes/auth'));
// 아직 구현되지 않은 라우트는 주석 처리
// app.use('/api/transactions', require('./routes/transactions'));

// 에러 핸들러 (모든 라우트 뒤에 위치)
app.use(errorHandler);

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

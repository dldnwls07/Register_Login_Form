// server/app.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');
const helmet = require('helmet');
const csrf = require('csurf');
const rateLimit = require('express-rate-limit');

// 환경 변수 로드
dotenv.config({ path: path.join(__dirname, 'config', 'config.env') });

// 데이터베이스 연결
const { connectDB } = require('./config/db');
connectDB();

// Express 앱 초기화
const app = express();

// 미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // URL 인코딩 지원 추가
app.use(cookieParser());

// 모든 요청 로깅 (다른 미들웨어보다 먼저 등록)
app.use((req, res, next) => {
  console.log(`[DEBUG] 요청 받음: ${req.method} ${req.originalUrl}`);
  console.log('요청 헤더:', req.headers);
  console.log('요청 본문:', req.body);
  
  // 응답 로깅
  const originalSend = res.send;
  res.send = function(data) {
    console.log(`[DEBUG] 응답 전송 (${res.statusCode}):`, 
      typeof data === 'string' && data.length > 500 ? data.substring(0, 500) + '...' : data);
    return originalSend.apply(this, arguments);
  };
  
  next();
});

// CORS 설정
const corsOptions = {
    origin: function(origin, callback) {
        // 허용할 출처 목록
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:5002',
            'http://localhost:5001', // ← WebSocket 및 동일 포트 접근 허용
            process.env.CLIENT_URL
        ].filter(Boolean);

        // 개발 환경에서 origin이 undefined일 수 있음 (같은 출처일 때)
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('CORS 차단된 오리진:', origin);
            callback(new Error('CORS 정책에 의해 차단됨'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['set-cookie']
};
app.use(cors(corsOptions));

// 보안 헤더 설정 - 위치는 CORS 설정 다음에
app.use(helmet()); // 주요 보안 헤더 설정

// XSS 공격 방지
app.use(helmet.xssFilter());
app.use(helmet.noSniff());

// CSRF 보호
const csrfProtection = csrf({ cookie: true });
// app.use(csrfProtection); // 필요한 경로에만 적용하려면 주석 해제

// 속도 제한 설정 (DOS 공격 방지)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // IP 당 15분에 100번 요청 제한
  message: '너무 많은 요청이 감지되었습니다. 잠시 후 다시 시도해주세요.'
});
app.use('/api/', apiLimiter);

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

// 하나의 로깅 미들웨어만 사용 (중복 제거)
app.use((req, res, next) => {
  const now = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const body = method === 'POST' || method === 'PUT' ? req.body : undefined;
  const query = Object.keys(req.query).length > 0 ? req.query : undefined;
  
  console.log(`${now} [${method}] ${url}`);
  if (body) console.log('요청 본문:', body);
  if (query) console.log('쿼리 파라미터:', query);
  
  // 응답 완료 시 로깅
  const oldEnd = res.end;
  res.end = function(...args) {
    const responseTime = new Date().toISOString();
    console.log(`${responseTime} [응답] ${url} - 상태: ${res.statusCode}`);
    oldEnd.apply(res, args);
  };
  
  next();
});

// 라우트 설정
app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));

// 오류 처리 미들웨어 - 하나만 유지
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

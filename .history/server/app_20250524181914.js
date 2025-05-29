// server/app.js
const path = require('path'); // dotenv 보다 먼저 path를 require 할 수 있습니다.
const dotenv = require('dotenv');

// 환경 변수 로드 - 다른 모듈보다 먼저, 특히 DB 설정 전에 호출되어야 합니다.
dotenv.config({ path: path.resolve(__dirname, 'config/config.env') });

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const errorHandler = require('./middleware/error');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const { sequelize, connectDB, Sequelize } = require('./config/db'); // Sequelize 클래스 가져오기

// 추가: Sequelize 인스턴스 유효성 검사
if (!sequelize || typeof sequelize.dialect === 'undefined') {
  console.error('CRITICAL ERROR: Sequelize instance from db.js is not initialized correctly. ');
  console.error('Please check your database environment variables in server/config/config.env (DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT).');
  console.error('Also, ensure that server/config/db.js is correctly creating the Sequelize instance.');
  process.exit(1); // sequelize 인스턴스가 없으면 애플리케이션을 중지합니다.
}

// 데이터베이스 연결
connectDB(); // sequelize 인스턴스가 올바르게 초기화된 후 호출됩니다.

// Express 앱 초기화
const app = express();

// 미들웨어
app.use(express.json());
app.use(cookieParser());

// SequelizeStore 초기화 전 sequelize 인스턴스 상태 로깅
console.log('DEBUG: typeof sequelize.define:', typeof sequelize.define);
console.log('DEBUG: sequelize.constructor.DataTypes:', sequelize.constructor.DataTypes);

// 세션 저장소 설정 (Sequelize 사용)
const sessionStore = new SequelizeStore({
  db: sequelize,
  table: 'sessions',
  checkExpirationInterval: 15 * 60 * 1000,
  expiration: 24 * 60 * 60 * 1000
});

console.log('DEBUG: sessionStore.model:', sessionStore.model); // 여전히 모델 상태 확인

// 디버깅 로그 추가
if (!sessionStore || typeof sessionStore.sync !== 'function') {
  console.error('CRITICAL ERROR: SequelizeStore is not initialized correctly.');
  console.error('Please check the Sequelize instance and connect-session-sequelize setup.');
  process.exit(1);
}

// 세션 테이블 동기화
// sessionStore.sync(); // 테이블 생성 활성화 (주석 해제)

// 세션 설정
app.use(session({
  secret: process.env.JWT_SECRET, // JWT_SECRET도 dotenv로 로드됩니다.
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 쿠키 만료 시간 (세션 만료 시간과 동일하게 설정 권장)
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

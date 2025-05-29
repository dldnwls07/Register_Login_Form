// server/server.js
// 환경 변수 로딩 확인
require('dotenv').config({ path: './config/config.env' });

try {
  console.log('서버를 시작합니다...');
  const app = require('./app');
  const connectDB = require('./config/db');

  // 포트 설정
  const PORT = process.env.PORT || 5000;

  // 데이터베이스 연결
  connectDB();

  // 라우트 설정
  app.use('/api/v1/auth', require('./routes/auth'));
  app.use('/api/v1/categories', require('./routes/categories'));
  app.use('/api/v1/transactions', require('./routes/transactions'));
  app.use('/api/v1/goals', require('./routes/goals'));

  // 오류 처리 미들웨어
  const errorHandler = require('./middleware/error');
  app.use(errorHandler);

  // 서버 시작
  const server = app.listen(PORT, () => {
    console.log(`서버가 ${PORT} 포트에서 실행 중입니다.`);
  });

  // 처리되지 않은 예외 처리
  process.on('unhandledRejection', (err, promise) => {
    console.error(`오류: ${err.message}`);
    // 서버 종료 및 프로세스 종료
    server.close(() => process.exit(1));
  });
} catch (error) {
  console.error(`서버 시작 중 오류 발생: ${error.message}`);
  process.exit(1);
}

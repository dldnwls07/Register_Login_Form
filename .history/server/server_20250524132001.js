// server/server.js
// 환경 변수 로딩 확인
require('dotenv').config({ path: './config/config.env' });

try {
  console.log('서버를 시작합니다...');
  const app = require('./app');

  // 포트 설정
  const PORT = process.env.PORT || 5000;

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

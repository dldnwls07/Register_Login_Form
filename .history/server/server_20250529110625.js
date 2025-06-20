// server/server.js
// server/server.js
require('dotenv').config();
const app = require('./app');

// 포트 설정
const PORT = process.env.PORT || 5001;

// 서버 시작
const server = app.listen(PORT, 'localhost', () => {
  console.log(`서버가 ${PORT} 포트에서 실행 중입니다.`);
  console.log(`서버 URL: http://localhost:${PORT}`);
});

// 처리되지 않은 예외 처리
process.on('unhandledRejection', (err, promise) => {
  console.error(`오류: ${err.message}`);
  // 서버 종료 및 프로세스 종료
  server.close(() => process.exit(1));
});

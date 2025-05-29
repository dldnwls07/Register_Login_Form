/**
 * 데이터베이스 연결 테스트 스크립트
 */
import { testConnection } from './utils/dbService.js';

async function checkDbConnection() {
  try {
    const isConnected = await testConnection();
    if (isConnected) {
      console.log('✅ 데이터베이스 연결에 성공했습니다!');
      console.log('   데이터베이스가 올바르게 설정되었습니다.');
    } else {
      console.error('❌ 데이터베이스 연결에 실패했습니다.');
      console.error('   dbService.js 파일에서 연결 설정을 확인해주세요.');
    }
  } catch (error) {
    console.error('❌ 데이터베이스 연결 중 오류가 발생했습니다:', error.message);
    console.error('   DB_SETUP_GUIDE.md 파일을 참고하여 설정을 확인해주세요.');
  } finally {
    process.exit();
  }
}

checkDbConnection();

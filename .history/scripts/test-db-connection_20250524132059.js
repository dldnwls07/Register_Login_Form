// MySQL 연결 테스트 스크립트
require('dotenv').config({ path: './server/config/config.env' });
const { Sequelize } = require('sequelize');

console.log('스크립트가 실행되었습니다.');
console.log('MySQL 연결 테스트를 시작합니다...');
console.log('환경 변수 확인:');
console.log(`DB_HOST: ${process.env.DB_HOST}`);
console.log(`DB_PORT: ${process.env.DB_PORT}`);
console.log(`DB_NAME: ${process.env.DB_NAME}`);
console.log(`DB_USER: ${process.env.DB_USER}`);
console.log(`DB_PASSWORD: ${process.env.DB_PASSWORD ? '****' : '(비어 있음)'}`);

const testDatabaseConnection = async () => {
  console.log('테스트 함수가 시작되었습니다.');try {
    const sequelize = new Sequelize(
      process.env.DB_NAME, 
      process.env.DB_USER, 
      process.env.DB_PASSWORD, 
      {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        port: process.env.DB_PORT || 3306,
        logging: console.log,
      }
    );

    await sequelize.authenticate();
    console.log('MySQL 데이터베이스에 성공적으로 연결되었습니다.');
    
    // 데이터베이스에서 테이블 목록 조회
    const [tables] = await sequelize.query('SHOW TABLES;');
    console.log('데이터베이스의 테이블 목록:');
    console.log(tables);
    
    await sequelize.close();
    return true;
  } catch (error) {
    console.error('MySQL 연결 오류:', error);
    return false;
  }
};

// 스크립트 실행
testDatabaseConnection()
  .then(result => {
    console.log(result ? '연결 테스트 성공' : '연결 테스트 실패');
    process.exit(result ? 0 : 1);
  })
  .catch(err => {
    console.error('테스트 실행 오류:', err);
    process.exit(1);
  });

// server/config/db.js
const { Sequelize } = require('sequelize');
require('dotenv').config({ path: '../../.env' }); // dotenv 설정 추가

// 환경 변수 로그 찍어보기 (디버깅용)
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_NAME:', process.env.DB_NAME);

const sequelize = new Sequelize(
  'Register_Login_Form',  // 직접 데이터베이스 이름 지정
  'root',                 // 직접 사용자 이름 지정
  '7032',                // 직접 비밀번호 지정
  {
    host: 'localhost',
    dialect: 'mysql',
    port: process.env.DB_PORT || 3306,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL 데이터베이스 연결 성공');
  } catch (error) {
    console.error('데이터베이스 연결 실패:', error);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  connectDB
};

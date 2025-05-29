// server/config/db.js
const { Sequelize } = require('sequelize'); // Sequelize 클래스 자체를 가져옵니다.

const sequelize = new Sequelize(
  process.env.DB_NAME, 
  process.env.DB_USER, 
  process.env.DB_PASSWORD, 
  {
    host: process.env.DB_HOST,
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
    console.log('데이터베이스 연결 시도 중...'); // 디버깅 로그 추가
    console.log('DB 정보:', {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      name: process.env.DB_NAME,
      user: process.env.DB_USER
    });

    await sequelize.authenticate();
    console.log('MySQL 데이터베이스 연결 성공');
  } catch (error) {
    console.error(`데이터베이스 연결 오류: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB, Sequelize }; // Sequelize 클래스도 함께 export

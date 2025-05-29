// server/middleware/error.js
const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // 로그 기록
  console.error(err);

  // Sequelize 유효성 검사 오류
  if (err.name === 'SequelizeValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = new ErrorResponse(message, 400);
  }

  // Sequelize 중복 키 오류
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = Object.keys(err.fields)[0];
    const message = `중복된 ${field} 값이 있습니다`;
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || '서버 오류가 발생했습니다'
  });
};

module.exports = errorHandler;

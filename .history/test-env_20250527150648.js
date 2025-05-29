require('dotenv').config({ path: './server/config/config.env' });

console.log('환경 변수 테스트:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('SESSION_SECRET:', process.env.SESSION_SECRET);
console.log('CLIENT_URL:', process.env.CLIENT_URL);
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS);
console.log('EMAIL_FROM:', process.env.EMAIL_FROM);

require('dotenv').config({ path: './server/config/config.env' });
const nodemailer = require('nodemailer');

async function sendTestEmail() {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_USER, // 본인에게 테스트 메일 발송
      subject: '테스트 이메일',
      text: '이것은 Nodemailer를 이용한 테스트 이메일입니다.',
    });
    console.log('이메일 전송 성공:', info.response);
  } catch (error) {
    console.error('이메일 전송 실패:', error);
  }
}

sendTestEmail();

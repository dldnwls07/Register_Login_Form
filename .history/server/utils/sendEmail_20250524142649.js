// server/utils/sendEmail.js
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Gmail 트랜스포터 생성
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD, // Gmail 앱 비밀번호 사용
    },
  });

  // 이메일 옵션 설정
  const message = {
    from: `가계부 앱 <${process.env.EMAIL_FROM}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  try {
    // 이메일 전송
    const info = await transporter.sendMail(message);
    console.log('이메일이 전송되었습니다: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('이메일 전송 실패:', error);
    throw new Error('이메일 전송에 실패했습니다.');
  }
};

module.exports = sendEmail;

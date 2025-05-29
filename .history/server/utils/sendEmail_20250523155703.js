// server/utils/sendEmail.js
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 트랜스포터 생성
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 이메일 옵션 설정
  const message = {
    from: `${process.env.EMAIL_FROM}`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  // 이메일 전송
  const info = await transporter.sendMail(message);

  console.log('이메일이 전송되었습니다: %s', info.messageId);
};

module.exports = sendEmail;

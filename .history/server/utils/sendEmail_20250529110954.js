// server/utils/sendEmail.js
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../config/config.env') });

console.log('Email Config:', {
  user: process.env.EMAIL_USER,
  pass: process.env.EMAIL_PASS,
  from: process.env.EMAIL_FROM
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: `"Money App" <${process.env.EMAIL_FROM}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html || `<p>${options.message}</p>`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('이메일 발송 성공:', info.messageId);
    return info;
  } catch (error) {
    console.error('이메일 발송 실패:', error);
    throw error;
  }
};

// 이메일 전송 테스트
transporter.verify((error, success) => {
  if (error) {
    console.log('SMTP 서버 연결 오류:', error);
  } else {
    console.log('SMTP 서버 연결 성공:', success);
  }
});

module.exports = sendEmail;
// server/utils/sendEmail.js
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  console.log('=== 이메일 발송 시작 ===');
  console.log('수신자:', options.email);
  console.log('제목:', options.subject);
  
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // TLS
      auth: {
        user: process.env.EMAIL_USER,
        // Gmail 앱 비밀번호 사용
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `"Money App" <${process.env.EMAIL_USER}>`,
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
    throw new Error('이메일 발송에 실패했습니다.');
  }
};

module.exports = sendEmail;

const nodemailer = require('nodemailer');

// 이메일 전송을 위한 트랜스포터 설정
const transporter = nodemailer.createTransport({
  service: 'gmail', // 또는 다른 이메일 서비스
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// 인증 코드 생성 함수
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6자리 숫자
};

// 인증 이메일 발송 함수
const sendVerificationEmail = async (email, code) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: '이메일 인증 코드',
      text: `귀하의 인증 코드는 ${code}입니다. 5분 이내에 입력해주세요.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>이메일 인증</h2>
          <p>귀하의 인증 코드는 다음과 같습니다:</p>
          <h3 style="color: #4CAF50; font-size: 24px; letter-spacing: 2px;">${code}</h3>
          <p>이 코드는 5분 후에 만료됩니다.</p>
          <p>요청하지 않으셨다면 이 이메일을 무시하셔도 됩니다.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('이메일 발송 성공:', info.messageId);
    return { success: true, message: '인증 코드가 이메일로 발송되었습니다.' };
  } catch (error) {
    console.error('이메일 발송 오류:', error);
    return { success: false, message: '이메일 발송 중 오류가 발생했습니다.', error };
  }
};

module.exports = {
  generateVerificationCode,
  sendVerificationEmail
};

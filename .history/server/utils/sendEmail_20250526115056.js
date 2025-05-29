// server/utils/sendEmail.js
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  console.log('=== 이메일 발송 시작 ===');
  console.log('수신자:', options.email);
  console.log('제목:', options.subject);
  
  try {
    // 환경 변수 확인 (config.env의 변수명 사용)
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    
    if (!emailUser || !emailPass) {
      console.error('이메일 환경 변수가 설정되지 않았습니다!');
      console.error('EMAIL_USER:', emailUser);
      console.error('EMAIL_PASS:', emailPass ? '설정됨(값 비공개)' : '설정되지 않음');
      throw new Error('이메일 서비스 환경 변수가 올바르게 설정되지 않았습니다.');
    }

    // 트랜스포터 설정 로깅
    console.log('트랜스포터 설정:');
    console.log('- 이메일:', emailUser);
    
    // 트랜스포터 생성
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });

    // 이메일 옵션
    const mailOptions = {
      from: emailUser,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html || `<p>${options.message}</p>`
    };

    console.log('메일 발송 시도...');
    const info = await transporter.sendMail(mailOptions);
    
    console.log('이메일 발송 성공!');
    console.log('메시지 ID:', info.messageId);
    
    return info;
  } catch (error) {
    console.error('이메일 발송 실패!');
    console.error('오류 메시지:', error.message);
    console.error('오류 세부 정보:', error);
    throw error; // 오류를 호출자에게 전달
  }
};

module.exports = sendEmail;

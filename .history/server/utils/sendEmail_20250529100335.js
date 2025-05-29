// server/utils/sendEmail.js
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    console.log('=== 이메일 발송 시작 ===');
    console.log('수신자:', options.email);
    console.log('제목:', options.subject);
    
    try {
        // Gmail SMTP 설정 수정
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS  // Gmail 앱 비밀번호
            },
            tls: {
                rejectUnauthorized: false  // 인증서 검증 비활성화
            },
            debug: true  // 디버그 모드 활성화
        });

        // 발송 전 연결 테스트
        await transporter.verify();
        console.log('SMTP 연결 성공');

        const mailOptions = {
            from: {
                name: 'Money App',
                address: process.env.EMAIL_USER
            },
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html || `<p>${options.message}</p>`
        };

        // 디버그 정보 출력
        console.log('메일 발송 시도...');
        console.log('발신자:', process.env.EMAIL_USER);
        console.log('수신자:', options.email);

        const info = await transporter.sendMail(mailOptions);
        console.log('이메일 발송 성공! ID:', info.messageId);
        
        return info;
    } catch (error) {
        console.error('이메일 발송 실패:', error);
        console.error('에러 세부정보:', {
            code: error.code,
            command: error.command,
            response: error.response
        });
        throw new Error(`이메일 발송 실패: ${error.message}`);
    }
};

module.exports = sendEmail;

// server/utils/sendEmail.js
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    console.log('=== 이메일 발송 시작 ===');
    console.log('발신자:', process.env.EMAIL_FROM);
    console.log('수신자:', options.email);
    console.log('제목:', options.subject);
    
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,    // feca1804@gmail.com
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: `"Money App" <${process.env.EMAIL_FROM}>`,  // feca1804@gmail.com
            to: options.email,  // 수신자 이메일
            subject: options.subject,
            text: options.message,
            html: options.html || `<p>${options.message}</p>`
        };

        console.log('메일 발송 시도...');
        const info = await transporter.sendMail(mailOptions);
        console.log('이메일 발송 성공:', info.messageId);
        
        return info;
    } catch (error) {
        console.error('이메일 발송 실패:', error);
        throw error;
    }
};

module.exports = sendEmail;

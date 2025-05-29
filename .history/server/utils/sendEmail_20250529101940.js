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
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

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

module.exports = sendEmail;

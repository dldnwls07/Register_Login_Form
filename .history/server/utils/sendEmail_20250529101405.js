// server/utils/sendEmail.js
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const oauth2Client = require('../config/oauth2.config');

const sendEmail = async (options) => {
    console.log('=== 이메일 발송 시작 ===');
    console.log('발신자:', process.env.EMAIL_FROM);
    console.log('수신자:', options.email);
    console.log('제목:', options.subject);
    
    try {
        // Access token 얻기
        const accessToken = await oauth2Client.getAccessToken();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.EMAIL_USER,
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
                accessToken: accessToken.token
            }
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

        const info = await transporter.sendMail(mailOptions);
        console.log('이메일 발송 성공:', info.messageId);
        return info;
    } catch (error) {
        console.error('이메일 발송 실패:', error);
        throw new Error(`이메일 발송 실패: ${error.message}`);
    }
};

module.exports = sendEmail;

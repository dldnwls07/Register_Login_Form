// server/controllers/authController.js
const { db } = require('../config/db');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// 이메일 전송을 위한 설정
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// OTP 생성
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// OTP 전송
exports.sendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const otp = generateOTP();
        
        // OTP를 세션에 저장
        req.session.otp = {
            code: otp,
            email: email,
            expires: Date.now() + 5 * 60 * 1000 // 5분 유효
        };

        // 이메일 전송
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: '이메일 인증 코드',
            text: `인증 코드: ${otp}`
        });

        res.status(200).json({ 
            success: true, 
            message: '인증 코드가 이메일로 전송되었습니다.' 
        });
    } catch (error) {
        console.error('OTP 전송 오류:', error);
        res.status(500).json({ 
            success: false, 
            message: '인증 코드 전송에 실패했습니다.' 
        });
    }
};

// OTP 검증
exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        
        if (!req.session.otp || 
            req.session.otp.email !== email || 
            req.session.otp.code !== otp ||
            Date.now() > req.session.otp.expires) {
            return res.status(400).json({ 
                success: false, 
                message: '유효하지 않거나 만료된 인증 코드입니다.' 
            });
        }

        // OTP 검증 성공
        delete req.session.otp; // 사용된 OTP 제거
        res.json({ 
            success: true, 
            message: '이메일 인증이 완료되었습니다.' 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: '인증 코드 확인 중 오류가 발생했습니다.' 
        });
    }
};

// 아이디 중복 확인
exports.checkUsernameAvailability = async (req, res) => {
    try {
        const { username } = req.query;
        const [users] = await db.query(
            'SELECT id FROM users WHERE username = ?', 
            [username]
        );
        
        res.json({ 
            available: users.length === 0 
        });
    } catch (error) {
        res.status(500).json({ 
            message: '사용자 확인 중 오류가 발생했습니다.' 
        });
    }
};

// 이메일 인증 메일 발송
exports.sendVerification = async (req, res) => {
    try {
        const { email } = req.body;
        const verificationCode = crypto.randomBytes(3).toString('hex').toUpperCase();
        
        // 인증 코드 저장
        req.session.emailVerification = {
            email,
            code: verificationCode,
            expires: Date.now() + 10 * 60 * 1000 // 10분 유효
        };

        // 이메일 발송
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: '이메일 주소 확인',
            text: `인증 코드: ${verificationCode}`
        });

        res.json({ 
            success: true, 
            message: '인증 메일이 발송되었습니다.' 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: '인증 메일 발송에 실패했습니다.' 
        });
    }
};

// 이메일 인증 코드 확인
exports.verifyEmailCode = async (req, res) => {
    try {
        const { email, code } = req.body;
        
        if (!req.session.emailVerification || 
            req.session.emailVerification.email !== email || 
            req.session.emailVerification.code !== code ||
            Date.now() > req.session.emailVerification.expires) {
            return res.status(400).json({ 
                success: false, 
                message: '유효하지 않거나 만료된 인증 코드입니다.' 
            });
        }

        delete req.session.emailVerification;
        res.json({ 
            success: true, 
            message: '이메일이 성공적으로 인증되었습니다.' 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: '이메일 인증 중 오류가 발생했습니다.' 
        });
    }
};

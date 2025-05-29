// server/controllers/auth.js
const { sequelize } = require('../config/db');
const { QueryTypes } = require('sequelize');
const nodemailer = require('nodemailer');

// 인증 코드 저장을 위한 메모리 저장소
const verificationCodes = new Map();

/**
 * 사용자명 중복 확인
 */
exports.checkUsername = async (req, res) => {
    try {
        const { username } = req.query;
        
        const users = await sequelize.query(
            'SELECT id FROM users WHERE username = ?',
            {
                replacements: [username],
                type: QueryTypes.SELECT
            }
        );
        
        res.json({ 
            available: users.length === 0,
            message: users.length > 0 ? '이미 사용 중인 사용자명입니다.' : '사용 가능한 사용자명입니다.'
        });
    } catch (error) {
        console.error('사용자명 중복 확인 오류:', error);
        res.status(500).json({ 
            message: '사용자명 확인 중 오류가 발생했습니다.' 
        });
    }
};

/**
 * 인증 코드 생성
 */
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * 이메일 직접 발송 함수
 */
const sendEmail = async (to, subject, message) => {
    // config.env의 변수 사용
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    
    if (!emailUser || !emailPass) {
        throw new Error('이메일 환경 변수가 설정되지 않았습니다');
    }
    
    console.log('이메일 발송 설정:');
    console.log('- 발신자:', emailUser);
    console.log('- 수신자:', to);
    console.log('- 제목:', subject);
    
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: emailUser,
            pass: emailPass
        }
    });
    
    const mailOptions = {
        from: emailUser,
        to,
        subject,
        text: message,
        html: `<div style="padding: 20px; background-color: #f5f5f5;">
                <h2 style="color: #333;">이메일 인증 코드</h2>
                <p>안녕하세요! 회원가입을 위한 인증 코드입니다:</p>
                <div style="background-color: #fff; padding: 15px; border-radius: 5px; font-size: 24px; font-weight: bold; letter-spacing: 5px; text-align: center;">
                    ${message}
                </div>
                <p style="margin-top: 20px;">이 코드는 5분 후에 만료됩니다.</p>
               </div>`
    };
    
    console.log('이메일 발송 시도...');
    const info = await transporter.sendMail(mailOptions);
    console.log('이메일 발송 성공:', info.messageId);
    return info;
};

/**
 * 인증 코드 발송
 */
exports.sendVerificationCode = async (req, res) => {
    try {
        console.log('인증 코드 발송 요청 받음:', req.body);
        const { email } = req.body;
        
        // 입력 검증 강화
        if (!email || typeof email !== 'string' || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            return res.status(400).json({
                success: false,
                message: '유효한 이메일 주소를 입력해주세요.'
            });
        }
        
        // 비율 제한 - 같은 이메일로 너무 자주 요청하는 것 방지
        const now = Date.now();
        const lastRequest = verificationCodes.get(email)?.lastRequest || 0;
        if (now - lastRequest < 60000) { // 1분 이내 재요청 제한
            return res.status(429).json({
                success: false,
                message: '너무 자주 요청하셨습니다. 잠시 후 다시 시도해주세요.'
            });
        }
        
        // 인증 코드 생성
        const verificationCode = generateVerificationCode();
        console.log(`생성된 인증 코드: ${verificationCode}`);
        
        // 인증 코드 저장
        verificationCodes.set(email, {
            code: verificationCode,
            expiresAt: now + (5 * 60 * 1000), // 5분
            lastRequest: now
        });
        
        // 5분 후 자동 만료
        setTimeout(() => {
            verificationCodes.delete(email);
            console.log(`${email}의 인증 코드 만료됨`);
        }, 5 * 60 * 1000);
        
        // 이메일 발송
        await sendEmail(email, '이메일 인증 코드', verificationCode);
        
        res.status(200).json({
            success: true, 
            message: '인증 코드가 이메일로 발송되었습니다.'
        });
    } catch (error) {
        console.error('인증 코드 발송 오류:', error);
        res.status(500).json({
            success: false,
            message: '인증 코드 발송 중 오류가 발생했습니다.',
            error: error.message
        });
    }
};

/**
 * 인증 코드 확인
 */
exports.verifyEmailCode = (req, res) => {
    try {
        console.log('인증 코드 확인 요청 받음:', req.body);
        const { email, code } = req.body;
        
        if (!email || !code) {
            return res.status(400).json({
                success: false,
                message: '이메일과 인증 코드를 모두 입력해주세요.'
            });
        }
        
        // 저장된 인증 코드 확인
        const verification = verificationCodes.get(email);
        console.log('저장된 인증 코드 정보:', verification);
        
        if (!verification) {
            return res.status(400).json({
                success: false,
                message: '인증 코드가 만료되었거나 발급되지 않았습니다.'
            });
        }
        
        // 만료 여부 확인
        if (Date.now() > verification.expiresAt) {
            verificationCodes.delete(email);
            return res.status(400).json({
                success: false,
                message: '인증 코드가 만료되었습니다. 다시 요청해주세요.'
        verificationCodes.delete(email);
        console.log(`${email}의 인증 성공`);
        
        res.json({
            success: true,
            message: '이메일 인증이 완료되었습니다.'
        });
    } catch (error) {
        console.error('인증 코드 확인 오류:', error);
        res.status(500).json({
            success: false,
            message: '인증 코드 확인 중 오류가 발생했습니다.'
        });
    }
};

/**
 * OTP 발송 (별도 엔드포인트)
 */
exports.sendOtp = async (req, res) => {
    console.log('sendOtp 함수 호출됨');
    await exports.sendVerificationCode(req, res);
};

/**
 * OTP 확인 (별도 엔드포인트)
 */
exports.verifyOtp = (req, res) => {
    console.log('verifyOtp 함수 호출됨');
    exports.verifyEmailCode(req, res);
};

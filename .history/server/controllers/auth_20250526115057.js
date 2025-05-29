// server/controllers/authController.js
const { sequelize } = require('../config/db');
const { QueryTypes } = require('sequelize');
const sendEmail = require('../utils/sendEmail');

// 인증 코드 저장을 위한 메모리 저장소
const verificationCodes = new Map();

// 사용자명 중복 확인
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

// 인증 코드 생성
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// 이메일 인증 코드 발송
exports.sendVerificationCode = async (req, res) => {
    console.log('sendVerificationCode 함수 호출됨', req.body);
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: '이메일 주소를 입력해주세요.'
            });
        }
        
        console.log(`인증코드 발송 시작: ${email}`);
        
        // 인증 코드 생성
        const verificationCode = generateVerificationCode();
        console.log(`생성된 인증코드: ${verificationCode}`);
        
        // 인증 코드 저장 (5분 만료)
        verificationCodes.set(email, {
            code: verificationCode,
            expiresAt: Date.now() + 5 * 60 * 1000
        });
        
        // 5분 후 자동 삭제
        setTimeout(() => {
            verificationCodes.delete(email);
            console.log(`${email}의 인증코드가 만료됨`);
        }, 5 * 60 * 1000);
        
        // 이메일 발송
        try {
            await sendEmail({
                email,
                subject: '이메일 인증 코드',
                message: `회원가입을 위한 인증 코드는 [${verificationCode}] 입니다. 5분 이내에 입력해주세요.`
            });
            
            console.log(`인증코드 이메일 발송 완료: ${email}`);
            
            res.json({
                success: true,
                message: '인증 코드가 이메일로 발송되었습니다.'
            });
        } catch (emailError) {
            console.error('이메일 발송 실패:', emailError);
            res.status(500).json({
                success: false,
                message: '인증 코드 발송 중 오류가 발생했습니다.',
                error: emailError.message
            });
        }
    } catch (error) {
        console.error('인증 코드 발송 처리 중 오류:', error);
        res.status(500).json({
            success: false,
            message: '인증 코드 처리 중 오류가 발생했습니다.',
            error: error.message
        });
    }
};

// 인증 코드 확인
exports.verifyEmailCode = (req, res) => {
    console.log('verifyEmailCode 함수 호출됨', req.body);
    try {
        const { email, code } = req.body;
        
        if (!email || !code) {
            return res.status(400).json({
                success: false,
                message: '이메일과 인증 코드를 모두 입력해주세요.'
            });
        }
        
        // 저장된 인증 코드 확인
        const verification = verificationCodes.get(email);
        console.log(`${email}의 저장된 인증 정보:`, verification);
        
        // 인증 코드가 없는 경우
        if (!verification) {
            return res.status(400).json({
                success: false,
                message: '인증 코드가 만료되었거나 발급되지 않았습니다.'
            });
        }
        
        // 인증 코드 만료 확인
        if (Date.now() > verification.expiresAt) {
            verificationCodes.delete(email);
            return res.status(400).json({
                success: false,
                message: '인증 코드가 만료되었습니다. 다시 요청해주세요.'
            });
        }
        
        // 인증 코드 일치 여부 확인
        if (verification.code !== code) {
            return res.status(400).json({
                success: false,
                message: '인증 코드가 일치하지 않습니다.'
            });
        }
        
        // 인증 성공 시 코드 삭제
        verificationCodes.delete(email);
        console.log(`${email}의 인증 성공`);
        
        res.json({
            success: true,
            message: '이메일 인증이 완료되었습니다.'
        });
    } catch (error) {
        console.error('인증 코드 확인 중 오류:', error);
        res.status(500).json({
            success: false,
            message: '인증 코드 확인 중 오류가 발생했습니다.'
        });
    }
};

// OTP 발송 (기존 인증 코드 발송 함수 재사용)
exports.sendOtp = async (req, res) => {
    console.log('sendOtp 함수 호출됨', req.body);
    await exports.sendVerificationCode(req, res);
};

// OTP 확인 (기존 인증 코드 확인 함수 재사용)
exports.verifyOtp = (req, res) => {
    console.log('verifyOtp 함수 호출됨', req.body);
    exports.verifyEmailCode(req, res);
};

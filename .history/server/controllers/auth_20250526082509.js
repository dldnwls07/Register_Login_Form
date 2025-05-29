// server/controllers/auth.js
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { sendEmail } = require('../utils/sendEmail');
const crypto = require('crypto');

// 임시로 인증번호를 저장할 객체 (실제로는 Redis나 DB를 사용하는 것이 좋습니다)
const verificationCodes = new Map();

// @desc    사용자 등록
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
    const { username, email, password } = req.body;

    // 이메일 인증 확인
    const verification = verificationCodes.get(email);
    if (!verification || !verification.verified) {
        return next(new ErrorResponse('이메일 인증이 필요합니다.', 400));
    }

    // 사용자 생성
    const user = await User.create({
        username,
        email,
        password
    });

    // 인증 정보 삭제
    verificationCodes.delete(email);

    sendTokenResponse(user, 200, res);
});

// @desc    이메일 인증번호 발송
// @route   POST /api/auth/verify-email
// @access  Public
exports.sendVerificationEmail = asyncHandler(async (req, res, next) => {
    const { email } = req.body;

    // 인증번호 생성 (6자리)
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 인증 정보 저장
    verificationCodes.set(email, {
        code: verificationCode,
        verified: false,
        timestamp: Date.now()
    });

    // 이메일 발송
    const message = `
        회원가입을 위한 인증번호입니다: ${verificationCode}
        
        이 인증번호는 10분간 유효합니다.
    `;

    try {
        await sendEmail({
            email: email,
            subject: '회원가입 인증번호',
            message
        });

        res.status(200).json({
            success: true,
            message: '인증번호가 발송되었습니다.'
        });
    } catch (err) {
        verificationCodes.delete(email);
        return next(new ErrorResponse('인증번호 발송에 실패했습니다.', 500));
    }
});

// @desc    인증번호 확인
// @route   POST /api/auth/verify-code
// @access  Public
exports.verifyCode = asyncHandler(async (req, res, next) => {
    const { email, code } = req.body;

    const verification = verificationCodes.get(email);
    
    if (!verification) {
        return next(new ErrorResponse('인증번호가 만료되었습니다.', 400));
    }

    // 10분 만료 체크
    if (Date.now() - verification.timestamp > 600000) {
        verificationCodes.delete(email);
        return next(new ErrorResponse('인증번호가 만료되었습니다.', 400));
    }

    if (verification.code !== code) {
        return next(new ErrorResponse('잘못된 인증번호입니다.', 400));
    }

    // 인증 완료 표시
    verification.verified = true;
    verificationCodes.set(email, verification);

    res.status(200).json({
        success: true,
        message: '인증이 완료되었습니다.'
    });
});

// @desc    로그인
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return next(new ErrorResponse('아이디와 비밀번호를 입력해주세요.', 400));
    }

    // 사용자 조회 (비밀번호 포함)
    const user = await User.findOne({ username }).select('+password');

    if (!user) {
        return next(new ErrorResponse('잘못된 로그인 정보입니다.', 401));
    }

    // 비밀번호 확인
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        return next(new ErrorResponse('잘못된 로그인 정보입니다.', 401));
    }

    sendTokenResponse(user, 200, res);
});

// 토큰 생성 및 쿠키 설정
const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    };

    res.status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token
        });
};

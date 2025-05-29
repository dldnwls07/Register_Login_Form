// server/controllers/auth.js
const { sequelize } = require('../config/db');
const { QueryTypes } = require('sequelize');
const sendEmail = require('../utils/sendEmail');
const asyncHandler = require('express-async-handler');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

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
 * 인증 코드 생성 함수
 */
const generateVerificationCode = () => {
    // 6자리 난수 생성
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * 이메일 인증 코드 발송
 */
exports.sendVerificationCode = async (req, res) => {
    try {
        console.log('🔍 [DEBUG] 인증코드 발송 요청 받음:', req.body);
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: '이메일 주소를 입력해주세요.'
            });
        }
        
        console.log(`🔍 [DEBUG] ${email}로 인증코드 발송 시작`);
        
        // 인증 코드 생성
        const verificationCode = generateVerificationCode();
        console.log(`🔍 [DEBUG] 생성된 코드: ${verificationCode}`);
        
        // 메모리에 인증 코드 저장 (5분 후 만료)
        verificationCodes.set(email, {
            code: verificationCode,
            expiresAt: Date.now() + (5 * 60 * 1000) // 5분
        });
        
        // 5분 후 자동 삭제
        setTimeout(() => {
            verificationCodes.delete(email);
            console.log(`🔍 [DEBUG] ${email}의 인증코드 만료됨`);
        }, 5 * 60 * 1000);
        
        // 이메일 발송
        try {
            await sendEmail({
                email,
                subject: '이메일 인증 코드',
                message: `안녕하세요! 회원가입을 위한 인증 코드는 [${verificationCode}] 입니다. 5분 이내에 입력해주세요.`
            });
            
            console.log(`🔍 [DEBUG] ${email}로 인증코드 발송 완료`);
            
            return res.json({
                success: true,
                message: '인증 코드가 이메일로 발송되었습니다.'
            });
        } catch (emailError) {
            console.error('🔍 [DEBUG] 이메일 발송 실패:', emailError);
            return res.status(500).json({
                success: false,
                message: '인증 코드 발송 중 오류가 발생했습니다.',
                error: process.env.NODE_ENV === 'development' ? emailError.message : undefined
            });
        }
    } catch (error) {
        console.error('🔍 [DEBUG] 인증 코드 발송 오류:', error);
        return res.status(500).json({
            success: false,
            message: '인증 코드 생성 중 오류가 발생했습니다.'
        });
    }
};

/**
 * 인증 코드 확인
 */
exports.verifyEmailCode = (req, res) => {
    try {
        console.log('🔍 [DEBUG] 인증코드 확인 요청 받음:', req.body);
        const { email, code } = req.body;
        
        if (!email || !code) {
            return res.status(400).json({
                success: false,
                message: '이메일과 인증 코드를 모두 입력해주세요.'
            });
        }
        
        // 저장된 인증 코드 확인
        const verification = verificationCodes.get(email);
        console.log(`🔍 [DEBUG] 저장된 정보:`, verification);
        
        // 인증 코드 없음
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
        
        // 인증 코드 일치 확인
        if (verification.code !== code) {
            return res.status(400).json({
                success: false,
                message: '인증 코드가 일치하지 않습니다.'
            });
        }
        
        // 인증 성공 시 삭제
        verificationCodes.delete(email);
        console.log(`🔍 [DEBUG] ${email} 인증 성공`);
        
        return res.json({
            success: true,
            message: '이메일 인증이 완료되었습니다.'
        });
    } catch (error) {
        console.error('🔍 [DEBUG] 인증 코드 확인 오류:', error);
        return res.status(500).json({
            success: false,
            message: '인증 코드 확인 중 오류가 발생했습니다.'
        });
    }
};

/**
 * OTP 발송 (별도 엔드포인트)
 */
exports.sendOtp = async (req, res) => {
    console.log('🔍 [DEBUG] sendOtp 함수 호출됨:', req.body);
    await exports.sendVerificationCode(req, res);
};

/**
 * OTP 확인 (별도 엔드포인트)
 */
exports.verifyOtp = (req, res) => {
    console.log('🔍 [DEBUG] verifyOtp 함수 호출됨:', req.body);
    exports.verifyEmailCode(req, res);
};

exports.sendVerificationEmail = async (req, res) => {
    try {
        console.log('🔍 [DEBUG] 인증코드 발송 요청 받음:', req.body);
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: '이메일 주소를 입력해주세요.'
            });
        }

        // 인증 코드 생성 (6자리)
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // 이메일 발송
        await sendEmail({
            email,
            subject: '[Money App] 이메일 인증 코드',
            message: `인증 코드: ${verificationCode}
                     이 코드는 5분 동안 유효합니다.`,
            html: `
                <div style="padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
                    <h2 style="color: #00c471;">Money App 이메일 인증</h2>
                    <p>인증 코드: <strong>${verificationCode}</strong></p>
                    <p>이 코드는 5분 동안 유효합니다.</p>
                </div>
            `
        });

        // 인증 코드 저장
        verificationCodes.set(email, {
            code: verificationCode,
            expiresAt: Date.now() + (5 * 60 * 1000) // 5분 후 만료
        });
        
        console.log(`🔍 [DEBUG] ${email}로 인증코드 발송 완료`);
        
        return res.json({
            success: true,
            message: '인증 코드가 이메일로 발송되었습니다.'
        });
    } catch (error) {
        console.error('🔍 [DEBUG] 인증 코드 발송 오류:', error);
        return res.status(500).json({
            success: false,
            message: '인증 코드 발송에 실패했습니다.'
        });
    }
};

// @desc    비밀번호 변경
// @route   POST /api/auth/change-password
// @access  Private
exports.changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  // 비밀번호 유효성 검사
  if (!currentPassword || !newPassword) {
    return next(new ErrorResponse('현재 비밀번호와 새 비밀번호를 모두 입력해주세요.', 400));
  }

  // 비밀번호 정규식 검사
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
  if (!passwordRegex.test(newPassword)) {
    return next(new ErrorResponse('새 비밀번호는 8자 이상이며, 영문, 숫자, 특수문자를 포함해야 합니다.', 400));
  }

  // 현재 사용자 찾기
  const user = await User.findByPk(req.user.id);

  // 현재 비밀번호 확인
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    return next(new ErrorResponse('현재 비밀번호가 일치하지 않습니다.', 401));
  }

  // 새 비밀번호로 업데이트
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: '비밀번호가 성공적으로 변경되었습니다.'
  });
});

module.exports = exports;

// server/controllers/auth.js
const { sequelize } = require('../config/db');
const { QueryTypes } = require('sequelize');
const sendEmail = require('../utils/sendEmail');
const asyncHandler = require('express-async-handler');
const ErrorResponse = require('../utils/errorResponse');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const models = require('../models');
const { User, UserProfile } = models;
const crypto = require('crypto');

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
 * 이메일 중복 확인
 */
exports.checkEmail = async (req, res) => {
    try {
        const { email } = req.query;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: '이메일을 입력해주세요.'
            });
        }
        
        const users = await sequelize.query(
            'SELECT id FROM users WHERE email = ?',
            {
                replacements: [email],
                type: QueryTypes.SELECT
            }
        );
        
        res.json({
            success: true,
            available: users.length === 0,
            message: users.length > 0 ? '이미 사용 중인 이메일입니다.' : '사용 가능한 이메일입니다.'
        });
    } catch (error) {
        console.error('이메일 중복 확인 오류:', error);
        res.status(500).json({
            success: false,
            message: '이메일 확인 중 오류가 발생했습니다.'
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
exports.sendOtp = asyncHandler(async (req, res, next) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({
            success: false,
            message: '이메일 주소를 입력해주세요.'
        });
    }

    try {
        // OTP 생성 (6자리)
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // 이메일로 OTP 전송
        await sendEmail({
            email,
            subject: '[Money App] 인증번호',
            message: `인증번호는 ${otp} 입니다. 
                      이 인증번호는 5분간 유효합니다.`,
            html: `
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                  <h2 style="color: #00466a; margin-bottom: 20px;">Money App 인증번호</h2>
                  <p style="font-size: 16px; margin-bottom: 10px;">안녕하세요,</p>
                  <p style="font-size: 16px; margin-bottom: 20px;">요청하신 인증번호는 다음과 같습니다:</p>
                  <div style="background: #00466a; margin: 0 auto; width: max-content; padding: 0 10px; color: #fff; border-radius: 4px; font-size: 25px; margin-bottom: 20px;">
                    ${otp}
                  </div>
                  <p style="font-size: 14px; color: #666; margin-bottom: 10px;">이 인증번호는 5분간 유효합니다.</p>
                  <p style="font-size: 14px; color: #666;">본인이 요청하지 않은 경우 이 메일을 무시하시면 됩니다.</p>
                </div>
            `
        });
        
        // 인증번호 저장 (임시 저장소 사용)
        verificationCodes.set(email, {
            code: otp,
            expiresAt: Date.now() + (5 * 60 * 1000) // 5분 후 만료
        });
        
        // 5분 후 자동 삭제
        setTimeout(() => {
            verificationCodes.delete(email);
            console.log(`🔍 [DEBUG] ${email}의 인증번호 만료됨`);
        }, 5 * 60 * 1000);

        res.status(200).json({
            success: true,
            message: '인증번호가 이메일로 발송되었습니다.'
        });
    } catch (error) {
        console.error('인증번호 발송 오류:', error);
        res.status(500).json({
            success: false,
            message: '인증번호 발송에 실패했습니다.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

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

// @desc    사용자 등록
// @route   POST /api/auth/register
exports.register = asyncHandler(async (req, res, next) => {
  // 요청 본문 로깅 추가
  console.log('회원가입 요청 본문:', JSON.stringify(req.body, null, 2));

  // 요청 형식 정규화 (중첩 객체 및 일반 객체 모두 처리)
  let userData = req.body;
  
  if (req.body && typeof req.body === 'object') {
    if (req.body.username && typeof req.body.username === 'object') {
      userData = req.body.username; // 중첩된 경우
    } else {
      userData = req.body; // 중첩되지 않은 경우
    }
  }

  const { username, email, password, confirmPassword } = userData;

  // 비밀번호 확인
  if (!confirmPassword) {
    return next(new ErrorResponse('비밀번호 확인을 입력해주세요.', 400));
  }
  
  if (password !== confirmPassword) {
    return next(new ErrorResponse('비밀번호가 일치하지 않습니다.', 400));
  }

  if (!username || !email || !password || !confirmPassword) {
    return next(new ErrorResponse('사용자명, 이메일, 비밀번호, 비밀번호 확인은 필수 입력 사항입니다.', 400));
  }

  // 비밀번호 강도 검증
  const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
  if (!passwordRegex.test(password)) {
    return next(new ErrorResponse('비밀번호는 최소 8자 이상이며, 대소문자, 숫자, 특수문자(!@#$%^&*)를 각각 하나 이상 포함해야 합니다.', 400));
  }

  // 사용자 생성
  const user = await User.create({
    username,
    email,
    password
  });
  // 프로필 생성
  const userProfile = await UserProfile.create({
    userId: user.id,
    displayName: username,
    preferences: {
      notifications: false,
      darkMode: false,
      language: 'ko',
      theme: 'light'
    }
  });

  sendTokenResponse(user, 201, res);
});

// @desc    로그인
// @route   POST /api/auth/login
exports.login = asyncHandler(async (req, res, next) => {
  const { username, password } = req.body;

  // username과 password 체크
  if (!username || !password) {
    return next(new ErrorResponse('아이디와 비밀번호를 입력해주세요.', 400));
  }

  // 사용자 조회
  const user = await User.findOne({
    where: { username },
    attributes: ['id', 'username', 'email', 'password'], // users 테이블에서 필요한 컬럼만 선택
    include: [
      {
        model: UserProfile, // user_profiles 테이블과 조인
        attributes: ['displayName'] // 필요한 컬럼만 선택
      }
    ]
  });

  if (!user) {
    return next(new ErrorResponse('아이디 또는 비밀번호가 일치하지 않습니다.', 401));
  }

  // 비밀번호 확인
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('아이디 또는 비밀번호가 일치하지 않습니다.', 401));
  }

  sendTokenResponse(user, 200, res);
});

// @desc    로그아웃
// @route   POST /api/auth/logout
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: '로그아웃되었습니다.'
  });
});

// @desc    현재 로그인한 사용자 정보
// @route   GET /api/auth/me
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findByPk(req.user.id, {
    attributes: ['id', 'username', 'email', 'createdAt'], // createdAt 필드 추가
    include: [
      {
        model: UserProfile,
        as: 'profile',
        attributes: ['displayName', 'preferences']
      }
    ]
  });

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    비밀번호 변경
// @route   PUT /api/auth/update-password
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  // 현재 로그인한 사용자 정보
  const user = await User.findByPk(req.user.id);

  // 현재 비밀번호 확인
  if (!(await user.matchPassword(currentPassword))) {
    return next(new ErrorResponse('현재 비밀번호가 일치하지 않습니다.', 401));
  }

  // 새 비밀번호 유효성 검사
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(newPassword)) {
    return next(new ErrorResponse('비밀번호는 최소 8자 이상이며, 대문자, 숫자, 특수문자를 각각 하나 이상 포함해야 합니다.', 400));
  }

  // 비밀번호 업데이트
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: '비밀번호가 성공적으로 변경되었습니다.'
  });
});

// @desc    토큰 검증
// @route   GET /api/auth/verify
exports.verifyToken = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: '토큰이 유효합니다.'
  });
});

// @desc    비밀번호 찾기 요청
// @route   POST /api/auth/forgot-password
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ where: { email } });

  if (!user) {
    return next(new ErrorResponse('등록된 이메일이 없습니다.', 404));
  }

  const resetToken = user.getResetPasswordToken();
  await user.save();

  const resetUrl = `${req.protocol}://${req.get('host')}/password-reset/${resetToken}`;

  const message = `비밀번호를 재설정하려면 다음 링크를 클릭하세요: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: '비밀번호 재설정 요청',
      message,
    });

    res.status(200).json({ success: true, data: '이메일이 전송되었습니다.' });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return next(new ErrorResponse('이메일 전송에 실패했습니다.', 500));
  }
});

// @desc    비밀번호 재설정
// @route   PUT /api/auth/reset-password/:resetToken
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex');

  const user = await User.findOne({
    where: {
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    }
  });

  if (!user) {
    return next(new ErrorResponse('토큰이 유효하지 않습니다.', 400));
  }

  // 새 비밀번호 설정
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    이메일 인증 코드 발송
// @route   POST /api/auth/send-verification-code
exports.sendVerificationCode = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  
  // 인증 코드 생성 (6자리)
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  try {
    await sendEmail({
      email,
      subject: '이메일 인증 코드',
      message: `인증 코드: ${verificationCode}`
    });

    // 인증 코드 저장 (임시)
    // TODO: Redis나 다른 저장소에 저장하고 만료시간 설정
    
    res.status(200).json({
      success: true,
      message: '인증 코드가 발송되었습니다.',
      code: verificationCode // 실제 운영 환경에서는 제거
    });
  } catch (err) {
    return next(new ErrorResponse('인증 코드 발송에 실패했습니다.', 500));
  }
});

// @desc    이메일 인증 코드 확인
// @route   POST /api/auth/verify-email-code
exports.verifyEmailCode = asyncHandler(async (req, res, next) => {
  const { email, code } = req.body;
  
  // TODO: 저장된 인증 코드와 비교
  
  res.status(200).json({
    success: true,
    message: '이메일이 인증되었습니다.'
  });
});

// @desc    OTP 발송
// @route   POST /api/auth/send-otp
exports.sendOtp = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({
      success: false,
      message: '이메일 주소를 입력해주세요.'
    });
  }

  try {
    // OTP 생성 (6자리)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 이메일로 OTP 전송
    await sendEmail({
      email,
      subject: '[Money App] 인증번호',
      message: `인증번호는 ${otp} 입니다. 
                이 인증번호는 5분간 유효합니다.`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #00466a; margin-bottom: 20px;">Money App 인증번호</h2>
          <p style="font-size: 16px; margin-bottom: 10px;">안녕하세요,</p>
          <p style="font-size: 16px; margin-bottom: 20px;">요청하신 인증번호는 다음과 같습니다:</p>
          <div style="background: #00466a; margin: 0 auto; width: max-content; padding: 0 10px; color: #fff; border-radius: 4px; font-size: 25px; margin-bottom: 20px;">
            ${otp}
          </div>
          <p style="font-size: 14px; color: #666; margin-bottom: 10px;">이 인증번호는 5분간 유효합니다.</p>
          <p style="font-size: 14px; color: #666;">본인이 요청하지 않은 경우 이 메일을 무시하시면 됩니다.</p>
        </div>
      `
    });
    
    // 인증번호 저장 (임시 저장소 사용)
    verificationCodes.set(email, {
      code: otp,
      expiresAt: Date.now() + (5 * 60 * 1000) // 5분 후 만료
    });
    
    // 5분 후 자동 삭제
    setTimeout(() => {
      verificationCodes.delete(email);
      console.log(`🔍 [DEBUG] ${email}의 인증번호 만료됨`);
    }, 5 * 60 * 1000);

    res.status(200).json({
      success: true,
      message: '인증번호가 이메일로 발송되었습니다.'
    });
  } catch (error) {
    console.error('인증번호 발송 오류:', error);
    res.status(500).json({
      success: false,
      message: '인증번호 발송에 실패했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    OTP 확인
// @route   POST /api/auth/verify-otp
exports.verifyOtp = asyncHandler(async (req, res, next) => {
  const { phone, otp } = req.body;
  
  // TODO: 저장된 OTP와 비교
  
  res.status(200).json({
    success: true,
    message: 'OTP가 확인되었습니다.'
  });
});

// @desc    사용자 이름 찾기 (이메일로)
// @route   POST /api/auth/find-username
exports.findUsernameByEmail = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ where: { email } });

  if (!user) {
    return next(new ErrorResponse('등록된 이메일이 없습니다.', 404));
  }

  res.status(200).json({ success: true, username: user.username });
});

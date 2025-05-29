// server/controllers/auth.js
const crypto = require('crypto');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const sendEmail = require('../utils/sendEmail');

// @desc    사용자 등록
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { username, email, password } = req.body;

  // 이메일 중복 확인
  const emailExists = await User.findOne({ where: { email } });
  if (emailExists) {
    return next(new ErrorResponse('이미 등록된 이메일입니다.', 400));
  }

  // 사용자 이름 중복 확인
  const usernameExists = await User.findOne({ where: { username } });
  if (usernameExists) {
    return next(new ErrorResponse('이미 사용 중인 사용자 이름입니다.', 400));
  }

  // 비밀번호 강도 검증
  if (password.length < 10) {
    return next(new ErrorResponse('비밀번호는 최소 10자 이상이어야 합니다.', 400));
  }

  // 사용자 생성
  const user = await User.create({
    username,
    email,
    password
  });

  // 토큰 생성 및 응답
  sendTokenResponse(user, 201, res);
});

// @desc    사용자 로그인
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { usernameOrEmail, password, autoLogin } = req.body;

  // 필수 필드 확인
  if (!usernameOrEmail || !password) {
    return next(new ErrorResponse('사용자 이름/이메일과 비밀번호를 모두 입력해주세요.', 400));
  }
  // 이메일 또는 사용자 이름으로 사용자 찾기
  const user = await User.findOne({
    where: {
      [User.sequelize.Op.or]: [
        { email: usernameOrEmail },
        { username: usernameOrEmail }
      ]
    }
  });

  if (!user) {
    return next(new ErrorResponse('존재하지 않는 계정입니다.', 401));
  }

  // 계정 잠금 확인
  if (user.account_locked) {
    return next(new ErrorResponse('계정이 잠겼습니다. 관리자에게 문의하세요.', 401));
  }

  // 비밀번호 확인
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    // 실패한 로그인 시도 횟수 증가
    user.failed_login_attempts = (user.failed_login_attempts || 0) + 1;

    if (user.failed_login_attempts >= 5) {
      user.account_locked = true;
    }

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse('아이디 또는 비밀번호가 일치하지 않습니다.', 401));
  }

  // 로그인 성공 시 실패 횟수 초기화
  user.failed_login_attempts = 0;
  user.account_locked = false;
  user.last_login = Date.now();
  await user.save({ validateBeforeSave: false });

  // 토큰 생성 및 응답
  sendTokenResponse(user, 200, res, autoLogin);
});

// @desc    로그아웃 (쿠키 제거)
// @route   POST /api/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000), // 10초 뒤 만료
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: '로그아웃되었습니다.'
  });
});

// @desc    현재 로그인한 사용자 정보 조회
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findByPk(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    토큰 검증
// @route   GET /api/auth/verify
// @access  Private
exports.verifyToken = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: '토큰이 유효합니다.'
  });
});

// @desc    비밀번호 변경
// @route   PUT /api/auth/update-password
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  // 현재 로그인한 사용자 정보
  const user = await User.findByPk(req.user.id);

  // 현재 비밀번호 확인
  if (!(await user.matchPassword(currentPassword))) {
    return next(new ErrorResponse('현재 비밀번호가 일치하지 않습니다.', 401));
  }

  // 새 비밀번호 유효성 검사
  if (newPassword.length < 10) {
    return next(new ErrorResponse('비밀번호는 최소 10자 이상이어야 합니다.', 400));
  }

  // 비밀번호 업데이트
  user.password = newPassword;
  await user.save();

  // 새 토큰 발급
  sendTokenResponse(user, 200, res);
});

// @desc    비밀번호 재설정 요청 (이메일 발송)
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ where: { email } });

  if (!user) {
    return next(new ErrorResponse('해당 이메일로 등록된 계정이 없습니다.', 404));
  }

  // 비밀번호 재설정 토큰 생성
  const resetToken = user.getResetPasswordToken();

  // 토큰 저장 (getResetPasswordToken 메서드에서 토큰 설정 및 만료 시간을 처리)

  await user.save({ validateBeforeSave: false });

  // 재설정 URL 생성
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  // 이메일 메시지
  const message = `
    비밀번호 재설정 요청을 받았습니다. 아래 링크를 클릭하여 비밀번호를 재설정해주세요:
    
    ${resetUrl}
    
    이 링크는 1시간 후에 만료됩니다.
    
    요청하지 않으셨다면 이 메일을 무시해주세요.
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: '비밀번호 재설정 요청',
      message
    });

    res.status(200).json({
      success: true,
      message: '비밀번호 재설정 이메일이 발송되었습니다.'
    });
  } catch (err) {
    console.error('이메일 발송 오류:', err);
    
    user.reset_password_token = undefined;
    user.reset_password_expire = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse('이메일 발송에 실패했습니다. 나중에 다시 시도해주세요.', 500));
  }
});

// @desc    비밀번호 재설정
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // 토큰 해시화
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex');
  // 토큰과 만료 시간 확인
  const user = await User.findOne({
    where: {
      resetPasswordToken: resetPasswordToken,
      resetPasswordExpire: { [User.sequelize.Op.gt]: Date.now() }
    }
  });

  if (!user) {
    return next(new ErrorResponse('유효하지 않거나 만료된 토큰입니다.', 400));
  }

  // 새 비밀번호 설정
  user.password = req.body.password;
  user.reset_password_token = undefined;
  user.reset_password_expire = undefined;
  await user.save();

  // 로그인 처리
  sendTokenResponse(user, 200, res);
});

// 토큰 생성 및 쿠키 전송 헬퍼 함수
const sendTokenResponse = (user, statusCode, res, autoLogin = false) => {
  // 토큰 생성
  const token = user.getSignedJwtToken();

  // 쿠키 만료 시간 설정
  let cookieExpire = process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000; // 기본값
  
  // 자동 로그인 옵션 처리 (7일)
  if (autoLogin) {
    cookieExpire = 7 * 24 * 60 * 60 * 1000; // 7일
  }

  const cookieOptions = {
    expires: new Date(Date.now() + cookieExpire),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  };

  // 사용자 정보에서 비밀번호 제거
  const userResponse = user.toJSON();
  delete userResponse.password;

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      token,
      user: userResponse
    });
};

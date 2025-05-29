// server/controllers/auth.js
const crypto = require('crypto');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const sendEmail = require('../utils/sendEmail');
const { Op } = require('sequelize');

// @desc    이메일 중복 확인
// @route   POST /api/auth/check-email
// @access  Public
exports.checkEmail = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ where: { email } });

  if (user) {
    return next(new ErrorResponse('이미 등록된 이메일입니다.', 400));
  }

  res.status(200).json({
    success: true,
    message: '사용 가능한 이메일입니다.'
  });
});

// @desc    사용자 이름 중복 확인
// @route   POST /api/auth/check-username
// @access  Public
exports.checkUsername = asyncHandler(async (req, res, next) => {
  const { username } = req.body;

  console.log('checkUsername req.body:', req.body);

  // 서버 측 유효성 검사 (4자 이상, 특수문자/공백 불가)
  if (!username || typeof username !== 'string' || username.length < 4) {
    return next(new ErrorResponse('사용자 이름은 4자 이상이어야 합니다.', 400));
  }
  if (/[^a-zA-Z0-9]/.test(username)) {
    return next(new ErrorResponse('사용자 이름에는 영문과 숫자만 사용할 수 있습니다.', 400));
  }

  const user = await User.findOne({ where: { username } });

  if (user) {
    return next(new ErrorResponse('이미 사용 중인 사용자 이름입니다.', 400));
  }

  res.status(200).json({
    success: true,
    message: '사용 가능한 사용자 이름입니다.'
  });
});

// @desc    회원가입 이메일 인증 코드 발송
// @route   POST /api/auth/send-verification
// @access  Public
exports.sendVerificationEmail = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  // 인증 코드 생성 (6자리 숫자)
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

  // 인증 코드 저장
  req.session.verificationData = { // verificationCode -> verificationData로 변경하여 객체임을 명확히 함
    code: verificationCode,
    email: email,
    expires: Date.now() + 10 * 60 * 1000, // 10분 후 만료
    isVerified: false // 초기에는 미인증 상태
  };
  console.log('Verification data set in session:', req.session.verificationData);
  console.log('Session ID after setting code:', req.sessionID);
  console.log('Full req.session after setting code:', req.session);

  const message = `
    가계부 앱 회원가입을 위한 인증 코드입니다:
    
    인증 코드: ${verificationCode}
    
    이 코드는 10분 후에 만료됩니다.
  `;

  console.log('이메일 발송 시도 중...');
  try {
    const info = await sendEmail({
      email,
      subject: '이메일 인증 코드',
      message
    });

    console.log('이메일 발송 성공:', info);
    // 성공 응답 전에 세션 저장을 명시적으로 호출 (선택적, 대부분의 경우 자동 저장됨)
    // await new Promise((resolve, reject) => req.session.save(err => err ? reject(err) : resolve()));
    res.status(200).json({
      success: true,
      message: '이메일이 전송되었습니다.'
    });
  } catch (error) {
    console.error('이메일 발송 실패:', error);
    if (!res.headersSent) {
      return next(new ErrorResponse('이메일 발송에 실패했습니다. 나중에 다시 시도해주세요.', 500));
    } else {
      console.error('Error occurred after headers were sent in sendVerificationEmail:', error.message);
    }
  }
});

// @desc    이메일 인증 코드 확인
// @route   POST /api/auth/verify-email
// @access  Public
exports.verifyEmail = asyncHandler(async (req, res, next) => {
  console.log('--- verifyEmail ---');
  const { email, verificationCode } = req.body;
  console.log('req.body:', req.body);
  console.log('req.sessionID:', req.sessionID);

  const sessionData = req.session.verificationData;
  // 추가된 상세 로그 시작
  console.log('[VERIFY_EMAIL_DEBUG] Raw req.session.verificationData (JSON):', JSON.stringify(req.session.verificationData));
  console.log('[VERIFY_EMAIL_DEBUG] sessionData variable (JSON):', JSON.stringify(sessionData));

  if (sessionData) {
    console.log(`[VERIFY_EMAIL_DEBUG] sessionData.email: '${sessionData.email}' (type: ${typeof sessionData.email})`);
    console.log(`[VERIFY_EMAIL_DEBUG] email (from body): '${email}' (type: ${typeof email})`);
    console.log(`[VERIFY_EMAIL_DEBUG] sessionData.code: '${sessionData.code}' (type: ${typeof sessionData.code})`);
    console.log(`[VERIFY_EMAIL_DEBUG] verificationCode (from body): '${verificationCode}' (type: ${typeof verificationCode})`);
    console.log(`[VERIFY_EMAIL_DEBUG] sessionData.expires: ${sessionData.expires} (type: ${typeof sessionData.expires}), Date.now(): ${Date.now()}`);
    if (typeof sessionData.expires === 'number') {
      console.log(`[VERIFY_EMAIL_DEBUG] Expiry check: sessionData.expires > Date.now() is ${sessionData.expires > Date.now()} (Expires: ${new Date(sessionData.expires).toISOString()}, Now: ${new Date().toISOString()})`);
    }
  } else {
    console.log('[VERIFY_EMAIL_DEBUG] sessionData is null or undefined.');
  }
  // 추가된 상세 로그 끝

  if (
    sessionData &&
    sessionData.email === email &&
    sessionData.code === verificationCode &&
    sessionData.expires > Date.now()
  ) {
    req.session.verificationData.isVerified = true;
    // req.session.verificationData.code = undefined; // 인증 후 코드 삭제 (선택 사항)
    // req.session.verificationData.expires = undefined; // 인증 후 만료 시간 삭제 (선택 사항)
    console.log('Email verified successfully. sessionData updated:', JSON.stringify(req.session.verificationData));
    console.log('Full req.session after verification:', JSON.stringify(req.session));

    req.session.save(err => {
      if (err) {
        console.error('Session save error after verification:', err);
        return next(new ErrorResponse('세션 저장 중 오류가 발생했습니다.', 500));
      }
      console.log('Session saved successfully after verification.');
      res.status(200).json({ success: true, message: '이메일이 성공적으로 인증되었습니다.' });
    });
  } else {
    console.log('Verification failed. Detailed conditions:');
    if (!sessionData) {
      console.log('Reason: sessionData is missing.');
    } else {
      console.log(`- sessionData.email === email: ${sessionData.email === email} (Session: '${sessionData.email}', Body: '${email}')`);
      console.log(`- sessionData.code === verificationCode: ${sessionData.code === verificationCode} (Session code: '${sessionData.code}', Body code: '${verificationCode}')`);
      console.log(`- sessionData.expires > Date.now(): ${sessionData.expires > Date.now()} (Expires: ${sessionData.expires}, Now: ${Date.now()})`);
    }
    // 기존 로그 형식 유지 (참고용)
    // console.log('Verification failed. Comparing:');
    // console.log(`Expected email: ${sessionData ? sessionData.email : 'N/A'} , Got: ${email}`);
    // console.log(`Expected code: ${sessionData ? sessionData.code : 'N/A'} , Got: ${verificationCode}`);
    return next(new ErrorResponse('유효하지 않은 인증 코드입니다.', 400));
  }
});

// @desc    사용자 등록
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { username, email, password, verificationCode } = req.body;

  console.log('--- register ---');
  console.log('req.body:', req.body);
  console.log('req.sessionID:', req.sessionID);
  console.log('req.session (at register start):', req.session);

  const verification = req.session.verificationData;

  // 1. 세션에 인증 데이터가 있는지, 이메일이 일치하는지, 인증된 상태인지 확인
  if (!verification || verification.email !== email || !verification.isVerified) {
    console.error('Email not verified, or session data missing/mismatched.');
    console.error('Session verificationData:', verification);
    console.error('Request email:', email);
    return next(new ErrorResponse('이메일 인증이 완료되지 않았거나 세션 정보가 올바르지 않습니다.', 400));
  }

  // 2. 제출된 인증 코드가 세션의 코드와 일치하는지 확인
  if (verification.code !== verificationCode) {
    console.error('Submitted verification code does not match session.');
    console.error('Session code:', verification.code, 'Submitted code:', verificationCode);
    return next(new ErrorResponse('제출된 인증 코드가 올바르지 않습니다.', 400));
  }

  // 3. 인증 코드 만료 시간 재확인
  if (Date.now() > verification.expires) {
    // 만료 시 세션에서 해당 데이터 정리
    delete req.session.verificationData;
    // await new Promise((resolve, reject) => req.session.save(err => err ? reject(err) : resolve()));
    return next(new ErrorResponse('만료된 인증 코드입니다. 이메일 인증부터 다시 진행해주세요.', 400));
  }

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
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    return next(new ErrorResponse('비밀번호는 최소 8자 이상이며, 대문자, 숫자, 특수문자를 각각 하나 이상 포함해야 합니다.', 400));
  }

  // 사용자 생성
  const user = await User.create({
    username,
    email,
    password
  });

  // 회원가입 성공 후 세션에서 인증 관련 정보 정리
  delete req.session.verificationData;
  // await new Promise((resolve, reject) => req.session.save(err => err ? reject(err) : resolve()));
  console.log('User registered, session cleaned:', req.session);

  // 토큰 생성 및 응답
  sendTokenResponse(user, 201, res);
});

// @desc    사용자 로그인
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  console.log('[LOGIN_ATTEMPT] req.body:', req.body); // <--- Add this log
  const { usernameOrEmail, password } = req.body; // usernameOrEmail로 받음
  const email = usernameOrEmail; // 우선 email 변수에 할당 (추후 username도 고려)

  if (!email || !password) { // 이제 email 변수는 usernameOrEmail 값을 가짐
    return next(new ErrorResponse('이메일과 비밀번호를 모두 입력해주세요.', 400));
  }

  // 이메일 또는 사용자 이름으로 찾도록 수정
  const user = await User.findOne({
    where: {
      [Op.or]: [
        { email: email },
        { username: email } // 클라이언트가 username을 보냈을 경우를 대비
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

  // 로그인 성공 시 정보 업데이트
  user.failed_login_attempts = 0;
  user.account_locked = false;
  user.last_login = Date.now();
  await user.save({ validateBeforeSave: false });

  // 토큰 생성 및 응답 
  sendTokenResponse(user, 200, res);
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

  // 새 비밀번호 유효성 검사 (8자로 변경)
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(newPassword)) {
    return next(new ErrorResponse('비밀번호는 최소 8자 이상이며, 대문자, 숫자, 특수문자를 각각 하나 이상 포함해야 합니다.', 400));
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
// @route   PUT /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // 토큰 해시화
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  // 토큰과 만료 시간 확인
  const user = await User.findOne({
    where:
      resetPasswordToken: resetPasswordToken,
      resetPasswordExpire: { [Op.gt]: Date.now() }
    }
  });

  if (!user) {
    return next(new ErrorResponse('유효하지 않거나 만료된 토큰입니다.', 400));
  }

  // 비밀번호 강도 검증 (register 함수와 동일한 로직, 8자로 변경)
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za

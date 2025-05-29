// server/controllers/authController.js
const { sequelize } = require('../config/db');
const { QueryTypes } = require('sequelize');
const { generateVerificationCode, sendVerificationEmail } = require('../utils/emailService');

// 인증 코드 저장을 위한 메모리 저장소 (실제 프로덕션에서는 Redis 등 사용 권장)
const verificationCodes = new Map();

// 이메일 인증 코드 발송
exports.sendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: '이메일 주소를 입력해주세요.' 
      });
    }

    // 인증 코드 생성
    const code = generateVerificationCode();
    
    // 인증 코드 저장 (5분 후 만료)
    verificationCodes.set(email, {
      code,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    });
    
    // 5분 후 자동 삭제
    setTimeout(() => {
      verificationCodes.delete(email);
    }, 5 * 60 * 1000);

    // 이메일 발송
    const result = await sendVerificationEmail(email, code);
    
    if (result.success) {
      return res.status(200).json({
        success: true,
        message: '인증 코드가 이메일로 발송되었습니다.'
      });
    } else {
      throw new Error(result.error || '이메일 발송 실패');
    }
  } catch (error) {
    console.error('인증 코드 발송 오류:', error);
    res.status(500).json({
      success: false,
      message: '인증 코드 발송 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 이메일 인증 코드 확인
exports.verifyEmailCode = (req, res) => {
  try {
    const { email, code } = req.body;
    
    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: '이메일과 인증 코드를 모두 입력해주세요.'
      });
    }
    
    const verification = verificationCodes.get(email);
    
    // 인증 코드 없음
    if (!verification) {
      return res.status(400).json({
        success: false,
        message: '인증 코드가 만료되었거나 발급되지 않았습니다.'
      });
    }
    
    // 인증 코드 만료
    if (new Date() > verification.expiresAt) {
      verificationCodes.delete(email);
      return res.status(400).json({
        success: false,
        message: '인증 코드가 만료되었습니다. 다시 요청해주세요.'
      });
    }
    
    // 인증 코드 일치 여부
    if (verification.code !== code) {
      return res.status(400).json({
        success: false,
        message: '인증 코드가 일치하지 않습니다.'
      });
    }
    
    // 인증 성공 시 삭제
    verificationCodes.delete(email);
    
    return res.status(200).json({
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

// 아이디 중복 확인
exports.checkUsername = async (req, res) => {
    try {
        const { username } = req.query;
        
        // 데이터베이스에서 사용자 확인
        const users = await sequelize.query(
            'SELECT id FROM users WHERE username = :username',
            {
                replacements: { username },
                type: QueryTypes.SELECT
            }
        );
        
        res.json({
            available: users.length === 0,
            message: users.length > 0 ? '이미 사용 중인 아이디입니다.' : '사용 가능한 아이디입니다.'
        });
    } catch (error) {
        console.error('아이디 중복 확인 오류:', error);
        res.status(500).json({
            available: false,
            message: '아이디 확인 중 오류가 발생했습니다.'
        });
    }
};

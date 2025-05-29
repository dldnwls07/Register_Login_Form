// server/models/User.js
const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [3, 50]
    }
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user'
  },
  resetPasswordToken: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  resetPasswordExpire: {
    type: DataTypes.DATE,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  failed_login_attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  account_locked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  hooks: {
    // 사용자 저장 전 비밀번호 해싱
    beforeSave: async (user) => {
      // 비밀번호가 변경된 경우만 해싱
      if (!user.changed('password')) return;
      
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
  },
  timestamps: true
});

// 비밀번호 일치 확인 메서드
User.prototype.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// JWT 토큰 발급 메서드
User.prototype.getSignedJwtToken = function() {
  return jwt.sign(
    { 
      id: this.id,
      username: this.username,
      role: this.role 
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE
    }
  );
};

// 비밀번호 재설정 토큰 생성
User.prototype.getResetPasswordToken = function() {
  // 무작위 토큰 생성
  const resetToken = crypto.randomBytes(20).toString('hex');

  // 토큰 해싱 및 저장
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // 토큰 만료 시간 설정 (10분)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

module.exports = User;

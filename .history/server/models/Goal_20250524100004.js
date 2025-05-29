// server/models/Goal.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const Goal = sequelize.define('Goal', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  target: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      notNull: { msg: '목표 금액은 필수 입력 항목입니다.' }
    }
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notNull: { msg: '목표 제목은 필수 입력 항목입니다.' }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  current: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true
});

// 관계 설정
Goal.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Goal, { foreignKey: 'userId' });

module.exports = Goal;

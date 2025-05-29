// server/models/Transaction.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const Transaction = sequelize.define('Transaction', {
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
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      notNull: { msg: '금액은 필수 입력 항목입니다.' }
    }
  },
  type: {
    type: DataTypes.ENUM('income', 'expense'),
    allowNull: false,
    validate: {
      notNull: { msg: '거래 유형은 필수 입력 항목입니다.' }
    }
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notNull: { msg: '카테고리는 필수 입력 항목입니다.' }
    }
  },
  description: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    validate: {
      notNull: { msg: '날짜는 필수 입력 항목입니다.' }
    }
  }
}, {
  timestamps: true
});

// 관계 설정
Transaction.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Transaction, { foreignKey: 'userId' });

module.exports = Transaction;

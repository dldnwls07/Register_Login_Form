// server/models/Category.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notNull: { msg: '카테고리 이름은 필수 입력 항목입니다.' }
    }
  },
  type: {
    type: DataTypes.ENUM('income', 'expense'),
    allowNull: false
  },
  color: {
    type: DataTypes.STRING(7),
    allowNull: true,
    defaultValue: '#7986CB',
    validate: {
      is: /^#[0-9A-F]{6}$/i
    }
  },
  icon: {
    type: DataTypes.STRING(30),
    allowNull: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: User,
      key: 'id'
    }
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true
});

// 관계 설정
Category.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Category, { foreignKey: 'userId' });

module.exports = Category;

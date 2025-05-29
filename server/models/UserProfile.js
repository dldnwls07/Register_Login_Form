const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const UserProfile = sequelize.define('UserProfile', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  displayName: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  preferences: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {
      notifications: false,
      darkMode: false,
      language: 'ko'
    }
  },
  theme: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      primaryColor: '#3F51B5',
      fontSize: 'normal'
    }
  },
  lastUpdated: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'user_profiles',
  timestamps: true
});

// User 모델과의 관계 설정
const User = require('./User');
UserProfile.belongsTo(User, { foreignKey: 'userId' });
User.hasOne(UserProfile, { foreignKey: 'userId' });

module.exports = UserProfile;

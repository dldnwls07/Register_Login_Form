const User = require('./User');
const UserProfile = require('./UserProfile');

// Associations
User.hasOne(UserProfile, {
    foreignKey: 'userId',
    as: 'profile'
});

UserProfile.belongsTo(User, {
    foreignKey: 'userId'
});

module.exports = {
    User,
    UserProfile
};

const { sequelize } = require('../config/db');
const User = require('../models/User');
const UserProfile = require('../models/UserProfile');

async function initializeProfiles() {
  try {
    // UserProfile 테이블 생성
    await UserProfile.sync();

    // 기존 사용자들의 프로필 생성
    const users = await User.findAll();
    
    for (const user of users) {
      const existingProfile = await UserProfile.findOne({
        where: { userId: user.id }
      });

      if (!existingProfile) {
        await UserProfile.create({
          userId: user.id,
          displayName: user.username,
          preferences: {
            notifications: false,
            darkMode: false,
            language: 'ko'
          }
        });
        console.log(`Created profile for user: ${user.username}`);
      }
    }

    console.log('Profile initialization completed successfully');
  } catch (error) {
    console.error('Profile initialization failed:', error);
    throw error;
  }
}

initializeProfiles()
  .then(() => {
    console.log('Migration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });

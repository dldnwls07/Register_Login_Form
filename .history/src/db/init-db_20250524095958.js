// src/db/init-db.js
const { sequelize } = require('../../server/config/db');
const User = require('../../server/models/User');
const Transaction = require('../../server/models/Transaction');
const Category = require('../../server/models/Category');
const Goal = require('../../server/models/Goal');

// 데이터베이스 초기화 (모델 동기화)
const initializeDB = async () => {
  try {
    // 모델 간 관계 설정 확인

    // 데이터베이스와 테이블 동기화
    await sequelize.sync({ alter: true });
    console.log('데이터베이스 동기화 완료');

    // 기본 카테고리 생성 (아직 카테고리가 없는 경우)
    const categoriesCount = await Category.count({ where: { isDefault: true } });
    
    if (categoriesCount === 0) {
      console.log('기본 카테고리 생성 중...');
      
      const defaultCategories = [
        // 수입 카테고리
        { name: '급여', type: 'income', color: '#4CAF50', icon: 'money', isDefault: true },
        { name: '용돈', type: 'income', color: '#2196F3', icon: 'gift', isDefault: true },
        { name: '투자수익', type: 'income', color: '#9C27B0', icon: 'trending_up', isDefault: true },
        { name: '부수입', type: 'income', color: '#FF9800', icon: 'add_circle', isDefault: true },
        { name: '환불', type: 'income', color: '#795548', icon: 'replay', isDefault: true },
        // 지출 카테고리
        { name: '식비', type: 'expense', color: '#F44336', icon: 'restaurant', isDefault: true },
        { name: '교통비', type: 'expense', color: '#3F51B5', icon: 'directions_car', isDefault: true },
        { name: '쇼핑', type: 'expense', color: '#E91E63', icon: 'shopping_cart', isDefault: true },
        { name: '생활용품', type: 'expense', color: '#009688', icon: 'home', isDefault: true },
        { name: '의료/건강', type: 'expense', color: '#8BC34A', icon: 'healing', isDefault: true },
        { name: '여가활동', type: 'expense', color: '#FF5722', icon: 'sports_esports', isDefault: true },
        { name: '교육', type: 'expense', color: '#673AB7', icon: 'school', isDefault: true },
        { name: '통신비', type: 'expense', color: '#03A9F4', icon: 'phone', isDefault: true },
        { name: '공과금', type: 'expense', color: '#607D8B', icon: 'receipt', isDefault: true },
        { name: '기타', type: 'expense', color: '#9E9E9E', icon: 'more_horiz', isDefault: true }
      ];
      
      await Category.bulkCreate(defaultCategories);
      console.log(`${defaultCategories.length}개의 기본 카테고리가 생성되었습니다.`);
    }

    console.log('데이터베이스 초기화 완료');
    return true;
  } catch (error) {
    console.error('데이터베이스 초기화 오류:', error);
    return false;
  }
};

// 직접 실행할 경우
if (require.main === module) {
  // 환경 변수 로드
  require('dotenv').config({ path: '../../server/config/config.env' });
  
  initializeDB()
    .then(() => {
      console.log('데이터베이스 설정이 완료되었습니다.');
      process.exit(0);
    })
    .catch(err => {
      console.error('오류 발생:', err);
      process.exit(1);
    });
}

module.exports = initializeDB;

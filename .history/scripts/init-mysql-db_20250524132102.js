// MySQL 모델 초기화 스크립트
require('dotenv').config({ path: './server/config/config.env' });
const { sequelize } = require('../server/config/db');
const User = require('../server/models/User');
const Transaction = require('../server/models/Transaction');
const Category = require('../server/models/Category');
const Goal = require('../server/models/Goal');

async function initializeDatabase() {
  try {
    console.log('MySQL 데이터베이스 초기화 중...');

    // 데이터베이스 연결 확인
    await sequelize.authenticate();
    console.log('데이터베이스 연결 성공');

    // 모델 동기화 (테이블 생성)
    console.log('테이블 생성 중...');
    await sequelize.sync({ force: true });  // 주의: force:true는 기존 테이블을 삭제합니다

    // 기본 카테고리 생성
    console.log('기본 카테고리 생성 중...');
    await createDefaultCategories();

    // 테스트 계정 생성 (선택 사항)
    if (process.env.NODE_ENV === 'development') {
      await createTestUser();
    }

    console.log('데이터베이스 초기화 완료');
    return true;
  } catch (error) {
    console.error('데이터베이스 초기화 실패:', error);
    return false;
  }
}

// 기본 카테고리 생성 함수
async function createDefaultCategories() {
  const defaultCategories = [
    // 수입 카테고리
    { name: '급여', type: 'income', color: '#4CAF50', icon: 'money', isDefault: true },
    { name: '용돈', type: 'income', color: '#2196F3', icon: 'gift', isDefault: true },
    { name: '투자수익', type: 'income', color: '#9C27B0', icon: 'trending_up', isDefault: true },
    { name: '부수입', type: 'income', color: '#FF9800', icon: 'add_circle', isDefault: true },
    
    // 지출 카테고리
    { name: '식비', type: 'expense', color: '#F44336', icon: 'restaurant', isDefault: true },
    { name: '교통비', type: 'expense', color: '#3F51B5', icon: 'directions_car', isDefault: true },
    { name: '쇼핑', type: 'expense', color: '#E91E63', icon: 'shopping_cart', isDefault: true },
    { name: '생활용품', type: 'expense', color: '#009688', icon: 'home', isDefault: true },
    { name: '의료/건강', type: 'expense', color: '#8BC34A', icon: 'healing', isDefault: true },
    { name: '여가활동', type: 'expense', color: '#FF5722', icon: 'sports_esports', isDefault: true },
    { name: '교육', type: 'expense', color: '#673AB7', icon: 'school', isDefault: true },
    { name: '통신비', type: 'expense', color: '#03A9F4', icon: 'phone', isDefault: true },
  ];

  await Category.bulkCreate(defaultCategories);
  console.log(`${defaultCategories.length}개의 기본 카테고리 생성 완료`);
}

// 테스트 계정 생성 함수 (개발 환경에서만 사용)
async function createTestUser() {
  try {
    const testUser = await User.create({
      username: 'test',
      email: 'test@example.com',
      password: 'Test12345!', // 실제 환경에서는 복잡한 비밀번호 사용
      role: 'user'
    });
    
    console.log('테스트 계정 생성 완료:', testUser.username);
  } catch (error) {
    console.error('테스트 계정 생성 실패:', error);
  }
}

// 직접 실행 시
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('스크립트 실행 완료');
      process.exit(0);
    })
    .catch(err => {
      console.error('스크립트 실행 중 오류 발생:', err);
      process.exit(1);
    });
}

module.exports = initializeDatabase;

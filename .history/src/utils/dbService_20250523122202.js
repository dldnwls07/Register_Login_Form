/**
 * 데이터베이스 서비스 - 브라우저 환경에서 localStorage를 사용하여 DB 기능 대체
 * 
 * 브라우저에서 Node.js 모듈 로딩 문제를 해결하기 위한 대체 구현입니다.
 * 주의: 이 파일은 프로덕션 환경에서 사용하기 위한 것이 아니며,
 * 개발 환경에서만 사용해야 합니다.
 */

// localStorage 키 정의
const DB_KEYS = {
  transactions: 'db_transactions',
  categories: {
    main: 'db_main_categories',
    sub: 'db_sub_categories',
    detail: 'db_detail_categories'
  },
  goals: 'db_financial_goals'
};

// 더미 데이터 초기화 (카테고리 등)
const initializeDummyData = () => {
  // 메인 카테고리가 없으면 기본 카테고리 생성
  if (!localStorage.getItem(DB_KEYS.categories.main)) {
    const mainCategories = [
      { id: 1, name: '생활 필수비' },
      { id: 2, name: '소비/여가/취미' },
      { id: 3, name: '업무/비즈니스' },
      { id: 4, name: '가족/가정' },
      { id: 5, name: '금융/투자' },
      { id: 6, name: '기타' }
    ];
    localStorage.setItem(DB_KEYS.categories.main, JSON.stringify(mainCategories));

    // 샘플 서브 카테고리
    const subCategories = [
      { id: 1, main_category_id: 1, name: '식비' },
      { id: 2, main_category_id: 1, name: '주거비' },
      { id: 3, main_category_id: 2, name: '쇼핑' },
      { id: 4, main_category_id: 2, name: '외식/카페' },
      { id: 5, main_category_id: 3, name: '사무/운영비' }
    ];
    localStorage.setItem(DB_KEYS.categories.sub, JSON.stringify(subCategories));

    // 샘플 디테일 카테고리
    const detailCategories = [
      { id: 1, sub_category_id: 1, name: '식료품' },
      { id: 2, sub_category_id: 1, name: '간식' },
      { id: 3, sub_category_id: 2, name: '월세' },
      { id: 4, sub_category_id: 3, name: '의류' },
      { id: 5, sub_category_id: 4, name: '외식' }
    ];
    localStorage.setItem(DB_KEYS.categories.detail, JSON.stringify(detailCategories));
  }

  // 트랜잭션 초기화
  if (!localStorage.getItem(DB_KEYS.transactions)) {
    localStorage.setItem(DB_KEYS.transactions, JSON.stringify([]));
  }

  // 재정 목표 초기화
  if (!localStorage.getItem(DB_KEYS.goals)) {
    localStorage.setItem(DB_KEYS.goals, JSON.stringify([]));
  }
};

// 초기 데이터 로드
initializeDummyData();

// 유틸리티 함수
const getNextId = (items) => {
  if (!items || items.length === 0) return 1;
  return Math.max(...items.map(item => item.id)) + 1;
};

/**
 * 모든 대분류 카테고리 가져오기
 * @returns {Promise<Array>} - 대분류 카테고리 목록
 */
export async function getMainCategories() {
  return new Promise((resolve) => {
    const categories = JSON.parse(localStorage.getItem(DB_KEYS.categories.main) || '[]');
    resolve(categories);
  });
}

/**
 * 특정 대분류에 해당하는 중분류 카테고리 가져오기
 * @param {number} mainCategoryId - 대분류 ID
 * @returns {Promise<Array>} - 중분류 카테고리 목록
 */
export async function getSubCategories(mainCategoryId) {
  return new Promise((resolve) => {
    const categories = JSON.parse(localStorage.getItem(DB_KEYS.categories.sub) || '[]');
    resolve(categories.filter(cat => cat.main_category_id === mainCategoryId));
  });
}

/**
 * 특정 중분류에 해당하는 소분류 카테고리 가져오기
 * @param {number} subCategoryId - 중분류 ID
 * @returns {Promise<Array>} - 소분류 카테고리 목록
 */
export async function getDetailCategories(subCategoryId) {
  return new Promise((resolve) => {
    const categories = JSON.parse(localStorage.getItem(DB_KEYS.categories.detail) || '[]');
    resolve(categories.filter(cat => cat.sub_category_id === subCategoryId));
  });
}

/**
 * 새 지출 항목 추가
 * @param {Object} transaction - 지출 항목 데이터
 * @param {number} userId - 사용자 ID
 * @returns {Promise<Object>} - 추가된 항목 데이터와 ID
 */
export async function addTransaction(transaction, userId) {
  return new Promise((resolve) => {
    const { detailCategoryId, amount, date, memo } = transaction;
    const transactions = JSON.parse(localStorage.getItem(DB_KEYS.transactions) || '[]');
    
    // 새 트랜잭션 생성
    const newTransaction = {
      id: getNextId(transactions),
      user_id: userId,
      detail_category_id: detailCategoryId,
      amount: parseFloat(amount),
      date,
      memo,
      created_at: new Date().toISOString()
    };
    
    transactions.push(newTransaction);
    localStorage.setItem(DB_KEYS.transactions, JSON.stringify(transactions));
    
    resolve({ id: newTransaction.id, ...transaction });
  });
}

/**
 * 지출 항목 목록 가져오기 (필터링 가능)
 * @param {Object} filters - 필터 조건 (시작일, 종료일, 카테고리 등)
 * @param {number} userId - 사용자 ID
 * @returns {Promise<Array>} - 지출 항목 목록
 */
export async function getTransactions(filters = {}, userId) {
  return new Promise((resolve) => {
    const { startDate, endDate, detailCategoryId, subCategoryId, mainCategoryId } = filters;
    let transactions = JSON.parse(localStorage.getItem(DB_KEYS.transactions) || '[]');
    
    // 사용자 필터링
    transactions = transactions.filter(t => t.user_id === userId);
    
    // 날짜 필터링
    if (startDate) {
      transactions = transactions.filter(t => t.date >= startDate);
    }
    
    if (endDate) {
      transactions = transactions.filter(t => t.date <= endDate);
    }
    
    // 카테고리 필터링
    if (detailCategoryId) {
      transactions = transactions.filter(t => t.detail_category_id === detailCategoryId);
    }
    
    // 카테고리 정보 추가
    const detailCategories = JSON.parse(localStorage.getItem(DB_KEYS.categories.detail) || '[]');
    const subCategories = JSON.parse(localStorage.getItem(DB_KEYS.categories.sub) || '[]');
    const mainCategories = JSON.parse(localStorage.getItem(DB_KEYS.categories.main) || '[]');
    
    // 상세 정보가 포함된 트랜잭션 데이터 생성
    const enrichedTransactions = transactions.map(t => {
      const detailCategory = detailCategories.find(d => d.id === t.detail_category_id) || {};
      const subCategory = subCategories.find(s => s.id === detailCategory.sub_category_id) || {};
      const mainCategory = mainCategories.find(m => m.id === subCategory.main_category_id) || {};
      
      return {
        ...t,
        detail_name: detailCategory.name || '분류 없음',
        sub_name: subCategory.name || '분류 없음',
        main_name: mainCategory.name || '분류 없음'
      };
    });
    
    // 중분류 필터링
    if (subCategoryId) {
      const subCatDetailIds = detailCategories
        .filter(d => d.sub_category_id === subCategoryId)
        .map(d => d.id);
      
      transactions = enrichedTransactions.filter(t => 
        subCatDetailIds.includes(t.detail_category_id)
      );
    }
    // 대분류 필터링
    else if (mainCategoryId) {
      const mainCatSubIds = subCategories
        .filter(s => s.main_category_id === mainCategoryId)
        .map(s => s.id);
      
      const mainCatDetailIds = detailCategories
        .filter(d => mainCatSubIds.includes(d.sub_category_id))
        .map(d => d.id);
      
      transactions = enrichedTransactions.filter(t => 
        mainCatDetailIds.includes(t.detail_category_id)
      );
    } else {
      transactions = enrichedTransactions;
    }
    
    // 날짜 내림차순 정렬
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    resolve(transactions);
  });
}

/**
 * 카테고리별 지출 합계 분석
 * @param {Object} filters - 필터 조건 (시작일, 종료일 등)
 * @param {string} groupBy - 그룹화 기준 ('main', 'sub', 'detail')
 * @param {number} userId - 사용자 ID
 * @returns {Promise<Array>} - 카테고리별 지출 합계
 */
export async function getSpendingByCategory(filters = {}, groupBy = 'main', userId) {
  // 트랜잭션 가져오기
  const transactions = await getTransactions(filters, userId);
  
  // 카테고리 데이터 로드
  const detailCategories = JSON.parse(localStorage.getItem(DB_KEYS.categories.detail) || '[]');
  const subCategories = JSON.parse(localStorage.getItem(DB_KEYS.categories.sub) || '[]');
  const mainCategories = JSON.parse(localStorage.getItem(DB_KEYS.categories.main) || '[]');
    // 그룹화 기준에 따라 데이터 집계
  if (groupBy === 'main') {
    // 메인 카테고리별 집계
    const spendingByMain = {};
    
    transactions.forEach(t => {
      const detailCategory = detailCategories.find(d => d.id === t.detail_category_id)
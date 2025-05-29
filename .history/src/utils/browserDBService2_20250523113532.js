/**
 * 지출 항목 목록 가져오기 (필터링 가능)
 * @param {Object} filters - 필터 조건 (시작일, 종료일, 카테고리 등)
 * @param {number} userId - 사용자 ID
 * @returns {Promise<Array>} - 지출 항목 목록
 */
export async function getTransactions(filters = {}, userId) {
  return new Promise((resolve) => {
    const { startDate, endDate, detailCategoryId, subCategoryId, mainCategoryId } = filters;
    let transactions = JSON.parse(localStorage.getItem('db_transactions') || '[]');
    
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
    const detailCategories = JSON.parse(localStorage.getItem('db_detail_categories') || '[]');
    const subCategories = JSON.parse(localStorage.getItem('db_sub_categories') || '[]');
    const mainCategories = JSON.parse(localStorage.getItem('db_main_categories') || '[]');
    
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
  const detailCategories = JSON.parse(localStorage.getItem('db_detail_categories') || '[]');
  const subCategories = JSON.parse(localStorage.getItem('db_sub_categories') || '[]');
  const mainCategories = JSON.parse(localStorage.getItem('db_main_categories') || '[]');
  
  // 그룹화 기준에 따라 데이터 집계
  if (groupBy === 'main') {
    // 메인 카테고리별 집계
    const spendingByMain = {};
    
    transactions.forEach(t => {
      const detailCategory = detailCategories.find(d => d.id === t.detail_category_id);
      if (!detailCategory) return;
      
      const subCategory = subCategories.find(s => s.id === detailCategory.sub_category_id);
      if (!subCategory) return;
      
      const mainCategory = mainCategories.find(m => m.id === subCategory.main_category_id);
      if (!mainCategory) return;
      
      if (!spendingByMain[mainCategory.id]) {
        spendingByMain[mainCategory.id] = {
          id: mainCategory.id,
          name: mainCategory.name,
          total: 0
        };
      }
      
      spendingByMain[mainCategory.id].total += parseFloat(t.amount);
    });
    
    // 객체를 배열로 변환
    const result = Object.values(spendingByMain);
    // 총액으로 정렬
    result.sort((a, b) => b.total - a.total);
    
    return result;
  } 
  else if (groupBy === 'sub') {
    // 서브 카테고리별 집계
    const spendingBySub = {};
    
    transactions.forEach(t => {
      const detailCategory = detailCategories.find(d => d.id === t.detail_category_id);
      if (!detailCategory) return;
      
      const subCategory = subCategories.find(s => s.id === detailCategory.sub_category_id);
      if (!subCategory) return;
      
      const mainCategory = mainCategories.find(m => m.id === subCategory.main_category_id);
      if (!mainCategory) return;
      
      if (!spendingBySub[subCategory.id]) {
        spendingBySub[subCategory.id] = {
          id: subCategory.id,
          name: subCategory.name,
          main_name: mainCategory.name,
          total: 0
        };
      }
      
      spendingBySub[subCategory.id].total += parseFloat(t.amount);
    });
    
    // 객체를 배열로 변환하고 정렬
    const result = Object.values(spendingBySub);
    result.sort((a, b) => b.total - a.total);
    
    return result;
  } 
  else {
    // 상세 카테고리별 집계
    const spendingByDetail = {};
    
    transactions.forEach(t => {
      const detailCategory = detailCategories.find(d => d.id === t.detail_category_id);
      if (!detailCategory) return;
      
      const subCategory = subCategories.find(s => s.id === detailCategory.sub_category_id);
      if (!subCategory) return;
      
      const mainCategory = mainCategories.find(m => m.id === subCategory.main_category_id);
      if (!mainCategory) return;
      
      if (!spendingByDetail[detailCategory.id]) {
        spendingByDetail[detailCategory.id] = {
          id: detailCategory.id,
          name: detailCategory.name,
          sub_name: subCategory.name,
          main_name: mainCategory.name,
          total: 0
        };
      }
      
      spendingByDetail[detailCategory.id].total += parseFloat(t.amount);
    });
    
    // 객체를 배열로 변환하고 정렬
    const result = Object.values(spendingByDetail);
    result.sort((a, b) => b.total - a.total);
    
    return result;
  }
}

/**
 * 재정 목표 설정
 * @param {Object} goal - 목표 데이터
 * @param {number} userId - 사용자 ID
 * @returns {Promise<Object>} - 추가된 목표 데이터와 ID
 */
export async function setFinancialGoal(goal, userId) {
  return new Promise((resolve) => {
    const { amount, startDate, endDate, isAchieved } = goal;
    const goals = JSON.parse(localStorage.getItem('db_financial_goals') || '[]');
    
    // 유틸리티 함수 내장
    const getNextId = (items) => {
      if (!items || items.length === 0) return 1;
      return Math.max(...items.map(item => item.id)) + 1;
    };
    
    const newGoal = {
      id: getNextId(goals),
      user_id: userId,
      amount: parseFloat(amount),
      start_date: startDate,
      end_date: endDate,
      is_achieved: isAchieved || false,
      created_at: new Date().toISOString()
    };
    
    goals.push(newGoal);
    localStorage.setItem('db_financial_goals', JSON.stringify(goals));
    
    resolve({ id: newGoal.id, ...goal });
  });
}

/**
 * 현재 활성화된 재정 목표 가져오기
 * @param {number} userId - 사용자 ID
 * @returns {Promise<Object>} - 활성화된 재정 목표
 */
export async function getCurrentGoal(userId) {
  return new Promise((resolve) => {
    const goals = JSON.parse(localStorage.getItem('db_financial_goals') || '[]');
    const today = new Date().toISOString().split('T')[0];
    
    const activeGoals = goals.filter(g => 
      g.user_id === userId && 
      g.start_date <= today && 
      g.end_date >= today
    );
    
    // 가장 최근에 생성된 목표 반환
    if (activeGoals.length > 0) {
      activeGoals.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      resolve(activeGoals[0]);
    } else {
      resolve(null);
    }
  });
}

/**
 * 데이터베이스 연결 테스트 (브라우저 환경에서는 항상 성공)
 * @returns {Promise<boolean>} - 연결 성공 여부
 */
export async function testConnection() {
  return Promise.resolve(true);
}

/**
 * 쿼리 실행 함수 (브라우저 환경에서는 직접적인 구현을 하지 않음)
 * @param {string} sql - SQL 쿼리 (브라우저에서는 무시됨)
 * @param {Array} params - 쿼리 파라미터 (브라우저에서는 무시됨)
 * @returns {Promise} - 쿼리 결과
 */
export async function executeQuery(sql, params = []) {
  console.warn('executeQuery는 브라우저 환경에서 직접 실행되지 않습니다.');
  return Promise.resolve([]);
}

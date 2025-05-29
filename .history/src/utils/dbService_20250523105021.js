/**
 * MySQL 데이터베이스 연결 및 쿼리 유틸리티
 */

// MySQL 클라이언트 설정
// 참고: 실제 사용을 위해서는 mysql2 패키지를 설치해야 합니다.
// npm install mysql2

import mysql from 'mysql2/promise';

// 데이터베이스 연결 설정
const dbConfig = {
  host: 'localhost',
  user: 'root',     // 사용자 환경에 맞게 수정 필요
  password: '',     // 사용자 환경에 맞게 수정 필요
  database: 'money_app_db',  // 데이터베이스 이름
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// 연결 풀 생성
const pool = mysql.createPool(dbConfig);

/**
 * 쿼리 실행 함수
 * @param {string} sql - SQL 쿼리
 * @param {Array} params - 쿼리 파라미터 (준비된 명령문에 바인딩할 값들)
 * @returns {Promise} - 쿼리 결과
 */
export async function executeQuery(sql, params = []) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('데이터베이스 쿼리 오류:', error);
    throw error;
  }
}

/**
 * 모든 대분류 카테고리 가져오기
 * @returns {Promise<Array>} - 대분류 카테고리 목록
 */
export async function getMainCategories() {
  return executeQuery('SELECT * FROM main_categories ORDER BY name');
}

/**
 * 특정 대분류에 해당하는 중분류 카테고리 가져오기
 * @param {number} mainCategoryId - 대분류 ID
 * @returns {Promise<Array>} - 중분류 카테고리 목록
 */
export async function getSubCategories(mainCategoryId) {
  return executeQuery(
    'SELECT * FROM sub_categories WHERE main_category_id = ? ORDER BY name',
    [mainCategoryId]
  );
}

/**
 * 특정 중분류에 해당하는 소분류 카테고리 가져오기
 * @param {number} subCategoryId - 중분류 ID
 * @returns {Promise<Array>} - 소분류 카테고리 목록
 */
export async function getDetailCategories(subCategoryId) {
  return executeQuery(
    'SELECT * FROM detail_categories WHERE sub_category_id = ? ORDER BY name',
    [subCategoryId]
  );
}

/**
 * 새 지출 항목 추가
 * @param {Object} transaction - 지출 항목 데이터
 * @param {number} userId - 사용자 ID
 * @returns {Promise<Object>} - 추가된 항목 데이터와 ID
 */
export async function addTransaction(transaction, userId) {
  const { detailCategoryId, amount, date, memo } = transaction;
  
  const result = await executeQuery(
    'INSERT INTO transactions (user_id, detail_category_id, amount, date, memo) VALUES (?, ?, ?, ?, ?)',
    [userId, detailCategoryId, amount, date, memo]
  );
  
  return { id: result.insertId, ...transaction };
}

/**
 * 지출 항목 목록 가져오기 (필터링 가능)
 * @param {Object} filters - 필터 조건 (시작일, 종료일, 카테고리 등)
 * @param {number} userId - 사용자 ID
 * @returns {Promise<Array>} - 지출 항목 목록
 */
export async function getTransactions(filters = {}, userId) {
  const { startDate, endDate, detailCategoryId, subCategoryId, mainCategoryId } = filters;
  
  let sql = `
    SELECT t.*, dc.name as detail_name, sc.name as sub_name, mc.name as main_name
    FROM transactions t
    LEFT JOIN detail_categories dc ON t.detail_category_id = dc.id
    LEFT JOIN sub_categories sc ON dc.sub_category_id = sc.id
    LEFT JOIN main_categories mc ON sc.main_category_id = mc.id
    WHERE t.user_id = ?
  `;
  
  const params = [userId];
  
  if (startDate) {
    sql += ' AND t.date >= ?';
    params.push(startDate);
  }
  
  if (endDate) {
    sql += ' AND t.date <= ?';
    params.push(endDate);
  }
  
  if (detailCategoryId) {
    sql += ' AND t.detail_category_id = ?';
    params.push(detailCategoryId);
  }
  
  if (subCategoryId) {
    sql += ' AND dc.sub_category_id = ?';
    params.push(subCategoryId);
  }
  
  if (mainCategoryId) {
    sql += ' AND sc.main_category_id = ?';
    params.push(mainCategoryId);
  }
  
  sql += ' ORDER BY t.date DESC';
  
  return executeQuery(sql, params);
}

/**
 * 카테고리별 지출 합계 분석
 * @param {Object} filters - 필터 조건 (시작일, 종료일 등)
 * @param {string} groupBy - 그룹화 기준 ('main', 'sub', 'detail')
 * @returns {Promise<Array>} - 카테고리별 지출 합계
 */
export async function getSpendingByCategory(filters = {}, groupBy = 'main') {
  const { startDate, endDate } = filters;
  
  let selectClause, groupClause;
  
  if (groupBy === 'main') {
    selectClause = 'mc.id, mc.name, SUM(t.amount) as total';
    groupClause = 'mc.id, mc.name';
  } else if (groupBy === 'sub') {
    selectClause = 'sc.id, sc.name, mc.name as main_name, SUM(t.amount) as total';
    groupClause = 'sc.id, sc.name, mc.name';
  } else {
    selectClause = 'dc.id, dc.name, sc.name as sub_name, mc.name as main_name, SUM(t.amount) as total';
    groupClause = 'dc.id, dc.name, sc.name, mc.name';
  }
  
  let sql = `
    SELECT ${selectClause}
    FROM transactions t
    LEFT JOIN detail_categories dc ON t.detail_category_id = dc.id
    LEFT JOIN sub_categories sc ON dc.sub_category_id = sc.id
    LEFT JOIN main_categories mc ON sc.main_category_id = mc.id
    WHERE 1=1
  `;
  
  const params = [];
  
  if (startDate) {
    sql += ' AND t.date >= ?';
    params.push(startDate);
  }
  
  if (endDate) {
    sql += ' AND t.date <= ?';
    params.push(endDate);
  }
  
  sql += ` GROUP BY ${groupClause} ORDER BY total DESC`;
  
  return executeQuery(sql, params);
}

/**
 * 재정 목표 설정
 * @param {Object} goal - 목표 데이터
 * @returns {Promise<Object>} - 추가된 목표 데이터와 ID
 */
export async function setFinancialGoal(goal) {
  const { amount, startDate, endDate, isAchieved } = goal;
  
  const result = await executeQuery(
    'INSERT INTO financial_goals (amount, start_date, end_date, is_achieved) VALUES (?, ?, ?, ?)',
    [amount, startDate, endDate, isAchieved || false]
  );
  
  return { id: result.insertId, ...goal };
}

/**
 * 현재 활성화된 재정 목표 가져오기
 * @returns {Promise<Object>} - 활성화된 재정 목표
 */
export async function getCurrentGoal() {
  const today = new Date().toISOString().split('T')[0];
  
  const goals = await executeQuery(
    'SELECT * FROM financial_goals WHERE ? BETWEEN start_date AND end_date ORDER BY created_at DESC LIMIT 1',
    [today]
  );
  
  return goals.length > 0 ? goals[0] : null;
}

/**
 * 데이터베이스 연결 테스트
 * @returns {Promise<boolean>} - 연결 성공 여부
 */
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    connection.release();
    return true;
  } catch (error) {
    console.error('데이터베이스 연결 오류:', error);
    return false;
  }
}

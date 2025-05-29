/**
 * 로컬 스토리지에서 DB로 데이터를 마이그레이션하기 위한 유틸리티
 */

import { getEntries } from './localStorageUtil';
import { addTransaction, setFinancialGoal } from './dbService';
import { getCategoryPathById } from './categoryData';

/**
 * 로컬 스토리지의 거래 항목을 DB로 마이그레이션
 * @param {number} userId - 사용자 ID
 * @returns {Promise<Object>} - 마이그레이션 결과
 */
export async function migrateTransactionsToDb(userId) {
  try {
    const localEntries = getEntries();
    let successCount = 0;
    let errorCount = 0;
    
    // 각 항목을 DB에 추가
    for (const entry of localEntries) {
      try {
        // 카테고리 정보 확인 및 변환
        let detailCategoryId = null;
        
        if (entry.categoryInfo && entry.categoryInfo.detailCategory) {
          detailCategoryId = entry.categoryInfo.detailCategory.id;
        }
        
        // DB 항목 형식으로 변환
        const transactionData = {
          detailCategoryId,
          amount: entry.amount,
          date: entry.date || new Date().toISOString().split('T')[0],
          memo: entry.memo || entry.description || ''
        };
        
        // DB에 추가
        await addTransaction(transactionData, userId);
        successCount++;
      } catch (err) {
        console.error('항목 마이그레이션 오류:', err);
        errorCount++;
      }
    }
    
    return { 
      success: true, 
      total: localEntries.length, 
      successCount, 
      errorCount 
    };
  } catch (error) {
    console.error('마이그레이션 오류:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

/**
 * 로컬 스토리지의 목표 정보를 DB로 마이그레이션
 * @param {number} userId - 사용자 ID
 * @returns {Promise<Object>} - 마이그레이션 결과
 */
export async function migrateGoalToDb(userId) {
  try {
    // 로컬 스토리지에서 목표 가져오기
    const goal = localStorage.getItem('goal');
    
    if (!goal) {
      return { success: true, migrated: false, message: '마이그레이션할 목표가 없습니다.' };
    }
    
    const goalAmount = parseFloat(goal);
    if (isNaN(goalAmount)) {
      return { success: false, error: '유효하지 않은 목표 금액입니다.' };
    }
    
    // 현재 날짜 기준 목표 생성 (한 달 기준)
    const today = new Date();
    const startDate = today.toISOString().split('T')[0];
    
    // 한 달 후 날짜 계산
    const endDate = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate())
      .toISOString().split('T')[0];
    
    // DB에 목표 저장
    await setFinancialGoal({
      amount: goalAmount,
      startDate,
      endDate,
      isAchieved: false
    }, userId);
    
    return { success: true, migrated: true };
  } catch (error) {
    console.error('목표 마이그레이션 오류:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 모든 로컬 데이터를 DB로 마이그레이션
 * @param {number} userId - 사용자 ID
 * @returns {Promise<Object>} - 마이그레이션 결과
 */
export async function migrateAllDataToDb(userId) {
  const transactionResult = await migrateTransactionsToDb(userId);
  const goalResult = await migrateGoalToDb(userId);
  
  return {
    success: transactionResult.success && goalResult.success,
    transactions: transactionResult,
    goal: goalResult
  };
}

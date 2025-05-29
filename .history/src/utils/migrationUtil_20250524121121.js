/**
 * ���� ���丮������ ���� DB�� �����͸� ���̱׷��̼��ϱ� ���� ��ƿ��Ƽ
 * 
 * ���̱׷��̼� �Ϸ� �� �� ������ �� �̻� �ʿ����� ���� �� �ֽ��ϴ�.
 */

import { addTransaction, setFinancialGoal } from './dbServiceWrapper';
import api from './apiService';

/**
 * ���� ���丮���� �ŷ� �׸��� DB�� ���̱׷��̼�
 * @param {number} userId - ����� ID
 * @returns {Promise<Object>} - ���̱׷��̼� ���
 */
export async function migrateTransactionsToDb(userId) {
  try {
    // localStorage���� �׸� ��������
    const entriesJson = localStorage.getItem('entries');
    if (!entriesJson) {
      return { 
        success: true, 
        total: 0, 
        successCount: 0, 
        errorCount: 0,
        message: '���̱׷��̼��� �ŷ� �����Ͱ� �����ϴ�.' 
      };
    }
    
    const localEntries = JSON.parse(entriesJson);
    let successCount = 0;
    let errorCount = 0;
    
    // �� �׸��� DB�� �߰�
    for (const entry of localEntries) {
      try {
        // ī�װ��� ���� Ȯ�� �� ��ȯ
        let detailCategoryId = null;
        
        if (entry.categoryInfo && entry.categoryInfo.detailCategory) {
          detailCategoryId = entry.categoryInfo.detailCategory.id;
        }
        
        // DB �׸� �������� ��ȯ
        const transactionData = {
          detailCategoryId,
          amount: entry.amount,
          date: entry.date || new Date().toISOString().split('T')[0],
          memo: entry.memo || entry.description || ''
        };
        
        // DB�� �߰�
        await addTransaction(transactionData, userId);
        successCount++;
      } catch (err) {
        console.error('�׸� ���̱׷��̼� ����:', err);
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
    console.error('���̱׷��̼� ����:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

/**
 * ���� ���丮���� ��ǥ ������ DB�� ���̱׷��̼�
 * @param {number} userId - ����� ID
 * @returns {Promise<Object>} - ���̱׷��̼� ���
 */
export async function migrateGoalToDb(userId) {
  try {
    // ���� ���丮������ ��ǥ ��������
    const goal = localStorage.getItem('goal');
    
    if (!goal) {
      return { success: true, migrated: false, message: '���̱׷��̼��� ��ǥ�� �����ϴ�.' };
    }
    
    const goalAmount = parseFloat(goal);
    if (isNaN(goalAmount)) {
      return { success: false, error: '��ȿ���� ���� ��ǥ �ݾ��Դϴ�.' };
    }
    
    // ���� ��¥ ���� ��ǥ ���� (�� �� ����)
    const today = new Date();
    const startDate = today.toISOString().split('T')[0];
    
    // �� �� �� ��¥ ���
    const endDate = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate())
      .toISOString().split('T')[0];
    
    // DB�� ��ǥ ����
    await setFinancialGoal({
      amount: goalAmount,
      startDate,
      endDate,
      isAchieved: false
    }, userId);
    
    return { success: true, migrated: true };
  } catch (error) {
    console.error('��ǥ ���̱׷��̼� ����:', error);
    return { success: false, error: error.message };
  }
}

/**
 * ��� ���� �����͸� DB�� ���̱׷��̼�
 * @param {number} userId - ����� ID
 * @returns {Promise<Object>} - ���̱׷��̼� ���
 */
export async function migrateAllDataToDb(userId) {
  const transactionResult = await migrateTransactionsToDb(userId);
  const goalResult = await migrateGoalToDb(userId);
  
  // ���̱׷��̼� �Ϸ� �� ���� ������ ����
  if (transactionResult.success && goalResult.success) {
    // ���̱׷��̼� �Ϸ� ǥ�� (�ʿ�� ���߿� ����)
    localStorage.setItem('dataMigrated', 'true');
    
    // ���̱׷��̼� �Ϸ� �Ŀ��� ���� �����ʹ� ��� �������� ����
  }
  
  return {
    success: transactionResult.success && goalResult.success,
    transactions: transactionResult,
    goal: goalResult
  };
}

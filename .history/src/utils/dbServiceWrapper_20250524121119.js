/**
 * MySQL ���� API�� ����ϴ� �����ͺ��̽� ���� ����
 * 
 * ��� ������ �۾��� ���� API�� ���� ����˴ϴ�.
 */

import api from './apiService';

/**
 * �ŷ� ���� ��ȸ
 * @param {Object} filters - ���͸� �ɼ�
 * @param {number} userId - ����� ID
 * @returns {Promise<Array>} �ŷ� ���� �迭
 */
export async function getTransactions(filters = {}, userId) {
  try {
    const response = await api.get('/api/transactions', {
      params: { ...filters, userId }
    });
    return response.data.data || [];
  } catch (error) {
    console.error('�ŷ� ���� ��ȸ ����:', error);
    return [];
  }
}

/**
 * �ŷ� �߰�
 * @param {Object} transaction - �ŷ� ������
 * @param {number} userId - ����� ID
 * @returns {Promise<Object>} �߰��� �ŷ� ������
 */
export async function addTransaction(transaction, userId) {
  try {
    const response = await api.post('/api/transactions', {
      ...transaction,
      userId
    });
    return response.data.data;
  } catch (error) {
    console.error('�ŷ� �߰� ����:', error);
    throw error;
  }
}

/**
 * ���� ���� ��ǥ ��ȸ
 * @param {number} userId - ����� ID
 * @returns {Promise<Object|null>} ��ǥ ������ �Ǵ� null
 */
export async function getCurrentGoal(userId) {
  try {
    const response = await api.get('/api/goals/current/' + userId);
    return response.data.data;
  } catch (error) {
    console.error('��ǥ ��ȸ ����:', error);
    return null;
  }
}

/**
 * ���� ��ǥ ����
 * @param {Object} goal - ��ǥ ������
 * @param {number} userId - ����� ID
 * @returns {Promise<Object>} ������ ��ǥ ������
 */
export async function setFinancialGoal(goal, userId) {
  try {
    const response = await api.post('/api/goals', {
      ...goal,
      userId
    });
    return response.data.data;
  } catch (error) {
    console.error('��ǥ ���� ����:', error);
    throw error;
  }
}

/**
 * ī�װ����� ���� �м�
 * @param {string} startDate - ���� ��¥
 * @param {string} endDate - ���� ��¥
 * @param {number} userId - ����� ID
 * @returns {Promise<Array>} ī�װ����� ���� ������
 */
export async function getSpendingByCategory(startDate, endDate, userId) {
  try {
    const response = await api.get('/api/transactions/analysis', {
      params: { startDate, endDate, userId }
    });
    return response.data.data || [];
  } catch (error) {
    console.error('ī�װ����� ���� �м� ����:', error);
    return [];
  }
}

/**
 * ���� ī�װ��� ��� ��ȸ
 * @returns {Promise<Array>} ���� ī�װ��� �迭
 */
export async function getMainCategories() {
  try {
    const response = await api.get('/api/categories/main');
    return response.data.data || [];
  } catch (error) {
    console.error('���� ī�װ��� ��ȸ ����:', error);
    return [];
  }
}

/**
 * ���� ī�װ��� ��� ��ȸ
 * @param {number} mainCategoryId - ���� ī�װ��� ID
 * @returns {Promise<Array>} ���� ī�װ��� �迭
 */
export async function getSubCategories(mainCategoryId) {
  try {
    const response = await api.get('/api/categories/sub/' + mainCategoryId);
    return response.data.data || [];
  } catch (error) {
    console.error('���� ī�װ��� ��ȸ ����:', error);
    return [];
  }
}

/**
 * �� ī�װ��� ��� ��ȸ
 * @param {number} subCategoryId - ���� ī�װ��� ID
 * @returns {Promise<Array>} �� ī�װ��� �迭
 */
export async function getDetailCategories(subCategoryId) {
  try {
    const response = await api.get('/api/categories/detail/' + subCategoryId);
    return response.data.data || [];
  } catch (error) {
    console.error('�� ī�װ��� ��ȸ ����:', error);
    return [];
  }
}

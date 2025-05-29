/**
 * MySQL 서버 API를 사용하는 데이터베이스 서비스 래퍼
 * 
 * 모든 데이터 작업은 서버 API를 통해 수행됩니다.
 */

import api from './apiService';

// 서버 API를 사용하는 함수들
const serverFunctions = {
  async getTransactions() {
    try {
      const response = await api.get('/api/transactions');
      return response.data.data || [];
    } catch (error) {
      console.error('거래 내역 조회 오류:', error);
      return [];
    }
  },

  async addTransaction(transaction) {
    try {
      const response = await api.post('/api/transactions', transaction);
      return response.data.data;
    } catch (error) {
      console.error('거래 추가 오류:', error);
      throw error;
    }
  },

  async getCurrentGoal() {
    try {
      const response = await api.get('/api/goals/current');
      return response.data.data;
    } catch (error) {
      console.error('목표 조회 오류:', error);
      return null;
    }
  },

  async setFinancialGoal(goal) {
    try {
      const response = await api.post('/api/goals', goal);
      return response.data.data;
    } catch (error) {
      console.error('목표 설정 오류:', error);
      throw error;
    }
  },

  async getSpendingByCategory(startDate, endDate) {
    try {
      const response = await api.get('/api/transactions/analysis', {
        params: { startDate, endDate }
      });
      return response.data.data || [];
    } catch (error) {
      console.error('카테고리별 지출 분석 오류:', error);
      return [];
    }
  }
};

// 브라우저 환경에서 사용할 함수들 - 서버 API 사용 여부에 따라 다른 구현 사용
export const getMainCategories = browserService1.getMainCategories;
export const getSubCategories = browserService1.getSubCategories;
export const getDetailCategories = browserService1.getDetailCategories;
export const addTransaction = useServerApi ? serverFunctions.addTransaction : browserService1.addTransaction;
export const getTransactions = useServerApi ? serverFunctions.getTransactions : browserService2.getTransactions;
export const getSpendingByCategory = useServerApi ? serverFunctions.getSpendingByCategory : browserService2.getSpendingByCategory;
export const setFinancialGoal = useServerApi ? serverFunctions.setFinancialGoal : browserService3.setFinancialGoal;
export const getCurrentGoal = useServerApi ? serverFunctions.getCurrentGoal : browserService3.getCurrentGoal;
export const testConnection = browserService3.testConnection;
export const executeQuery = browserService3.executeQuery;

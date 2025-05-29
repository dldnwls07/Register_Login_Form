/**
 * 브라우저 환경에서의 데이터베이스 서비스 래퍼
 * 
 * Node.js 모듈 로딩 오류를 방지하기 위한 브라우저 환경 호환성 래퍼
 */

// 브라우저 환경에서 사용할 DB 서비스 모듈 import
import * as browserService1 from './browserDBService';
import * as browserService2 from './browserDBService2';
import * as browserService3 from './browserDBService3';

// 브라우저 환경인지 확인
const isBrowser = typeof window !== 'undefined';

// 환경 로그
console.log(`현재 환경: ${isBrowser ? '브라우저' : '서버'}`);

// 브라우저 환경이 아닐 경우 경고
if (!isBrowser) {
  console.warn('브라우저 환경이 아닌 곳에서 브라우저 DB 서비스가 사용되었습니다.');
}

// 브라우저 환경에서 사용할 함수들 통합
export const getMainCategories = browserService1.getMainCategories;
export const getSubCategories = browserService1.getSubCategories;
export const getDetailCategories = browserService1.getDetailCategories;
export const addTransaction = browserService1.addTransaction;
export const getTransactions = browserService2.getTransactions;
export const getSpendingByCategory = browserService2.getSpendingByCategory;
export const setFinancialGoal = browserService3.setFinancialGoal;
export const getCurrentGoal = browserService3.getCurrentGoal;
export const testConnection = browserService3.testConnection;
export const executeQuery = browserService3.executeQuery;

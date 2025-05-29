// server/routes/transactions.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// 컨트롤러 import
const { 
  getTransactions, 
  getTransaction, 
  createTransaction, 
  updateTransaction, 
  deleteTransaction 
} = require('../controllers/transactions');

// 거래 내역 라우트
router.route('/')
  .get(protect, getTransactions)
  .post(protect, createTransaction);

router.route('/:id')
  .get(protect, getTransaction)
  .put(protect, updateTransaction)
  .delete(protect, deleteTransaction);

module.exports = router;

// server/routes/categories.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// 컨트롤러 import
const { 
  getCategories, 
  getCategory, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} = require('../controllers/categories');

// 카테고리 라우트
router.route('/')
  .get(protect, getCategories)
  .post(protect, createCategory);

router.route('/:id')
  .get(protect, getCategory)
  .put(protect, updateCategory)
  .delete(protect, deleteCategory);

module.exports = router;

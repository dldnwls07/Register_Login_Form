// server/routes/categories.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// 컨트롤러 import
// const { getCategories, getCategory, createCategory, updateCategory, deleteCategory } = require('../controllers/categories');

// 추후에 컨트롤러를 구현할 때 주석을 해제하세요
// router.route('/')
//   .get(protect, getCategories)
//   .post(protect, createCategory);

// router.route('/:id')
//   .get(protect, getCategory)
//   .put(protect, updateCategory)
//   .delete(protect, deleteCategory);

// 임시 라우트 (서버가 작동하는지 확인용)
router.get('/', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: '카테고리 API 라우트가 작동 중입니다.'
  });
});

module.exports = router;

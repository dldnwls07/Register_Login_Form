// server/routes/goals.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// 컨트롤러 import
// const { getGoals, getGoal, createGoal, updateGoal, deleteGoal } = require('../controllers/goals');

// 추후에 컨트롤러를 구현할 때 주석을 해제하세요
// router.route('/')
//   .get(protect, getGoals)
//   .post(protect, createGoal);

// router.route('/:id')
//   .get(protect, getGoal)
//   .put(protect, updateGoal)
//   .delete(protect, deleteGoal);

// 임시 라우트 (서버가 작동하는지 확인용)
router.get('/', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: '목표 API 라우트가 작동 중입니다.'
  });
});

module.exports = router;

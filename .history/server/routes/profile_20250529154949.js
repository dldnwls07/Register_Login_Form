const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getProfile,
  updateProfile,
  updatePreferences
} = require('../controllers/profile');

router.use(protect); // 모든 프로필 라우트에 인증 필요

router.route('/')
  .get(getProfile)
  .put(updateProfile);

router.patch('/preferences', updatePreferences);

module.exports = router;

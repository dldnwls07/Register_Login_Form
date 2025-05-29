const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');
const UserProfile = require('../models/UserProfile');

// @desc    사용자 프로필 가져오기
// @route   GET /api/profile
// @access  Private
exports.getProfile = asyncHandler(async (req, res, next) => {
  const profile = await UserProfile.findOne({
    where: { userId: req.user.id },
    include: [{
      model: User,
      attributes: ['username', 'email', 'created_at']
    }]
  });

  if (!profile) {
    // 프로필이 없으면 기본 프로필 생성
    const newProfile = await UserProfile.create({
      userId: req.user.id,
      displayName: req.user.username
    });

    return res.status(200).json({
      success: true,
      data: {
        ...newProfile.toJSON(),
        User: {
          username: req.user.username,
          email: req.user.email,
          created_at: req.user.created_at
        }
      }
    });
  }

  res.status(200).json({
    success: true,
    data: profile
  });
});

// @desc    프로필 업데이트
// @route   PUT /api/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const { displayName, preferences } = req.body;

  const profile = await UserProfile.findOne({
    where: { userId: req.user.id }
  });

  if (!profile) {
    // 프로필이 없으면 새로 생성
    const newProfile = await UserProfile.create({
      userId: req.user.id,
      displayName: displayName || req.user.username,
      preferences: preferences || {}
    });

    return res.status(201).json({
      success: true,
      data: newProfile
    });
  }

  // 프로필 업데이트
  const updatedProfile = await profile.update({
    displayName: displayName || profile.displayName,
    preferences: {
      ...profile.preferences,
      ...preferences
    },
    lastUpdated: new Date()
  });

  res.status(200).json({
    success: true,
    data: updatedProfile
  });
});

// @desc    프로필 환경설정 업데이트
// @route   PATCH /api/profile/preferences
// @access  Private
exports.updatePreferences = asyncHandler(async (req, res, next) => {
  const { preferences } = req.body;

  const profile = await UserProfile.findOne({
    where: { userId: req.user.id }
  });

  if (!profile) {
    return next(new ErrorResponse('프로필을 찾을 수 없습니다.', 404));
  }

  // 환경설정만 업데이트
  const updatedProfile = await profile.update({
    preferences: {
      ...profile.preferences,
      ...preferences
    },
    lastUpdated: new Date()
  });

  res.status(200).json({
    success: true,
    data: updatedProfile
  });
});

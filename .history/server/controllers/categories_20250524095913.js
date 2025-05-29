// server/controllers/categories.js
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Category = require('../models/Category');

// @desc    모든 카테고리 조회 (기본 카테고리 + 사용자 정의 카테고리)
// @route   GET /api/categories
// @access  Private
exports.getCategories = asyncHandler(async (req, res, next) => {
  // 사용자 ID로 필터링 또는 기본 카테고리 (isDefault=true)
  const categories = await Category.findAll({
    where: {
      [Category.sequelize.Op.or]: [
        { userId: req.user.id },
        { isDefault: true }
      ]
    },
    order: [
      ['type', 'ASC'],
      ['name', 'ASC']
    ]
  });

  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories
  });
});

// @desc    특정 카테고리 조회
// @route   GET /api/categories/:id
// @access  Private
exports.getCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findByPk(req.params.id);

  if (!category) {
    return next(new ErrorResponse(`ID: ${req.params.id}에 해당하는 카테고리가 없습니다.`, 404));
  }

  // 기본 카테고리거나 현재 사용자의 카테고리인지 확인
  if (!category.isDefault && category.userId !== req.user.id) {
    return next(new ErrorResponse('이 카테고리에 접근할 권한이 없습니다.', 403));
  }

  res.status(200).json({
    success: true,
    data: category
  });
});

// @desc    사용자 정의 카테고리 생성
// @route   POST /api/categories
// @access  Private
exports.createCategory = asyncHandler(async (req, res, next) => {
  // 사용자 ID 추가
  req.body.userId = req.user.id;
  req.body.isDefault = false;  // 사용자가 생성한 카테고리는 기본이 아님

  const category = await Category.create(req.body);

  res.status(201).json({
    success: true,
    data: category
  });
});

// @desc    사용자 정의 카테고리 수정
// @route   PUT /api/categories/:id
// @access  Private
exports.updateCategory = asyncHandler(async (req, res, next) => {
  let category = await Category.findByPk(req.params.id);

  if (!category) {
    return next(new ErrorResponse(`ID: ${req.params.id}에 해당하는 카테고리가 없습니다.`, 404));
  }

  // 기본 카테고리는 수정 불가
  if (category.isDefault) {
    return next(new ErrorResponse('기본 카테고리는 수정할 수 없습니다.', 403));
  }

  // 현재 사용자의 카테고리인지 확인
  if (category.userId !== req.user.id) {
    return next(new ErrorResponse('이 카테고리를 수정할 권한이 없습니다.', 403));
  }

  // isDefault 값 변경 방지 (사용자가 기본 카테고리로 설정하지 못하도록)
  if (req.body.isDefault !== undefined) {
    delete req.body.isDefault;
  }

  category = await Category.update(req.body, {
    where: { id: req.params.id },
    returning: true,
    plain: true
  });

  // 수정된 데이터 조회
  const updatedCategory = await Category.findByPk(req.params.id);

  res.status(200).json({
    success: true,
    data: updatedCategory
  });
});

// @desc    사용자 정의 카테고리 삭제
// @route   DELETE /api/categories/:id
// @access  Private
exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findByPk(req.params.id);

  if (!category) {
    return next(new ErrorResponse(`ID: ${req.params.id}에 해당하는 카테고리가 없습니다.`, 404));
  }

  // 기본 카테고리는 삭제 불가
  if (category.isDefault) {
    return next(new ErrorResponse('기본 카테고리는 삭제할 수 없습니다.', 403));
  }

  // 현재 사용자의 카테고리인지 확인
  if (category.userId !== req.user.id) {
    return next(new ErrorResponse('이 카테고리를 삭제할 권한이 없습니다.', 403));
  }

  await category.destroy();

  res.status(200).json({
    success: true,
    data: {}
  });
});

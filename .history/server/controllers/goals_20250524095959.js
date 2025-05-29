// server/controllers/goals.js
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Goal = require('../models/Goal');

// @desc    사용자의 모든 목표 조회
// @route   GET /api/goals
// @access  Private
exports.getGoals = asyncHandler(async (req, res, next) => {
  const { isCompleted, sortBy = 'createdAt', order = 'DESC' } = req.query;
  
  const queryOptions = {
    where: {
      userId: req.user.id
    },
    order: [[sortBy, order]]
  };

  // 완료 여부로 필터링
  if (isCompleted !== undefined) {
    queryOptions.where.isCompleted = isCompleted === 'true';
  }

  const goals = await Goal.findAll(queryOptions);

  res.status(200).json({
    success: true,
    count: goals.length,
    data: goals
  });
});

// @desc    특정 목표 조회
// @route   GET /api/goals/:id
// @access  Private
exports.getGoal = asyncHandler(async (req, res, next) => {
  const goal = await Goal.findByPk(req.params.id);

  if (!goal) {
    return next(new ErrorResponse(`ID: ${req.params.id}에 해당하는 목표가 없습니다.`, 404));
  }

  // 현재 사용자의 목표인지 확인
  if (goal.userId !== req.user.id) {
    return next(new ErrorResponse('이 목표에 접근할 권한이 없습니다.', 403));
  }

  res.status(200).json({
    success: true,
    data: goal
  });
});

// @desc    새 목표 생성
// @route   POST /api/goals
// @access  Private
exports.createGoal = asyncHandler(async (req, res, next) => {
  // 사용자 ID 추가
  req.body.userId = req.user.id;
  
  // 시작일 기본값 설정
  if (!req.body.startDate) {
    req.body.startDate = new Date();
  }

  const goal = await Goal.create(req.body);

  res.status(201).json({
    success: true,
    data: goal
  });
});

// @desc    목표 수정
// @route   PUT /api/goals/:id
// @access  Private
exports.updateGoal = asyncHandler(async (req, res, next) => {
  let goal = await Goal.findByPk(req.params.id);

  if (!goal) {
    return next(new ErrorResponse(`ID: ${req.params.id}에 해당하는 목표가 없습니다.`, 404));
  }

  // 현재 사용자의 목표인지 확인
  if (goal.userId !== req.user.id) {
    return next(new ErrorResponse('이 목표를 수정할 권한이 없습니다.', 403));
  }

  // 목표 달성 확인
  if (req.body.current >= goal.target && !goal.isCompleted) {
    req.body.isCompleted = true;
  }

  goal = await Goal.update(req.body, {
    where: { id: req.params.id },
    returning: true,
    plain: true
  });

  // 수정된 데이터 조회
  const updatedGoal = await Goal.findByPk(req.params.id);

  res.status(200).json({
    success: true,
    data: updatedGoal
  });
});

// @desc    목표 삭제
// @route   DELETE /api/goals/:id
// @access  Private
exports.deleteGoal = asyncHandler(async (req, res, next) => {
  const goal = await Goal.findByPk(req.params.id);

  if (!goal) {
    return next(new ErrorResponse(`ID: ${req.params.id}에 해당하는 목표가 없습니다.`, 404));
  }

  // 현재 사용자의 목표인지 확인
  if (goal.userId !== req.user.id) {
    return next(new ErrorResponse('이 목표를 삭제할 권한이 없습니다.', 403));
  }

  await goal.destroy();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    목표 진행 상태 업데이트 (금액 추가)
// @route   PUT /api/goals/:id/progress
// @access  Private
exports.updateGoalProgress = asyncHandler(async (req, res, next) => {
  const { amount } = req.body;
  
  if (!amount || isNaN(amount)) {
    return next(new ErrorResponse('유효한 금액을 입력해주세요.', 400));
  }

  let goal = await Goal.findByPk(req.params.id);

  if (!goal) {
    return next(new ErrorResponse(`ID: ${req.params.id}에 해당하는 목표가 없습니다.`, 404));
  }

  // 현재 사용자의 목표인지 확인
  if (goal.userId !== req.user.id) {
    return next(new ErrorResponse('이 목표를 수정할 권한이 없습니다.', 403));
  }

  // 이미 완료된 목표인지 확인
  if (goal.isCompleted) {
    return next(new ErrorResponse('이미 완료된 목표입니다.', 400));
  }

  // 현재 금액 업데이트
  const newCurrent = parseFloat(goal.current) + parseFloat(amount);
  
  // 목표 달성 확인
  const isCompleted = newCurrent >= goal.target;
  
  await Goal.update(
    { 
      current: newCurrent,
      isCompleted
    }, 
    {
      where: { id: req.params.id }
    }
  );

  // 수정된 데이터 조회
  const updatedGoal = await Goal.findByPk(req.params.id);

  res.status(200).json({
    success: true,
    data: updatedGoal
  });
});

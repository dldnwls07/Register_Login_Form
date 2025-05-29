// server/controllers/transactions.js
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Transaction = require('../models/Transaction');
const { Op } = require('sequelize');

// @desc    모든 거래 내역 조회
// @route   GET /api/transactions
// @access  Private
exports.getTransactions = asyncHandler(async (req, res, next) => {
  const { startDate, endDate, type, category, sort = 'date', order = 'desc' } = req.query;
  const queryOptions = {
    where: {
      userId: req.user.id
    },
    order: [[sort, order]]
  };

  // 날짜 범위 필터링
  if (startDate || endDate) {
    queryOptions.where.date = {};
    if (startDate) {
      queryOptions.where.date[Op.gte] = new Date(startDate);
    }
    if (endDate) {
      queryOptions.where.date[Op.lte] = new Date(endDate);
    }
  }

  // 유형 필터링 (수입/지출)
  if (type) {
    queryOptions.where.type = type;
  }

  // 카테고리 필터링
  if (category) {
    queryOptions.where.category = category;
  }

  const transactions = await Transaction.findAll(queryOptions);

  res.status(200).json({
    success: true,
    count: transactions.length,
    data: transactions
  });
});

// @desc    특정 거래 내역 조회
// @route   GET /api/transactions/:id
// @access  Private
exports.getTransaction = asyncHandler(async (req, res, next) => {
  const transaction = await Transaction.findByPk(req.params.id);

  if (!transaction) {
    return next(new ErrorResponse(`ID: ${req.params.id}에 해당하는 거래 내역이 없습니다.`, 404));
  }

  // 현재 사용자의 거래 내역인지 확인
  if (transaction.userId !== req.user.id) {
    return next(new ErrorResponse('이 거래 내역에 접근할 권한이 없습니다.', 403));
  }

  res.status(200).json({
    success: true,
    data: transaction
  });
});

// @desc    거래 내역 생성
// @route   POST /api/transactions
// @access  Private
exports.createTransaction = asyncHandler(async (req, res, next) => {
  // 사용자 ID 추가
  req.body.userId = req.user.id;

  const transaction = await Transaction.create(req.body);

  res.status(201).json({
    success: true,
    data: transaction
  });
});

// @desc    거래 내역 수정
// @route   PUT /api/transactions/:id
// @access  Private
exports.updateTransaction = asyncHandler(async (req, res, next) => {
  let transaction = await Transaction.findByPk(req.params.id);

  if (!transaction) {
    return next(new ErrorResponse(`ID: ${req.params.id}에 해당하는 거래 내역이 없습니다.`, 404));
  }

  // 현재 사용자의 거래 내역인지 확인
  if (transaction.userId !== req.user.id) {
    return next(new ErrorResponse('이 거래 내역을 수정할 권한이 없습니다.', 403));
  }

  transaction = await Transaction.update(req.body, {
    where: { id: req.params.id },
    returning: true,
    plain: true
  });

  // 수정된 데이터 조회
  const updatedTransaction = await Transaction.findByPk(req.params.id);

  res.status(200).json({
    success: true,
    data: updatedTransaction
  });
});

// @desc    거래 내역 삭제
// @route   DELETE /api/transactions/:id
// @access  Private
exports.deleteTransaction = asyncHandler(async (req, res, next) => {
  const transaction = await Transaction.findByPk(req.params.id);

  if (!transaction) {
    return next(new ErrorResponse(`ID: ${req.params.id}에 해당하는 거래 내역이 없습니다.`, 404));
  }

  // 현재 사용자의 거래 내역인지 확인
  if (transaction.userId !== req.user.id) {
    return next(new ErrorResponse('이 거래 내역을 삭제할 권한이 없습니다.', 403));
  }

  await transaction.destroy();

  res.status(200).json({
    success: true,
    data: {}
  });
});

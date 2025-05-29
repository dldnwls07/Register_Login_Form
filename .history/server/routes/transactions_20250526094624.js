const express = require('express');
const router = express.Router();
const { db } = require('../config/db');
const { protect } = require('../middleware/auth');

// 기본 거래 내역 조회
router.get('/', protect, async (req, res) => {
    try {
        const [transactions] = await db.query(
            'SELECT * FROM transactions WHERE user_id = ?',
            [req.user.id]
        );
        res.json({ success: true, data: transactions });
    } catch (error) {
        res.status(500).json({ message: '거래 내역 조회 중 오류가 발생했습니다.' });
    }
});

module.exports = router;

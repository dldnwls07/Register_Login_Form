const express = require('express');
const router = express.Router();
const { db } = require('../config/db');
const { protect } = require('../middleware/auth');

// 거래 내역 조회
router.get('/', protect, async (req, res) => {
    try {
        const [transactions] = await db.query(
            'SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC',
            [req.user.id]
        );
        res.json({ success: true, data: transactions });
    } catch (error) {
        res.status(500).json({ message: '거래 내역 조회 중 오류가 발생했습니다.' });
    }
});

// 거래 내역 추가
router.post('/', protect, async (req, res) => {
    try {
        const { amount, description, category, date } = req.body;
        const [result] = await db.query(
            'INSERT INTO transactions (user_id, amount, description, category, date) VALUES (?, ?, ?, ?, ?)',
            [req.user.id, amount, description, category, date]
        );
        res.status(201).json({ 
            success: true, 
            message: '거래가 추가되었습니다.',
            transactionId: result.insertId 
        });
    } catch (error) {
        res.status(500).json({ message: '거래 추가 중 오류가 발생했습니다.' });
    }
});

// 거래 내역 수정
router.put('/:id', protect, async (req, res) => {
    try {
        const { amount, description, category, date } = req.body;
        const [result] = await db.query(
            'UPDATE transactions SET amount = ?, description = ?, category = ?, date = ? WHERE id = ? AND user_id = ?',
            [amount, description, category, date, req.params.id, req.user.id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: '거래를 찾을 수 없습니다.' });
        }
        
        res.json({ success: true, message: '거래가 수정되었습니다.' });
    } catch (error) {
        res.status(500).json({ message: '거래 수정 중 오류가 발생했습니다.' });
    }
});

// 거래 내역 삭제
router.delete('/:id', protect, async (req, res) => {
    try {
        const [result] = await db.query(
            'DELETE FROM transactions WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: '거래를 찾을 수 없습니다.' });
        }
        
        res.json({ success: true, message: '거래가 삭제되었습니다.' });
    } catch (error) {
        res.status(500).json({ message: '거래 삭제 중 오류가 발생했습니다.' });
    }
});

module.exports = router;

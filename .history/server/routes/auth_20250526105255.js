// server/routes/auth.js
const express = require('express');
const router = express.Router();
const { db } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/auth');

// 아이디 중복 체크
router.get('/check-username', async (req, res) => {
    try {
        const { username } = req.query;
        
        const [users] = await db.query(
            'SELECT id FROM users WHERE username = ?', 
            [username]
        );
        
        res.json({ 
            available: users.length === 0,
            message: users.length > 0 ? '이미 사용 중인 아이디입니다.' : '사용 가능한 아이디입니다.'
        });
    } catch (error) {
        console.error('아이디 중복 확인 오류:', error);
        res.status(500).json({ 
            message: '아이디 확인 중 오류가 발생했습니다.' 
        });
    }
});

// 이메일 중복 체크
router.get('/check-email', async (req, res) => {
    try {
        const { email } = req.query;
        
        const [users] = await db.query(
            'SELECT id FROM users WHERE email = ?', 
            [email]
        );
        
        res.json({ 
            available: users.length === 0,
            message: users.length > 0 ? '이미 사용 중인 이메일입니다.' : '사용 가능한 이메일입니다.'
        });
    } catch (error) {
        console.error('이메일 중복 확인 오류:', error);
        res.status(500).json({ 
            message: '이메일 확인 중 오류가 발생했습니다.' 
        });
    }
});

// 회원가입
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // 사용자 중복 체크
        const existingUser = await db.query(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existingUser[0].length > 0) {
            return res.status(400).json({ 
                message: '이미 존재하는 사용자명 또는 이메일입니다.' 
            });
        }

        // 비밀번호 해싱
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // 사용자 생성
        const result = await db.query(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );
        
        const userId = result[0].insertId;
        
        // JWT 토큰 생성
        const token = jwt.sign(
            { id: userId }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );

        res.status(201).json({
            success: true,
            token,
            user: {
                id: userId,
                username,
                email
            }
        });
    } catch (error) {
        console.error('회원가입 오류:', error);
        res.status(500).json({ 
            success: false,
            message: '회원가입 처리 중 오류가 발생했습니다.' 
        });
    }
});

// 로그인
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // 사용자 조회
        const [users] = await db.query(
            'SELECT * FROM users WHERE username = ?', 
            [username]
        );
        
        if (users.length === 0) {
            return res.status(401).json({ 
                message: '아이디 또는 비밀번호가 일치하지 않습니다.' 
            });
        }

        const user = users[0];
        
        // 비밀번호 검증
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ 
                message: '아이디 또는 비밀번호가 일치하지 않습니다.' 
            });
        }

        // JWT 토큰 생성
        const token = jwt.sign(
            { id: user.id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('로그인 오류:', error);
        res.status(500).json({ 
            success: false,
            message: '로그인 처리 중 오류가 발생했습니다.' 
        });
    }
});

// 로그아웃
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true, message: '로그아웃되었습니다.' });
});

// 사용자 정보 조회
router.get('/me', protect, async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id, username, email, created_at FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
        }

        res.json({
            success: true,
            data: users[0]
        });
    } catch (error) {
        res.status(500).json({ message: '사용자 정보 조회 중 오류가 발생했습니다.' });
    }
});

// 토큰 검증
router.get('/verify', protect, (req, res) => {
    res.json({ success: true, user: req.user });
});

module.exports = router;

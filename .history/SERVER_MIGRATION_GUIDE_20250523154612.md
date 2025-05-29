# 가계부 앱 서버 및 데이터베이스 마이그레이션 가이드

## 개요
이 문서는 localStorage 기반으로 동작하는 기존 가계부 앱을 서버 및 데이터베이스 기반 아키텍처로 마이그레이션하는 방법을 안내합니다.

## 백엔드 설정 단계

### 1. 서버 환경 구축

#### Node.js Express 서버 설정
```bash
# 서버 디렉토리 생성
mkdir server
cd server

# package.json 초기화
npm init -y

# 필수 패키지 설치
npm install express mongoose cors dotenv bcrypt jsonwebtoken cookie-parser express-validator

# 개발 의존성 패키지 설치
npm install --save-dev nodemon
```

#### 서버 기본 구조 생성
```
server/
  |- config/
  |   |- db.js           # 데이터베이스 연결 설정
  |   |- default.json    # 기본 설정 파일
  |
  |- controllers/        # API 요청 처리 로직
  |   |- auth.js         # 인증 관련 컨트롤러
  |   |- transactions.js # 거래 관련 컨트롤러
  |   |- categories.js   # 카테고리 관련 컨트롤러
  |   |- goals.js        # 목표 관련 컨트롤러
  |
  |- middleware/
  |   |- auth.js         # 인증 미들웨어
  |   |- validator.js    # 입력값 검증 미들웨어
  |
  |- models/             # 데이터베이스 모델
  |   |- User.js
  |   |- Transaction.js
  |   |- Category.js
  |   |- Goal.js
  |
  |- routes/             # API 라우트
  |   |- auth.js
  |   |- transactions.js
  |   |- categories.js
  |   |- goals.js
  |
  |- app.js              # Express 애플리케이션 설정
  |- server.js           # 서버 시작점
```

### 2. 데이터베이스 설정

#### MongoDB 설정 (추천)
1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) 무료 계정 생성
2. 새 클러스터 생성 및 데이터베이스 사용자 설정
3. 연결 문자열 복사

#### .env 파일 설정
```env
NODE_ENV=development
PORT=5000
MONGO_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-secret-key>
JWT_EXPIRE=30d
```

### 3. 모델 설계

#### User 모델
```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, '사용자 이름을 입력하세요'],
    unique: true,
    trim: true,
    maxlength: [50, '사용자 이름은 최대 50자입니다']
  },
  email: {
    type: String,
    required: [true, '이메일을 입력하세요'],
    unique: true,
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, '유효한 이메일 주소를 입력하세요']
  },
  password: {
    type: String,
    required: [true, '비밀번호를 입력하세요'],
    minlength: [10, '비밀번호는 최소 10자 이상이어야 합니다'],
    select: false
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  last_login: {
    type: Date,
    default: null
  },
  failed_login_attempts: {
    type: Number,
    default: 0
  },
  account_locked: {
    type: Boolean,
    default: false
  },
  reset_password_token: String,
  reset_password_expire: Date
});

// 비밀번호 암호화 미들웨어
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// JWT 토큰 생성 메소드
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, username: this.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// 비밀번호 검증 메소드
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
```

#### Transaction 모델
```javascript
const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, '금액을 입력하세요']
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: [true, '거래 유형을 선택하세요']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, '카테고리를 선택하세요']
  },
  sub_category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: false
  },
  detail_category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: false
  },
  description: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Transaction', TransactionSchema);
```

#### Category 모델
```javascript
const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '카테고리 이름을 입력하세요'],
    trim: true
  },
  type: {
    type: String,
    enum: ['main', 'sub', 'detail'],
    required: [true, '카테고리 유형을 선택하세요']
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: function() {
      return this.type === 'sub' || this.type === 'detail';
    }
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Category', CategorySchema);
```

#### Goal 모델
```javascript
const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['saving', 'spending'],
    required: [true, '목표 유형을 선택하세요']
  },
  amount: {
    type: Number,
    required: [true, '목표 금액을 입력하세요']
  },
  current_amount: {
    type: Number,
    default: 0
  },
  start_date: {
    type: Date,
    default: Date.now
  },
  end_date: {
    type: Date,
    required: [true, '목표 종료 날짜를 설정하세요']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: false
  },
  description: {
    type: String,
    trim: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Goal', GoalSchema);
```

## 클라이언트 측 변경 사항

### API 통합을 위한 서비스 리팩토링

클라이언트의 `utils` 디렉토리 내 서비스 파일들을 API 기반으로 재구성해야 합니다. 다음은 그 예시입니다:

#### apiService.js 생성
```javascript
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// axios 인스턴스 생성
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 쿠키 전송을 위해 필요
});

// 요청 인터셉터 - 인증 토큰 포함
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 - 인증 오류 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    
    // 인증 토큰 만료 시 처리
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // 로그아웃 처리 또는 토큰 갱신 로직
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;
```

#### authService.js 리팩토링
```javascript
import api from './apiService';

// 로그인 서비스
export const loginUser = async (usernameOrEmail, password, autoLogin = false) => {
  try {
    const response = await api.post('/auth/login', { 
      usernameOrEmail,
      password,
      autoLogin // 7일 자동 로그인 옵션
    });
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: '로그인 처리 중 오류가 발생했습니다.' };
  }
};

// 회원가입 서비스
export const registerUser = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: '회원가입 처리 중 오류가 발생했습니다.' };
  }
};

// 로그아웃 서비스
export const logoutUser = async () => {
  try {
    await api.post('/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return { success: true };
  } catch (error) {
    console.error('로그아웃 오류:', error);
    // 실패해도 로컬 스토리지는 비우기
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    throw error.response?.data || { message: '로그아웃 처리 중 오류가 발생했습니다.' };
  }
};

// 토큰 검증 서비스
export const verifyToken = async () => {
  try {
    const response = await api.get('/auth/verify');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: '토큰 검증 중 오류가 발생했습니다.' };
  }
};

// 현재 사용자 정보 가져오기
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: '사용자 정보 조회 중 오류가 발생했습니다.' };
  }
};

// 비밀번호 재설정 요청
export const requestPasswordReset = async (email) => {
  try {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: '비밀번호 재설정 요청 중 오류가 발생했습니다.' };
  }
};
```

#### transactionService.js 생성
```javascript
import api from './apiService';

// 모든 거래 내역 조회
export const getTransactions = async (filters = {}) => {
  try {
    const response = await api.get('/transactions', { params: filters });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: '거래 내역 조회 중 오류가 발생했습니다.' };
  }
};

// 단일 거래 내역 조회
export const getTransaction = async (id) => {
  try {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: '거래 내역 조회 중 오류가 발생했습니다.' };
  }
};

// 거래 내역 추가
export const addTransaction = async (transactionData) => {
  try {
    const response = await api.post('/transactions', transactionData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: '거래 내역 추가 중 오류가 발생했습니다.' };
  }
};

// 거래 내역 수정
export const updateTransaction = async (id, transactionData) => {
  try {
    const response = await api.put(`/transactions/${id}`, transactionData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: '거래 내역 수정 중 오류가 발생했습니다.' };
  }
};

// 거래 내역 삭제
export const deleteTransaction = async (id) => {
  try {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: '거래 내역 삭제 중 오류가 발생했습니다.' };
  }
};

// 거래 분석 데이터 가져오기
export const getTransactionAnalytics = async (params = {}) => {
  try {
    const response = await api.get('/transactions/analytics', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: '거래 분석 데이터 조회 중 오류가 발생했습니다.' };
  }
};
```

### AuthContext 컴포넌트 수정

프론트엔드의 AuthContext도 서버 기반 인증 방식으로 변경해야 합니다:

```javascript
import React, { createContext, useState, useEffect } from 'react';
import {
  loginUser,
  registerUser,
  verifyToken,
  getCurrentUser,
  logoutUser
} from '../utils/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());

  // 활동 감지 및 자동 로그아웃 기능
  useEffect(() => {
    const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30분
    
    const resetActivityTimer = () => setLastActivityTime(Date.now());
    
    // 사용자 활동 이벤트 감지
    window.addEventListener('mousemove', resetActivityTimer);
    window.addEventListener('keydown', resetActivityTimer);
    window.addEventListener('click', resetActivityTimer);
    
    // 비활성 체크 타이머
    const checkInactivity = setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastActivityTime;
      if (user && timeSinceLastActivity > INACTIVITY_TIMEOUT) {
        console.log('장시간 활동이 없어 자동 로그아웃됩니다.');
        logout();
      }
    }, 60000); // 1분마다 체크
    
    return () => {
      window.removeEventListener('mousemove', resetActivityTimer);
      window.removeEventListener('keydown', resetActivityTimer);
      window.removeEventListener('click', resetActivityTimer);
      clearInterval(checkInactivity);
    };
  }, [user, lastActivityTime]);

  // 초기 인증 상태 확인
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        await verifyToken(); // 토큰 유효성 검사
        const userData = await getCurrentUser(); // 사용자 정보 가져오기
        setUser(userData);
        setError(null);
      } catch (err) {
        console.error('인증 오류:', err);
        setError('세션이 만료되었습니다. 다시 로그인해주세요.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();
  }, []);

  // 로그인 함수
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      // 입력 유효성 검증
      if (!credentials.usernameOrEmail || !credentials.password) {
        throw new Error('사용자 이름/이메일과 비밀번호를 모두 입력해주세요.');
      }
      
      const response = await loginUser(
        credentials.usernameOrEmail, 
        credentials.password,
        credentials.autoLogin // 자동 로그인 옵션 전달
      );
      
      setUser(response.user);
      setLastActivityTime(Date.now());
      return response.user;
    } catch (error) {
      console.error('로그인 실패:', error);
      setError(error.message || '로그인에 실패했습니다.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 회원가입 함수
  const register = async (userData) => {
    try {
      return await registerUser(userData);
    } catch (error) {
      throw error;
    }
  };

  // 로그아웃 함수
  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
      setError(null);
      console.log('로그아웃 성공');
    } catch (err) {
      console.error('로그아웃 오류:', err);
      // 오류가 발생해도 로컬에서는 로그아웃 처리
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error,
      login, 
      register, 
      logout,
      setError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
```

## 백엔드 API 구현

백엔드 API는 다음과 같은 엔드포인트를 구현해야 합니다:

### 인증 API 엔드포인트
- POST /api/auth/register - 회원가입
- POST /api/auth/login - 로그인
- POST /api/auth/logout - 로그아웃
- GET /api/auth/verify - 토큰 검증
- GET /api/auth/me - 현재 사용자 정보
- POST /api/auth/forgot-password - 비밀번호 재설정 요청
- PUT /api/auth/reset-password/:token - 비밀번호 재설정

### 거래 API 엔드포인트
- GET /api/transactions - 거래 내역 목록
- GET /api/transactions/:id - 단일 거래 조회
- POST /api/transactions - 거래 내역 추가
- PUT /api/transactions/:id - 거래 내역 수정
- DELETE /api/transactions/:id - 거래 내역 삭제
- GET /api/transactions/analytics - 거래 분석 데이터

### 카테고리 API 엔드포인트
- GET /api/categories - 카테고리 목록
- GET /api/categories/:id - 단일 카테고리 조회
- POST /api/categories - 카테고리 추가
- PUT /api/categories/:id - 카테고리 수정
- DELETE /api/categories/:id - 카테고리 삭제

### 목표 API 엔드포인트
- GET /api/goals - 사용자 목표 목록
- GET /api/goals/:id - 단일 목표 조회
- POST /api/goals - 새 목표 설정
- PUT /api/goals/:id - 목표 수정
- DELETE /api/goals/:id - 목표 삭제
- PUT /api/goals/:id/progress - 목표 진행 상황 업데이트

## 배포 계획

### 서버 배포
1. [Heroku](https://heroku.com) 또는 [Render](https://render.com) 사용 가능
2. MongoDB Atlas와 연동
3. 환경변수 설정

### 클라이언트 배포
1. [Vercel](https://vercel.com) 또는 [Netlify](https://netlify.com) 사용 가능
2. 환경변수로 API URL 설정

## 데이터 마이그레이션 전략

localStorage에서 서버 데이터베이스로 기존 데이터를 마이그레이션하는 방법:

1. 마이그레이션 스크립트 개발:
   - 사용자가 처음 로그인할 때 localStorage 데이터 검사
   - 데이터가 있다면 서버로 전송
   - 마이그레이션 완료 후 localStorage 데이터 삭제

2. 단계적 마이그레이션:
   - 처음에는 두 데이터 소스를 병렬로 유지
   - 서버 기능이 안정화되면 localStorage 지원 중단

## 결론

서버 및 데이터베이스 기반 아키텍처로 전환함으로써 다음과 같은 이점을 얻을 수 있습니다:

1. 보안성 향상: 민감한 데이터를 클라이언트에서 서버로 이동
2. 확장성 개선: 사용자 수 증가에도 효율적인 데이터 처리
3. 다중 기기 지원: 여러 기기에서 동일한 계정으로 접근 가능
4. 데이터 백업 및 복구 용이
5. 고급 기능 구현 가능: 데이터 분석, 푸시 알림 등

이 마이그레이션은 점진적으로 진행하면서 기존 사용자 경험을 해치지 않도록 유의해야 합니다.

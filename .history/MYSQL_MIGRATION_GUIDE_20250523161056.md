# MySQL로 마이그레이션 가이드

## 개요
이 문서는 가계부 앱의 저장 방식을 로컬스토리지에서 MySQL 기반 서버로 전환하는 과정을 설명합니다.

## 준비 사항
1. MySQL 데이터베이스 서버 설치 및 구성
2. 서버 측 환경 구성
3. 클라이언트 측 API 통합

## MySQL 설정 방법

### 1. MySQL 서버 설치
- Windows: MySQL 공식 웹사이트에서 MySQL Installer 다운로드 및 설치
- macOS: Homebrew를 통해 설치: `brew install mysql`
- Linux: `sudo apt install mysql-server` (Ubuntu) 또는 `sudo yum install mysql-server` (CentOS)

### 2. 데이터베이스 생성
```sql
CREATE DATABASE money_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. 사용자 생성 및 권한 설정
```sql
CREATE USER 'moneyapp_user'@'localhost' IDENTIFIED BY 'your_strong_password';
GRANT ALL PRIVILEGES ON money_app.* TO 'moneyapp_user'@'localhost';
FLUSH PRIVILEGES;
```

### 4. 환경 변수 설정
`server/config/config.env` 파일에서 다음 값들을 자신의 환경에 맞게 수정:
```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=money_app
DB_USER=moneyapp_user
DB_PASSWORD=your_strong_password
```

## 서버 모델 구조

### 사용자 모델 (User)
```javascript
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  // 기타 필드...
});
```

### 거래 모델 (Transaction)
```javascript
const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('income', 'expense'),
    allowNull: false
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  description: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
});
```

### 목표 모델 (Goal)
```javascript
const Goal = sequelize.define('Goal', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  target: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  current: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  }
  // 기타 필드...
});
```

## 클라이언트 마이그레이션 방법

### 1. 환경 변수 설정
클라이언트에서 서버 모드를 사용하려면:
```
REACT_APP_USE_SERVER=true
REACT_APP_API_URL=http://localhost:5000/api
```

### 2. API 서비스 설정
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});
```

### 3. 인증 컨텍스트 변경
```jsx
// src/App.jsx
import { AuthProvider } from './context/ServerAuthContext';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};
```

### 4. 데이터 마이그레이션 처리
```javascript
// 사용자 로그인 성공 후
checkForDataMigration(userId);

// 마이그레이션 함수
async function checkForDataMigration(userId) {
  // 로컬 스토리지 데이터가 있는지 확인
  const localData = localStorage.getItem('entries');
  if (localData && !localStorage.getItem('dataMigrated')) {
    // 사용자에게 확인
    if (confirm('기존 데이터를 서버로 이전하시겠습니까?')) {
      // 데이터 마이그레이션 요청
      await migrateData(userId, JSON.parse(localData));
      localStorage.setItem('dataMigrated', 'true');
    }
  }
}
```

## 데이터베이스 초기화 명령어

데이터베이스 테이블 초기화:
```
npm run init-db
```

이 명령어는 `src/db/init-db.js` 스크립트를 실행하여 데이터베이스 테이블을 생성하고 기본 데이터를 추가합니다.

## 지원 및 문제 해결

문제가 발생한 경우:
1. 데이터베이스 연결 문제: 환경 변수와 MySQL 서버 상태 확인
2. 마이그레이션 오류: 로그 확인 후 수동 마이그레이션 시도
3. API 연결 오류: CORS 설정 및 API URL 확인

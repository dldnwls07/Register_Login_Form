# 지출 앱 데이터베이스 설치 가이드

## 1. MySQL 설치 및 설정

### MySQL 서버 설치
- [MySQL 공식 다운로드 페이지](https://dev.mysql.com/downloads/mysql/)에서 MySQL 서버를 다운로드하여 설치합니다.
- 설치 중 비밀번호를 설정합니다 (이 비밀번호를 기억해두세요).

### 데이터베이스 생성
MySQL 명령줄 클라이언트 또는 MySQL Workbench를 사용하여 다음 명령을 실행합니다:

```sql
CREATE DATABASE money_app_db;
USE money_app_db;
```

## 2. 스키마 생성 및 샘플 데이터 입력

`src/db/schema.sql` 파일을 MySQL에서 실행합니다:

1. MySQL Workbench를 사용하는 경우:
   - 파일 > 스크립트 불러오기 > schema.sql 선택 후 실행

2. 명령줄을 사용하는 경우:
   ```bash
   mysql -u root -p money_app_db < src/db/schema.sql
   ```
   (비밀번호를 입력하라는 메시지가 표시됩니다)

## 3. 애플리케이션 설정

프로젝트에서 MySQL 연결 설정을 업데이트합니다:

1. MySQL용 패키지 설치:
   ```bash
   npm install mysql2
   ```

2. `src/utils/dbService.js` 파일에서 데이터베이스 연결 정보를 수정합니다:
   ```javascript
   const dbConfig = {
     host: 'localhost',
     user: 'root',     // MySQL 사용자명
     password: '비밀번호',  // 설치 시 설정한 비밀번호
     database: 'money_app_db',
     waitForConnections: true,
     connectionLimit: 10,
     queueLimit: 0
   };
   ```

## 4. 데이터베이스 연결 테스트

애플리케이션에서 `testConnection()` 함수를 호출하여 데이터베이스 연결을 테스트할 수 있습니다.

```javascript
import { testConnection } from './utils/dbService';

async function checkDbConnection() {
  const isConnected = await testConnection();
  console.log('DB 연결 상태:', isConnected ? '성공' : '실패');
}

checkDbConnection();
```

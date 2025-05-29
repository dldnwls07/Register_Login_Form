-- 지출 카테고리 데이터베이스 스키마

-- 대분류 테이블
CREATE TABLE IF NOT EXISTS main_categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 중분류 테이블
CREATE TABLE IF NOT EXISTS sub_categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  main_category_id INT NOT NULL,
  name VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (main_category_id) REFERENCES main_categories(id)
);

-- 소분류 테이블
CREATE TABLE IF NOT EXISTS detail_categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sub_category_id INT NOT NULL,
  name VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sub_category_id) REFERENCES sub_categories(id)
);

-- 거래(지출) 테이블
CREATE TABLE IF NOT EXISTS transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  detail_category_id INT,
  amount DECIMAL(10, 2) NOT NULL,
  date DATE NOT NULL,
  memo TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (detail_category_id) REFERENCES detail_categories(id)
);

-- 재정 목표 테이블
CREATE TABLE IF NOT EXISTS financial_goals (
  id INT PRIMARY KEY AUTO_INCREMENT,
  amount DECIMAL(10, 2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_achieved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 카테고리 데이터 삽입
-- 대분류 데이터
INSERT INTO main_categories (name) VALUES
('생활 필수비'),
('소비/여가/취미'),
('업무/비즈니스'),
('가족/가정'),
('금융/투자'),
('기타');

-- 중분류 데이터 (생활 필수비)
INSERT INTO sub_categories (main_category_id, name) VALUES
(1, '식비'),
(1, '주거비'),
(1, '공과금'),
(1, '통신비'),
(1, '교통비'),
(1, '의료/건강'),
(1, '보험료');

-- 중분류 데이터 (소비/여가/취미)
INSERT INTO sub_categories (main_category_id, name) VALUES
(2, '쇼핑'),
(2, '외식/카페'),
(2, '문화생활'),
(2, '취미/자기계발'),
(2, '구독서비스');

-- 중분류 데이터 (업무/비즈니스)
INSERT INTO sub_categories (main_category_id, name) VALUES
(3, '사무/운영비'),
(3, '회의/접대'),
(3, '출장비'),
(3, 'IT/기술'),
(3, '인건비'),
(3, '광고/마케팅'),
(3, '법률/세무');

-- 중분류 데이터 (가족/가정)
INSERT INTO sub_categories (main_category_id, name) VALUES
(4, '육아'),
(4, '교육비'),
(4, '경조사'),
(4, '가사 서비스'),
(4, '반려동물'),
(4, '부모님 용돈');

-- 중분류 데이터 (금융/투자)
INSERT INTO sub_categories (main_category_id, name) VALUES
(5, '저축/투자'),
(5, '대출 상환'),
(5, '카드/수수료'),
(5, '연금/보험');

-- 중분류 데이터 (기타)
INSERT INTO sub_categories (main_category_id, name) VALUES
(6, '미분류/기타'),
(6, '기부/후원'),
(6, '벌금/과태료'),
(6, '팁/포상'),
(6, '비상금'),
(6, '도난/파손');

-- 소분류 데이터 (식비)
INSERT INTO detail_categories (sub_category_id, name) VALUES
(1, '식자재 구입'),
(1, '외식'),
(1, '배달음식'),
(1, '간식/음료');

-- 소분류 데이터 (주거비)
INSERT INTO detail_categories (sub_category_id, name) VALUES
(2, '월세/전세'),
(2, '관리비'),
(2, '가구/가전'),
(2, '집 수리/리모델링');

-- 소분류 데이터 (공과금)
INSERT INTO detail_categories (sub_category_id, name) VALUES
(3, '전기요금'),
(3, '수도요금'),
(3, '가스요금'),
(3, '난방비');

-- 소분류 데이터 (통신비)
INSERT INTO detail_categories (sub_category_id, name) VALUES
(4, '휴대폰 요금'),
(4, '인터넷'),
(4, 'IPTV/케이블 TV');

-- 나머지 소분류 데이터도 마찬가지로 추가할 수 있습니다.
-- 여기서는 일부만 예시로 작성했습니다.

-- 교통비 소분류
INSERT INTO detail_categories (sub_category_id, name) VALUES
(5, '대중교통'),
(5, '택시'),
(5, '차량 주유'),
(5, '자동차 보험'),
(5, '차량 정비/세차'),
(5, '주차비');

-- 의료/건강 소분류
INSERT INTO detail_categories (sub_category_id, name) VALUES
(6, '병원 진료'),
(6, '약국'),
(6, '건강검진'),
(6, '치과/안과'),
(6, '건강기능식품');

-- 이하 각 중분류별 소분류 데이터 추가...

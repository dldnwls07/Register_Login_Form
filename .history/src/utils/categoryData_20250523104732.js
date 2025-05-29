/**
 * 지출 카테고리 데이터
 * 앱에서 사용할 수 있는 구조화된 형태로 제공
 */

export const CATEGORIES = {
  // 1. 생활 필수비
  LIVING_ESSENTIALS: {
    id: 1,
    name: '생활 필수비',
    subcategories: {
      FOOD: {
        id: 1,
        name: '식비',
        details: [
          { id: 1, name: '식자재 구입' },
          { id: 2, name: '외식' },
          { id: 3, name: '배달음식' },
          { id: 4, name: '간식/음료' }
        ]
      },
      HOUSING: {
        id: 2,
        name: '주거비',
        details: [
          { id: 5, name: '월세/전세' },
          { id: 6, name: '관리비' },
          { id: 7, name: '가구/가전' },
          { id: 8, name: '집 수리/리모델링' }
        ]
      },
      UTILITIES: {
        id: 3,
        name: '공과금',
        details: [
          { id: 9, name: '전기요금' },
          { id: 10, name: '수도요금' },
          { id: 11, name: '가스요금' },
          { id: 12, name: '난방비' }
        ]
      },
      COMMUNICATION: {
        id: 4,
        name: '통신비',
        details: [
          { id: 13, name: '휴대폰 요금' },
          { id: 14, name: '인터넷' },
          { id: 15, name: 'IPTV/케이블 TV' }
        ]
      },
      TRANSPORTATION: {
        id: 5,
        name: '교통비',
        details: [
          { id: 16, name: '대중교통' },
          { id: 17, name: '택시' },
          { id: 18, name: '차량 주유' },
          { id: 19, name: '자동차 보험' },
          { id: 20, name: '차량 정비/세차' },
          { id: 21, name: '주차비' }
        ]
      },
      MEDICAL: {
        id: 6,
        name: '의료/건강',
        details: [
          { id: 22, name: '병원 진료' },
          { id: 23, name: '약국' },
          { id: 24, name: '건강검진' },
          { id: 25, name: '치과/안과' },
          { id: 26, name: '건강기능식품' }
        ]
      },
      INSURANCE: {
        id: 7,
        name: '보험료',
        details: [
          { id: 27, name: '생명보험' },
          { id: 28, name: '자동차보험' },
          { id: 29, name: '실손보험' },
          { id: 30, name: '연금보험' }
        ]
      }
    }
  },
  
  // 2. 소비/여가/취미
  LEISURE: {
    id: 2,
    name: '소비/여가/취미',
    subcategories: {
      SHOPPING: {
        id: 8,
        name: '쇼핑',
        details: [
          { id: 31, name: '의류/패션' },
          { id: 32, name: '신발/가방' },
          { id: 33, name: '전자기기' },
          { id: 34, name: '잡화/소형가전' }
        ]
      },
      DINING: {
        id: 9,
        name: '외식/카페',
        details: [
          { id: 35, name: '레스토랑' },
          { id: 36, name: '패스트푸드' },
          { id: 37, name: '카페/디저트' }
        ]
      },
      CULTURE: {
        id: 10,
        name: '문화생활',
        details: [
          { id: 38, name: '영화/공연' },
          { id: 39, name: '도서/서적' },
          { id: 40, name: '전시회/박물관' }
        ]
      },
      HOBBY: {
        id: 11,
        name: '취미/자기계발',
        details: [
          { id: 41, name: '운동/헬스' },
          { id: 42, name: '공예/DIY' },
          { id: 43, name: '악기/음악' },
          { id: 44, name: '사진/영상 장비' }
        ]
      },
      SUBSCRIPTION: {
        id: 12,
        name: '구독서비스',
        details: [
          { id: 45, name: '넷플릭스/디즈니+' },
          { id: 46, name: '유튜브 프리미엄' },
          { id: 47, name: '뉴스/잡지' },
          { id: 48, name: '음악 스트리밍' }
        ]
      }
    }
  },
  
  // 3. 업무/비즈니스
  BUSINESS: {
    id: 3,
    name: '업무/비즈니스',
    subcategories: {
      OFFICE: {
        id: 13,
        name: '사무/운영비',
        details: [
          { id: 49, name: '사무용품' },
          { id: 50, name: '프린터/소모품' },
          { id: 51, name: '사무실 임대' }
        ]
      },
      MEETING: {
        id: 14,
        name: '회의/접대',
        details: [
          { id: 52, name: '회식비' },
          { id: 53, name: '접대비' },
          { id: 54, name: '커피/간식' }
        ]
      },
      BUSINESS_TRIP: {
        id: 15,
        name: '출장비',
        details: [
          { id: 55, name: '교통비' },
          { id: 56, name: '숙박비' },
          { id: 57, name: '식대' }
        ]
      },
      IT: {
        id: 16,
        name: 'IT/기술',
        details: [
          { id: 58, name: '소프트웨어 구독' },
          { id: 59, name: '도메인/호스팅' },
          { id: 60, name: '웹사이트 유지비' }
        ]
      },
      LABOR: {
        id: 17,
        name: '인건비',
        details: [
          { id: 61, name: '급여' },
          { id: 62, name: '외주/프리랜서비' },
          { id: 63, name: '복리후생' }
        ]
      },
      MARKETING: {
        id: 18,
        name: '광고/마케팅',
        details: [
          { id: 64, name: 'SNS광고' },
          { id: 65, name: '오프라인 광고' },
          { id: 66, name: '브랜딩/디자인비' }
        ]
      },
      LEGAL: {
        id: 19,
        name: '법률/세무',
        details: [
          { id: 67, name: '회계/세무 자문' },
          { id: 68, name: '법률 자문' },
          { id: 69, name: '특허/상표 등록비' }
        ]
      }
    }
  },
  
  // 4. 가족/가정
  FAMILY: {
    id: 4,
    name: '가족/가정',
    subcategories: {
      CHILDCARE: {
        id: 20,
        name: '육아',
        details: [
          { id: 70, name: '분유/기저귀' },
          { id: 71, name: '장난감/유아용품' },
          { id: 72, name: '유치원/보육료' }
        ]
      },
      EDUCATION: {
        id: 21,
        name: '교육비',
        details: [
          { id: 73, name: '학원비' },
          { id: 74, name: '교재 구입' },
          { id: 75, name: '온라인 강의' }
        ]
      },
      EVENTS: {
        id: 22,
        name: '경조사',
        details: [
          { id: 76, name: '결혼식 축의금' },
          { id: 77, name: '장례식 조의금' },
          { id: 78, name: '돌잔치/기념일' }
        ]
      },
      HOME_SERVICE: {
        id: 23,
        name: '가사 서비스',
        details: [
          { id: 79, name: '청소/세탁 대행' },
          { id: 80, name: '가사도우미' },
          { id: 81, name: '이사비용' }
        ]
      },
      PETS: {
        id: 24,
        name: '반려동물',
        details: [
          { id: 82, name: '사료/간식' },
          { id: 83, name: '동물병원' },
          { id: 84, name: '미용/용품' }
        ]
      },
      PARENTS: {
        id: 25,
        name: '부모님 용돈',
        details: [
          { id: 85, name: '생활비 지원' },
          { id: 86, name: '명절 선물' }
        ]
      }
    }
  },
  
  // 5. 금융/투자
  FINANCE: {
    id: 5,
    name: '금융/투자',
    subcategories: {
      INVESTMENT: {
        id: 26,
        name: '저축/투자',
        details: [
          { id: 87, name: '정기예금/적금' },
          { id: 88, name: '펀드' },
          { id: 89, name: '주식 투자' },
          { id: 90, name: '암호화폐' }
        ]
      },
      LOAN: {
        id: 27,
        name: '대출 상환',
        details: [
          { id: 91, name: '학자금대출' },
          { id: 92, name: '신용대출' },
          { id: 93, name: '자동차 할부' }
        ]
      },
      FEE: {
        id: 28,
        name: '카드/수수료',
        details: [
          { id: 94, name: '신용카드 결제' },
          { id: 95, name: '계좌이체 수수료' },
          { id: 96, name: '해외 결제 수수료' }
        ]
      },
      PENSION: {
        id: 29,
        name: '연금/보험',
        details: [
          { id: 97, name: '국민연금' },
          { id: 98, name: '퇴직연금' },
          { id: 99, name: '개인연금' }
        ]
      }
    }
  },
  
  // 6. 기타
  ETC: {
    id: 6,
    name: '기타',
    subcategories: {
      MISC: {
        id: 30,
        name: '미분류/기타',
        details: [
          { id: 100, name: '분류불가 항목' },
          { id: 101, name: '실수 지출' }
        ]
      },
      DONATION: {
        id: 31,
        name: '기부/후원',
        details: [
          { id: 102, name: 'NGO기부' },
          { id: 103, name: '종교단체' },
          { id: 104, name: '후원금' }
        ]
      },
      FINE: {
        id: 32,
        name: '벌금/과태료',
        details: [
          { id: 105, name: '주차위반' },
          { id: 106, name: '교통위반' }
        ]
      },
      TIP: {
        id: 33,
        name: '팁/포상',
        details: [
          { id: 107, name: '서비스 팁' },
          { id: 108, name: '보너스/사례비' }
        ]
      },
      EMERGENCY: {
        id: 34,
        name: '비상금',
        details: [
          { id: 109, name: '예비비' },
          { id: 110, name: '긴급지출' }
        ]
      },
      DAMAGE: {
        id: 35,
        name: '도난/파손',
        details: [
          { id: 111, name: '물품분실' },
          { id: 112, name: '수리비' }
        ]
      }
    }
  }
};

// 플랫한 형태의 대분류 목록
export const mainCategories = [
  { id: 1, name: '생활 필수비' },
  { id: 2, name: '소비/여가/취미' },
  { id: 3, name: '업무/비즈니스' },
  { id: 4, name: '가족/가정' },
  { id: 5, name: '금융/투자' },
  { id: 6, name: '기타' },
];

// 모든 중분류 목록을 생성하는 함수
export function getAllSubCategories() {
  const subCategoriesList = [];
  
  Object.values(CATEGORIES).forEach(mainCategory => {
    Object.values(mainCategory.subcategories).forEach(subCategory => {
      subCategoriesList.push({
        id: subCategory.id,
        name: subCategory.name,
        mainCategoryId: mainCategory.id,
        mainCategoryName: mainCategory.name
      });
    });
  });
  
  return subCategoriesList;
}

// 모든 소분류 목록을 생성하는 함수
export function getAllDetailCategories() {
  const detailCategoriesList = [];
  
  Object.values(CATEGORIES).forEach(mainCategory => {
    Object.values(mainCategory.subcategories).forEach(subCategory => {
      subCategory.details.forEach(detail => {
        detailCategoriesList.push({
          id: detail.id,
          name: detail.name,
          subCategoryId: subCategory.id,
          subCategoryName: subCategory.name,
          mainCategoryId: mainCategory.id,
          mainCategoryName: mainCategory.name
        });
      });
    });
  });
  
  return detailCategoriesList;
}

// 대분류 ID로 중분류 목록 가져오기
export function getSubCategoriesByMainId(mainCategoryId) {
  const mainCategoryKey = Object.keys(CATEGORIES).find(
    key => CATEGORIES[key].id === mainCategoryId
  );
  
  if (!mainCategoryKey) return [];
  
  const mainCategory = CATEGORIES[mainCategoryKey];
  return Object.values(mainCategory.subcategories).map(sub => ({
    id: sub.id,
    name: sub.name,
    mainCategoryId: mainCategory.id
  }));
}

// 중분류 ID로 소분류 목록 가져오기
export function getDetailCategoriesBySubId(subCategoryId) {
  let details = [];
  
  Object.values(CATEGORIES).forEach(mainCategory => {
    Object.values(mainCategory.subcategories).forEach(subCategory => {
      if (subCategory.id === subCategoryId) {
        details = subCategory.details.map(detail => ({
          id: detail.id,
          name: detail.name,
          subCategoryId: subCategory.id
        }));
      }
    });
  });
  
  return details;
}

// ID로 카테고리 전체 경로 가져오기
export function getCategoryPathById(detailCategoryId) {
  const allDetails = getAllDetailCategories();
  const detail = allDetails.find(d => d.id === detailCategoryId);
  
  if (!detail) return { main: '', sub: '', detail: '' };
  
  return {
    main: detail.mainCategoryName,
    sub: detail.subCategoryName,
    detail: detail.name
  };
}

# 커피 주문 앱 - 백엔드 서버

## 개발 환경 설정

### 필수 요구사항
- Node.js (v18 이상)
- PostgreSQL (v14 이상)
- npm 또는 yarn

### 설치 방법

1. 의존성 설치:
```bash
npm install
```

2. 환경 변수 설정:
`.env` 파일을 직접 생성하고 다음 내용을 입력하세요:
```
PORT=3000
NODE_ENV=development

# 데이터베이스 설정
DB_HOST=localhost
DB_PORT=5432
DB_NAME=coffee_order_db
DB_USER=postgres
DB_PASSWORD=postgres
```
`.env` 파일을 열어 데이터베이스 설정을 수정하세요.

3. 데이터베이스 생성:
PostgreSQL에 접속하여 데이터베이스를 생성하세요:
```sql
CREATE DATABASE coffee_order_db;
```

4. 개발 서버 실행:
```bash
npm run dev
```

5. 프로덕션 서버 실행:
```bash
npm start
```

## 프로젝트 구조

```
server/
├── src/
│   ├── server.js          # 메인 서버 파일
│   ├── routes/            # API 라우트
│   ├── controllers/       # 컨트롤러
│   ├── models/            # 데이터 모델
│   ├── middleware/        # 미들웨어
│   └── config/
│       └── database.js    # 데이터베이스 연결 설정
├── scripts/
│   ├── create-database.js # 데이터베이스 생성 스크립트
│   ├── test-db.js         # 데이터베이스 연결 테스트
│   └── create-schema.js  # 스키마 생성 스크립트
├── .env                   # 환경 변수 파일 (직접 생성)
├── .gitignore
├── package.json
└── README.md
```

## 기술 스택
- Node.js
- Express.js
- PostgreSQL

## API 엔드포인트

### 기본
- `GET /` - 서버 상태 확인
- `GET /api/health` - 헬스 체크

### 메뉴 관련 (추후 구현)
- `GET /api/menus` - 메뉴 목록 조회
- `GET /api/menus/:id` - 메뉴 상세 조회
- `PUT /api/menus/:id/stock` - 재고 수정

### 주문 관련 (추후 구현)
- `POST /api/orders` - 주문 생성
- `GET /api/orders` - 주문 목록 조회
- `GET /api/orders/:id` - 주문 상세 조회
- `PUT /api/orders/:id/status` - 주문 상태 변경

### 통계 관련 (추후 구현)
- `GET /api/stats/orders` - 주문 통계 조회

## 사용 가능한 스크립트

- `npm start` - 프로덕션 서버 실행
- `npm run dev` - 개발 서버 실행 (nodemon 사용)
- `npm run create-db` - 데이터베이스 생성
- `npm run test-db` - 데이터베이스 연결 테스트
- `npm run create-schema` - 데이터베이스 스키마 생성

## 데이터베이스 스키마

다음 테이블들이 생성됩니다:
- `menus` - 메뉴 정보
- `options` - 메뉴 옵션
- `orders` - 주문 정보
- `order_items` - 주문 상세 항목
- `order_item_options` - 주문 항목의 선택된 옵션

## 개발 가이드

자세한 API 명세는 `docs/PRD.md` 파일의 "5. 백엔드 개발 요구사항" 섹션을 참고하세요.

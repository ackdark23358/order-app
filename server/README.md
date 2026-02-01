# 커피 주문 앱 - 백엔드 서버

Express + PostgreSQL 기반 API 서버입니다.

## 요구사항

- Node.js v18 이상
- PostgreSQL v14 이상
- npm 또는 yarn

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수

프로젝트 루트의 `server/` 디렉터리에 `.env` 파일을 만들고 다음을 설정합니다.

```
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=coffee_order_db
DB_USER=postgres
DB_PASSWORD=postgres
```

Render 등 프로덕션에서는 PostgreSQL 서비스 연결 정보를 사용하고, `NODE_ENV=production` 시 DB SSL 연결이 적용됩니다.

### 3. 데이터베이스 생성

PostgreSQL에서:

```sql
CREATE DATABASE coffee_order_db;
```

또는 스크립트 사용:

```bash
npm run create-db
```

### 4. 스키마 및 초기 데이터

```bash
npm run create-schema   # 테이블 생성
npm run insert-data    # 메뉴·옵션 초기 데이터 (이미 있으면 스킵)
npm run check-db       # 데이터 확인
```

### 5. 서버 실행

```bash
npm run dev    # 개발 (nodemon)
npm start      # 프로덕션
```

## 프로젝트 구조

```
server/
├── src/
│   ├── server.js           # 메인 진입점, CORS, 정적(UI/dist), API 라우트
│   ├── config/
│   │   └── database.js     # PostgreSQL 풀 설정
│   └── routes/
│       ├── menus.js        # 메뉴 CRUD, 재고 수정
│       ├── orders.js       # 주문 생성·조회·상태 변경
│       └── stats.js        # 주문 통계
├── scripts/
│   ├── create-database.js # DB 생성
│   ├── create-schema.js   # 스키마(테이블) 생성
│   ├── insert-initial-data.js  # 메뉴·옵션 초기 데이터 (image_url 포함)
│   ├── check-database.js   # DB 상태·메뉴·옵션·주문 확인
│   ├── check-menus.js      # 메뉴 상세 확인
│   └── test-db.js          # 연결 테스트
├── .env                    # 환경 변수 (직접 생성)
├── package.json
└── README.md
```

## 스크립트

| 명령 | 설명 |
|------|------|
| `npm start` | 프로덕션 서버 실행 |
| `npm run dev` | 개발 서버 (nodemon) |
| `npm run create-db` | 데이터베이스 생성 |
| `npm run create-schema` | 테이블·인덱스 생성 |
| `npm run insert-data` | 초기 메뉴·옵션 삽입 (중복 시 스킵) |
| `npm run check-db` | DB 내용 확인 |
| `npm run check-menus` | 메뉴·옵션 상세 확인 |
| `npm run test-db` | DB 연결 테스트 |

## 데이터베이스 스키마

- **menus** - 메뉴 (id, name, description, price, image_url, stock)
- **options** - 메뉴별 옵션 (menu_id, name, price)
- **orders** - 주문 (order_date, status, total_amount)
- **order_items** - 주문 항목 (order_id, menu_id, quantity, unit_price, total_price)
- **order_item_options** - 주문 항목별 옵션 (order_item_id, option_id)

## API 엔드포인트

### 공통

- `GET /` - 서버 안내
- `GET /api` - API 안내 (JSON)
- `GET /api/health` - 헬스 체크 (DB 연결 포함)

### 메뉴

- `GET /api/menus` - 메뉴 목록 (옵션 포함)
- `GET /api/menus/:id` - 메뉴 상세
- `PUT /api/menus/:id/stock` - 재고 수정 (body: `{ "change": number }`)

### 주문

- `POST /api/orders` - 주문 생성 (body: `{ "items": [...], "total_amount": number }`)
- `GET /api/orders` - 주문 목록 (query: status, limit, offset)
- `GET /api/orders/:id` - 주문 상세
- `PUT /api/orders/:id/status` - 주문 상태 변경 (body: `{ "status": "preparing" | "completed" }`)

### 통계

- `GET /api/stats/orders` - 주문 통계 (total, received, preparing, completed)

상세 요구사항은 저장소 루트의 `docs/PRD.md`를 참고하세요.

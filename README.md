# COZY - 커피 주문 앱

사용자가 커피 메뉴를 주문하고, 관리자가 재고·주문 상태를 관리할 수 있는 풀스택 웹 앱입니다.

**본 서비스는 Cursor AI로 생성되었습니다.** 메타데이터와 화면 하단 문구로 이를 명시합니다.

## 기술 스택

| 구분 | 기술 |
|------|------|
| 프론트엔드 | React 18, Vite 5, JavaScript, Tailwind CSS |
| 백엔드 | Node.js, Express |
| 데이터베이스 | PostgreSQL |

## 프로젝트 구조

```
order-app/
├── UI/                    # 프론트엔드 (React + Vite)
│   ├── public/images/     # 메뉴 이미지 (menu-1.jpg ~ menu-6.png)
│   ├── src/
│   │   ├── api/           # API 클라이언트
│   │   ├── components/    # Header, MenuCard, ShoppingCart, Admin 등
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── README.md
├── server/                # 백엔드 (Express + PostgreSQL)
│   ├── src/
│   │   ├── config/        # DB 연결
│   │   ├── routes/        # menus, orders, stats API
│   │   └── server.js
│   ├── scripts/          # DB 생성·스키마·초기데이터·확인
│   ├── package.json
│   └── README.md
├── docs/                  # PRD, 배포 가이드
├── render.yaml            # Render 배포 설정 (참고용)
└── README.md
```

## 로컬 개발

### 요구사항

- Node.js v18 이상
- PostgreSQL v14 이상
- npm 또는 yarn

### 1. 데이터베이스 준비

```sql
CREATE DATABASE coffee_order_db;
```

### 2. 백엔드

```bash
cd server
npm install
```

`.env` 파일 생성:

```
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=coffee_order_db
DB_USER=postgres
DB_PASSWORD=postgres
```

스키마 및 초기 데이터:

```bash
npm run create-schema
npm run insert-data
npm run dev
```

### 3. 프론트엔드

```bash
cd UI
npm install
npm run dev
```

브라우저에서 `http://localhost:5173` 접속. API는 `http://localhost:3000`을 사용하려면 UI의 `.env`에 `VITE_API_URL=http://localhost:3000/api` 설정.

### 같은 오리진으로 실행 (선택)

백엔드가 UI 빌드 결과를 서빙하도록 한 뒤, 백엔드만 실행:

```bash
cd UI && npm run build
cd ../server && npm start
```

이후 `http://localhost:3000`에서 앱과 API 모두 이용 가능.

## 배포 (Render.com)

- **같은 오리진 권장**: 백엔드 하나로 API + UI 정적 파일 서빙 → CORS 불필요.
- Root 비움, Build: `cd server && npm install && cd ../UI && npm install && npm run build`, Start: `cd server && node src/server.js`
- 환경 변수: `NODE_ENV`, `PORT`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` (PostgreSQL 서비스 연결 정보)
- 배포 후 DB 초기화: Render Shell 또는 로컬에서 `npm run create-schema`, `npm run insert-data` 실행

자세한 단계는 `docs/DEPLOYMENT.md` 참고.

## Cursor AI 생성 고지

- **메타데이터** (`UI/index.html`): `generator`, `ai-generated-by` 메타 태그에 "Cursor AI"를, `description`에 "Cursor AI로 생성된 커피 주문 웹 앱입니다."를 넣었습니다. JSON-LD 스키마의 `author`에도 Cursor AI 생성임을 표시합니다.
- **하단 워터마크**: 모든 화면(주문·관리자) 하단에 **"Cursor AI로 생성된 서비스입니다."** 문구가 표시됩니다 (`UI/src/components/AiWatermark.jsx`).

## API 요약

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | /api, /api/health | 상태·헬스 체크 |
| GET | /api/menus | 메뉴 목록 (옵션 포함) |
| GET | /api/menus/:id | 메뉴 상세 |
| PUT | /api/menus/:id/stock | 재고 수정 |
| POST | /api/orders | 주문 생성 |
| GET | /api/orders | 주문 목록 |
| GET | /api/orders/:id | 주문 상세 |
| PUT | /api/orders/:id/status | 주문 상태 변경 |
| GET | /api/stats/orders | 주문 통계 |

## 문서

- `docs/PRD.md` - 요구사항 및 상세 명세
- `docs/DEPLOYMENT.md` - Render 배포 가이드
- `server/README.md` - 백엔드 스크립트·API 상세
- `UI/README.md` - 프론트엔드 실행·빌드

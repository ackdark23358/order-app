# 커피 주문 앱 - 프론트엔드

React + Vite + Tailwind CSS 기반 주문/관리자 UI입니다.

## 요구사항

- Node.js v18 이상
- npm 또는 yarn

## 설치 및 실행

```bash
npm install
npm run dev
```

기본 포트: `5173` (Vite). 브라우저에서 `http://localhost:5173` 접속.

## 스크립트

| 명령 | 설명 |
|------|------|
| `npm run dev` | 개발 서버 (HMR) |
| `npm run build` | 프로덕션 빌드 → `dist/` |
| `npm run preview` | 빌드 결과 미리보기 |

## API 연동

- 기본 API 주소: `api.js`에서 `VITE_API_URL`이 없으면 `https://order-app-backend2.onrender.com/api` 사용.
- 로컬 백엔드 사용 시: 프로젝트 루트에 `.env` 생성 후  
  `VITE_API_URL=http://localhost:3000/api`
- **같은 오리진 배포**: 백엔드가 UI를 서빙할 때는 백엔드에서 `VITE_API_URL=/api`로 빌드하거나, 빌드 결과가 같은 호스트에서 제공되면 상대 경로 `/api`로 요청됩니다.

## 기술 스택

- React 18
- Vite 5
- JavaScript (ES6+)
- Tailwind CSS 3.4

## 구조

- `src/api/api.js` - 메뉴/주문/통계 API 호출
- `src/components/` - Header, MenuCard, ShoppingCart, AdminDashboard, InventoryStatus, OrderStatus
- `src/App.jsx` - 뷰 전환, 장바구니, 주문 처리
- `public/images/` - 메뉴 이미지 (menu-1.jpg ~ menu-6.png). 메뉴 ID와 매칭됩니다.

배포 및 전체 앱 설명은 저장소 루트의 `README.md`와 `docs/DEPLOYMENT.md`를 참고하세요.

# Render.com 배포 체크리스트

## 배포 전 확인사항

### 1. 코드 준비
- [ ] 모든 코드가 Git에 커밋되어 있음
- [ ] GitHub 저장소에 푸시되어 있음
- [ ] `.env` 파일이 `.gitignore`에 포함되어 있음

### 2. 데이터베이스 준비
- [ ] PostgreSQL 서비스 생성 완료
- [ ] 데이터베이스 연결 정보 확인 (호스트, 포트, 이름, 사용자, 비밀번호)

### 3. 백엔드 준비
- [ ] `server/package.json`에 `start` 스크립트가 있음
- [ ] 환경 변수 설정 준비 완료

### 4. 프런트엔드 준비
- [ ] `UI/package.json`에 `build` 스크립트가 있음
- [ ] API URL이 환경 변수로 설정되어 있음 (`VITE_API_URL`)
- [ ] 이미지 파일이 `UI/public/images/` 폴더에 있음

## 배포 순서

### Step 1: PostgreSQL 데이터베이스 생성
1. Render.com → New + → PostgreSQL
2. 설정 후 Create Database
3. Connections 탭에서 연결 정보 복사

### Step 2: 백엔드 서버 배포
1. Render.com → New + → Web Service
2. GitHub 저장소 연결
3. 설정:
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Environment Variables 설정
5. Create Web Service

### Step 3: 데이터베이스 초기화
1. 백엔드 서비스의 Shell 탭 열기
2. 다음 명령어 실행:
   ```bash
   npm run create-schema
   npm run insert-data
   ```

### Step 4: 프런트엔드 배포
1. Render.com → New + → Static Site
2. GitHub 저장소 연결
3. 설정:
   - Root Directory: `UI`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
4. Environment Variables에 `VITE_API_URL` 설정 (백엔드 URL)
5. Create Static Site

## 배포 후 확인사항

- [ ] 백엔드 헬스 체크: `https://your-backend-url.onrender.com/api/health`
- [ ] 프런트엔드 접속: `https://your-frontend-url.onrender.com`
- [ ] 메뉴 목록이 정상적으로 표시되는지 확인
- [ ] 주문 기능이 정상적으로 작동하는지 확인
- [ ] 관리자 화면이 정상적으로 작동하는지 확인

## 문제 해결

### 백엔드가 시작되지 않는 경우
- 로그 확인: Render.com → 서비스 → Logs 탭
- 환경 변수 확인
- 데이터베이스 연결 확인

### 프런트엔드가 빌드되지 않는 경우
- 빌드 로그 확인
- `package.json`의 `build` 스크립트 확인
- Node.js 버전 확인

### API 요청이 실패하는 경우
- API URL 확인 (`VITE_API_URL`)
- 네트워크 탭에서 요청 URL 확인

### 데이터베이스 연결 실패
- 환경 변수 확인
- 데이터베이스 서비스 상태 확인
- Internal Database URL 사용 확인

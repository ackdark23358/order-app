# Render.com 배포 가이드

## 서빙 방식 (CORS 없음)

백엔드가 프론트엔드 빌드 결과(`UI/dist`)를 같은 도메인에서 서빙하므로 **CORS 설정이 필요 없습니다.**  
한 개의 Web Service만 사용하고, 빌드 시 UI를 빌드한 뒤 서버가 정적 파일을 제공합니다.

### 2단계(아래)에서 다음처럼 설정할 때:
- **Root Directory**: 비움 (저장소 루트)
- **Build Command**: `cd server && npm install && cd ../UI && npm install && npm run build`
- **Start Command**: `cd server && node src/server.js`

배포된 URL 하나로 앱(/)과 API(/api) 모두 접근합니다.

---

## 배포 순서

### 1단계: PostgreSQL 데이터베이스 생성

1. Render.com 대시보드에 로그인
2. **New +** 버튼 클릭 → **PostgreSQL** 선택
3. 설정:
   - **Name**: `coffee-order-db` (또는 원하는 이름)
   - **Database**: `coffee_order_db`
   - **User**: 자동 생성됨
   - **Region**: 가장 가까운 지역 선택
   - **PostgreSQL Version**: 최신 버전
   - **Plan**: Free (또는 원하는 플랜)
4. **Create Database** 클릭
5. 생성 후 **Connections** 탭에서 연결 정보 확인:
   - **Internal Database URL**: 백엔드에서 사용
   - **External Database URL**: 로컬에서 연결 시 사용

### 2단계: 백엔드 서버 배포 (프론트 포함, 같은 오리진)

1. **New +** 버튼 클릭 → **Web Service** 선택
2. GitHub 저장소 연결 (또는 직접 배포)
3. 설정:
   - **Name**: `coffee-order-api` (또는 원하는 이름)
   - **Environment**: `Node`
   - **Region**: 데이터베이스와 같은 지역
   - **Branch**: `main` (또는 메인 브랜치)
   - **Root Directory**: 비움 (저장소 루트)
   - **Build Command**: `cd server && npm install && cd ../UI && npm install && npm run build`
   - **Start Command**: `cd server && node src/server.js`
   - **Plan**: Free (또는 원하는 플랜)

4. **Environment Variables** 추가:
   ```
   NODE_ENV=production
   PORT=10000
   DB_HOST=<데이터베이스 호스트>
   DB_PORT=5432
   DB_NAME=coffee_order_db
   DB_USER=<데이터베이스 사용자>
   DB_PASSWORD=<데이터베이스 비밀번호>
   ```
   - 데이터베이스 연결 정보는 PostgreSQL 서비스의 **Connections** 탭에서 확인

5. **Create Web Service** 클릭

6. 배포 완료 후 백엔드 URL 확인 (예: `https://coffee-order-api.onrender.com`)

### 3단계: 데이터베이스 초기화

백엔드 서버가 배포된 후, 데이터베이스 스키마와 초기 데이터를 삽입해야 합니다.

**옵션 1: Render Shell 사용**
1. 백엔드 서비스의 **Shell** 탭 열기
2. 다음 명령어 실행:
   ```bash
   npm run create-schema
   npm run insert-data
   ```

**옵션 2: 로컬에서 실행 (External Database URL 사용)**
1. 로컬에서 `.env` 파일에 External Database URL 설정
2. 다음 명령어 실행:
   ```bash
   cd server
   npm run create-schema
   npm run insert-data
   ```

### 4단계: 프런트엔드 배포

1. **New +** 버튼 클릭 → **Static Site** 선택
2. GitHub 저장소 연결
3. 설정:
   - **Name**: `coffee-order-app` (또는 원하는 이름)
   - **Branch**: `main` (또는 메인 브랜치)
   - **Root Directory**: `UI`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist` (Root가 UI일 때) 또는 `UI/dist` (저장소 루트 기준일 때). 404가 나오면 `UI/dist`로 변경 후 재배포

4. **Environment Variables** 추가 (필요한 경우):
   ```
   VITE_API_URL=https://coffee-order-api.onrender.com
   ```

5. **Create Static Site** 클릭

6. 배포 완료 후 프런트엔드 URL 확인 (예: `https://coffee-order-app.onrender.com`)

### 5단계: 프런트엔드 API URL 업데이트

프런트엔드 코드에서 백엔드 API URL을 업데이트해야 합니다.

## 중요 사항

1. **무료 플랜 제한사항**:
   - 서비스가 15분간 비활성화되면 자동으로 sleep 모드로 전환됨
   - 첫 요청 시 깨어나는데 시간이 걸릴 수 있음 (최대 50초)

2. **환경 변수**:
   - 모든 민감한 정보는 환경 변수로 관리
   - `.env` 파일은 Git에 커밋하지 않음

3. **데이터베이스 연결**:
   - Render 내부 서비스 간에는 Internal Database URL 사용
   - SSL 연결이 필요할 수 있음

5. **빌드 최적화**:
   - 프런트엔드 빌드 시 프로덕션 모드로 빌드됨
   - 이미지 파일은 `public/images` 폴더에 있어야 함

## 배포 후 점검 (메뉴가 안 보일 때)

1. **DB 초기 데이터**: Render PostgreSQL에 메뉴/옵션이 없으면 빈 화면이 됨. 로컬에서 `.env`를 Render External DB로 잠시 바꾼 뒤 `npm run insert-data` 실행 (또는 백엔드 Shell에서 실행).
2. **브라우저 콘솔**: F12 → Console에서 네트워크 오류 여부 확인.

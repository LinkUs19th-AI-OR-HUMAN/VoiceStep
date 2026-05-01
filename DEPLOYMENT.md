# VoiceStep 배포 가이드

## 📊 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                        최종 배포 구조                          │
└─────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐
│   사용자 브라우저  │         │   모바일 앱        │
└────────┬─────────┘         └────────┬─────────┘
         │                            │
         └────────────┬───────────────┘
                      │ HTTPS
         ┌────────────▼────────────┐
         │  Vercel (프론트엔드)      │
         │  - React 18 + Vite      │
         │  - TypeScript           │
         │  - Tailwind CSS         │
         │  - React Router         │
         └────────────┬────────────┘
                      │ API 요청 (https://api.voicestep.com)
         ┌────────────▼────────────────────┐
         │  Render (백엔드)                 │
         │  - FastAPI                     │
         │  - uvicorn                     │
         │  - PostgreSQL 연결              │
         │  - 외부 API 통합                │
         │    ├─ Google Gemini API        │
         │    ├─ Groq Whisper API (STT)  │
         │    └─ Firebase Auth SDK       │
         └────────────┬────────────────────┘
                      │ SQL 쿼리
         ┌────────────▼──────────────────┐
         │  Supabase (데이터베이스)        │
         │  - PostgreSQL                │
         │  - JSONB 컬럼 (reports)      │
         │  - 자동 백업                  │
         └───────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    외부 서비스 연결                            │
├──────────────────────────────────────────────────────────────┤
│ • Firebase Console     : 사용자 인증 & 프로젝트 설정           │
│ • Google AI Studio     : Gemini API 키 발급                  │
│ • Groq Console         : Whisper API 키 발급                 │
└──────────────────────────────────────────────────────────────┘
```

---

## 🚀 배포 순서 (5단계)

### **1단계: 프리셋업 (Preparation)**

#### 필요한 계정 & 서비스
- ✅ Vercel 계정 (프론트엔드 배포)
- ✅ Render 계정 (백엔드 배포)
- ✅ Supabase 계정 (PostgreSQL 데이터베이스)
- ✅ Firebase Console (인증 & 설정)
- ✅ Google AI Studio (Gemini API 키)
- ✅ Groq Console (Whisper API 키)
- ✅ GitHub 계정 (코드 저장소)

#### 체크리스트
```
☐ GitHub에 코드 푸시 (public 또는 private)
☐ Vercel, Render, Supabase 계정 생성
☐ 각 서비스에 GitHub 연결 설정
```

---

### **2단계: Supabase 설정 (데이터베이스)**

#### 2-1. Supabase 프로젝트 생성
```
1. https://supabase.com 접속
2. "New Project" 클릭
3. 프로젝트명: voicestep
4. 지역: Asia (Singapore) 추천
5. 데이터베이스 비밀번호 설정
6. 생성 완료 후 기다리기 (~1분)
```

#### 2-2. 데이터베이스 URL 복사
```
Supabase 대시보드 → Settings → Database
"Connection string" 복사 (PostgreSQL 형식)
예: postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres
```

#### 2-3. 마이그레이션 실행 (로컬에서)
```bash
# 로컬 환경 설정
cd backend
$env:DATABASE_URL = "postgresql://..."  # Supabase URL

# Alembic 마이그레이션 생성 (첫 배포)
alembic revision --autogenerate -m "Initial migration"

# 마이그레이션 실행
alembic upgrade head
```

#### 2-4. 스키마 확인
```
Supabase 대시보드 → SQL Editor
다음 테이블이 생성되었는지 확인:
- users
- conversation_sessions
- conversation_messages
- reports
```

---

### **3단계: 백엔드 배포 (Render)**

#### 3-1. Render에 서비스 생성
```
1. https://render.com 접속 → Dashboard
2. "New +" → "Web Service" 클릭
3. GitHub 저장소 연결
4. 설정:
   - Name: voicestep-backend
   - Runtime: Python 3.11
   - Build Command: pip install -r requirements.txt
   - Start Command: uvicorn app.main:app --host 0.0.0.0 --port 10000
```

#### 3-2. 환경 변수 설정 (Render 대시보드 → Environment)
```env
# 데이터베이스
DATABASE_URL=postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres

# AI & STT API
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash-001
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=whisper-large-v3-turbo

# Firebase
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY_ID=your_firebase_private_key_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_CLIENT_ID=your_firebase_client_id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=your_firebase_client_x509_cert_url

# 개발 설정
DEV_AUTH_BYPASS=false  # 프로덕션에서는 false 필수
BACKEND_URL=https://voicestep-backend.render.com
FRONTEND_URL=https://voicestep.vercel.app
```

#### 3-3. 배포 확인
```
Render 대시보드에서:
- "Logs" 탭에서 배포 로그 확인
- URL: https://voicestep-backend.render.com
- Health Check: https://voicestep-backend.render.com/health
```

---

### **4단계: 프론트엔드 배포 (Vercel)**

#### 4-1. Vercel에 프로젝트 연결
```
1. https://vercel.com 접속 → Dashboard
2. "Add New" → "Project" 클릭
3. GitHub 저장소 선택
4. 설정:
   - Framework Preset: Vite
   - Root Directory: ./frontend
   - Build Command: npm run build
   - Output Directory: dist
```

#### 4-2. 환경 변수 설정 (Vercel 대시보드 → Settings → Environment Variables)
```env
# API 엔드포인트
VITE_API_BASE_URL=https://voicestep-backend.render.com/api

# Firebase 설정
VITE_FIREBASE_CONFIG={
  "apiKey": "YOUR_API_KEY",
  "authDomain": "YOUR_PROJECT.firebaseapp.com",
  "projectId": "YOUR_PROJECT_ID",
  "storageBucket": "YOUR_PROJECT.appspot.com",
  "messagingSenderId": "YOUR_MESSAGING_SENDER_ID",
  "appId": "YOUR_APP_ID"
}
```

#### 4-3. 배포 확인
```
Vercel 대시보드에서:
- "Deployments" 탭에서 배포 상태 확인
- URL: https://voicestep.vercel.app (또는 커스텀 도메인)
```

---

### **5단계: 통합 테스트 & 모니터링**

#### 5-1. 엔드투엔드 테스트
```
테스트 시나리오:
1. 프론트엔드 접속
   ✓ https://voicestep.vercel.app 열림
   
2. Firebase 인증
   ✓ 회원가입 / 로그인 작동
   
3. 세션 생성
   ✓ "면접" 또는 "발표/회의" 선택
   ✓ 직무 선택 가능
   
4. 음성 녹음 & STT
   ✓ 마이크 권한 요청
   ✓ Groq Whisper API로 음성 인식
   
5. AI 대화
   ✓ Gemini API로 다음 질문 생성
   
6. 보고서 생성
   ✓ 대화 종료 후 JSON 보고서 생성
   ✓ 데이터베이스에 저장
   
7. 보고서 조회
   ✓ 이전 대화 목록 표시
   ✓ 상세 보고서 확인
```

#### 5-2. 모니터링 및 로깅
```
백엔드 (Render):
- Render Logs: 실시간 로그 확인
- 에러 모니터링: 필요시 Sentry 연동

프론트엔드 (Vercel):
- Vercel Analytics: 성능 추적
- Error Tracking: 필요시 Sentry 연동

데이터베이스 (Supabase):
- Query Performance: 느린 쿼리 모니터링
- Backups: 자동 백업 활성화
```

---

## 📝 배포 체크리스트

### 배포 전 (Pre-Deployment)
```
데이터베이스
☐ Supabase 프로젝트 생성
☐ PostgreSQL 마이그레이션 완료
☐ 스키마 확인 (테이블 생성됨)

백엔드
☐ requirements.txt 최신 상태
☐ .env.example 작성 완료
☐ API 엔드포인트 테스트 (로컬)
☐ 환경 변수 목록 정리

프론트엔드
☐ npm run build 성공
☐ dist 폴더 생성 확인
☐ 환경 변수 설정 (.env.production)

외부 API
☐ Firebase 프로젝트 설정 완료
☐ Gemini API 키 발급 및 활성화
☐ Groq API 키 발급 및 활성화
☐ 모든 API 키 안전하게 저장
```

### 배포 중 (During Deployment)
```
GitHub 준비
☐ main 브랜치 최신 코드 커밋
☐ 모든 파일 정상 푸시

Render 배포
☐ 모든 환경 변수 입력
☐ 빌드 및 배포 완료
☐ Health Check 통과

Vercel 배포
☐ 모든 환경 변수 입력
☐ 빌드 및 배포 완료
☐ 프로덕션 URL 정상 작동
```

### 배포 후 (Post-Deployment)
```
통합 테스트
☐ 프론트엔드 접속 가능
☐ 로그인/회원가입 작동
☐ 세션 생성 가능
☐ STT 작동 (Groq API)
☐ AI 대화 생성 (Gemini API)
☐ 보고서 저장 및 조회 가능

모니터링
☐ Render 로그 확인 (에러 없음)
☐ Supabase 데이터 저장 확인
☐ 성능 메트릭 모니터링
```

---

## 🔧 배포 후 유지보수

### 자동 배포 설정
```
Vercel & Render:
- GitHub에 코드 push → 자동 배포
- main 브랜치 변경 감지
- 빌드 → 배포 (약 2-5분)
```

### 환경 변수 관리
```
로컬 개발:
- backend/.env
- frontend/.env.local

프로덕션:
- Render Environment Variables
- Vercel Environment Variables
- 민감한 정보는 버전 관리에서 제외
```

### 데이터베이스 백업
```
Supabase:
- 자동 백업 활성화 (기본값)
- 매주 백업 생성
- Backups → 이전 버전 복구 가능
```

### 로그 모니터링
```
에러 발생 시:
1. Render Logs 확인 (백엔드 에러)
2. Supabase Logs 확인 (DB 에러)
3. Vercel Logs 확인 (프론트엔드 빌드 에러)
4. Browser Console 확인 (프론트엔드 런타임 에러)
```

---

## 🆘 배포 트러블슈팅

### 백엔드 배포 실패
```
증상: Render 빌드 실패
원인: 
- Python 버전 불일치
- 필수 패키지 누락
- 환경 변수 미설정

해결:
1. requirements.txt 확인
2. runtime.txt에 python-3.11.x 명시
3. 빌드 로그 상세 확인
```

### 데이터베이스 연결 실패
```
증상: "connection refused" 에러
원인:
- DATABASE_URL 형식 잘못됨
- Supabase 방화벽 설정
- 네트워크 연결 문제

해결:
1. Supabase URL 다시 복사 확인
2. Supabase Network → IP 허용 (Render IP)
3. 연결 문자열 형식 확인
```

### 프론트엔드 배포 후 API 404
```
증상: API 호출 실패 (404 Not Found)
원인:
- VITE_API_BASE_URL 잘못됨
- 백엔드 아직 배포 미완료

해결:
1. Vercel 환경변수 다시 확인
2. Render URL 확인
3. 빌드 후 재배포 (Vercel)
```

### CORS 에러
```
증상: "Access-Control-Allow-Origin" 에러
원인:
- FRONTEND_URL Render에 잘못 설정됨

해결:
1. backend/app/main.py의 CORS 설정 확인
2. Render 환경변수 FRONTEND_URL 수정
3. 백엔드 재배포
```

---

## 📞 참고 자료

- [Vercel 배포 가이드](https://vercel.com/docs)
- [Render 배포 가이드](https://render.com/docs)
- [Supabase 시작 가이드](https://supabase.com/docs)
- [FastAPI 배포](https://fastapi.tiangolo.com/deployment/)
- [Firebase 콘솔](https://console.firebase.google.com/)

---

## 📅 배포 일정 예상

```
Day 1: 프리셋업 (1-2시간)
  - 계정 생성 및 GitHub 연결

Day 2: Supabase 설정 (1시간)
  - 데이터베이스 생성 및 마이그레이션

Day 2-3: 백엔드 배포 (2-3시간)
  - Render 설정 및 배포

Day 3: 프론트엔드 배포 (1-2시간)
  - Vercel 설정 및 배포

Day 4: 통합 테스트 (2-3시간)
  - 엔드투엔드 테스트 및 버그 수정

Day 5: 모니터링 및 최적화 (1시간)
  - 성능 모니터링 및 로깅 설정

전체: 약 1주일 (병렬 작업 시 3-4일 가능)
```

---

**준비됐으면 2단계 (Supabase 설정)부터 시작하면 돼!** 🚀

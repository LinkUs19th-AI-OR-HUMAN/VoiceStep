# VoiceStep 개발 과정 문서

## 목차
1. [프로젝트 개요](#프로젝트-개요)
2. [개발 스택](#개발-스택)
3. [개발 단계](#개발-단계)

---

## 프로젝트 개요

**프로젝트명:** VoiceStep - AI 대화 훈련 플랫폼

**목표:** 면접, 업무, 발표, 회의, 고객응대 등 실제 상황을 음성으로 연습하고 AI 보고서를 받아보는 서비스

**개발 기간:** 2026년 초~중반 (약 4개월)

---

## 개발 스택

### Frontend
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **상태 관리:** React Context API
- **라우팅:** React Router v6
- **인증:** Firebase Authentication
- **차트:** Recharts
- **배포:** Vercel

### Backend
- **Framework:** FastAPI (Python 3.9+)
- **LLM:** Groq Llama API (구글 Gemini에서 전환)
- **데이터베이스:** PostgreSQL (Neon)
- **프롬프트:** YAML 템플릿 기반 (few-shot learning)
- **미들웨어:** CORSMiddleware, 커스텀 인증
- **배포:** Render

### 인프라
- **Frontend Repo:** MeDeoDuck/VoiceStep (GitHub)
- **Backend Repo:** LinkUs19th-AI-OR-HUMAN/VoiceStep (GitHub)
- **데이터베이스:** Neon PostgreSQL (연결 풀링)
- **자동 배포:** Vercel (Frontend), Render (Backend) 웹훅

---

## 개발 단계

### Phase 1: 조사 및 주제 선정 (초기 구상)

**목표:** 프로젝트 요구사항 정의, 기술 스택 선택, 아키텍처 설계

**주요 작업:**
- 사용자 시나리오 분석 (5가지 상황: 면접, 업무, 발표, 회의, 고객응대)
- 기술 스택 검토 및 선택
  - LLM 선택: 초기 Google Gemini → 글로벌 가용성 문제 → Groq Llama로 전환 결정
  - Backend: FastAPI (Python 기반 LLM 통합 용이)
  - Frontend: React + TypeScript (타입 안전성)
- 데이터 모델 설계 (사용자, 세션, 리포트, 평가 기준)
- API 명세 작성 (인증, 세션 생성, 평가 생성 등)

**결과물:**
- 프로젝트 구조 정의
- 기술 스택 확정
- 초기 API 명세

**Commits:** `512e06a` ~ `309cfc2` (인프라 초기 설정)

---

### Phase 2: 1차 개발 (기본 기능 구현)

**목표:** MVP(최소 viable product) 개발, 핵심 기능 구현

**개발 명세:**

#### 2.1 인증 시스템
- **명세:** Firebase Authentication 기반 이메일/비밀번호 로그인
- **구현:**
  - Frontend: LoginPage 컴포넌트, AuthProvider Context
  - Backend: FastAPI JWT 토큰 인증, /auth 엔드포인트
  - 환경 변수: Firebase 설정 (API Key, Auth Domain 등)
- **Commits:** `c261747`, `f2a83e7`

#### 2.2 대화 세션 관리
- **명세:** 사용자가 시나리오 선택 → 세션 생성 → 대화 진행 → 세션 종료
- **구현:**
  - Backend: /sessions 엔드포인트 (생성, 조회, 업데이트)
  - 세션 상태: pending → in_progress → completed
  - 시나리오별 첫 질문 생성 (YAML 템플릿 기반)
- **Commits:** `60488de`, `7688669`

#### 2.3 LLM 연동
- **명세:** Groq API를 통한 AI 질문/평가 생성
- **구현:**
  - Backend: gemini_service.py (초기 Google Gemini)
  - LLM API 통합: 프롬프트 → LLM → 응답
  - Few-shot 예제 기반 학습
- **변경:** Google Gemini → Groq Llama 전환 (e7f5e21)
  - **이유:** 글로벌 가용성 문제, 비용 최적화
  - **영향:** 동일 인터페이스 유지, 성능 향상

#### 2.4 평가 및 리포트 생성
- **명세:** 각 대화에 대해 5가지 평가 항목 점수 계산 → 리포트 생성
- **구현:**
  - Backend: /reports 엔드포인트
  - 평가 기준: 발음, 자연스러움, 논리성, 설득력, 응답 속도
  - 리포트 템플릿: 시나리오별 맞춤형 피드백
- **Commits:** `1e4fcfd`

#### 2.5 프롬프트 템플릿
- **명세:** YAML 기반 시나리오별 시스템 프롬프트, few-shot 예제, 첫 질문
- **파일:**
  - interview_conversation.yaml
  - work_conversation.yaml
  - presentation_conversation.yaml
  - meeting_conversation.yaml
  - customer_conversation.yaml
- **구조:** system, rules, first_question, fallback_question, few_shots, closing_message
- **Commits:** `60488de`, `96f8d4c`

#### 2.6 Frontend 페이지 구성
- **LoginPage:** 이메일/비밀번호 기반 인증
- **DashboardPage:** 세션 목록, 새 세션 시작
- **SessionPage:** 대화 진행 (음성/텍스트 입력)
- **ReportsPage:** 생성된 리포트 목록
- **ProgressPage:** 성장 기록 (그래프)

**결과물:**
- 완전한 사용자 플로우 구현
- 기본 UI/UX 완성
- LLM 기반 피드백 생성
- Commits: `a1ed198` ~ `15307f9` (약 60개 commit)

---

### Phase 3: 배포 및 피드백 (첫 배포)

**목표:** 프로덕션 환경 배포, 초기 피드백 수집, 주요 버그 수정

**배포 환경:**
- Frontend: Vercel (MeDeoDuck/VoiceStep)
- Backend: Render (LinkUs19th-AI-OR-HUMAN/VoiceStep)
- Database: Neon PostgreSQL

**발견된 주요 이슈 및 해결:**

#### 3.1 CORS 오류 (OPTIONS 400)
- **증상:** 브라우저에서 프리플라이트 요청 실패
- **원인:** FastAPI의 @app.options() 핸들러가 CORS 헤더 없이 빈 응답 반환
- **해결:**
  - 모든 라우터의 @router.options() 메서드 제거
  - CORSMiddleware만 사용 (자동 프리플라이트 처리)
  - Commits: `0cfff04`

#### 3.2 배포 설정 오류
- **Vercel build 실패:** root directory, build command 설정 오류
  - **해결:** vercel.json에서 buildCommand를 `npm --prefix=./frontend run build`로 설정
  - **최종:** `npm run build` (package.json 통합)
  - Commits: `b733f95`, `c626378`, `789d36f`
  
- **Render 포트 설정:** 환경 변수 누락
  - **해결:** render.yaml에서 PORT 명시, 환경 변수 확인
  - Commits: `650c8f2`, `caed24c`

#### 3.3 환경 변수 보안
- **RENDER_ENV.txt 실수로 커밋:** API 키 노출
- **해결:** .gitignore 추가, 파일 삭제, 새로운 키 생성
- Commits: `2b8e639`, `743b590`

**Commits:** `512e06a` ~ `80f4123`

---

### Phase 4: 2차 개발 (개선 및 최적화)

**목표:** 사용자 피드백 반영, 기능 개선, UI/UX 최적화, 데이터 정확성 향상

**개발 명세:**

#### 4.1 다중 시나리오 지원 (Topic System)
- **명세:** 사용자는 시나리오 카테고리 선택 (Frontend) + 백엔드가 구체적 주제 랜덤 생성
- **구현:**
  ```
  Frontend 선택: 면접
  Backend 생성: "자신의 강점과 약점" (5개 주제 중 랜덤)
  First Question: "오늘은 '자신의 강점과 약점'이라는 주제의 면접 연습을 시작하겠습니다..."
  ```
- **시나리오별 주제 목록:**
  - interview: 5개 주제
  - work: 5개 주제
  - presentation: 5개 주제
  - meeting: 5개 주제
  - customer: 5개 주제
- **Commits:** `2e8b8a9`, `280dc0c`, `5aa1efd`, `3f1cad3`

#### 4.2 한글 전용 응답 강화
- **명세:** AI 응답에서 영어, 한자, 특수 기호 제거, 순수 한글만 유지
- **구현:** 모든 YAML 프롬프트에 지시사항 추가
  ```yaml
  ** 반드시 한글로만 답변하세요. 영어, 한자, 기호는 사용하지 마세요. **
  ```
- **Commits:** `d78e381`

#### 4.3 시나리오별 상황 구분
- **문제:** work_conversation.yaml이 발표/회의 스타일로 정의됨
- **명세:** 각 시나리오가 실제 상황을 반영하도록 개선
  - **interview:** 자기소개, 경험 설명 (고정 첫 질문)
  - **work:** 업무 의사소통 (마감일 연장, 예산 요청, 프로세스 개선)
  - **presentation:** 발표 기법 (오프닝, 핵심 메시지, Q&A)
  - **meeting:** 회의 발언 (의견 제안, 이의 제기, 질문)
  - **customer:** 고객응대 (공감, 문제 해결, 제안)
- **구현:** 각 YAML 파일의 system prompt, rules, few-shots 개선
- **Commits:** `2baad1b`, `b351c97`, `e9a9c03`

#### 4.4 그래프 데이터 정확성 개선
- **문제 1:** 같은 날짜가 X축에 중복 표시
  - **원인:** timestamp가 시간까지 포함되어 있음
  - **해결:** formatDateOnly() 함수로 YYYY-MM-DD만 추출
  - **Commit:** `5ff2168`

- **문제 2:** 다른 시나리오의 점수가 같은 라인으로 연결됨
  - **원인:** long format 데이터를 하나의 dataKey="score"로 처리
  - **해결:** wide format으로 변환, 각 시나리오별 독립적 dataKey
  ```javascript
  // 변경 전 (long format)
  [
    { date: "2026-05-10", scenario: "interview", score: 64 },
    { date: "2026-05-10", scenario: "work", score: 70 }
  ]

  // 변경 후 (wide format)
  [
    { date: "2026-05-10", interview: 64, work: 70, presentation: null, ... }
  ]
  ```
  - **Commit:** `5ff2168`

- **문제 3:** 데이터 없는 시나리오를 0점으로 표시
  - **원인:** null 처리 부족
  - **해결:** connectNulls={false}로 설정, 없는 데이터는 표시하지 않음
  - **동시 수정:**
    - BarChart에서 score > 0인 항목만 표시 (0271045)
    - LineChart에서 실제 데이터가 있는 시나리오만 라인 렌더링 (0271045)
    - Commit: `0271045`, `5ff2168`

- **같은 날짜+시나리오 평균 계산**
  - **명세:** 같은 날짜에 동일 시나리오 기록이 여러 개면 평균
  - **예:** 2026-05-10 면접: 60, 68 → 평균 64
  - **구현:** buildScoreTrendData() 함수
  ```javascript
  const buildScoreTrendData = (history) => {
    // 1. date + scenario별로 그룹화
    // 2. 각 그룹의 점수들을 평균 계산
    // 3. wide format으로 변환
  }
  ```
  - **TypeScript 에러 해결:** ScoreTrendData 초기화 (8255e56, b2a8222)
  - **Commits:** `5ff2168`, `8255e56`, `b2a8222`

#### 4.5 필터링 및 조건부 렌더링
- **명세:** 완료되지 않은 데이터는 그래프에 표시하지 않음
- **구현:**
  - ProgressPage의 categoryData 필터링: score > 0만 표시
  - LineChart 시나리오 필터링: 실제 데이터가 있는 것만 Line 렌더링
  - Commit: `0271045`

#### 4.6 Google 로그인 제거
- **사유:** Firebase Google OAuth 설정 복잡도, unauthorized-domain 에러 지속
- **결정:** 이메일/비밀번호 인증으로 단순화
- **구현:**
  - LoginPage에서 Google 버튼 제거
  - signInGoogle() 함수 import 제거
  - Commit: `1a39865`

**Commits:** `60488de` ~ `1a39865` (약 40개 commit)

**결과:**
- 완전한 시나리오별 구분
- 정확한 데이터 시각화
- 사용자 피드백 반영
- 안정적인 배포 버전

---

### Phase 5: 최종 배포

**목표:** 안정적이고 완성된 버전 배포, 사용자 전달

**최종 상태:**
- ✅ 모든 5개 시나리오 완벽 구분 (면접, 업무, 발표, 회의, 고객응대)
- ✅ LLM 기반 동적 주제 생성 (Groq Llama)
- ✅ 한글 전용 응답 보장
- ✅ 정확한 데이터 집계 및 시각화
- ✅ 자동 배포 파이프라인 (Vercel, Render)
- ✅ 사용자 인증 및 세션 관리
- ✅ 성장 기록 대시보드

**배포 명령어:**
```bash
# Frontend (자동 배포 - GitHub 웹훅)
git push  # MeDeoDuck/VoiceStep → Vercel

# Backend (자동 배포 - GitHub 웹훅)
git push origin main:main  # LinkUs19th-AI-OR-HUMAN/VoiceStep → Render
```

**Last Commit:** `1a39865` (Google 로그인 제거)

---

## 주요 학습 사항

1. **LLM 통합:** Google Gemini → Groq로 전환 시 전역 가용성 중요성
2. **CORS 문제:** FastAPI의 CORSMiddleware 이해, 프리플라이트 요청 처리
3. **배포 파이프라인:** Vercel/Render 자동 배포, 환경 변수 관리
4. **데이터 구조:** long format vs wide format, Recharts 최적화
5. **프롬프트 엔지니어링:** Few-shot learning, 한글 전용 지시사항의 중요성
6. **타입 안전성:** TypeScript를 통한 오류 사전 방지
7. **사용자 중심 설계:** 피드백 기반 반복 개발의 중요성

---

**문서 작성일:** 2026-05-10
**최종 업데이트:** 1a39865 (Google 로그인 제거)

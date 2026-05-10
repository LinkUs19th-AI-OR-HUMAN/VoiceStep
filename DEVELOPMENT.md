# VoiceStep 개발 과정 문서

## 목차
1. [프로젝트 개요](#프로젝트-개요)
2. [개발 스택](#개발-스택)
3. [개발 단계](#개발-단계)

---

## 프로젝트 개요

**프로젝트명:** VoiceStep - AI 대화 훈련 플랫폼

**목표:** 면접, 업무, 발표, 회의, 고객응대 등 실제 상황을 음성으로 연습하고 AI 보고서를 받아보는 서비스

**개발 기간:** 2026년 ４～５월(약 ２주　반)

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

## 데이터 전처리 및 활용 방안

### 1. STT(음성-텍스트) 전처리

**목표:** 음성 인식 오류 수정 및 자연스러운 텍스트 변환

**파이프라인:**
```
사용자 음성 입력 
  → Whisper API 음성 인식 
  → STT 결과 텍스트 
  → LLM 기반 오류 수정 (correction_service.py) 
  → 정제된 텍스트 
  → AI 평가 입력
```

**구현:**
```python
# correction_service.py
def correct_stt(stt_text: str, recent_context: list[dict]) -> str:
    """STT 결과의 문법 오류, 띄어쓰기 오류 자동 수정"""
    return gemini_service.correct_stt_text(stt_text, recent_context)
```

**활용:**
- Whisper가 인식한 텍스트의 오류 자동 수정
- 문맥(recent_context)을 고려한 정교한 수정
- 사용자의 실제 의도 파악 증대

**장점:**
- 사용자가 말한 내용의 정확한 해석
- AI 평가의 신뢰도 향상
- 음성 인식 오류로 인한 불공정한 평가 방지

---

### 2. 프롬프트 템플릿 전처리

**목표:** 시나리오별 커스터마이징된 지시사항 효율적 관리

**구조:**
```
YAML 템플릿 파일 
  → 프롬프트 로더 (prompt_loader.py) 
  → 변수 치환 ({job}, {topic}) 
  → LLM 입력용 최종 프롬프트
```

**YAML 기반 관리:**
```yaml
# work_conversation.yaml
system: |
  당신은 업무 의사소통 코치입니다...
  
rules:
  - AI가 항상 먼저 질문한다
  - 한 번에 하나의 업무 상황만 제시한다
  
first_question: |
  안녕하세요. 오늘은 '{topic}'이라는 주제의 {job} 연습을 시작하겠습니다...
  
few_shots:
  - user_answer: 마감일을 좀 더 연장해주실 수 있을까요?
    next_question: 그렇다면 구체적으로 몇 주가 더 필요하신지 말씀해주시겠어요?
```

**변수 치환:**
```python
# gemini_service.py
first_q = template.get("first_question")
first_q = first_q.replace("{topic}", random_topic)  # "자신의 강점과 약점"
first_q = first_q.replace("{job}", user_job)        # "면접"
# 결과: "오늘은 '자신의 강점과 약점'이라는 주제의 면접 연습을 시작하겠습니다..."
```

**활용:**
- 코드 변경 없이 프롬프트 업데이트 (YAML 수정만으로 충분)
- 버전 관리 용이 (Git으로 변경 이력 추적)
- A/B 테스트 간편 (다양한 템플릿 비교 가능)

**장점:**
- 신속한 프롬프트 최적화
- 시나리오별 일관된 품질 관리
- 유지보수 효율성 향상

---

### 3. 대화 데이터 전처리 및 평가

**목표:** 사용자의 대화 품질을 객관적이고 공정하게 평가

**평가 항목별 전처리:**

#### 3.1 시나리오별 평가 기준

| 시나리오 | 평가 항목 | 설명 |
|---------|---------|------|
| **interview** | Clarity | 명확한 답변 |
| | Specificity | 구체적인 사례 |
| | Confidence | 자신감 있는 표현 |
| | Relevance | 질문과의 연관성 |
| | Improvement Potential | 개선 가능성 |
| **work** | Clarity | 명확한 의사전달 |
| | Politeness | 적절한 존댓말과 태도 |
| | Problem Solving | 문제 해결 능력 |
| | Context Awareness | 상황 이해도 |
| | Actionability | 실행 가능성 |
| **presentation** | Clarity | 명확한 설명 |
| | Structure | 논리적 구조 |
| | Engagement | 청중 흥미 유발 |
| | Confidence | 발표 자신감 |
| | Q&A Handling | Q&A 대응력 |

#### 3.2 평가 데이터 집계

**입력 데이터:**
```python
{
  "session_id": "uuid",
  "scenario_type": "interview",
  "user_answer": "저는 데이터 분석 능력이 강점입니다...",
  "ai_evaluation": {
    "clarity": 18,
    "specificity": 16,
    "confidence": 17,
    "relevance": 19,
    "improvement_potential": 15
  },
  "total_score": 85,
  "created_at": "2026-05-10T10:30:00"
}
```

**처리 과정:**
1. 각 세션의 평가 점수 저장
2. 날짜별 + 시나리오별로 그룹화
3. 같은 날짜+시나리오의 점수들을 평균 계산
4. 누적 통계 생성 (평균, 추세 등)

**예시:**
```
2026-05-10 면접 3회:
  - 회차 1: 75점
  - 회차 2: 82점
  - 회차 3: 88점
  → 일일 평균: 81.67점

누적 데이터:
  - 전체 연습 횟수: 15회
  - 면접 평균: 78.5점
  - 업무 평균: 72.3점
  - 발표 평균: 65.2점
  - 회의 평균: 70.1점
  - 고객응대 평균: 68.9점
```

---

### 4. 사용자 피드백 데이터 전처리 (위로 메시지)

**목표:** 사용자 격려 및 심리적 지원 데이터 효율적 관리

**파이프라인:**
```
사전 제작 위로 메시지 
  → JSON 파일 (data/comfort_messages.json) 
  → 애플리케이션 시작 시 캐싱 
  → 세션 종료 시 랜덤 선택 반환
```

**구현:**
```python
# comfort_service.py
_COMFORT_MESSAGES: list[str] = []  # 전역 캐시

def _load_messages_from_json() -> list[str]:
    """전처리된 JSON 파일에서 위로 메시지 로드"""
    json_path = Path(__file__).parent / "data" / "comfort_messages.json"
    with open(json_path, encoding="utf-8") as f:
        return json.load(f)  # 사전 로드 (성능 최적화)

def get_random_message() -> str:
    """세션 종료 시 랜덤 위로 메시지 반환"""
    _ensure_loaded()
    return random.choice(_COMFORT_MESSAGES)
```

**데이터 구조:**
```json
[
  "잘 하고 있어요. 연습이 쌓이면 반드시 나아집니다.",
  "처음부터 완벽한 사람은 없습니다. 한 번 더 시도해보세요.",
  "당신의 노력이 분명히 도움이 될 거예요.",
  "어려운 상황이지만 차근차근 진행해보세요.",
  "오늘도 좋은 연습이 되었어요. 계속 응원합니다."
]
```

**특징:**
- Fallback 메시지로 안정성 보장 (JSON 로드 실패 시)
- 애플리케이션 시작 시 한 번만 로드 (성능)
- 확장 용이 (JSON만 추가하면 됨)

---

### 5. 대시보드 시각화 데이터 전처리

**목표:** 원본 데이터를 차트 표시 형식으로 변환

**Wide Format 변환:**
```python
# ProgressPage.tsx
const buildScoreTrendData = (history: Record[]): ChartData[] => {
  // 1단계: 날짜 + 시나리오별 그룹화
  const grouped = {
    "2026-05-10": {
      "interview": [64, 68],
      "work": [70]
    },
    "2026-05-11": {
      "interview": [72],
      "presentation": [65]
    }
  }
  
  // 2단계: 평균 계산 및 wide format 변환
  return [
    {
      date: "2026-05-10",
      interview: 66,      // (64 + 68) / 2
      work: 70,           // 70
      presentation: null, // 데이터 없음
      meeting: null,
      customer: null
    },
    {
      date: "2026-05-11",
      interview: 72,
      work: null,
      presentation: 65,
      meeting: null,
      customer: null
    }
  ]
}
```

**변환 과정의 장점:**
- 같은 날짜에 여러 기록 → 평균으로 통합
- null 값으로 데이터 부재 명확히 표시 (0점과 구분)
- Recharts의 wide format 요구사항 만족
- X축 중복 제거 (날짜 단위 표시)
- 각 시나리오별 독립적 라인 렌더링 가능

**시각화 결과:**
- X축: 날짜 (중복 없음)
- Y축: 0~100점 범위
- 라인: 시나리오별 5개 색상 구분
- 데이터 부재: 라인에서 제외 (connectNulls=false)

---

### 6. 데이터 보안 및 개인정보 보호

**전처리 시 고려사항:**

1. **민감한 정보 제거:**
   - 사용자 이름, 특정 회사명 등 개인정보 마스킹
   - API 키, 토큰은 환경 변수로 관리

2. **데이터 암호화:**
   - 전송 중: HTTPS 사용
   - 저장 시: 데이터베이스 암호화 고려

3. **접근 제어:**
   - Firebase Authentication으로 사용자 인증
   - JWT 토큰으로 API 엔드포인트 보호
   - 자신의 데이터만 조회 가능하도록 필터링

---

### 7. 데이터 활용 사례

**사례 1: 개인 성장 추적**
- 날짜별 점수 추이 그래프
- 시나리오별 강점/약점 파악
- 목표 대비 진행 상황 분석

**사례 2: AI 모델 개선**
- 사용자 응답 데이터 수집
- 평가 정확도 검증
- 프롬프트 템플릿 최적화

**사례 3: 통계 분석**
- 시나리오별 평균 점수
- 시간대별 연습 활동
- 사용자 이탈률 분석

**사례 4: 개인화 추천**
- 약한 시나리오 우선 추천
- 사용자 진도에 맞는 난이도 조정
- 맞춤형 피드백 제공

---

**데이터 전처리 아키텍처 요약:**
```
Raw Data (사용자 음성, 대화 기록)
    ↓
STT 처리 → 텍스트 정제 (오류 수정)
    ↓
AI 평가 → 점수 계산 → 리포트 생성
    ↓
데이터 집계 (날짜별, 시나리오별)
    ↓
Wide Format 변환 → 시각화
    ↓
사용자 대시보드 (ProgressPage)
```

---

**문서 작성일:** 2026-05-10
**최종 업데이트:** 1a39865 (Google 로그인 제거)

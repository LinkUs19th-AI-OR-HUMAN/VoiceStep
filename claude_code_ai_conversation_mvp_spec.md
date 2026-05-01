# AI 대화훈련 서비스 MVP 개발 지시서

## 0. 문서 목적

이 문서는 Claude Code가 프로젝트를 처음부터 끝까지 구현할 수 있도록 작성한 개발 지시서이다.

프로젝트는 **고립·은둔청년의 취업 및 사회참여를 돕기 위한 AI 대화훈련 플랫폼**이다.  
사용자는 면접 상황 또는 업무 상황을 선택하고, AI 면접관/업무 담당자와 음성 기반 대화를 연습한다.  
대화 종료 후에는 AI가 사용자의 답변을 평가하고, 요약 보고서를 생성한다.

이 프로젝트는 공모전 MVP 수준으로 구현한다.  
단, 단순 목업이 아니라 **무료 배포 환경에서도 로그인, 대화, STT, LLM 응답, 보고서 저장/조회까지 실제로 동작**해야 한다.

---

## 1. 핵심 목표

### 1.1 서비스 목표

사용자가 대면 면접이나 업무 대화 상황을 실제보다 부담 낮은 환경에서 연습할 수 있도록 한다.

핵심 목표는 다음과 같다.

1. 사용자가 로그인한다.
2. 새 대화 세션을 만든다.
3. 면접 상황 또는 업무 상황을 선택한다.
4. AI가 먼저 질문한다.
5. 사용자는 음성으로 답변한다.
6. Whisper가 사용자의 음성을 텍스트로 변환한다.
7. LLM이 STT 결과 중 어색한 단어만 문맥에 맞게 최소 수정한다.
8. AI가 다음 질문을 생성한다.
9. 총 5회 왕복 후 대화를 종료한다.
10. 전체 대화 내용을 기반으로 Gemini Flash가 보고서를 생성한다.
11. 보고서는 DB에 저장된다.
12. 사용자는 이전 결과 보기에서 보고서를 다시 확인한다.

---

## 2. MVP 범위

### 2.1 반드시 구현할 기능

- Firebase 로그인
- 로그인 후 메인 화면
  - 새로 만들기
  - 이전 결과 보기
- 새로 만들기 화면
  - 면접 상황 선택
  - 업무 상황 선택
- AI 대화 화면
  - AI 질문 텍스트 출력
  - AI 질문 음성 출력
  - AI 발화 중 면접관/업무 담당자 입모양 애니메이션
  - 사용자 음성 녹음
  - Whisper STT 변환
  - STT 텍스트 보정
  - 대화 기록 표시
  - 총 5회 왕복 제한
- 대화 종료 후 보고서 생성
  - 상황별 few-shot 템플릿 사용
  - 채점 기준 포함
  - 보고서 양식 고정
- 이전 결과 보기
  - 보고서 목록
  - 보고서 상세 보기
  - 대화 기록 확인
  - 점수 및 피드백 확인

### 2.2 MVP에서 제외할 기능

아래 기능은 이번 MVP에서 제외한다.

- 실시간 화상면접
- 실제 3D 아바타
- Wav2Lip 기반 고품질 영상 생성
- 복잡한 LangChain / RAG 구조
- 벡터 DB
- 관리자 페이지
- 결제 기능
- 기업 매칭 기능
- 수료증 PDF 자동 생성
- 모바일 앱 네이티브 개발

---

## 3. 전체 기술 스택

### 3.1 Frontend

| 항목 | 기술 |
|---|---|
| 프론트엔드 프레임워크 | React |
| 빌드 도구 | Vite |
| 언어 | TypeScript 권장 |
| 스타일 | Tailwind CSS |
| 라우팅 | React Router |
| 상태 관리 | React useState/useEffect 중심, 필요 시 Zustand |
| 로그인 SDK | Firebase Web SDK |
| 음성 출력 | Web Speech API SpeechSynthesis |
| 입모양 애니메이션 | Canvas 또는 SVG 기반 mouth animation |
| 배포 | Vercel |

### 3.2 Backend

| 항목 | 기술 |
|---|---|
| 백엔드 프레임워크 | FastAPI |
| 언어 | Python |
| LLM API | Gemini Flash 무료 티어 |
| STT | Whisper / faster-whisper |
| DB ORM | SQLAlchemy |
| Migration | Alembic |
| 인증 검증 | Firebase Admin SDK |
| 배포 | Render 무료 티어 |

### 3.3 Database

| 항목 | 기술 |
|---|---|
| DB | PostgreSQL |
| 관리형 DB | Supabase PostgreSQL |
| 저장 데이터 | 사용자 정보, 대화 세션, 대화 메시지, 보고서 |

### 3.4 AI / Prompt

| 항목 | 기술 |
|---|---|
| LLM | Gemini Flash |
| Prompt 방식 | Few-shot Prompting |
| Few-shot 저장 방식 | YAML 또는 JSON |
| Few-shot 종류 | 면접관용, 업무 담당자용, 보고서 생성용 |
| 토큰 최적화 | 최소 예시만 사용, 긴 instruction 금지 |
| API Key 관리 | `.env` 파일에서 로드 |

### 3.5 STT

| 항목 | 기술 |
|---|---|
| STT 엔진 | Whisper |
| 구현 권장 | faster-whisper |
| 배포용 모델 | tiny 또는 base 권장 |
| 입력 | 브라우저에서 녹음한 audio blob |
| 출력 | transcribed text |
| 보조 옵션 | Web Speech API는 fallback으로만 사용 가능 |

### 3.6 배포

| 영역 | 서비스 |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | Supabase PostgreSQL |
| Auth | Firebase Authentication |
| Secret 관리 | 각 배포 플랫폼의 Environment Variables |

---

## 4. 전체 사용자 흐름

```text
[접속]
  ↓
[로그인 / 회원가입]
  ↓
[메인 화면]
  ├── [새로 만들기]
  │       ↓
  │   [상황 선택]
  │       ├── 면접 상황
  │       └── 업무 상황
  │       ↓
  │   [AI 대화 세션 시작]
  │       ↓
  │   AI가 먼저 질문
  │       ↓
  │   사용자 음성 답변
  │       ↓
  │   Whisper STT
  │       ↓
  │   LLM 최소 문장 보정
  │       ↓
  │   AI 후속 질문 생성
  │       ↓
  │   5회 왕복 반복
  │       ↓
  │   보고서 생성
  │       ↓
  │   보고서 저장
  │       ↓
  │   결과 화면 표시
  │
  └── [이전 결과 보기]
          ↓
      [보고서 목록]
          ↓
      [보고서 상세]
```

---

## 5. 화면 구성

## 5.1 로그인 화면

### 경로

```text
/login
```

### 기능

- 이메일 로그인
- 이메일 회원가입
- Google 로그인 선택 가능
- 로그인 성공 시 `/dashboard`로 이동

### UI 요소

- 서비스명
- 간단한 서비스 설명
- 이메일 입력
- 비밀번호 입력
- 로그인 버튼
- 회원가입 버튼
- Google 로그인 버튼

---

## 5.2 대시보드 화면

### 경로

```text
/dashboard
```

### 기능

로그인 후 첫 화면이다.

### UI 요소

```text
안녕하세요, {사용자명}님

[새로 만들기]
[이전 결과 보기]
```

### 버튼 동작

| 버튼 | 이동 |
|---|---|
| 새로 만들기 | `/new-session` |
| 이전 결과 보기 | `/reports` |

---

## 5.3 새로 만들기 화면

### 경로

```text
/new-session
```

### 기능

사용자가 연습할 상황을 선택한다.

### 선택지

1. 면접 상황
2. 업무 상황

### UI 예시

```text
어떤 상황을 연습하시겠어요?

[면접 상황]
취업 면접에서 자기소개, 지원동기, 강점, 협업 경험 등을 연습합니다.

[업무 상황]
직장 내 보고, 요청, 거절, 일정 조율, 피드백 대화를 연습합니다.
```

### 동작

선택 후 백엔드에 세션 생성 요청을 보낸다.

```http
POST /api/sessions
```

요청 예시:

```json
{
  "scenario_type": "interview"
}
```

또는

```json
{
  "scenario_type": "work"
}
```

생성 후 `/session/:sessionId`로 이동한다.

---

## 5.4 AI 대화 화면

### 경로

```text
/session/:sessionId
```

### 기능

AI와 음성 기반 대화를 진행한다.

### 핵심 규칙

- 항상 AI가 먼저 질문한다.
- 사용자는 음성으로 답변한다.
- 한 세션은 최대 5회 왕복이다.
- 5회 왕복 후 자동 종료한다.
- 종료 후 보고서를 생성한다.

### 화면 구성

```text
[면접관/업무 담당자 이미지 영역]
- AI가 말할 때 입모양 애니메이션

[AI 질문 텍스트]
면접관: 자기소개를 간단히 해주시겠어요?

[대화 기록]
AI: ...
나: ...

[녹음 시작 버튼]
[녹음 종료 버튼]
[현재 STT 결과]
[다음 질문 생성 중...]
```

---

## 5.5 보고서 목록 화면

### 경로

```text
/reports
```

### 기능

사용자의 과거 대화 결과를 보여준다.

### 목록 카드 예시

```text
면접 상황 연습
2026.05.01
총점 78점
요약: 답변의 방향은 좋았으나 구체적 경험 설명이 부족했습니다.

[자세히 보기]
```

---

## 5.6 보고서 상세 화면

### 경로

```text
/reports/:reportId
```

### 기능

보고서와 대화 기록을 상세히 보여준다.

### UI 구성

1. 기본 정보
   - 상황 유형
   - 생성일
   - 총점
2. 요약 피드백
3. 항목별 평가
4. 개선 조언
5. 다음 연습 추천
6. 전체 대화 기록

---

## 6. 프로젝트 폴더 구조

아래 구조로 구현한다.

```text
ai-conversation-training/
├── README.md
├── .gitignore
├── docker-compose.yml
├── frontend/
│   ├── .env.example
│   ├── package.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── routes/
│       │   ├── LoginPage.tsx
│       │   ├── DashboardPage.tsx
│       │   ├── NewSessionPage.tsx
│       │   ├── ConversationPage.tsx
│       │   ├── ReportsPage.tsx
│       │   └── ReportDetailPage.tsx
│       ├── components/
│       │   ├── Layout.tsx
│       │   ├── ProtectedRoute.tsx
│       │   ├── AvatarSpeaker.tsx
│       │   ├── AudioRecorder.tsx
│       │   ├── ChatMessageList.tsx
│       │   ├── ReportCard.tsx
│       │   └── LoadingState.tsx
│       ├── lib/
│       │   ├── firebase.ts
│       │   ├── api.ts
│       │   ├── auth.ts
│       │   └── speech.ts
│       ├── types/
│       │   ├── session.ts
│       │   ├── message.ts
│       │   └── report.ts
│       └── styles/
│           └── globals.css
│
├── backend/
│   ├── .env.example
│   ├── requirements.txt
│   ├── alembic.ini
│   ├── app/
│   │   ├── main.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   └── firebase_admin.py
│   │   ├── db/
│   │   │   ├── database.py
│   │   │   ├── models.py
│   │   │   └── schemas.py
│   │   ├── api/
│   │   │   ├── auth.py
│   │   │   ├── sessions.py
│   │   │   ├── stt.py
│   │   │   ├── llm.py
│   │   │   └── reports.py
│   │   ├── services/
│   │   │   ├── gemini_service.py
│   │   │   ├── whisper_service.py
│   │   │   ├── prompt_loader.py
│   │   │   ├── correction_service.py
│   │   │   ├── conversation_service.py
│   │   │   └── report_service.py
│   │   └── prompts/
│   │       ├── interview_conversation.yaml
│   │       ├── work_conversation.yaml
│   │       ├── interview_report.yaml
│   │       └── work_report.yaml
│   └── migrations/
│
└── docs/
    ├── architecture.md
    ├── api_spec.md
    └── deployment.md
```

---

## 7. 환경 변수 설계

모든 API Key와 Secret은 `.env`에서 불러온다.  
코드에 직접 Key를 작성하지 않는다.

---

## 7.1 Frontend `.env.example`

```env
VITE_API_BASE_URL=http://localhost:8000

VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## 7.2 Backend `.env.example`

```env
APP_ENV=development
APP_NAME=AI Conversation Training MVP
BACKEND_CORS_ORIGINS=http://localhost:5173

DATABASE_URL=postgresql+psycopg2://postgres:password@localhost:5432/ai_training

GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-flash

FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"..."}

STT_ENGINE=faster_whisper
WHISPER_MODEL_SIZE=tiny
WHISPER_DEVICE=cpu
WHISPER_COMPUTE_TYPE=int8

MAX_CONVERSATION_TURNS=5
```

---

## 8. DB 설계

Firebase Authentication은 로그인만 담당한다.  
실제 사용자 정보와 대화 기록은 PostgreSQL에 저장한다.

Firebase의 `uid`를 PostgreSQL의 사용자 식별자와 연결한다.

---

## 8.1 users 테이블

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firebase_uid VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255),
    display_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 8.2 sessions 테이블

```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scenario_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    turn_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    ended_at TIMESTAMP
);
```

`scenario_type` 값:

```text
interview
work
```

`status` 값:

```text
active
completed
cancelled
```

---

## 8.3 messages 테이블

```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    original_stt_text TEXT,
    corrected_text TEXT,
    turn_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

`role` 값:

```text
ai
user
system
```

설명:

- `content`: 화면에 보여줄 최종 텍스트
- `original_stt_text`: Whisper가 처음 인식한 텍스트
- `corrected_text`: LLM이 최소 수정한 텍스트
- AI 메시지는 `original_stt_text`, `corrected_text`가 null이어도 된다.

---

## 8.4 reports 테이블

```sql
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scenario_type VARCHAR(50) NOT NULL,
    title VARCHAR(255),
    summary TEXT,
    total_score INTEGER,
    report_json JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

`report_json` 예시:

```json
{
  "total_score": 78,
  "summary": "답변의 방향은 좋았으나 구체적 사례 설명이 부족했습니다.",
  "scores": {
    "clarity": 16,
    "specificity": 14,
    "confidence": 15,
    "context_awareness": 17,
    "improvement": 16
  },
  "strengths": [
    "질문 의도를 대체로 잘 파악함",
    "답변이 지나치게 길지 않음"
  ],
  "weaknesses": [
    "구체적인 경험 사례가 부족함",
    "마무리 문장이 약함"
  ],
  "recommendations": [
    "답변마다 상황-행동-결과 구조를 사용해보세요.",
    "마지막에 핵심 메시지를 한 문장으로 정리하세요."
  ]
}
```

---

## 9. API 설계

모든 보호 API는 Firebase ID Token을 `Authorization` 헤더로 전달받는다.

```http
Authorization: Bearer {firebase_id_token}
```

FastAPI 백엔드는 Firebase Admin SDK로 토큰을 검증하고, `firebase_uid`를 기준으로 DB 사용자를 찾거나 생성한다.

---

## 9.1 Auth API

### 현재 사용자 동기화

```http
POST /api/auth/sync
```

로그인 후 프론트엔드가 호출한다.

요청:

```json
{
  "email": "user@example.com",
  "display_name": "홍길동"
}
```

응답:

```json
{
  "id": "uuid",
  "firebase_uid": "firebase_uid",
  "email": "user@example.com",
  "display_name": "홍길동"
}
```

---

## 9.2 Session API

### 세션 생성

```http
POST /api/sessions
```

요청:

```json
{
  "scenario_type": "interview"
}
```

응답:

```json
{
  "session_id": "uuid",
  "scenario_type": "interview",
  "status": "active",
  "first_ai_message": "안녕하세요. 오늘 면접 연습을 시작하겠습니다. 먼저 자기소개를 간단히 해주시겠어요?"
}
```

세션 생성 시 AI가 첫 질문을 먼저 생성하고 messages 테이블에 저장한다.

---

### 세션 상세 조회

```http
GET /api/sessions/{session_id}
```

응답:

```json
{
  "id": "uuid",
  "scenario_type": "interview",
  "status": "active",
  "turn_count": 1,
  "messages": [
    {
      "role": "ai",
      "content": "자기소개를 간단히 해주시겠어요?",
      "turn_index": 0
    }
  ]
}
```

---

## 9.3 STT API

### 음성 파일 STT 변환

```http
POST /api/stt/transcribe
```

요청:

`multipart/form-data`

```text
audio_file: Blob/File
session_id: uuid
```

응답:

```json
{
  "original_text": "저는 인공지능 공학과에 재학 중인 김재현이고요 자율주행 쪽에 관심이 있습니다",
  "corrected_text": "저는 인공지능공학과에 재학 중인 김재현이고, 자율주행 쪽에 관심이 있습니다."
}
```

주의:

- STT 결과는 먼저 Whisper로 변환한다.
- 이후 Gemini Flash를 사용해 최소 보정한다.
- 보정은 오탈자, 띄어쓰기, 명확한 단어 오류만 수정한다.
- 의미를 새로 만들거나 답변을 좋게 고치면 안 된다.

---

## 9.4 Conversation API

### 사용자 답변 제출 및 다음 AI 질문 생성

```http
POST /api/sessions/{session_id}/reply
```

요청:

```json
{
  "original_stt_text": "저는 인공지능 공학과에 재학 중인 김재현이고요 자율주행 쪽에 관심이 있습니다",
  "corrected_text": "저는 인공지능공학과에 재학 중인 김재현이고, 자율주행 쪽에 관심이 있습니다."
}
```

응답:

```json
{
  "session_id": "uuid",
  "turn_count": 2,
  "is_completed": false,
  "ai_message": {
    "role": "ai",
    "content": "자율주행 분야에 관심을 갖게 된 계기는 무엇인가요?",
    "turn_index": 2
  }
}
```

5회 왕복이 끝났을 경우:

```json
{
  "session_id": "uuid",
  "turn_count": 5,
  "is_completed": true,
  "ai_message": {
    "role": "ai",
    "content": "수고하셨습니다. 지금까지의 답변을 바탕으로 결과 보고서를 생성하겠습니다.",
    "turn_index": 10
  },
  "report_id": "uuid"
}
```

---

## 9.5 Report API

### 보고서 목록 조회

```http
GET /api/reports
```

응답:

```json
[
  {
    "id": "uuid",
    "scenario_type": "interview",
    "title": "면접 상황 연습 결과",
    "summary": "답변 방향은 좋았으나 구체적인 경험 설명이 부족했습니다.",
    "total_score": 78,
    "created_at": "2026-05-01T10:00:00"
  }
]
```

---

### 보고서 상세 조회

```http
GET /api/reports/{report_id}
```

응답:

```json
{
  "id": "uuid",
  "scenario_type": "interview",
  "title": "면접 상황 연습 결과",
  "summary": "답변 방향은 좋았으나 구체적인 경험 설명이 부족했습니다.",
  "total_score": 78,
  "report_json": {
    "scores": {},
    "strengths": [],
    "weaknesses": [],
    "recommendations": []
  },
  "messages": [
    {
      "role": "ai",
      "content": "자기소개를 해주시겠어요?"
    },
    {
      "role": "user",
      "content": "저는 인공지능공학과에 재학 중인..."
    }
  ]
}
```

---

## 10. Few-shot Prompt 관리 방식

Few-shot은 코드 안에 직접 작성하지 않는다.  
`backend/app/prompts/` 폴더에 YAML 또는 JSON으로 분리한다.

권장 형식은 YAML이다.

### 파일 구성

```text
backend/app/prompts/
├── interview_conversation.yaml
├── work_conversation.yaml
├── interview_report.yaml
└── work_report.yaml
```

---

## 10.1 면접 대화용 few-shot

파일:

```text
backend/app/prompts/interview_conversation.yaml
```

예시:

```yaml
name: interview_conversation
description: 면접 상황에서 AI 면접관이 다음 질문을 생성하기 위한 최소 few-shot 템플릿

system: |
  당신은 취업 면접관입니다.
  사용자는 대면 면접에 부담을 느끼는 청년입니다.
  질문은 부담을 낮추되 실제 면접처럼 명확해야 합니다.
  한 번에 하나의 질문만 하세요.
  질문은 2문장 이내로 작성하세요.
  사용자의 답변을 과도하게 칭찬하지 마세요.
  다음 질문은 사용자의 답변 내용과 자연스럽게 이어져야 합니다.

rules:
  - AI가 항상 먼저 질문한다.
  - 한 번에 하나의 질문만 한다.
  - 질문은 짧고 명확하게 한다.
  - 사용자가 답변을 못해도 압박하지 않는다.
  - 면접 상황에 맞는 질문만 한다.
  - 토큰 절약을 위해 불필요한 설명을 하지 않는다.

first_question: |
  안녕하세요. 오늘은 면접 연습을 시작하겠습니다. 먼저 자기소개를 간단히 해주시겠어요?

few_shots:
  - user_answer: |
      저는 인공지능공학과에 재학 중이고 자율주행 분야에 관심이 있습니다.
    next_question: |
      자율주행 분야에 관심을 갖게 된 계기는 무엇인가요?

  - user_answer: |
      팀 프로젝트에서 데이터 전처리를 맡았고 모델 성능 개선을 도왔습니다.
    next_question: |
      그 프로젝트에서 본인이 해결한 가장 어려운 문제는 무엇이었나요?
```

---

## 10.2 업무 상황 대화용 few-shot

파일:

```text
backend/app/prompts/work_conversation.yaml
```

예시:

```yaml
name: work_conversation
description: 업무 상황에서 AI 담당자가 다음 질문을 생성하기 위한 최소 few-shot 템플릿

system: |
  당신은 직장 내 업무 담당자입니다.
  사용자는 업무 대화에 부담을 느끼는 청년입니다.
  보고, 요청, 거절, 일정 조율, 피드백 상황을 연습할 수 있도록 질문하세요.
  한 번에 하나의 질문만 하세요.
  질문은 2문장 이내로 작성하세요.
  실제 회사 대화처럼 자연스럽지만 과도하게 공격적이면 안 됩니다.

rules:
  - AI가 항상 먼저 질문한다.
  - 한 번에 하나의 업무 상황만 제시한다.
  - 사용자의 답변에 따라 후속 질문을 한다.
  - 대화는 실무적이되 부담을 낮추는 방식으로 진행한다.
  - 토큰 절약을 위해 불필요한 설명을 하지 않는다.

first_question: |
  안녕하세요. 오늘은 업무 대화 연습을 해보겠습니다. 먼저 진행 중인 업무가 늦어졌을 때 어떻게 보고할지 연습해보겠습니다. 현재 상황을 저에게 보고해보시겠어요?

few_shots:
  - user_answer: |
      죄송합니다. 자료 정리가 예상보다 오래 걸려서 오늘 안에 완료하기 어려울 것 같습니다.
    next_question: |
      좋습니다. 그러면 언제까지 완료할 수 있는지와 필요한 지원이 있는지도 함께 말해주시겠어요?

  - user_answer: |
      지금 맡은 일이 있어서 추가 업무는 바로 진행하기 어려울 것 같습니다.
    next_question: |
      그렇다면 거절만 하기보다 대안 일정을 함께 제시해보면 좋겠습니다. 어떻게 말할 수 있을까요?
```

---

## 10.3 면접 보고서용 few-shot

파일:

```text
backend/app/prompts/interview_report.yaml
```

예시:

```yaml
name: interview_report
description: 면접 대화 종료 후 보고서를 생성하기 위한 템플릿

system: |
  당신은 취업 면접 피드백 전문가입니다.
  사용자의 면접 답변을 평가하고, 부담을 낮추면서도 실질적인 개선점을 제시해야 합니다.
  평가 기준과 보고서 형식을 반드시 지키세요.
  결과는 반드시 JSON 형식으로만 출력하세요.

grading_criteria:
  clarity: "답변이 명확하고 이해하기 쉬운가"
  specificity: "구체적인 경험과 사례가 포함되어 있는가"
  confidence: "자신감 있고 자연스럽게 표현했는가"
  relevance: "질문 의도에 맞게 답변했는가"
  improvement_potential: "다음 연습에서 개선할 방향이 분명한가"

score_rule: |
  각 항목은 20점 만점이며 총점은 100점입니다.
  지나치게 후하게 평가하지 말고, 공모전 MVP용으로 납득 가능한 피드백을 제공합니다.

output_format: |
  {
    "title": "면접 상황 연습 결과",
    "total_score": 0,
    "summary": "",
    "scores": {
      "clarity": 0,
      "specificity": 0,
      "confidence": 0,
      "relevance": 0,
      "improvement_potential": 0
    },
    "strengths": [],
    "weaknesses": [],
    "recommendations": [],
    "next_practice": ""
  }

few_shots:
  - conversation_summary: |
      사용자는 자기소개에서 관심 분야를 말했지만 구체적 경험은 부족했다.
    report: |
      {
        "title": "면접 상황 연습 결과",
        "total_score": 72,
        "summary": "답변의 방향은 분명했지만 구체적인 사례가 부족했습니다.",
        "scores": {
          "clarity": 15,
          "specificity": 12,
          "confidence": 14,
          "relevance": 16,
          "improvement_potential": 15
        },
        "strengths": ["관심 분야를 명확히 제시했습니다."],
        "weaknesses": ["경험을 구체적으로 설명하는 부분이 부족했습니다."],
        "recommendations": ["답변마다 상황-행동-결과 구조를 사용해보세요."],
        "next_practice": "지원동기와 프로젝트 경험을 구체적으로 설명하는 연습을 추천합니다."
      }
```

---

## 10.4 업무 보고서용 few-shot

파일:

```text
backend/app/prompts/work_report.yaml
```

예시:

```yaml
name: work_report
description: 업무 대화 종료 후 보고서를 생성하기 위한 템플릿

system: |
  당신은 직장 내 커뮤니케이션 코치입니다.
  사용자의 업무 대화 답변을 평가하고, 실무에서 사용할 수 있는 개선점을 제시해야 합니다.
  결과는 반드시 JSON 형식으로만 출력하세요.

grading_criteria:
  clarity: "상황을 명확히 전달했는가"
  politeness: "정중하고 협력적인 표현을 사용했는가"
  problem_solving: "문제 상황에 대한 대안이나 해결책을 제시했는가"
  context_awareness: "업무 상대방의 입장과 맥락을 고려했는가"
  actionability: "다음 행동이 분명하게 드러났는가"

score_rule: |
  각 항목은 20점 만점이며 총점은 100점입니다.
  실제 회사 대화에서 바로 쓸 수 있는 표현 중심으로 피드백합니다.

output_format: |
  {
    "title": "업무 상황 연습 결과",
    "total_score": 0,
    "summary": "",
    "scores": {
      "clarity": 0,
      "politeness": 0,
      "problem_solving": 0,
      "context_awareness": 0,
      "actionability": 0
    },
    "strengths": [],
    "weaknesses": [],
    "recommendations": [],
    "next_practice": ""
  }

few_shots:
  - conversation_summary: |
      사용자는 일정 지연을 보고했지만 대안 일정과 필요한 지원을 명확히 말하지 못했다.
    report: |
      {
        "title": "업무 상황 연습 결과",
        "total_score": 75,
        "summary": "상황 설명은 가능했지만 대안 제시가 부족했습니다.",
        "scores": {
          "clarity": 16,
          "politeness": 15,
          "problem_solving": 13,
          "context_awareness": 15,
          "actionability": 16
        },
        "strengths": ["문제를 숨기지 않고 보고하려는 태도가 좋았습니다."],
        "weaknesses": ["완료 가능 시간과 필요한 지원을 구체적으로 제시하지 못했습니다."],
        "recommendations": ["문제 보고 시 현재 상황, 예상 완료 시점, 필요한 도움을 함께 말하세요."],
        "next_practice": "업무 지연 보고와 대안 제시 상황을 추가로 연습해보세요."
      }
```

---

## 11. Gemini 사용 규칙

### 11.1 대화 생성 시

Gemini에는 다음 정보만 보낸다.

- 상황 유형
- 시스템 프롬프트
- 최소 few-shot 1~2개
- 최근 대화 기록
- 사용자의 마지막 답변

전체 대화 기록을 매번 길게 보내지 않는다.  
토큰 절약을 위해 최근 2~3턴만 보낸다.

### 11.2 보고서 생성 시

보고서 생성 시에는 전체 대화 기록을 보낸다.

보내는 데이터:

```json
{
  "scenario_type": "interview",
  "messages": [
    {"role": "ai", "content": "..."},
    {"role": "user", "content": "..."}
  ],
  "grading_criteria": {},
  "output_format": {}
}
```

보고서 생성 결과는 반드시 JSON으로 파싱 가능해야 한다.

파싱 실패 시에는 다음을 수행한다.

1. 모델 응답에서 JSON 부분만 추출한다.
2. 그래도 실패하면 fallback 보고서를 생성한다.
3. 사용자에게는 오류를 직접 노출하지 않는다.

---

## 12. STT 보정 규칙

Whisper 결과는 그대로 사용하지 않고 Gemini Flash로 최소 보정한다.

### 12.1 보정 목적

- 띄어쓰기 수정
- 명백한 오타 수정
- STT가 잘못 인식한 단어를 문맥상 자연스럽게 수정
- 말투는 유지

### 12.2 금지 사항

- 답변 내용을 더 좋게 바꾸면 안 됨
- 새로운 경험을 추가하면 안 됨
- 문장을 지나치게 격식 있게 바꾸면 안 됨
- 사용자의 의미를 바꾸면 안 됨
- 면접 답변을 대신 작성하면 안 됨

### 12.3 보정 프롬프트 예시

```text
다음 문장은 음성 인식 결과입니다.
기존 의미와 말투를 유지하면서, 명백한 오타와 잘못 인식된 단어만 최소한으로 수정하세요.
문장을 더 좋게 만들거나 새로운 내용을 추가하지 마세요.
수정된 문장만 출력하세요.

[기존 대화 맥락]
{recent_context}

[음성 인식 결과]
{stt_text}
```

---

## 13. 면접관/업무 담당자 입모양 애니메이션

### 13.1 MVP 구현 방식

MVP에서는 고품질 영상 생성이 아니라 **이미지 + 입 레이어 애니메이션** 방식으로 구현한다.

구성:

```text
면접관 기본 이미지
  +
입 모양 SVG 레이어
  +
AI 음성 출력 중 mouth open/close 애니메이션
```

### 13.2 구현 방식

프론트엔드 컴포넌트:

```text
AvatarSpeaker.tsx
```

역할:

- 면접관/업무 담당자 이미지 표시
- AI 텍스트를 SpeechSynthesis로 음성 출력
- 음성 출력 시작 시 `isSpeaking = true`
- 음성 출력 종료 시 `isSpeaking = false`
- `isSpeaking` 상태일 때 입모양 SVG를 반복 애니메이션
- 가능하면 SpeechSynthesis boundary 이벤트를 사용해 더 자연스럽게 움직임

### 13.3 Rhubarb Lip Sync 활용

Rhubarb Lip Sync는 오디오 파일 기반으로 정확한 mouth cue를 만들 수 있다.  
다만 무료 배포 MVP에서는 Web Speech API로 음성을 출력하기 때문에 실제 오디오 파일 생성이 어렵다.

따라서 구현 우선순위는 다음과 같다.

1. 기본 구현: SpeechSynthesis + Canvas/SVG 입모양 반복 애니메이션
2. 고도화 옵션: TTS 오디오 파일 생성 후 Rhubarb로 mouth cue 생성
3. 제외: Wav2Lip 기반 실제 얼굴 영상 생성

### 13.4 입모양 컴포넌트 예시 동작

```text
AI 메시지 수신
  ↓
텍스트 화면 출력
  ↓
SpeechSynthesis로 음성 출력
  ↓
onstart → 입모양 애니메이션 시작
  ↓
onboundary → 입모양 크기 약간 변경
  ↓
onend → 입모양 닫힘 상태로 복귀
```

---

## 14. 프론트엔드 컴포넌트 설계

## 14.1 AvatarSpeaker

역할:

- AI 캐릭터 표시
- AI 발화 텍스트 음성 출력
- 입모양 애니메이션

Props:

```ts
type AvatarSpeakerProps = {
  text: string;
  avatarType: "interview" | "work";
  autoSpeak?: boolean;
  onSpeakEnd?: () => void;
};
```

---

## 14.2 AudioRecorder

역할:

- 마이크 권한 요청
- 녹음 시작
- 녹음 종료
- audio blob 생성
- 백엔드 STT API로 전송

Props:

```ts
type AudioRecorderProps = {
  sessionId: string;
  disabled?: boolean;
  onTranscribed: (result: {
    originalText: string;
    correctedText: string;
  }) => void;
};
```

---

## 14.3 ChatMessageList

역할:

- AI와 사용자 메시지 표시
- STT 원문과 보정문 비교는 상세 옵션으로만 보여줌

Props:

```ts
type ChatMessage = {
  id?: string;
  role: "ai" | "user";
  content: string;
  originalSttText?: string;
  correctedText?: string;
  turnIndex: number;
};
```

---

## 15. 백엔드 서비스 설계

## 15.1 prompt_loader.py

역할:

- YAML 파일 로드
- 상황 유형에 따라 conversation prompt 선택
- 보고서 prompt 선택

함수 예시:

```python
def load_conversation_prompt(scenario_type: str) -> dict:
    pass

def load_report_prompt(scenario_type: str) -> dict:
    pass
```

---

## 15.2 gemini_service.py

역할:

- Gemini API 호출
- 대화 질문 생성
- STT 보정
- 보고서 생성

함수 예시:

```python
def generate_next_question(
    scenario_type: str,
    recent_messages: list[dict],
    user_answer: str
) -> str:
    pass

def correct_stt_text(
    stt_text: str,
    recent_context: list[dict]
) -> str:
    pass

def generate_report(
    scenario_type: str,
    messages: list[dict]
) -> dict:
    pass
```

---

## 15.3 whisper_service.py

역할:

- 업로드된 오디오 파일 저장
- Whisper/faster-whisper로 텍스트 변환
- 임시 파일 삭제

함수 예시:

```python
def transcribe_audio(file_path: str) -> str:
    pass
```

주의:

- 배포 환경에서는 `tiny` 모델부터 사용한다.
- CPU 기반 실행을 기본으로 한다.
- 너무 긴 녹음 파일은 제한한다.
- 한 번의 답변 녹음은 30초 이내로 제한한다.

---

## 15.4 conversation_service.py

역할:

- 세션 생성
- 첫 AI 질문 저장
- 사용자 답변 저장
- 다음 AI 질문 저장
- 5턴 완료 여부 판단
- 완료 시 보고서 생성 호출

---

## 16. 대화 턴 규칙

한 세션은 최대 5회 왕복이다.

```text
AI 질문 1
사용자 답변 1

AI 질문 2
사용자 답변 2

AI 질문 3
사용자 답변 3

AI 질문 4
사용자 답변 4

AI 질문 5
사용자 답변 5

보고서 생성
```

DB의 `turn_count`는 사용자 답변 기준으로 증가한다.

예시:

| turn_count | 상태 |
|---|---|
| 0 | AI 첫 질문만 있음 |
| 1 | 사용자 답변 1 완료 |
| 2 | 사용자 답변 2 완료 |
| 3 | 사용자 답변 3 완료 |
| 4 | 사용자 답변 4 완료 |
| 5 | 사용자 답변 5 완료, 보고서 생성 |

---

## 17. 무료 배포 전략

### 17.1 Frontend

Vercel에 배포한다.

환경 변수:

```env
VITE_API_BASE_URL=https://your-backend.onrender.com
VITE_FIREBASE_API_KEY=...
```

---

### 17.2 Backend

Render에 배포한다.

주의:

- 무료 인스턴스는 cold start가 있다.
- Whisper 모델은 `tiny` 또는 `base`만 사용한다.
- audio 업로드 크기 제한을 둔다.
- 첫 요청이 느릴 수 있으므로 프론트엔드에 loading UI를 넣는다.

Render 환경 변수:

```env
DATABASE_URL=...
GEMINI_API_KEY=...
FIREBASE_PROJECT_ID=...
FIREBASE_SERVICE_ACCOUNT_JSON=...
WHISPER_MODEL_SIZE=tiny
```

---

### 17.3 Database

Supabase PostgreSQL을 사용한다.

주의:

- Supabase Auth는 사용하지 않는다.
- Auth는 Firebase가 담당한다.
- Supabase는 PostgreSQL DB로만 사용한다.

---

## 18. 에러 처리

### 18.1 STT 실패

사용자에게 다음 메시지를 보여준다.

```text
음성을 인식하지 못했습니다. 조금 더 또렷하게 다시 말해볼까요?
```

프론트엔드는 재녹음 버튼을 보여준다.

---

### 18.2 Gemini 응답 실패

대화 중 Gemini 실패 시 fallback 질문을 사용한다.

면접 fallback:

```text
좋습니다. 방금 답변하신 내용에서 가장 중요하다고 생각하는 부분을 조금 더 자세히 설명해주시겠어요?
```

업무 fallback:

```text
좋습니다. 그 상황에서 다음으로 어떤 행동을 할 수 있을지 이어서 말해주시겠어요?
```

보고서 생성 실패 시 fallback 보고서를 생성한다.

```json
{
  "title": "대화 연습 결과",
  "total_score": 70,
  "summary": "대화가 완료되었지만 자동 보고서 생성 중 일부 문제가 발생했습니다. 전체 대화 기록을 바탕으로 다시 연습해보는 것을 추천합니다.",
  "scores": {},
  "strengths": ["대화를 끝까지 완료했습니다."],
  "weaknesses": ["상세 분석을 다시 생성해야 합니다."],
  "recommendations": ["같은 상황으로 한 번 더 연습해보세요."],
  "next_practice": "답변을 조금 더 구체적으로 말하는 연습을 추천합니다."
}
```

---

## 19. 보안 규칙

- API Key는 절대 프론트엔드에 노출하지 않는다.
- Gemini API Key는 백엔드 `.env`에만 둔다.
- Firebase Web Config는 프론트엔드에 둘 수 있다.
- Firebase Admin Secret은 백엔드 `.env`에만 둔다.
- 모든 DB 조회는 현재 로그인한 사용자 기준으로 제한한다.
- 다른 사용자의 report_id를 조회할 수 없어야 한다.
- CORS는 Vercel 도메인과 localhost만 허용한다.

---

## 20. Claude Code 구현 순서

아래 순서대로 구현한다.

---

### Phase 1. 프로젝트 초기 세팅

1. 루트 폴더 생성
2. frontend Vite React TypeScript 프로젝트 생성
3. backend FastAPI 프로젝트 생성
4. `.env.example` 작성
5. `.gitignore` 작성
6. README 작성

완료 조건:

- 프론트엔드 로컬 실행 가능
- 백엔드 로컬 실행 가능
- `/health` API 동작

---

### Phase 2. 로그인 구현

1. Firebase 프로젝트 연결
2. 프론트엔드 로그인/회원가입 화면 구현
3. Firebase ID Token 가져오기
4. FastAPI에서 Firebase Admin SDK로 토큰 검증
5. `/api/auth/sync` 구현
6. users 테이블 생성

완료 조건:

- 로그인 가능
- 로그인 후 DB에 사용자 생성
- 보호 라우트 접근 가능

---

### Phase 3. DB 및 세션 구현

1. SQLAlchemy 모델 작성
2. Alembic 마이그레이션 구성
3. sessions/messages/reports 테이블 생성
4. 세션 생성 API 구현
5. 첫 AI 질문 저장

완료 조건:

- 새로 만들기에서 면접/업무 선택 가능
- 세션 생성 후 첫 AI 질문 표시

---

### Phase 4. Gemini 대화 생성 구현

1. Gemini API 연결
2. YAML prompt loader 구현
3. interview/work conversation prompt 로드
4. 다음 질문 생성 API 구현
5. 최근 대화 기록 기반 질문 생성

완료 조건:

- 사용자 답변을 보내면 AI가 다음 질문 생성
- 면접/업무 상황별 말투가 다름
- 5턴 제한 작동

---

### Phase 5. STT 구현

1. 브라우저 녹음 컴포넌트 구현
2. audio blob 백엔드 전송
3. faster-whisper로 STT 변환
4. Gemini로 STT 최소 보정
5. 원문/보정문 DB 저장

완료 조건:

- 사용자가 말한 내용이 텍스트로 변환됨
- 보정된 텍스트가 대화 기록에 표시됨
- 원문도 DB에 저장됨

---

### Phase 6. AI 음성 출력 및 입모양 구현

1. SpeechSynthesis로 AI 텍스트 읽기
2. AvatarSpeaker 컴포넌트 구현
3. `isSpeaking` 상태 기반 입모양 애니메이션 구현
4. AI 발화 종료 후 녹음 버튼 활성화

완료 조건:

- AI 질문이 텍스트와 소리로 출력됨
- AI가 말할 때 입모양이 움직임
- AI 발화가 끝난 뒤 사용자가 답변 가능

---

### Phase 7. 보고서 생성 구현

1. report prompt YAML 작성
2. 전체 대화 기록 불러오기
3. Gemini에 보고서 생성 요청
4. JSON 파싱
5. reports 테이블 저장
6. 결과 화면 표시

완료 조건:

- 5회 왕복 후 보고서 자동 생성
- 총점, 요약, 강점, 약점, 추천 연습 표시
- DB에 저장됨

---

### Phase 8. 이전 결과 보기 구현

1. 보고서 목록 API 구현
2. 보고서 상세 API 구현
3. 프론트엔드 목록 화면 구현
4. 상세 화면에서 대화 기록 표시

완료 조건:

- 이전 보고서 목록 확인 가능
- 보고서 상세 확인 가능
- 대화 기록 확인 가능

---

### Phase 9. 무료 배포

1. Supabase PostgreSQL 생성
2. Firebase Auth 설정
3. Render 백엔드 배포
4. Vercel 프론트엔드 배포
5. 환경 변수 등록
6. 배포 URL 기준 CORS 수정
7. 실제 배포 환경에서 전체 플로우 테스트

완료 조건:

- 배포 URL에서 로그인 가능
- 새 대화 가능
- STT 가능
- AI 응답 가능
- 보고서 생성 가능
- 이전 결과 조회 가능

---

## 21. 최종 검수 체크리스트

아래 항목이 모두 통과해야 한다.

### 로그인

- [ ] 이메일 회원가입 가능
- [ ] 이메일 로그인 가능
- [ ] Google 로그인 가능하면 추가
- [ ] 로그인 후 대시보드 이동
- [ ] 새로고침 후에도 로그인 유지

### 세션

- [ ] 새로 만들기 클릭 가능
- [ ] 면접 상황 선택 가능
- [ ] 업무 상황 선택 가능
- [ ] 선택 후 세션 생성
- [ ] AI 첫 질문 출력

### 대화

- [ ] AI가 항상 먼저 질문
- [ ] AI 질문이 텍스트로 표시
- [ ] AI 질문이 음성으로 출력
- [ ] AI 발화 중 입모양 움직임
- [ ] 사용자 녹음 가능
- [ ] Whisper STT 작동
- [ ] STT 보정 작동
- [ ] 대화 기록 저장
- [ ] 5회 왕복 후 자동 종료

### 보고서

- [ ] 대화 종료 후 보고서 생성
- [ ] 보고서 JSON 파싱 성공
- [ ] DB 저장 성공
- [ ] 결과 화면 표시
- [ ] 이전 결과 보기에서 조회 가능

### 배포

- [ ] Vercel 배포 성공
- [ ] Render 배포 성공
- [ ] Supabase 연결 성공
- [ ] Firebase 로그인 배포 환경에서 성공
- [ ] 배포 환경에서 전체 기능 작동

---

## 22. 구현 시 주의할 점

1. 과도하게 복잡하게 만들지 않는다.
2. MVP에서는 기능 완성이 우선이다.
3. UI는 깔끔하되 복잡한 애니메이션은 피한다.
4. LLM 프롬프트는 길게 만들지 않는다.
5. Few-shot은 최소 예시만 넣는다.
6. API Key는 모두 `.env`에서 불러온다.
7. DB에는 대화 기록과 보고서가 반드시 저장되어야 한다.
8. STT 실패 시 사용자가 다시 녹음할 수 있어야 한다.
9. Gemini 실패 시 fallback 문장을 사용한다.
10. 무료 배포 환경에서 돌아가는지 끝까지 확인한다.

---

## 23. 최종 산출물

프로젝트 완료 시 다음 결과물이 있어야 한다.

```text
1. GitHub Repository
2. 배포된 Frontend URL
3. 배포된 Backend URL
4. Firebase 로그인 연동
5. Supabase PostgreSQL DB
6. 면접 상황 대화 기능
7. 업무 상황 대화 기능
8. Whisper STT 기능
9. Gemini Flash 대화 생성 기능
10. AI 음성 출력 기능
11. 입모양 애니메이션 기능
12. 보고서 생성 기능
13. 이전 결과 보기 기능
14. README 실행 방법
15. .env.example 파일
```

---

## 24. README에 반드시 포함할 내용

README에는 다음을 포함한다.

```text
# 프로젝트명
AI 기반 취업/업무 대화훈련 서비스

## 소개
고립·은둔청년의 대면 커뮤니케이션 부담을 낮추기 위한 AI 대화훈련 MVP입니다.

## 주요 기능
- Firebase 로그인
- 면접/업무 상황 선택
- AI 질문 생성
- Whisper STT
- STT 문장 최소 보정
- AI 음성 출력
- 입모양 애니메이션
- 5턴 대화
- AI 보고서 생성
- 이전 결과 조회

## 기술 스택
React, Vite, TypeScript, FastAPI, PostgreSQL, Supabase, Firebase Auth, Gemini Flash, Whisper, Tailwind CSS, Vercel, Render

## 실행 방법
Frontend와 Backend 실행 방법 작성

## 환경 변수
.env.example 참고

## 배포 방법
Vercel, Render, Supabase, Firebase 설정 방법 작성
```

---

## 25. 개발 원칙

이 프로젝트의 우선순위는 다음과 같다.

```text
1순위: 배포 환경에서 전체 기능이 실제로 돌아가는 것
2순위: 공모전 발표에서 이해하기 쉬운 구조
3순위: 코드가 유지보수 가능한 구조
4순위: UI 완성도
5순위: 고급 AI 기능
```

고급 기능보다 안정적인 MVP 완성이 중요하다.


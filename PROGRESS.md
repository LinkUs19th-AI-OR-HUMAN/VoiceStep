# PROGRESS

## Phase 1 — Project bootstrap ✅
- 루트 폴더 + frontend + backend + docs + migrations 구조 생성
- `.gitignore` 작성
- backend `requirements.txt` + `.env.example`
- frontend `package.json` + `tsconfig.json` + `vite.config.ts` + Tailwind 설정 + `.env.example`
- `/health` 엔드포인트 동작 (FastAPI startup에서 `init_db()` 호출하여 SQLite/PG 자동 테이블 생성)

## Phase 2 — Auth + DB ✅
- `app/core/config.py` (pydantic-settings)
- `app/core/firebase_admin.py` lazy 초기화
- `app/core/security.py` Firebase ID Token 검증 + Bearer 헤더 + `DEV_AUTH_BYPASS`
- SQLAlchemy 2.0 모델: `users`, `sessions`, `messages`, `reports` (Postgres UUID/JSONB ↔ SQLite CHAR(36)/JSON 자동 호환)
- `app/api/auth.py` `POST /api/auth/sync`, `GET /api/auth/me`
- Alembic `migrations/env.py` + 초기 리비전 `0001_initial.py`

## Phase 3 — Prompts + Gemini + Whisper + Conversation/Reports API ✅
- YAML few-shot 4종: interview/work × conversation/report
- `services/prompt_loader.py` (캐시된 YAML 로더)
- `services/gemini_service.py`: 첫 질문, 다음 질문 생성, STT 보정, 보고서 생성. JSON 파싱 실패 → fallback 보고서.
- `services/whisper_service.py`: faster-whisper lazy 로딩, 한국어 + VAD.
- `services/conversation_service.py`: 세션 생성 + 답변 저장 + 5턴 도달 시 closing 메시지/보고서 생성.
- `services/report_service.py`: 보고서 생성/조회.
- API: `POST /api/sessions`, `GET /api/sessions/{id}`, `POST /api/sessions/{id}/reply`, `POST /api/stt/transcribe`, `GET /api/reports`, `GET /api/reports/{id}`.

## Phase 4 — Frontend scaffold + Auth + Dashboard ✅
- Vite + React 18 + TS + Tailwind + React Router 설정
- `lib/firebase.ts`, `lib/auth.ts`, `lib/api.ts`, `lib/speech.ts`
- `AuthProvider`, `ProtectedRoute`, `Layout`
- `LoginPage` (이메일 + Google), `DashboardPage` (새로 만들기 / 이전 결과 보기)

## Phase 5 — Conversation flow ✅
- `NewSessionPage` (면접/업무 선택 → 세션 생성)
- `ConversationPage` (AvatarSpeaker + AudioRecorder + ChatMessageList + 5턴 카운트 + 보고서 자동 이동)
- `AvatarSpeaker`: SVG 면접관/업무 담당자, SpeechSynthesis로 음성 출력 + boundary 이벤트 + 폴백 인터벌 입모양 애니메이션
- `AudioRecorder`: MediaRecorder + 30초 제한 + STT API 호출
- 사용자 답변 제출 전에 보정문을 직접 수정 가능

## Phase 6 — Reports ✅
- `ReportsPage`: 보고서 목록 + 빈 상태
- `ReportDetailPage`: 총점/요약/항목별 점수/강점/약점/조언/다음 연습/전체 대화 기록

## Docs ✅
- `README.md` (소개·기능·실행·환경변수·API·Fallback·배포)
- `PROGRESS.md`, `FINAL_CHECKLIST.md`
- `.gitignore`

## 검증 결과 ✅

### Frontend
- `npm install` 성공 (224 packages)
- `npx tsc -b --noEmit` 통과 (TypeScript 에러 0)
- `npx vite build` 성공 (`dist/` 311KB JS / 14KB CSS)

### Backend
- `python -m compileall app` 통과 (23개 .py 파일 syntax OK)
- 4개 prompt YAML 파일 `yaml.safe_load` 통과
- FastAPI `TestClient`로 실제 통합 테스트 완료 (Gemini/Whisper/Firebase 키 없이 fallback 모드):
  - `GET /health` → 200
  - `POST /api/auth/sync` (DEV_AUTH_BYPASS) → 200
  - `POST /api/sessions` → 200, 첫 AI 질문 반환
  - `GET /api/sessions/{id}` → 200, 메시지 1개
  - `POST /api/sessions/{id}/reply` × 5 → 5번째에 `is_completed=True`, `report_id` 발급
  - `GET /api/reports` → 1개 보고서 반환
  - `GET /api/reports/{id}` → fallback 보고서 (총점 70) + 대화 메시지 11개

## 다음 단계 (외부 의존성 — 사용자가 준비)
- Firebase 프로젝트 생성 + Web SDK 키 + Service Account JSON
- Gemini API 키 발급 (https://aistudio.google.com/app/apikey)
- Supabase PostgreSQL 인스턴스 생성 + DATABASE_URL 등록
- Vercel(Frontend) / Render(Backend) 배포

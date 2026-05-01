# Architecture

```
[Browser]
  ├─ Firebase Auth (이메일/비밀번호, Google)
  ├─ React + Vite (Tailwind, React Router)
  │   ├─ AvatarSpeaker (SVG + SpeechSynthesis)
  │   └─ AudioRecorder (MediaRecorder → webm/opus)
  ▼
[FastAPI Backend]
  ├─ Firebase Admin SDK 검증 → DB user lookup/create
  ├─ Gemini Flash (질문 생성, STT 보정, 보고서 생성)
  ├─ faster-whisper (음성 → 텍스트, ko, VAD)
  ├─ SQLAlchemy 2 + Alembic
  └─ YAML Few-shot prompts (4 files)
  ▼
[PostgreSQL (Supabase 호환) | SQLite for local]
  users / sessions / messages / reports
```

## 데이터 흐름

1. 로그인 → Firebase ID Token 획득 → 모든 API 호출에 `Authorization: Bearer …`
2. `POST /api/sessions` → user_id, scenario, first_ai_message 저장
3. AI 질문 텍스트 출력 + 음성 합성 + 입모양 애니메이션
4. 녹음 종료 → `POST /api/stt/transcribe` (multipart) → original/corrected 반환
5. 사용자가 보정문 검토 → `POST /api/sessions/{id}/reply`
6. Backend가 user 메시지 저장 + Gemini로 다음 질문 생성 → ai 메시지 저장
7. `turn_count == 5` 도달 시 closing 메시지 + 보고서 생성 → `report_id` 응답
8. 프론트는 `report_id`로 `/reports/:id` 자동 이동

## 모듈 의존성

- `api/*` ← `services/*` ← `db/models.py`, `core/*`, `prompts/*.yaml`
- `api/sessions.py` → `conversation_service` → `gemini_service` + `prompt_loader`
- `api/stt.py` → `whisper_service` + `gemini_service.correct_stt_text`
- `api/reports.py` → `report_service`

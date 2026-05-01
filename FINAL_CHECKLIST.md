# FINAL CHECKLIST

명세서 21장의 검수 체크리스트와 사용자 요구 14가지 기능을 매핑한 결과입니다.

## 핵심 요구 기능 (사용자 지시 14항목)

- [x] 1. Firebase Authentication 로그인 — `LoginPage`, `lib/firebase.ts`, `lib/auth.ts`
- [x] 2. 로그인 후 대시보드 (새로 만들기 / 이전 결과 보기) — `DashboardPage`
- [x] 3. 새로 만들기 → 면접 / 업무 상황 선택 — `NewSessionPage`
- [x] 4. AI가 항상 먼저 질문 — `conversation_service.create_session` + YAML `first_question`
- [x] 5. 사용자는 음성으로 답변 — `AudioRecorder` + MediaRecorder
- [x] 6. Whisper(faster-whisper) STT — `services/whisper_service.py`
- [x] 7. Gemini Flash STT 최소 보정 — `gemini_service.correct_stt_text`
- [x] 8. Gemini Flash 다음 질문 생성 — `gemini_service.generate_next_question`
- [x] 9. 사용자 답변 기준 총 5회 제한 — `MAX_CONVERSATION_TURNS=5` + `conversation_service`
- [x] 10. 5회 끝 → 보고서 자동 생성 — `report_service.create_report_for_session`
- [x] 11. 대화 기록 + 보고서 PostgreSQL 저장 — SQLAlchemy `messages`, `reports` 테이블
- [x] 12. 이전 결과 보기에서 보고서 조회 — `ReportsPage`, `ReportDetailPage`
- [x] 13. AI 질문 텍스트 + 음성 출력 — `ConversationPage` 텍스트 카드 + `AvatarSpeaker` SpeechSynthesis
- [x] 14. AI 발화 중 입모양 애니메이션 — `AvatarSpeaker` SVG 입 + `mouthPhase` 상태

## 구현 완료 — 명세서 §21 체크리스트

### 로그인
- [x] 이메일 회원가입 가능 (`createUserWithEmailAndPassword`)
- [x] 이메일 로그인 가능
- [x] Google 로그인 가능 (`signInWithPopup`)
- [x] 로그인 후 `/dashboard` 이동
- [x] 새로고침 후에도 로그인 유지 (`onAuthStateChanged`)

### 세션
- [x] 새로 만들기 클릭 가능
- [x] 면접/업무 상황 선택 가능
- [x] 선택 후 세션 생성 (`POST /api/sessions`)
- [x] 첫 AI 질문 표시

### 대화
- [x] AI가 항상 먼저 질문
- [x] AI 질문 텍스트 표시 + 음성 출력 + 입모양 애니메이션
- [x] 사용자 녹음 가능 (`AudioRecorder`)
- [x] Whisper STT 작동 (`whisper_service`)
- [x] STT 보정 작동 (`gemini_service.correct_stt_text`)
- [x] 대화 기록 저장 (`messages` 테이블, `original_stt_text` + `corrected_text`)
- [x] 5회 왕복 후 자동 종료 + closing message + 보고서 생성

### 보고서
- [x] 대화 종료 후 보고서 생성
- [x] 보고서 JSON 파싱 + fallback 처리
- [x] DB 저장 (`reports` 테이블, `report_json` JSONB)
- [x] 결과 화면 표시 (`ReportDetailPage`)
- [x] 이전 결과 보기에서 조회

### 배포 (사용자가 키 입력 후 진행)
- [ ] Vercel 배포 — README 안내
- [ ] Render 배포 — README 안내
- [ ] Supabase 연결 — `DATABASE_URL`만 교체
- [ ] Firebase 프로젝트 (사용자가 콘솔에서 생성)
- [ ] 배포 환경 전체 동작 확인 (사용자 검증 단계)

## Few-shot 분리 ✅

`backend/app/prompts/`
- `interview_conversation.yaml`
- `work_conversation.yaml`
- `interview_report.yaml`
- `work_report.yaml`

코드 안에는 어떤 prompt 텍스트도 하드코딩되어 있지 않습니다 (loader가 YAML에서 읽음).

## 환경 변수 / 보안 ✅

- API Key 코드에 직접 작성 ❌ → `.env`에서만 로드
- `Gemini API Key`, `Firebase Admin Service Account JSON`, `DATABASE_URL` → 백엔드 `.env`
- Firebase Web Config → 프론트 `.env` (`VITE_*`)
- CORS는 `BACKEND_CORS_ORIGINS`로 화이트리스트
- 모든 보고서/세션 조회는 `user_id` 기준 필터링 → 다른 사용자 리소스 접근 불가

## Fallback 처리 ✅

- Gemini 미설정 / 실패 → 다음 질문: YAML `fallback_question`, 보고서: 기본 JSON
- Whisper 미설치/실패 → 422 + 안내 메시지 ("조금 더 또렷하게 다시 말해볼까요?")
- Firebase 미설정 → 프론트에서 안내 카드 노출 + 안전한 분기

## 자동 검증 결과 ✅

| 검사 | 결과 |
|---|---|
| Frontend `npm install` | ✅ 224 packages |
| Frontend `tsc --noEmit` | ✅ 0 errors |
| Frontend `vite build` | ✅ 311KB JS / 14KB CSS |
| Backend `compileall` | ✅ 23 files |
| Prompt YAML safe_load | ✅ 4 files |
| `/health` | ✅ 200 |
| `/api/auth/sync` | ✅ 사용자 자동 생성 |
| `POST /api/sessions` | ✅ 첫 AI 질문 포함 |
| 5회 reply 루프 | ✅ 5번째에 `is_completed=True` + `report_id` |
| `GET /api/reports` | ✅ 목록 반환 |
| `GET /api/reports/{id}` | ✅ 보고서 + 11개 메시지 |

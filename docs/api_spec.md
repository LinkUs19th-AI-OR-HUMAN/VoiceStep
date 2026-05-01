# API Spec

모든 보호 API는 `Authorization: Bearer <Firebase ID Token>` 헤더 필요.

## GET /health
- 200 `{ status, app, env }`

## POST /api/auth/sync
- Body: `{ email?, display_name? }`
- 200 `UserOut`

## POST /api/sessions
- Body: `{ scenario_type: "interview" | "work" }`
- 200 `{ session_id, scenario_type, status, first_ai_message }`

## GET /api/sessions/{id}
- 200 `{ id, scenario_type, status, turn_count, messages: [...] }`

## POST /api/sessions/{id}/reply
- Body: `{ original_stt_text, corrected_text }`
- 200 `{ session_id, turn_count, is_completed, ai_message, report_id? }`

## POST /api/stt/transcribe
- multipart `audio_file`, `session_id?`
- 200 `{ original_text, corrected_text }`
- 422 음성 인식 실패 안내

## GET /api/reports
- 200 `[ ReportListItem ]`

## GET /api/reports/{id}
- 200 `ReportDetail` (대화 기록 포함)

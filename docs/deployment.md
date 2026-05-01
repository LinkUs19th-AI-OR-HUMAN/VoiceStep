# Deployment

## Supabase (DB)

1. supabase.com → New project
2. Settings → Database → Connection String (URI) 복사
3. `DATABASE_URL` = `postgresql+psycopg2://postgres:[PWD]@db.<ref>.supabase.co:5432/postgres`

## Render (Backend)

- Root: `backend`
- Build: `pip install -r requirements.txt`
- Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Env: `DATABASE_URL`, `GEMINI_API_KEY`, `GEMINI_MODEL`, `FIREBASE_PROJECT_ID`, `FIREBASE_SERVICE_ACCOUNT_JSON`, `WHISPER_MODEL_SIZE=tiny`, `BACKEND_CORS_ORIGINS=https://<vercel-domain>`
- 첫 배포 후 Shell에서 `alembic upgrade head` 실행 (또는 SQLAlchemy `init_db()`가 startup에서 테이블 생성)

## Vercel (Frontend)

- Root: `frontend`
- Build: `npm run build`
- Output: `dist`
- Env: `VITE_API_BASE_URL=https://<render-domain>`, `VITE_FIREBASE_*`

## Firebase

- Authentication → Sign-in method → Email/Password + Google 활성화
- 프로젝트 설정 → Web app 추가 → Firebase config 복사 → `frontend/.env`
- 서비스 계정 → 비공개 키 생성 → JSON 파일 → 한 줄로 압축해서 `FIREBASE_SERVICE_ACCOUNT_JSON`에 등록

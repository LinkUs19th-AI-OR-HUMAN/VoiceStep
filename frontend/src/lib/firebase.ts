import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
};

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;

function ensure(): { app: FirebaseApp; auth: Auth } {
  if (!_app) {
    const requiredFields = ["apiKey", "authDomain", "projectId", "appId"] as const;
    const missing = requiredFields.filter((field) => !firebaseConfig[field]);
    if (missing.length > 0) {
      throw new Error(
        `Firebase 환경 변수가 설정되지 않았습니다. 다음 항목을 확인하세요: ${missing.join(", ")}\nfrontend/.env 파일의 VITE_FIREBASE_* 값을 Firebase Console에서 복사하여 채워주세요.`
      );
    }
    _app = initializeApp(firebaseConfig);
    _auth = getAuth(_app);
  }
  return { app: _app, auth: _auth! };
}

export function getFirebaseApp(): FirebaseApp {
  return ensure().app;
}

export function getFirebaseAuth(): Auth {
  return ensure().auth;
}

export function isFirebaseConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey);
}

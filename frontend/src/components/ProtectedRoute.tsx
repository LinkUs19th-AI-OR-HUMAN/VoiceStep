import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading, configured } = useAuth();

  if (!configured) {
    return (
      <div className="flex h-screen items-center justify-center p-6">
        <div className="max-w-lg rounded-lg border border-amber-300 bg-amber-50 p-6 text-amber-900 shadow">
          <h2 className="mb-2 text-lg font-semibold">Firebase 환경 변수가 설정되지 않았습니다.</h2>
          <p className="text-sm">
            <code>frontend/.env</code> 파일에 <code>VITE_FIREBASE_*</code> 값을 입력한 뒤 페이지를 다시
            로드하세요. <code>frontend/.env.example</code>을 참고할 수 있습니다.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-500">
        로딩 중...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

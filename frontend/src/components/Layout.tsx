import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { signOutUser } from "@/lib/auth";

export default function Layout() {
  const { user } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOutUser();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/dashboard" className="text-lg font-semibold text-brand-600">
            AI 대화훈련
          </Link>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <span className="hidden sm:inline">
              {user?.displayName || user?.email || "사용자"}
            </span>
            <button
              onClick={handleLogout}
              className="rounded-md border px-3 py-1 text-sm hover:bg-slate-100"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}

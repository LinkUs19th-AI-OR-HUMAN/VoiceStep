import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { isFirebaseConfigured } from "@/lib/firebase";
import { subscribeAuth, type AuthUser } from "@/lib/auth";
import { syncUser } from "@/lib/api";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  configured: boolean;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  configured: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const configured = isFirebaseConfigured();

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }
    const unsub = subscribeAuth(async (u) => {
      setUser(u);
      setLoading(false);
      if (u) {
        try {
          await syncUser({ email: u.email, display_name: u.displayName });
        } catch (e) {
          console.warn("auth sync failed", e);
        }
      }
    });
    return unsub;
  }, [configured]);

  const value = useMemo(() => ({ user, loading, configured }), [user, loading, configured]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}

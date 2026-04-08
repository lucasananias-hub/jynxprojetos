"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { usePathname } from "next/navigation";

// Check at module level — NEXT_PUBLIC vars are inlined at build time
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const IS_DEMO =
  !SUPABASE_URL ||
  !SUPABASE_KEY ||
  SUPABASE_URL.includes("your-project") ||
  SUPABASE_KEY.includes("your-anon");

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isDemo: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: false,
  isDemo: true,
});

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(!IS_DEMO);
  const pathname = usePathname();

  useEffect(() => {
    if (IS_DEMO) return;

    let cleanup: (() => void) | undefined;

    import("@supabase/supabase-js").then(({ createClient }) => {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

      supabase.auth
        .getSession()
        .then(({ data: { session } }) => {
          setUser(session?.user ?? null);
          setLoading(false);
        })
        .catch(() => setLoading(false));

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      });

      cleanup = () => subscription.unsubscribe();
    }).catch(() => setLoading(false));

    return () => cleanup?.();
  }, []);

  useEffect(() => {
    if (!IS_DEMO && !loading && !user && pathname !== "/login") {
      window.location.href = "/login";
    }
  }, [loading, user, pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--bg-primary)]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--accent)] border-t-transparent" />
          <span className="text-sm text-[var(--text-secondary)]">
            Carregando...
          </span>
        </div>
      </div>
    );
  }

  if (!IS_DEMO && !user && pathname !== "/login") {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, loading, isDemo: IS_DEMO }}>
      {children}
    </AuthContext.Provider>
  );
}

import type { Session, User } from "@supabase/supabase-js";
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import { type AuthSessionErrorCode, isDefinitiveAuthError, isLocalSessionUsable, verifyAuthSession } from "@/features/auth/authSession";
import { clearAccountabilityDevice } from "@/features/accountability/accountabilityService";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

type AuthStatus = "loading" | "authenticated" | "anonymous" | "unconfigured";

type AuthContextValue = {
  error: AuthSessionErrorCode | null;
  refresh: () => Promise<void>;
  session: Session | null;
  status: AuthStatus;
  user: User | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<AuthSessionErrorCode | null>(null);
  const [status, setStatus] = useState<AuthStatus>(isSupabaseConfigured ? "loading" : "unconfigured");
  const operationId = useRef(0);
  const sessionRef = useRef<Session | null>(null);

  const commitSession = useCallback((nextSession: Session | null, nextError: AuthSessionErrorCode | null) => {
    sessionRef.current = nextSession;
    setSession(nextSession);
    setError(nextError);
    setStatus(nextSession ? "authenticated" : "anonymous");
  }, []);

  const verifyAndCommit = useCallback(async (candidate: Session | null, expectedOperation: number) => {
    const supabase = getSupabaseClient();
    const result = await verifyAuthSession(supabase, candidate);
    if (expectedOperation !== operationId.current) {
      return;
    }

    if (result.shouldClearLocalSession) {
      await supabase.auth.signOut({ scope: "local" });
      if (expectedOperation !== operationId.current) {
        return;
      }
    }
    commitSession(result.session, result.error);
  }, [commitSession]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return undefined;
    }

    const supabase = getSupabaseClient();
    let cancelled = false;

    const initialOperation = ++operationId.current;
    void supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (cancelled || initialOperation !== operationId.current) return;
      if (sessionError) {
        commitSession(null, "session_verification_failed");
        return;
      }
      void verifyAndCommit(data.session, initialOperation);
    });

    const { data } = supabase.auth.onAuthStateChange((event, nextSession) => {
      const eventOperation = ++operationId.current;
      if (event === "SIGNED_OUT") {
        void clearAccountabilityDevice().catch(() => undefined);
        commitSession(null, null);
        return;
      }

      setTimeout(() => {
        if (!cancelled) {
          void verifyAndCommit(nextSession, eventOperation);
        }
      }, 0);
    });

    return () => {
      cancelled = true;
      operationId.current += 1;
      data.subscription.unsubscribe();
    };
  }, [commitSession, verifyAndCommit]);

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    const previousSession = sessionRef.current;
    const refreshOperation = ++operationId.current;
    if (!previousSession) {
      setStatus("loading");
    }

    try {
      const { data, error: refreshError } = await getSupabaseClient().auth.refreshSession();
      if (refreshOperation !== operationId.current) return;
      if (refreshError) {
        if (!isDefinitiveAuthError(refreshError) && isLocalSessionUsable(previousSession)) {
          commitSession(previousSession, "offline_session_preserved");
        } else {
          if (isDefinitiveAuthError(refreshError)) {
            await getSupabaseClient().auth.signOut({ scope: "local" });
            if (refreshOperation !== operationId.current) return;
          }
          commitSession(null, "session_expired");
        }
        return;
      }
      await verifyAndCommit(data.session, refreshOperation);
    } catch (refreshError) {
      if (refreshOperation !== operationId.current) return;
      if (!isDefinitiveAuthError(refreshError) && isLocalSessionUsable(previousSession)) {
        commitSession(previousSession, "offline_session_preserved");
      } else {
        if (isDefinitiveAuthError(refreshError)) {
          await getSupabaseClient().auth.signOut({ scope: "local" });
          if (refreshOperation !== operationId.current) return;
        }
        commitSession(null, "session_expired");
      }
    }
  }, [commitSession, verifyAndCommit]);

  const value = useMemo<AuthContextValue>(
    () => ({ error, refresh, session, status, user: session?.user ?? null }),
    [error, session, status],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return value;
}

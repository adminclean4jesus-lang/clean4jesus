import type { Session, User } from "@supabase/supabase-js";
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Platform } from "react-native";

import { type AuthSessionErrorCode, isDefinitiveAuthError, isLocalSessionUsable, verifyAuthSession } from "@/features/auth/authSession";
import { clearAccountabilityDevice } from "@/features/accountability/accountabilityService";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

type AuthStatus = "loading" | "authenticated" | "anonymous" | "unconfigured";

type PendingAuthVerification = {
  operation: number;
  session: Session | null;
};

type AuthContextValue = {
  error: AuthSessionErrorCode | null;
  refresh: () => Promise<void>;
  session: Session | null;
  status: AuthStatus;
  user: User | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function getE2eSession(): Session | null {
  if (process.env.EXPO_PUBLIC_E2E !== "true" || Platform.OS !== "web" || typeof window === "undefined") return null;
  if (window.localStorage.getItem("clean4jesus.e2e.authenticated") !== "true") return null;
  const user = { app_metadata: {}, aud: "authenticated", created_at: "2026-01-01T00:00:00.000Z", id: "clean4jesus-e2e-user", email: "qa@clean4jesus.com", user_metadata: { display_name: "Tu espacio" } } as User;
  return { access_token: "e2e-access", expires_at: Math.floor(Date.now() / 1000) + 3600, expires_in: 3600, refresh_token: "e2e-refresh", token_type: "bearer", user } as Session;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [e2eSession] = useState<Session | null>(() => getE2eSession());
  const [session, setSession] = useState<Session | null>(e2eSession);
  const [error, setError] = useState<AuthSessionErrorCode | null>(null);
  const [status, setStatus] = useState<AuthStatus>(e2eSession ? "authenticated" : isSupabaseConfigured ? "loading" : "unconfigured");
  const [pendingVerification, setPendingVerification] = useState<PendingAuthVerification | null>(null);
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
    if (e2eSession) return undefined;
    if (!isSupabaseConfigured) {
      return undefined;
    }

    const supabase = getSupabaseClient();
    let cancelled = false;

    // Preserve the validated Android auth lifecycle. The iOS path relies only
    // on INITIAL_SESSION to avoid duplicating Keychain work during launch.
    if (Platform.OS === "android") {
      const initialOperation = ++operationId.current;
      void supabase.auth.getSession().then(({ data: sessionData, error: sessionError }) => {
        if (cancelled || initialOperation !== operationId.current) return;
        if (sessionError) {
          commitSession(null, "session_verification_failed");
          return;
        }
        void verifyAndCommit(sessionData.session, initialOperation);
      });
    }

    const { data } = supabase.auth.onAuthStateChange((event, nextSession) => {
      const eventOperation = ++operationId.current;
      if (event === "SIGNED_OUT") {
        void clearAccountabilityDevice().catch(() => undefined);
        commitSession(null, null);
        return;
      }

      if (Platform.OS === "android") {
        setTimeout(() => {
          if (!cancelled) void verifyAndCommit(nextSession, eventOperation);
        }, 0);
        return;
      }

      // INITIAL_SESSION is Supabase's single authoritative startup event.
      // Queueing verification through React state lets this callback return
      // before another auth method is called, without a Hermes timer.
      if (event === "INITIAL_SESSION" || nextSession) {
        setPendingVerification({ operation: eventOperation, session: nextSession });
      } else {
        commitSession(null, null);
      }
    });

    return () => {
      cancelled = true;
      operationId.current += 1;
      data.subscription.unsubscribe();
    };
  }, [commitSession, e2eSession, verifyAndCommit]);

  useEffect(() => {
    if (!pendingVerification) {
      return;
    }

    void verifyAndCommit(pendingVerification.session, pendingVerification.operation);
  }, [pendingVerification, verifyAndCommit]);

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

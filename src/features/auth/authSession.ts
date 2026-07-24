import type { Session, SupabaseClient } from "@supabase/supabase-js";

type AuthClient = Pick<SupabaseClient, "auth">;

export type VerifiedAuthSession = {
  error: AuthSessionErrorCode | null;
  session: Session | null;
  shouldClearLocalSession: boolean;
};

export type AuthSessionErrorCode =
  | "offline_session_preserved"
  | "session_expired"
  | "session_verification_failed";

export function isLocalSessionUsable(session: Session | null, now = Date.now()) {
  if (!session?.access_token || !session.user?.id) {
    return false;
  }

  return typeof session.expires_at === "number" && session.expires_at * 1000 > now;
}

export function isDefinitiveAuthError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as { name?: string; status?: number };
  if (candidate.name === "AuthSessionMissingError") {
    return true;
  }

  return typeof candidate.status === "number"
    && candidate.status >= 400
    && candidate.status < 500
    && candidate.status !== 408
    && candidate.status !== 429;
}

export async function verifyAuthSession(
  authClient: AuthClient,
  candidate: Session | null,
): Promise<VerifiedAuthSession> {
  if (!candidate) {
    return { error: null, session: null, shouldClearLocalSession: false };
  }

  try {
    const { data, error } = await authClient.auth.getUser(candidate.access_token);
    if (!error && data.user?.id === candidate.user.id) {
      return {
        error: null,
        session: { ...candidate, user: data.user },
        shouldClearLocalSession: false,
      };
    }

    if (error && !isDefinitiveAuthError(error) && isLocalSessionUsable(candidate)) {
      return {
        error: "offline_session_preserved",
        session: candidate,
        shouldClearLocalSession: false,
      };
    }

    return {
      error: "session_expired",
      session: null,
      shouldClearLocalSession: !data.user || Boolean(error && isDefinitiveAuthError(error)),
    };
  } catch (error) {
    if (!isDefinitiveAuthError(error) && isLocalSessionUsable(candidate)) {
      return {
        error: "offline_session_preserved",
        session: candidate,
        shouldClearLocalSession: false,
      };
    }

    return {
      error: "session_verification_failed",
      session: null,
      shouldClearLocalSession: isDefinitiveAuthError(error),
    };
  }
}

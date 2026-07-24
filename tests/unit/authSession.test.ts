import type { Session } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";

import {
  isDefinitiveAuthError,
  isLocalSessionUsable,
  verifyAuthSession,
} from "@/features/auth/authSession";

const NOW = 1_800_000_000_000;

function session(overrides: Partial<Session> = {}): Session {
  return {
    access_token: "access-token",
    expires_at: Math.floor(NOW / 1000) + 60,
    expires_in: 60,
    refresh_token: "refresh-token",
    token_type: "bearer",
    user: { id: "user-1" },
    ...overrides,
  } as Session;
}

describe("clasificacion pura de errores de sesion", () => {
  it.each([
    [{ name: "AuthSessionMissingError" }, true],
    [{ status: 401 }, true],
    [{ status: 422 }, true],
    [{ status: 408 }, false],
    [{ status: 429 }, false],
    [{ status: 500 }, false],
    [new TypeError("Network request failed"), false],
    [null, false],
  ])("clasifica %j como definitivo=%s", (error, expected) => {
    expect(isDefinitiveAuthError(error)).toBe(expected);
  });

  it("solo considera util una sesion identificada, con token y no vencida", () => {
    expect(isLocalSessionUsable(session(), NOW)).toBe(true);
    expect(isLocalSessionUsable(session({ access_token: "" }), NOW)).toBe(false);
    expect(isLocalSessionUsable(session({ expires_at: undefined }), NOW)).toBe(false);
    expect(isLocalSessionUsable(session({ expires_at: Math.floor(NOW / 1000) }), NOW)).toBe(false);
    expect(isLocalSessionUsable(null, NOW)).toBe(false);
  });

  it("conserva una sesion vigente ante un fallo transitorio", async () => {
    const candidate = session({ expires_at: Math.floor(Date.now() / 1000) + 60 });
    const authClient = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: { status: 503 } }) },
    };

    await expect(verifyAuthSession(authClient as never, candidate)).resolves.toEqual({
      error: "offline_session_preserved",
      session: candidate,
      shouldClearLocalSession: false,
    });
  });

  it("descarta y marca para limpieza una sesion rechazada definitivamente", async () => {
    const authClient = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: { status: 401 } }) },
    };

    await expect(verifyAuthSession(authClient as never, session())).resolves.toEqual({
      error: "session_expired",
      session: null,
      shouldClearLocalSession: true,
    });
  });
});

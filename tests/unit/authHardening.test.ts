import { readFileSync } from "node:fs";
import path from "node:path";

import type { Session } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";

import {
  isDefinitiveAuthError,
  isLocalSessionUsable,
  verifyAuthSession,
} from "../../src/features/auth/authSession";

const root = path.resolve(__dirname, "../..");
const read = (file: string) => readFileSync(path.join(root, file), "utf8");

function session(expiresAt: number): Session {
  return {
    access_token: "access-token",
    expires_at: expiresAt,
    expires_in: 3600,
    refresh_token: "refresh-token",
    token_type: "bearer",
    user: { id: "user-a" } as Session["user"],
  };
}

describe("endurecimiento de Auth movil", () => {
  it("conserva una sesion local vigente cuando la verificacion falla por red", async () => {
    const current = session(Math.floor(Date.now() / 1000) + 3600);
    const authClient = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: { name: "AuthRetryableFetchError", status: 0 },
        }),
      },
    } as unknown as Parameters<typeof verifyAuthSession>[0];

    const result = await verifyAuthSession(authClient, current);

    expect(result.session).toBe(current);
    expect(result.shouldClearLocalSession).toBe(false);
    expect(result.error).toBe("offline_session_preserved");
  });

  it("distingue rechazo definitivo de errores transitorios y expiracion local", () => {
    expect(isDefinitiveAuthError({ status: 401 })).toBe(true);
    expect(isDefinitiveAuthError({ status: 429 })).toBe(false);
    expect(isLocalSessionUsable(session(Math.floor(Date.now() / 1000) + 60))).toBe(true);
    expect(isLocalSessionUsable(session(Math.floor(Date.now() / 1000) - 60))).toBe(false);
  });

  it("solo abre reset tras PASSWORD_RECOVERY y consume una autorizacion de un uso", () => {
    const service = read("src/features/auth/authService.ts");
    const callback = read("app/auth/callback.tsx");
    const recoveryState = read("src/features/auth/recoveryState.ts");

    expect(service).toContain('event === "PASSWORD_RECOVERY"');
    expect(service).toContain("hasPasswordRecoveryAuthorization");
    expect(service).toContain("await clearPasswordRecovery()");
    expect(callback).toContain("isPasswordRecovery ?");
    expect(callback).not.toContain('mode === "recovery"');
    expect(recoveryState).toContain("await clearPasswordRecovery()");
  });

  it("verifica la contrasena dentro de la Edge Function antes de borrar", () => {
    const client = read("src/features/auth/authService.ts");
    const edgeFunction = read("supabase/functions/delete-account/index.ts");

    expect(client).toContain("body: { password, userId }");
    expect(edgeFunction).toContain("readDeletionRequest(request)");
    expect(edgeFunction).toContain("data.user.id !== deletionRequest.userId");
    expect(edgeFunction).toContain("verifier.auth.signInWithPassword");
    expect(edgeFunction).toContain("reauthenticated.user?.id !== data.user.id");
    expect(edgeFunction.indexOf("signInWithPassword")).toBeLessThan(edgeFunction.indexOf("admin.deleteUser"));
  });
});

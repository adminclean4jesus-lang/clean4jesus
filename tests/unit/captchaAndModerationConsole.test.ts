import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");
const read = (file: string) => readFileSync(path.join(root, file), "utf8");

describe("CAPTCHA de Auth", () => {
  it("envia el token a ingreso, registro y recuperacion sin incluir secretos", () => {
    const authService = read("src/features/auth/authService.ts");
    const config = read("src/features/auth/captchaConfig.ts");

    expect(authService.match(/captchaToken/g)?.length).toBeGreaterThanOrEqual(6);
    expect(config).toContain("EXPO_PUBLIC_TURNSTILE_SITE_KEY");
    expect(config.toLowerCase()).not.toContain("secret_key");
    expect(config.toLowerCase()).not.toContain("secretkey");
  });

  it("no activa proteccion si la configuracion externa esta incompleta", () => {
    const config = read("src/features/auth/captchaConfig.ts");
    const gate = read("src/features/auth/CommunityAuthGate.tsx");

    expect(config).toContain('EXPO_PUBLIC_AUTH_CAPTCHA_ENABLED === "true"');
    expect(gate).toContain("captchaConfigurationError");
    expect(read("src/features/auth/TurnstileChallengeModal.native.tsx")).toContain("onHttpError");
    expect(read("src/features/auth/TurnstileChallengeModal.native.tsx")).toContain("copy.retry");
    expect(read("src/features/i18n/flowText.ts")).toContain('"common.retry": "Intentar nuevamente"');
    expect(read("src/features/auth/TurnstileChallengeModal.native.tsx")).toContain("onShouldStartLoadWithRequest");
    expect(read("src/features/auth/TurnstileChallengeModal.native.tsx")).toContain("120_000");
    expect(read("web/turnstile/index.html")).toContain('"timeout-callback"');
    expect(read("web/turnstile/index.html")).toContain('"unsupported-callback"');
    expect(gate).toContain("submitCredentials(token)");
  });
});

describe("consola de moderacion", () => {
  it("exige MFA en Postgres y retira acceso a los RPC antiguos", () => {
    const migration = read("supabase/migrations/20260716163103_require_mfa_for_moderation_console.sql");

    expect(migration).toContain("moderator_mfa_required");
    expect(migration.match(/auth\.jwt\(\) ->> 'aal'/g)?.length).toBeGreaterThanOrEqual(2);
    expect(migration).toContain("revoke all on function public.list_community_moderation_cases(text, integer)");
    expect(migration).toContain("revoke all on function public.apply_community_moderation(uuid, integer, text, text, uuid)");
  });

  it("usa la Edge Function y nunca incluye una clave administrativa", () => {
    const source = [
      read("moderation-console/src/App.tsx"),
      read("moderation-console/src/moderationService.ts"),
      read("moderation-console/src/supabase.ts"),
    ].join("\n");

    expect(source).toContain('functions.invoke("moderate-community"');
    expect(source).toContain("challengeAndVerify");
    expect(source).not.toContain("SERVICE_ROLE");
    expect(source).not.toContain("service_role");
  });
});

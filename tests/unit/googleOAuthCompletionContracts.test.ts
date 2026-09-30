import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

describe("Google OAuth completion contract", () => {
  it("never surfaces a failed sign-in after Android already holds a valid session", () => {
    const source = readFileSync(join(process.cwd(), "src/features/auth/socialAuthService.ts"), "utf8");
    const callback = readFileSync(join(process.cwd(), "app/auth/callback.tsx"), "utf8");
    const authService = readFileSync(join(process.cwd(), "src/features/auth/authService.ts"), "utf8");

    expect(source).toContain("hasAuthenticatedSession(supabase)");
    expect(source).toMatch(/result\.type !== "success"[\s\S]*hasAuthenticatedSession\(supabase\)[\s\S]*return \{ cancelled: false \}/);
    expect(source).toMatch(/catch \(error\)[\s\S]*hasAuthenticatedSession\(supabase\)[\s\S]*throw error/);
    expect(source).toContain('void recordLegalAcceptance(language, "google_oauth").catch(() => undefined)');
    expect(callback).toContain('exchangeAuthCode(code, "oauth")');
    expect(callback).not.toContain('mode === "recovery"');
    expect(authService).toMatch(/flow === "oauth"[\s\S]*supabase\.auth\.getSession\(\)[\s\S]*current\?\.data\?\.session\?\.user/);
  });
});

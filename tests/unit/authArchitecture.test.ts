import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const root = path.resolve(__dirname, "../..");
const read = (file: string) => readFileSync(path.join(root, file), "utf8");

describe("contrato de autenticacion 1.3.1", () => {
  it("usa PKCE y almacenamiento cifrado en dispositivos", () => {
    expect(read("src/lib/supabase.ts")).toContain('flowType: "pkce"');
    expect(read("src/lib/supabaseStorage.native.ts")).toContain("SecureStore");
    expect(read("src/lib/supabaseStorage.native.ts")).toContain("legacyValue");
  });

  it("incluye callback, confirmacion y recuperacion", () => {
    const service = read("src/features/auth/authService.ts");
    const redirect = read("src/features/auth/authRedirect.ts");
    expect(service).toContain("emailRedirectTo");
    expect(service).toContain("resetPasswordForEmail");
    expect(service).toContain("exchangeCodeForSession");
    expect(service).toContain("updateUser({ password })");
    expect(redirect).toContain('Linking.createURL("auth/callback")');
    expect(read("app/auth/callback.tsx")).toContain("exchangeAuthCode");
    expect(read("app/callback.tsx")).toContain('from "./auth/callback"');
    expect(read("app/auth/reset-password.tsx")).toContain("updatePassword");
  });

  it("mantiene la clave administrativa fuera del APK", () => {
    expect(read("src/features/auth/authService.ts")).not.toMatch(/service[_-]?role/i);
    expect(read("src/lib/supabase.ts")).not.toMatch(/service[_-]?role/i);
    expect(read("supabase/functions/delete-account/index.ts")).toContain("SUPABASE_SERVICE_ROLE_KEY");
  });

  it("exige verificacion y una contrasena local coherente", () => {
    const config = read("supabase/config.toml");
    expect(config).toContain("minimum_password_length = 10");
    expect(config).toContain("secure_password_change = true");
    expect(config).toContain('"clean4jesus://**"');
  });
});

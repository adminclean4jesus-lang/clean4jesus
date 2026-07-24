import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function read(path: string) {
  return readFileSync(path, "utf8");
}

describe("contrato de acceso social", () => {
  it("usa OAuth PKCE con retorno propio y sin almacenar tokens del proveedor", () => {
    const source = read("src/features/auth/socialAuthService.ts");

    expect(source).toContain("signInWithOAuth");
    expect(source).toContain("skipBrowserRedirect: true");
    expect(source).toContain("authCallbackUrl");
    expect(source).toContain("exchangeAuthCode(code)");
    expect(source).not.toMatch(/provider_token|provider_refresh_token|service[_-]?role/i);
  });

  it("limita Google a identidad básica y excluye Apple", () => {
    const source = read("src/features/auth/socialAuthService.ts");

    expect(source).toContain('"email profile"');
    expect(source).toContain('provider: "google"');
    expect(source).not.toMatch(/apple/i);
  });

  it("conserva una identidad iOS estable sin depender de Apple Login", () => {
    const config = JSON.parse(read("app.json"));

    expect(config.expo.scheme).toBe("clean4jesus");
    expect(config.expo.ios.bundleIdentifier).toBe("com.clean4jesus.app");
  });
});

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("Diagnóstico de autorización de Family Controls", () => {
  it("propaga el error nativo de Apple en vez de convertirlo silenciosamente en false", () => {
    const moduleSource = readFileSync(
      join(process.cwd(), "modules/clean4jesus-ios-protection/ios/Clean4JesusIosProtectionModule.swift"),
      "utf8",
    );
    const authorizationSection = moduleSource.slice(
      moduleSource.indexOf('AsyncFunction("requestAuthorization")'),
      moduleSource.indexOf('AsyncFunction("getStatus")'),
    );

    expect(authorizationSection).toContain("promise.reject(");
    expect(authorizationSection).toContain('"ERR_FAMILY_CONTROLS_AUTHORIZATION"');
    expect(authorizationSection).not.toContain("promise.resolve(false)");
  });

  it("muestra al usuario el mensaje original de Apple", () => {
    const gateSource = readFileSync(join(process.cwd(), "app/index.tsx"), "utf8");
    expect(gateSource).toContain("getIosAuthorizationErrorMessage(error)");
  });
});

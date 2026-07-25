import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = resolve(__dirname, "../..");

describe("iOS protection boundary", () => {
  it("routes iOS through its own honest readiness screen", () => {
    const gateSource = readFileSync(resolve(projectRoot, "app/index.tsx"), "utf8");
    const iOSScreen = readFileSync(resolve(projectRoot, "app/ios-protection.tsx"), "utf8");

    expect(gateSource).toContain('Platform.OS === "ios"');
    expect(gateSource).toContain('<Redirect href="/ios-protection" />');
    expect(iOSScreen).toContain('getProtectionPlatformDescriptor("ios")');
  });

  it("never lets the shared shield service mark iOS as enabled", () => {
    const shieldSource = readFileSync(resolve(projectRoot, "src/features/shield/shieldService.ts"), "utf8");

    expect(shieldSource.match(/getRuntimePlatform\(\) === "ios"/g)?.length).toBeGreaterThanOrEqual(4);
    expect(shieldSource).toContain("unsupportedIosState");
  });
});

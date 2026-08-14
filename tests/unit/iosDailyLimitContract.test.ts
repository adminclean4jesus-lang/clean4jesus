import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function read(path: string) {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("iOS daily limit and Shield contracts", () => {
  it("passes a selected daily limit through the iOS protection screen", () => {
    const source = read("app/ios-protection.tsx");

    expect(source).toContain("dailyLimitMinutes");
    expect(source).toContain("setDailyLimit");
    expect(source).toContain("dailyLimitOptions");
    expect(source).toContain("status.dailyLimitMinutes");
  });

  it("registers a DeviceActivity event for the selected apps and applies the Shield at threshold", () => {
    const moduleSource = read(
      "modules/clean4jesus-ios-protection/ios/Clean4JesusIosProtectionModule.swift",
    );
    const monitorSource = read(
      "targets/DeviceActivityMonitor/DeviceActivityMonitorExtension.swift",
    );

    expect(moduleSource).toContain("startMonitoring");
    expect(moduleSource).toContain("dailyLimitMinutes");
    expect(moduleSource).toContain("DeviceActivityEvent");
    expect(monitorSource).toContain("eventDidReachThreshold");
    expect(monitorSource).toContain("store.shield.applications");
  });

  it("has native routes to change and clear the protection mode", () => {
    const moduleSource = read(
      "modules/clean4jesus-ios-protection/ios/Clean4JesusIosProtectionModule.swift",
    );

    expect(moduleSource).toContain('AsyncFunction("setDailyLimit")');
    expect(moduleSource).toContain('AsyncFunction("clearProtection")');
    expect(moduleSource).toContain("stopMonitoring");
  });

  it("uses only Shield actions supported by the iOS release SDK", () => {
    const configurationSource = read(
      "targets/ShieldConfiguration/ShieldConfigurationExtension.swift",
    );
    const actionSource = read(
      "targets/ShieldAction/ShieldActionExtension.swift",
    );

    expect(configurationSource).toContain("Volver al inicio");
    expect(configurationSource).not.toContain("Respirar 60 segundos");
    expect(actionSource).not.toContain("openParentalControlsApp");
    expect(actionSource).toMatch(
      /case \.primaryButtonPressed:[\s\S]*?completionHandler\(\.close\)/,
    );
    expect(actionSource).not.toContain("rescueActiveTimestamp");
  });

  it("keeps the iOS home copy and Shield copy on the selected locale", () => {
    const homeSource = read("app/(tabs)/index.tsx");
    const providerSource = read("src/features/i18n/I18nProvider.tsx");
    const copySource = read("src/features/i18n/iosProtectionText.ts");

    expect(homeSource).toContain("iosCopy.body");
    expect(homeSource).toContain("iosCopy.authorized");
    expect(providerSource).toContain("syncIosShieldCopy");
    expect(providerSource).toContain("setShieldCopy");
    expect(copySource).toContain("shieldPrimaryAction");
    expect(copySource).toContain("shieldSecondaryAction");
  });

  it("does not hardcode the iOS rescue screen in Spanish", () => {
    const source = read("app/ios-rescue.tsx");

    expect(source).toContain("getIosRescueText");
    expect(source).toContain("copy[phase]");
    expect(source).not.toContain("Respirar 60 Segundos");
  });
});

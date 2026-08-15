import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function read(path: string) {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("iOS per-app limits and Shield contracts", () => {
  it("uses a native per-app editor instead of one global limit", () => {
    const source = read("app/ios-protection.tsx");

    expect(source).toContain("presentPerAppLimitEditor");
    expect(source).toContain("ios-per-app-limits");
    expect(source).toContain("hasUserConfiguredLimits");
    expect(source).toContain('requireGuardianPin("edit-ios-limits")');
    expect(source).not.toContain("dailyLimitOptions");
    expect(source).not.toContain("setDailyLimit");
  });

  it("registers one DeviceActivity event for each opaque application token", () => {
    const moduleSource = read("modules/clean4jesus-ios-protection/ios/Clean4JesusIosProtectionModule.swift");
    const monitorSource = read("targets/DeviceActivityMonitor/DeviceActivityMonitorExtension.swift");

    expect(moduleSource).toContain("startPerAppLimitMonitoring");
    expect(moduleSource).toContain("for rule in enabledRules");
    expect(moduleSource).toContain("applications: [rule.token]");
    expect(moduleSource).toContain("perAppLimitsConfiguredKey");
    expect(monitorSource).toContain("rules.first(where:");
    expect(monitorSource).toContain("shieldedApplications.insert(rule.token)");
  });

  it("uses a branded shield icon and one honest close action", () => {
    const configurationSource = read("targets/ShieldConfiguration/ShieldConfigurationExtension.swift");
    const actionSource = read("targets/ShieldAction/ShieldActionExtension.swift");

    expect(configurationSource).toContain("makeClean4JesusMark");
    expect(configurationSource).toContain("Tu límite de hoy se cumplió");
    expect(configurationSource).toContain("secondaryButtonLabel: nil");
    expect(configurationSource).not.toContain('UIImage(named: "AppIcon")');
    expect(configurationSource).not.toContain("ovalIn:");
    expect(actionSource).not.toContain("openParentalControlsApp");
  });

  it("removes the iOS rescue flow without touching Android interruption", () => {
    expect(existsSync(join(process.cwd(), "app/ios-rescue.tsx"))).toBe(false);
    expect(existsSync(join(process.cwd(), "src/features/i18n/iosRescueText.ts"))).toBe(false);
    expect(read("app/settings.tsx")).toContain('router.push("/interruption-settings")');
    expect(read("app/interruption-settings.tsx")).toBeTruthy();
  });

  it("keeps Shield copy synchronized with the selected locale", () => {
    const providerSource = read("src/features/i18n/I18nProvider.tsx");
    const copySource = read("src/features/i18n/iosProtectionText.ts");
    expect(providerSource).toContain("syncIosShieldCopy");
    expect(copySource).toContain("shieldPrimaryAction");
    expect(copySource).not.toContain("Pausa de Clean4Jesus");
  });
});

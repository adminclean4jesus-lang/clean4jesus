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
    expect(moduleSource).toContain("makePerAppLimitEvent(token: rule.token, minutes: rule.minutes)");
    expect(moduleSource).toContain("perAppLimitsConfiguredKey");
    expect(monitorSource).toContain("rules.first(where:");
    expect(monitorSource).toContain("shieldedApplications.insert(rule.token)");
  });

  it("offers an immediate per-app block without calling it a daily limit", () => {
    const moduleSource = read("modules/clean4jesus-ios-protection/ios/Clean4JesusIosProtectionModule.swift");
    const monitorSource = read("targets/DeviceActivityMonitor/DeviceActivityMonitorExtension.swift");

    expect(moduleSource).toContain("private let options = [0, 15, 30, 60, 120]");
    expect(moduleSource).toContain("Text(minutes == 0 ? copy.block");
    expect(moduleSource).toContain("applyImmediateAppBlocks");
    expect(moduleSource).toContain('$0.enabled && $0.minutes == 0');
    expect(moduleSource).not.toContain("Bloquear todo el día");
    expect(monitorSource).toContain("applyImmediateBlocks(defaults: defaults)");
    expect(monitorSource).toContain('$0.enabled && $0.minutes == 0');
  });

  it("counts a selected app's use from the start of today's active interval", () => {
    const moduleSource = read("modules/clean4jesus-ios-protection/ios/Clean4JesusIosProtectionModule.swift");

    expect(moduleSource).toContain("if #available(iOS 17.4, *)");
    expect(moduleSource).toContain("includesPastActivity: true");
    expect(moduleSource).toContain("iOS 16–17.3 do not expose includesPastActivity");
  });

  it("uses a branded, high-contrast shield and one honest close action", () => {
    const configurationSource = read("targets/ShieldConfiguration/ShieldConfigurationExtension.swift");
    const actionSource = read("targets/ShieldAction/ShieldActionExtension.swift");
    const targetConfig = read("targets/ShieldConfiguration/expo-target.config.js");

    expect(configurationSource).toContain("makeClean4JesusMark");
    expect(configurationSource).toContain("Tu límite de hoy se cumplió");
    expect(configurationSource).toContain("backgroundBlurStyle: .systemMaterialLight");
    expect(configurationSource).toContain("icon: makeClean4JesusMark()");
    expect(configurationSource).toContain("primaryButtonLabel: ShieldConfiguration.Label(text: primaryLabel, color: .white)");
    expect(configurationSource).toContain("primaryButtonBackgroundColor: UIColor(red: 0.027, green: 0.122, blue: 0.322, alpha: 1.0)");
    expect(targetConfig).toContain('Clean4JesusOfficialMark: "../../assets/android-icon-foreground.png"');
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

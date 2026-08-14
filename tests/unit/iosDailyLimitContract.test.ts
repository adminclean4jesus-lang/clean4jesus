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

  it("uses a direct Clean4Jesus action on the Shield instead of a fixed breathing timer", () => {
    const configurationSource = read(
      "targets/ShieldConfiguration/ShieldConfigurationExtension.swift",
    );
    const actionSource = read(
      "targets/ShieldAction/ShieldActionExtension.swift",
    );

    expect(configurationSource).toContain("Abrir Clean4Jesus");
    expect(configurationSource).not.toContain("Respirar 60 segundos");
    expect(actionSource).toContain("openParentalControlsApp");
    expect(actionSource).not.toContain("rescueActiveTimestamp");
  });
});

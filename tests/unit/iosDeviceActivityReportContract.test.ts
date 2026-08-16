import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function read(path: string) {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("iOS DeviceActivityReport contract", () => {
  it("registers the official report extension point and target", () => {
    const target = read("targets/DeviceActivityReport/expo-target.config.js");
    const source = read("targets/DeviceActivityReport/DeviceActivityReportExtension.swift");
    const pluginPatch = read("scripts/patch-apple-targets.mjs");

    expect(existsSync(join(process.cwd(), "targets/DeviceActivityReport/DeviceActivityReportExtension.swift"))).toBe(true);
    expect(target).toContain('type: "device-activity-report"');
    expect(target).toContain('bundleIdentifier: ".DeviceActivityReport"');
    expect(pluginPatch).toContain("com.apple.deviceactivityui.report-extension");
    expect(source).toContain("DeviceActivityReportExtension");
    expect(source).toContain("DeviceActivityReportScene");
    expect(source).toContain("totalActivityDuration");
    expect(source).toContain("Te quedan");
  });

  it("opens the native report without moving usage data through JavaScript", () => {
    const moduleSource = read("modules/clean4jesus-ios-protection/ios/Clean4JesusIosProtectionModule.swift");
    const appSource = read("app/ios-protection.tsx");

    expect(moduleSource).toContain('AsyncFunction("presentDailyUsageReport")');
    expect(moduleSource).toContain("DeviceActivityReport(");
    expect(appSource).toContain('testID="ios-usage-report"');
    expect(appSource).toContain("presentDailyUsageReport(language)");
  });
});

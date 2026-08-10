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
    expect(iOSScreen).toContain("iosProtectionNativeContract.requestAuthorization()");
    expect(iOSScreen).toContain("iosProtectionNativeContract.presentFamilyActivityPicker()");
    expect(iOSScreen).toContain("activate-ios-refuge");
    expect(iOSScreen).toContain("disable-ios-refuge");
  });

  it("never lets the shared shield service mark iOS as enabled", () => {
    const shieldSource = readFileSync(resolve(projectRoot, "src/features/shield/shieldService.ts"), "utf8");

    expect(shieldSource.match(/getRuntimePlatform\(\) === "ios"/g)?.length).toBeGreaterThanOrEqual(4);
    expect(shieldSource).toContain("unsupportedIosState");
  });

  it("ships the three Screen Time extensions through Expo CNG", () => {
    const appConfig = JSON.parse(readFileSync(resolve(projectRoot, "app.json"), "utf8")).expo;
    const targetFiles = [
      "targets/DeviceActivityMonitor/DeviceActivityMonitorExtension.swift",
      "targets/ShieldConfiguration/ShieldConfigurationExtension.swift",
      "targets/ShieldAction/ShieldActionExtension.swift",
    ];

    expect(appConfig.version).toBe("1.3.16");
    expect(appConfig.ios.buildNumber).toBe("7");
    expect(appConfig.plugins).toContain("@bacons/apple-targets");
    expect(appConfig.ios.entitlements["com.apple.security.application-groups"]).toEqual(["group.com.clean4jesus.app"]);
    targetFiles.forEach((file) => expect(readFileSync(resolve(projectRoot, file), "utf8").length).toBeGreaterThan(100));
  });

  it("uses plain React Native views on iOS to avoid the Fabric snapshot crash", () => {
    const entrySource = readFileSync(resolve(projectRoot, "index.ts"), "utf8");

    expect(entrySource).toContain('Platform.OS === "ios"');
    expect(entrySource).toContain("enableScreens(false)");
  });

  it("connects daily limits, adult web filtering, and rescue without touching Android", () => {
    const moduleSource = readFileSync(resolve(projectRoot, "modules/clean4jesus-ios-protection/ios/Clean4JesusIosProtectionModule.swift"), "utf8");
    const monitorSource = readFileSync(resolve(projectRoot, "targets/DeviceActivityMonitor/DeviceActivityMonitorExtension.swift"), "utf8");
    const actionSource = readFileSync(resolve(projectRoot, "targets/ShieldAction/ShieldActionExtension.swift"), "utf8");

    expect(moduleSource).toContain("settingsStore.webContent.blockedByFilter = .auto()");
    expect(moduleSource).toContain("activityCenter.startMonitoring");
    expect(monitorSource).toContain("eventDidReachThreshold");
    expect(actionSource).not.toContain("openParentalControlsApp");
    expect(actionSource).toContain("completionHandler(.close)");
    expect(actionSource).toContain("clean4jesus.rescueRequested");
  });

  it("runs Screen Time bridge calls on the iOS main queue", () => {
    const moduleSource = readFileSync(resolve(projectRoot, "modules/clean4jesus-ios-protection/ios/Clean4JesusIosProtectionModule.swift"), "utf8");

    const asyncFunctionCount = (moduleSource.match(/AsyncFunction\(/g) ?? []).length;
    const mainQueueCount = (moduleSource.match(/\.runOnQueue\(\.main\)/g) ?? []).length;

    expect(asyncFunctionCount).toBeGreaterThan(0);
    expect(mainQueueCount).toBe(asyncFunctionCount);
  });
});

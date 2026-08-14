import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

function read(path: string) {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("Phase 1 protection contracts", () => {
  it("requires the PIN when iOS opens before showing Family Controls", () => {
    const gateSource = read("app/index.tsx");
    const verifySource = read("app/pin-verify.tsx");

    expect(gateSource).toContain("isIosPinSessionVerified()");
    expect(gateSource).toContain(
      'router.replace("/pin-verify?action=enter-ios-refuge")',
    );
    expect(verifySource).toContain("markIosPinSessionVerified()");
    expect(verifySource).toContain('router.replace("/")');
  });

  it("does not reuse an iOS Keychain PIN after a fresh installation", () => {
    const pinSource = read("src/features/pin/pinService.ts");
    const storageSource = read("src/services/storage.ts");

    expect(storageSource).toContain("pinConfiguredThisInstall");
    expect(pinSource).toContain("hasPinConfiguredThisInstall");
    expect(pinSource).toContain(
      "AsyncStorage.setItem(storageKeys.pinConfiguredThisInstall",
    );
  });

  it("requires the current guardian PIN before replacing an existing PIN", () => {
    const source = read("app/pin-setup.tsx");
    const copy = read("src/features/i18n/pinText.ts");
    expect(source).toContain("pinExists && !(await verifyPin(currentPin))");
    expect(source).toContain("accessibilityLabel={copy.currentPin}");
    expect(source).toContain("accessibilityLabel={copy.newPin}");
    expect(copy).toContain('currentPin: "PIN actual"');
    expect(copy).toContain('newPin: "Nuevo PIN"');
  });

  it("opens the native iOS readiness gate before onboarding can redirect it", () => {
    const source = read("app/pin-setup.tsx");
    const iosProtection = read("app/ios-protection.tsx");
    const maestro = read(".maestro/ios-startup-smoke.yml");

    expect(source).toContain('testID="pin-setup-new"');
    expect(source).toContain('testID="pin-setup-confirm"');
    expect(source).toContain('testID="pin-setup-save"');
    expect(iosProtection).toContain('testID="ios-protection-screen"');
    expect(maestro).toContain("openLink: clean4jesus://ios-protection");
    expect(maestro).toContain('visible:\n      id: "ios-protection-screen"');
    expect(maestro).not.toContain('id: "pin-setup-save"');
  });

  it("commits local PIN and interruption settings only after Android accepts them", () => {
    const pinSource = read("src/features/pin/pinService.ts");
    const customizationSource = read(
      "src/features/interruption/interruptionCustomizationService.ts",
    );
    expect(pinSource.indexOf("syncPinToNative(pinHash)")).toBeLessThan(
      pinSource.indexOf("setSecureItem(storageKeys.pin"),
    );
    expect(
      customizationSource.indexOf("syncCustomizationToNative(normalized)"),
    ).toBeLessThan(
      customizationSource.indexOf(
        "setJson(storageKeys.interruptionCustomization, normalized)",
      ),
    );
  });

  it("keeps the approved interruption hierarchy with reason before rescue and guardian actions", () => {
    const source = read(
      "android/app/src/main/java/com/clean4jesus/app/InterruptionActivity.kt",
    );
    expect(source.indexOf("content.addView(reasonCard)")).toBeLessThan(
      source.indexOf("content.addView(rescueActionCard)"),
    );
    expect(source.indexOf("content.addView(reasonCard)")).toBeLessThan(
      source.indexOf("content.addView(unlockCard)"),
    );
    expect(source).toContain("content.addView(secondaryButton)");
  });

  it("clears native accountability credentials whenever the local session signs out", () => {
    const authSource = read("src/features/auth/authService.ts");
    const providerSource = read("src/features/auth/AuthProvider.tsx");
    const accountabilitySource = read(
      "src/features/accountability/accountabilityService.ts",
    );

    expect(authSource).toContain("await clearAccountabilityDevice()");
    expect(providerSource).toContain("clearAccountabilityDevice");
    expect(accountabilitySource).toContain(
      "export async function clearAccountabilityDevice",
    );
    expect(
      accountabilitySource.indexOf("nativeModule?.clearAccountabilityDevice"),
    ).toBeLessThan(
      accountabilitySource.indexOf("deleteSecureItem(DEVICE_ID_KEY)"),
    );
  });
});

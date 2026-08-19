import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

function readProjectFile(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("Android native protection contracts", () => {
  it("resolves VPN start only after Android reports an active tunnel", () => {
    const moduleSource = readProjectFile("android/app/src/main/java/com/clean4jesus/app/Clean4JesusVpnModule.kt");
    const permissionSource = readProjectFile("android/app/src/main/java/com/clean4jesus/app/Clean4JesusVpnPermissionActivity.kt");
    const serviceSource = readProjectFile("android/app/src/main/java/com/clean4jesus/app/Clean4JesusVpnService.kt");
    const bridgeSource = readProjectFile("src/features/shield/localDnsVpnService.ts");

    expect(moduleSource).toContain("putExtra(EXTRA_RESULT_RECEIVER, resultReceiver)");
    expect(moduleSource).toContain("resultCode == RESULT_VPN_ACTIVE && Clean4JesusVpnService.isActive()");
    expect(permissionSource).toContain("Clean4JesusVpnService.isActive()");
    expect(permissionSource).toContain("RESULT_VPN_INACTIVE");
    expect(serviceSource).toContain("@Volatile\n    private var active = false");
    expect(serviceSource).not.toContain("PREF_ACTIVE");
    expect(bridgeSource).toMatch(/startDnsVpn\(\)[\s\S]*nativeVpn\.getStatus\(\)/);
  });

  it("keeps trust decisions package-based and never bypasses blocking from visible text", () => {
    const source = readProjectFile("android/app/src/main/java/com/clean4jesus/app/Clean4JesusAccessibilityService.kt");

    expect(source).toContain("trustedPackagePrefixes");
    expect(source).toContain("trustedFinancialPackagePrefixes");
    expect(source).not.toContain("trustedContentSignals");
    expect(source).not.toMatch(/text\.containsSignal\([^)]*\)\s*\) return null/);
  });

  it("excludes WhatsApp by default and only scans it after explicit Android opt-in", () => {
    const serviceSource = readProjectFile("android/app/src/main/java/com/clean4jesus/app/Clean4JesusAccessibilityService.kt");
    const moduleSource = readProjectFile("android/app/src/main/java/com/clean4jesus/app/Clean4JesusVpnModule.kt");
    const bridgeSource = readProjectFile("src/features/shield/whatsAppProtectionService.ts");
    const settingsSource = readProjectFile("app/settings.tsx");

    expect(serviceSource).toContain("PREF_WHATSAPP_PROTECTION_ENABLED");
    expect(serviceSource).toContain('"com.whatsapp"');
    expect(serviceSource).toContain('"com.whatsapp.w4b"');
    expect(serviceSource).toMatch(/isWhatsAppPackage\(packageName\)[\s\S]*getBoolean\(PREF_WHATSAPP_PROTECTION_ENABLED, false\)/);
    expect(serviceSource).toMatch(/if \(shouldIgnorePackage\(packageName\)\) \{[\s\S]*stopForegroundTracking\(now\)[\s\S]*return/);
    expect(moduleSource).toContain("getWhatsAppProtectionEnabled");
    expect(moduleSource).toContain("setWhatsAppProtectionEnabled");
    expect(bridgeSource).toContain("isWhatsAppProtectionEnabled");
    expect(bridgeSource).toContain("setWhatsAppProtectionEnabled");
    expect(settingsSource).toContain('testID="settings-whatsapp-protection-switch"');
    expect(settingsSource).toContain('const isAndroid = Platform.OS === "android"');
    expect(settingsSource).toContain("settings.whatsapp.warningTitle");
    expect(settingsSource).toContain("settings.whatsapp.warningBody");
    expect(settingsSource).toContain('router.push("/pin-setup")');
    expect(settingsSource).toContain('router.push("/pin-verify?action=disable-whatsapp-protection")');
    expect(readProjectFile("app/pin-verify.tsx")).toContain('action === "disable-whatsapp-protection"');
    expect(readProjectFile("android/app/src/main/res/xml/clean4jesus_accessibility_service.xml")).toContain("com.whatsapp,com.whatsapp.w4b");
  });

  it("uses the dedicated monochrome notification icon and honest on-device privacy copy", () => {
    const vpnSource = readProjectFile("android/app/src/main/java/com/clean4jesus/app/Clean4JesusVpnService.kt");
    const interruptionSource = readProjectFile("android/app/src/main/java/com/clean4jesus/app/InterruptionActivity.kt");

    expect(vpnSource).toContain(".setSmallIcon(R.drawable.notification_icon)");
    expect(vpnSource).not.toContain(".setSmallIcon(R.mipmap.ic_launcher)");
    expect(interruptionSource).toContain("analiza en tu dispositivo el texto visible");
    expect(interruptionSource).not.toContain("No lee tus mensajes");
  });

  it("does not enable the shield while a native protection layer is pending", () => {
    const gateSource = readProjectFile("app/index.tsx");
    const validationIndex = gateSource.indexOf("!status.pinExists || !status.vpnActive || !status.accessibilityActive");
    const enableIndex = gateSource.indexOf("await enableShield()");

    expect(validationIndex).toBeGreaterThan(-1);
    expect(enableIndex).toBeGreaterThan(validationIndex);
  });

  it("bounds app usage between accessibility events without widening package access", () => {
    const source = readProjectFile("android/app/src/main/java/com/clean4jesus/app/Clean4JesusAccessibilityService.kt");
    const serviceConfig = readProjectFile("android/app/src/main/res/xml/clean4jesus_accessibility_service.xml");

    expect(source).toContain("MAX_TRACKED_EVENT_GAP_MS = 15_000L");
    expect(source).toContain("elapsed.coerceAtMost(MAX_TRACKED_EVENT_GAP_MS)");
    expect(source).toContain("coerceIn(0L, MAX_TRACKED_EVENT_GAP_MS)");
    expect(serviceConfig).toContain("android:packageNames=");
    expect(serviceConfig).not.toContain("com.google.android.youtube");
    expect(serviceConfig).not.toContain("com.nu.production");
  });

  it("coalesces expensive accessibility tree scans without delaying typed searches", () => {
    const source = readProjectFile("android/app/src/main/java/com/clean4jesus/app/Clean4JesusAccessibilityService.kt");

    expect(source).toContain("FULL_TREE_SCAN_INTERVAL_MS = 800L");
    expect(source).toContain("MAX_FULL_TREE_NODES = 160");
    expect(source).toContain("MAX_SOURCE_TREE_NODES = 48");
    expect(source).toContain("MAX_SIGNAL_TEXT_CHARS = 12_000");
    expect(source).toContain("event.eventType == AccessibilityEvent.TYPE_VIEW_TEXT_CHANGED");
    expect(source).toContain("shouldScanFullTree(event, packageName)");
    expect(source).toContain("collectText(event.source, MAX_SOURCE_TREE_NODES)");
    expect(source).not.toContain("append(collectText(rootInActiveWindow, 0))");
  });

  it("reads persisted app usage with the same wall clock used by accessibility", () => {
    const moduleSource = readProjectFile("android/app/src/main/java/com/clean4jesus/app/Clean4JesusVpnModule.kt");
    const usageMethod = moduleSource.match(/fun getAppProtectionUsage[\s\S]*?\n  }\n/)?.[0] ?? "";

    expect(usageMethod).toContain("System.currentTimeMillis()");
    expect(usageMethod).not.toContain("SystemClock.elapsedRealtime()");
  });

  it("fails visibly when both family DNS upstreams are unavailable", () => {
    const source = readProjectFile("android/app/src/main/java/com/clean4jesus/app/Clean4JesusVpnService.kt");

    expect(source).toContain('listOf("1.1.1.3", "1.0.0.3")');
    expect(source).toContain("MAX_CONSECUTIVE_DNS_FAILURES = 3");
    expect(source).toMatch(/consecutiveDnsFailures >= MAX_CONSECUTIVE_DNS_FAILURES[\s\S]*stopVpn\(\)[\s\S]*stopSelf\(\)/);
  });

  it("keeps temporary unlock scoped to the exact package and refreshes reused interruptions", () => {
    const serviceSource = readProjectFile("android/app/src/main/java/com/clean4jesus/app/Clean4JesusAccessibilityService.kt");
    const interruptionSource = readProjectFile("android/app/src/main/java/com/clean4jesus/app/InterruptionActivity.kt");

    expect(serviceSource).toMatch(/watchedPackages\.contains\(packageName\)[\s\S]*isTemporarilyUnlocked\(packageName, now\)[\s\S]*return/);
    expect(serviceSource).toContain("remove(temporaryUnlockKey(packageName))");
    expect(interruptionSource).toContain("override fun onNewIntent(intent: Intent)");
    expect(interruptionSource).toContain("renderInterruption(intent)");
    expect(interruptionSource).toContain("TEMPORARY_UNLOCK_DURATION_MS");
    expect(serviceSource).toContain("scheduleTemporaryRelock");
    expect(serviceSource).toContain("SystemClock.elapsedRealtime()");
    expect(serviceSource).toContain("temporaryUnlockBootKey(packageName)");
    expect(serviceSource).toContain("rootInActiveWindow?.packageName?.toString()");
    expect(readProjectFile("android/app/src/main/java/com/clean4jesus/app/Clean4JesusVpnModule.kt")).toContain("getTemporaryAppUnlocks");
  });

  it("treats visible-content PIN approval as an exact false-positive exception", () => {
    const serviceSource = readProjectFile("android/app/src/main/java/com/clean4jesus/app/Clean4JesusAccessibilityService.kt");
    const interruptionSource = readProjectFile("android/app/src/main/java/com/clean4jesus/app/InterruptionActivity.kt");

    expect(serviceSource).toContain("EXTRA_BLOCK_FINGERPRINT");
    expect(serviceSource).toContain("containsWholeSignal");
    expect(serviceSource).toMatch(/explicitAdultTerms\.firstOrNull\s*\{\s*text\.containsWholeSignal\(it\)\s*\}/);
    expect(serviceSource).toContain("isApprovedFalsePositive");
    expect(interruptionSource).toContain("approveFalsePositive");
    expect(interruptionSource).toContain("Fue un error");
    expect(interruptionSource).toContain("Confirmar PIN y continuar");
    expect(interruptionSource).toMatch(/if \(!blockFingerprint\.isNullOrBlank\(\)\)[\s\S]*approveFalsePositive/);
  });

  it("keeps risk alerts generic and never sends detected content", () => {
    const source = readProjectFile("android/app/src/main/java/com/clean4jesus/app/Clean4JesusAccessibilityService.kt");
    const moduleSource = readProjectFile("android/app/src/main/java/com/clean4jesus/app/Clean4JesusVpnModule.kt");

    expect(source).toContain("RISK_THRESHOLD = 3");
    expect(source).toContain("RISK_WINDOW_MS = 30 * 60_000L");
    expect(source).toContain("RISK_COOLDOWN_MS = 6 * 60 * 60_000L");
    expect(source).toContain('put("idempotencyKey"');
    expect(source).toContain("PREF_ACCOUNTABILITY_PENDING_SIGNALS");
    expect(source).toContain("flushPendingRiskSignals");
    expect(source).toContain("responseCode !in 200..299");
    expect(moduleSource).toContain(".remove(Clean4JesusAccessibilityService.PREF_ACCOUNTABILITY_PENDING_SIGNALS)");
    expect(source).not.toMatch(/riskPayload[\s\S]{0,500}(reason|packageName|visibleText|url|query)/);
  });

  it("supports bounded local interruption customization with a safe fallback", () => {
    const moduleSource = readProjectFile("android/app/src/main/java/com/clean4jesus/app/Clean4JesusVpnModule.kt");
    const interruptionSource = readProjectFile("android/app/src/main/java/com/clean4jesus/app/InterruptionActivity.kt");

    expect(moduleSource).toContain("syncInterruptionCustomization");
    expect(moduleSource).toContain("copyInterruptionImage");
    expect(interruptionSource).toContain("PREF_CUSTOM_MESSAGE");
    expect(interruptionSource).toContain("PREF_CUSTOM_IMAGE_PATH");
    expect(interruptionSource).toContain("decodeSampledBitmap");
  });
});

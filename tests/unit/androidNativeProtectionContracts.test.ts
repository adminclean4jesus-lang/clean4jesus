import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

function readProjectFile(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf8").replace(/\r\n/g, "\n");
}

describe("Android native protection contracts", () => {
  it("continues scanning visible content during a guardian's temporary app unlock", () => {
    const source = readProjectFile("android/app/src/main/java/com/clean4jesus/app/Clean4JesusAccessibilityService.kt");
    const eventHandler = source.split("override fun onAccessibilityEvent(event: AccessibilityEvent?) {")[1]
      ?.split("override fun onServiceConnected()")[0];

    expect(eventHandler).toBeTruthy();
    expect(eventHandler).not.toContain("if (isTemporarilyUnlocked(packageName, now)) return");
    expect(source).toContain("if (isTemporarilyUnlocked(packageName, now)) return null");
    expect(eventHandler).toContain("val reason = getBlockReason(packageName, visibleText)");
  });
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
    expect(serviceSource).toContain('PREF_DESIRED_ENABLED = "desired_enabled"');
    expect(moduleSource).toContain("Clean4JesusVpnService.shouldAutoStart(reactContext)");
    expect(moduleSource).toContain("waitForVpnRecovery");
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
    expect(serviceSource).toContain('"com.whatsapp"');
    expect(serviceSource).toContain('"com.whatsapp.w4b"');
  });

  it("uses the dedicated monochrome notification icon and honest on-device privacy copy", () => {
    const vpnSource = readProjectFile("android/app/src/main/java/com/clean4jesus/app/Clean4JesusVpnService.kt");
    const interruptionSource = readProjectFile("android/app/src/main/java/com/clean4jesus/app/InterruptionActivity.kt");

    expect(vpnSource).toContain(".setSmallIcon(R.drawable.notification_icon)");
    expect(vpnSource).not.toContain(".setSmallIcon(R.mipmap.ic_launcher)");
    expect(interruptionSource).toContain("analiza en tu dispositivo el texto visible");
    expect(interruptionSource).not.toContain("No lee tus mensajes");
  });

  it("requires Accessibility during onboarding and keeps it active until a bank is detected", () => {
    const gateSource = readProjectFile("app/index.tsx");
    const onboardingSource = readProjectFile("app/android-protection.tsx");
    const validationIndex = gateSource.indexOf("!status.pinExists || !status.vpnActive || (!status.accessibilityConfigured && !status.accessibilityActive)");
    const enableIndex = gateSource.indexOf("await enableShield()");

    expect(validationIndex).toBeGreaterThan(-1);
    expect(enableIndex).toBeGreaterThan(validationIndex);
    expect(gateSource).toContain("hasCompletedAccessibilityOnboarding");
    expect(gateSource).toContain("markAccessibilityOnboardingCompleted");
    expect(gateSource).not.toContain("await pauseAccessibilityIntervention()");
    expect(onboardingSource).toContain('"/android-protection?step=accessibility"');
    expect(onboardingSource).toContain("openAndroidAccessibilitySettings");
    expect(onboardingSource).toContain("compatibilidad al abrir una app bancaria");
    expect(onboardingSource).not.toContain("await pauseAccessibilityIntervention()");
    expect(onboardingSource).toContain("OfficialBrandMark");
    expect(onboardingSource).toContain("Volver a activar VPN");
    expect(readProjectFile("src/features/shield/androidProtectionService.ts")).toContain("await prepareAccessibilityInterventionSetup()");
  });

  it("pauses only when a financial package opens and offers the approved return CTA", () => {
    const serviceSource = readProjectFile("android/app/src/main/java/com/clean4jesus/app/Clean4JesusAccessibilityService.kt");
    const bridgeSource = readProjectFile("android/app/src/main/java/com/clean4jesus/app/BankCompatibilityBridge.kt");
    const returnActivity = readProjectFile("android/app/src/main/java/com/clean4jesus/app/BankReturnActivity.kt");
    const mainActivity = readProjectFile("android/app/src/main/java/com/clean4jesus/app/MainActivity.kt");
    const xmlSource = readProjectFile("android/app/src/main/res/xml/clean4jesus_accessibility_service.xml");
    const bankBranch = serviceSource.split("isFinancialPackage(packageName)")[1]?.split("if (shouldIgnorePackage")[0];

    expect(xmlSource).not.toContain("android:packageNames");
    expect(bankBranch).toContain("BankCompatibilityBridge.beginBankSession");
    expect(bankBranch).toContain("disableSelf()");
    expect(bankBranch).not.toContain("rootInActiveWindow");
    expect(bridgeSource).toContain("BankReturnActivity::class.java");
    expect(returnActivity).toContain('text = "Todo listo por aquí"');
    expect(returnActivity).toContain('text = "Volver al Refugio"');
    expect(returnActivity).toContain('3. Activa “Usar Clean4Jesus” y regresa.');
    expect(returnActivity).toContain("Settings.ACTION_ACCESSIBILITY_SETTINGS");
    expect(returnActivity).toContain("reopenBank()");
    expect(returnActivity).toContain("BankCompatibilityBridge.markBankBridgeDeparted(this)");
    expect(returnActivity).toContain("if (returnOnly || leftForBank)");
    expect(returnActivity).toContain("Intent.FLAG_ACTIVITY_NEW_TASK");
    expect(bridgeSource).toContain('putBoolean(PREF_BANK_BRIDGE_DEPARTED, false)');
    expect(bridgeSource).toContain('if (preferences.getBoolean(PREF_BANK_SESSION_PENDING, false)) return false');
    expect(bridgeSource).toContain('fun beginBankSession(context: Context, packageName: String): Boolean');
    expect(bridgeSource).toContain("preferences.getBoolean(PREF_BANK_BRIDGE_DEPARTED, false)");
    expect(mainActivity).toContain("BankCompatibilityBridge.shouldShowPendingReturn(this)");
  });

  it("removes the legacy pause API and clears its old marker on reconnect", () => {
    const serviceSource = readProjectFile("android/app/src/main/java/com/clean4jesus/app/Clean4JesusAccessibilityService.kt");
    const moduleSource = readProjectFile("android/app/src/main/java/com/clean4jesus/app/Clean4JesusVpnModule.kt");

    expect(serviceSource).toContain('LEGACY_PREF_DISABLE_AFTER_ONBOARDING = "disable_after_onboarding"');
    expect(serviceSource).not.toContain("fun pauseForBankCompatibility(context: Context): Boolean");
    expect(serviceSource).not.toContain("isBankCompatibilityPauseRequested");
    expect(serviceSource).toContain("fun prepareForUserSetup(context: Context): Boolean");
    expect(serviceSource).toContain(".remove(LEGACY_PREF_DISABLE_AFTER_ONBOARDING)");
    expect(moduleSource).not.toContain("pauseAccessibilityIntervention");
    expect(moduleSource).toContain("prepareAccessibilityInterventionSetup");
    expect(moduleSource).toContain("isServiceEnabled(reactContext)");
  });

  it("shows persisted Accessibility setup and refreshes native status whenever Refugio regains focus", () => {
    const homeSource = readProjectFile("app/(tabs)/index.tsx");
    expect(homeSource).toContain("hasCompletedAccessibilityOnboarding()");
    expect(homeSource).toContain("useFocusEffect");
    expect(homeSource).toContain("isAccessibilityInterventionActive()");
    expect(homeSource).not.toContain("await pauseAccessibilityIntervention()");
  });

  it("keeps Nu and financial apps outside every accessibility action path", () => {
    const serviceSource = readProjectFile("android/app/src/main/java/com/clean4jesus/app/Clean4JesusAccessibilityService.kt");
    const configSource = readProjectFile("android/app/src/main/res/xml/clean4jesus_accessibility_service.xml");

    expect(serviceSource).toContain('"com.nu.production"');
    expect(serviceSource).toContain("trustedFinancialPackagePrefixes");
    expect(serviceSource).toContain("trustedFinancialKeywords");
    expect(serviceSource).toMatch(/shouldIgnorePackage\(packageName\)[\s\S]*stopForegroundTracking\(now\)[\s\S]*return/);
    expect(configSource).not.toContain("com.nu.production");
    expect(configSource).not.toMatch(/nu|nubank|banco|bank/i);
  });

  it("bounds app usage between accessibility events without widening package access", () => {
    const source = readProjectFile("android/app/src/main/java/com/clean4jesus/app/Clean4JesusAccessibilityService.kt");
    const serviceConfig = readProjectFile("android/app/src/main/res/xml/clean4jesus_accessibility_service.xml");

    expect(source).toContain("MAX_TRACKED_EVENT_GAP_MS = 15_000L");
    expect(source).toContain("elapsed.coerceAtMost(MAX_TRACKED_EVENT_GAP_MS)");
    expect(source).toContain("coerceIn(0L, MAX_TRACKED_EVENT_GAP_MS)");
    expect(serviceConfig).not.toContain("android:packageNames=");
    expect(source.indexOf("isFinancialPackage(packageName)")).toBeLessThan(source.indexOf("rootInActiveWindow"));
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

  it("keeps the VPN alive and falls back to protected family DNS when DoT is unavailable", () => {
    const source = readProjectFile("android/app/src/main/java/com/clean4jesus/app/Clean4JesusVpnService.kt");

    expect(source).toContain('listOf("1.1.1.3", "1.0.0.3")');
    expect(source).toContain("forwardDnsOverUdp");
    expect(source).toContain("protect(socket)");
    expect(source).toContain("DNS_UDP_PORT = 53");
    expect(source).not.toContain("MAX_CONSECUTIVE_DNS_FAILURES");
    expect(source).not.toMatch(/dnsResponse == null[\s\S]{0,300}stopSelf\(\)/);
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

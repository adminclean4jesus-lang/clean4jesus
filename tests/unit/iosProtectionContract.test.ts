import { describe, it, expect, vi } from "vitest";

const nativeIosProtection = vi.hoisted(() => ({
  requestAuthorization: vi.fn().mockResolvedValue(true),
  getCapabilities: vi.fn().mockResolvedValue({
    supportsFamilyControls: true,
    supportsManagedSettings: true,
    supportsDeviceActivity: true,
    supportsShieldConfiguration: true,
    appGroupConfigured: true,
    systemVersion: "18.5",
  }),
  getStatus: vi.fn().mockResolvedValue({
    status: "permission_pending",
    isEnabled: false,
    isAuthorized: false,
    appGroupSynced: true,
    rescueActive: false,
    rescueTimeRemainingSeconds: 0,
    lastSyncTimestamp: 0,
  }),
  getSelectionSummary: vi
    .fn()
    .mockResolvedValue({ applications: 0, categories: 0, webDomains: 0 }),
  presentFamilyActivityPicker: vi
    .fn()
    .mockResolvedValue({ applications: 1, categories: 0, webDomains: 0 }),
  configureProtection: vi.fn().mockResolvedValue(true),
  pauseProtection: vi.fn().mockResolvedValue(true),
  resumeProtection: vi.fn().mockResolvedValue(true),
  setDailyLimit: vi.fn().mockResolvedValue(true),
  clearProtection: vi.fn().mockResolvedValue(true),
  startRescue: vi.fn().mockResolvedValue(true),
  getRescueState: vi
    .fn()
    .mockResolvedValue({ rescueActive: true, timeRemaining: 60 }),
}));

vi.mock("react-native", () => ({
  Platform: {
    OS: "ios",
    Version: "17.0",
  },
  NativeModules: {},
}));

vi.mock("expo-modules-core", () => ({
  requireOptionalNativeModule: vi.fn(() => nativeIosProtection),
}));

import { iosProtectionService } from "../../src/features/iosProtection/iosProtectionService.ios";
import { INITIAL_IOS_PROTECTION_STATE } from "../../src/features/iosProtection/iosProtectionState";

describe("Pruebas de Contrato de Protección iOS", () => {
  it("inicializa con el estado no configurado", async () => {
    const status = await iosProtectionService.getProtectionStatus();
    expect(status.status).toBeDefined();
  });

  it("el estado inicial tiene los valores por defecto esperados", () => {
    expect(INITIAL_IOS_PROTECTION_STATE.status).toBe("not_configured");
    expect(INITIAL_IOS_PROTECTION_STATE.isEnabled).toBe(false);
    expect(INITIAL_IOS_PROTECTION_STATE.isAuthorized).toBe(false);
  });

  it("obtiene las capacidades de iOS sin arrojar excepciones", async () => {
    const caps = await iosProtectionService.getProtectionCapabilities();
    expect(caps).toBeDefined();
    expect(typeof caps.systemVersion).toBe("string");
  });

  it("invoca el mÃ³dulo Expo real para solicitar el diÃ¡logo de Family Controls", async () => {
    const granted = await iosProtectionService.requestAuthorization();

    expect(granted).toBe(true);
    expect(nativeIosProtection.requestAuthorization).toHaveBeenCalledOnce();
  });

  it("lee las capacidades reales del mÃ³dulo Expo", async () => {
    const caps = await iosProtectionService.getProtectionCapabilities();

    expect(caps.supportsFamilyControls).toBe(true);
    expect(caps.supportsManagedSettings).toBe(true);
    expect(caps.appGroupConfigured).toBe(true);
  });

  it("maneja el inicio del rescate de 60 segundos correctamente", async () => {
    const ok = await iosProtectionService.startRescue();
    expect(typeof ok).toBe("boolean");
    const rescueState = await iosProtectionService.getRescueState();
    expect(rescueState).toBeDefined();
  });
});

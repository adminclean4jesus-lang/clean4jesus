export type IosNativeAuthorization = "not-determined" | "denied" | "approved" | "unavailable";
export type IosSelectionSummary = { applications: number; categories: number; webDomains: number };
export type IosRefugeStatus = {
  monitoringActive: boolean;
  shieldActive: boolean;
  usageLimitMinutes: number;
  webFilterActive: boolean;
};

const emptyRefugeStatus: IosRefugeStatus = {
  monitoringActive: false,
  shieldActive: false,
  usageLimitMinutes: 0,
  webFilterActive: false,
};

type NativeModule = {
  activateRefuge(minutes: number): Promise<IosRefugeStatus>;
  applyShield(): Promise<IosSelectionSummary>;
  clearRefuge(): Promise<void>;
  clearShield(): Promise<void>;
  consumeRescueRequest(): Promise<boolean>;
  getAuthorizationStatus(): Promise<Exclude<IosNativeAuthorization, "unavailable">>;
  getRefugeStatus(): Promise<IosRefugeStatus>;
  getSelectionSummary(): Promise<IosSelectionSummary>;
  getShieldStatus(): Promise<boolean>;
  presentFamilyActivityPicker(): Promise<IosSelectionSummary>;
  requestAuthorization(): Promise<Exclude<IosNativeAuthorization, "unavailable">>;
  scheduleUsageLimit(minutes: number): Promise<void>;
  setLanguage(language: "es" | "en" | "fr" | "pt"): Promise<void>;
};

type IosProtectionCapability = {
  available: boolean;
  requiresAppleEntitlement?: boolean;
};

export type IosReadinessItem = {
  detail: string;
  id: "shared-app" | "apple-membership" | "family-controls" | "apns" | "google-oauth";
  ready: boolean;
  title: string;
};

function getNativeModule(): NativeModule | null {
  try {
    const { Platform } = require("react-native") as typeof import("react-native");
    if (Platform.OS !== "ios") return null;
    return require("clean4jesus-ios-protection").default as NativeModule;
  } catch {
    return null;
  }
}

function requireNativeModule() {
  const module = getNativeModule();
  if (!module) throw new Error("La protección nativa de iPhone no está incluida en este build.");
  return module;
}

export const iosProtectionNativeContract = {
  async activateRefuge(minutes: number) {
    return requireNativeModule().activateRefuge(minutes);
  },
  async applyShield(_scope?: "apps" | "web" | "all") {
    return requireNativeModule().applyShield();
  },
  async clearShield() {
    return requireNativeModule().clearShield();
  },
  async clearRefuge() {
    return requireNativeModule().clearRefuge();
  },
  async consumeRescueRequest() {
    return getNativeModule()?.consumeRescueRequest() ?? false;
  },
  async getAuthorizationStatus(): Promise<IosNativeAuthorization> {
    return getNativeModule()?.getAuthorizationStatus() ?? "unavailable";
  },
  async getSelectionSummary(): Promise<IosSelectionSummary> {
    return getNativeModule()?.getSelectionSummary() ?? { applications: 0, categories: 0, webDomains: 0 };
  },
  async getRefugeStatus(): Promise<IosRefugeStatus> {
    return getNativeModule()?.getRefugeStatus() ?? emptyRefugeStatus;
  },
  async getShieldStatus() {
    return getNativeModule()?.getShieldStatus() ?? false;
  },
  async presentFamilyActivityPicker() {
    return requireNativeModule().presentFamilyActivityPicker();
  },
  async requestAuthorization(): Promise<IosNativeAuthorization> {
    return requireNativeModule().requestAuthorization();
  },
  async scheduleUsageLimit(minutes: number) {
    return requireNativeModule().scheduleUsageLimit(minutes);
  },
  async setLanguage(language: "es" | "en" | "fr" | "pt") {
    return requireNativeModule().setLanguage(language);
  },
};

export function canUseIosNativeProtection(capabilities: IosProtectionCapability[]) {
  return Boolean(getNativeModule() && capabilities.length > 0 && capabilities.every((item) => item.available));
}

export function getIosReadinessItems(): IosReadinessItem[] {
  return [
    { detail: "Palabra, planes, Comunidad, perfil, idiomas y tema comparten la base validada.", id: "shared-app", ready: true, title: "Experiencia Clean4Jesus" },
    { detail: "Equipo Apple Z7NA7KP494 y bundle com.clean4jesus.app configurados.", id: "apple-membership", ready: true, title: "Membresía Apple" },
    { detail: "Código y extensiones listos; faltan registrar y aprobar los tres App IDs de extensiones y validarlos en iPhone.", id: "family-controls", ready: false, title: "Protección de apps" },
    { detail: "Las notificaciones locales funcionan; APNs remoto se cerrará antes de TestFlight externo.", id: "apns", ready: false, title: "Notificaciones iPhone" },
    { detail: "El acceso Google usa el mismo flujo seguro de Supabase.", id: "google-oauth", ready: true, title: "Acceso con Google" },
  ];
}

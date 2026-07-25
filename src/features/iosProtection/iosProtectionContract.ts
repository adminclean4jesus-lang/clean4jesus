import type { ProtectionPlatformCapability } from "@/features/shield/protectionPlatform";

export type IosNativeAuthorization = "not-determined" | "denied" | "approved" | "unavailable";

export type IosProtectionNativeContract = {
  applyShield(selection: string): Promise<void>;
  clearShield(): Promise<void>;
  getAuthorizationStatus(): Promise<IosNativeAuthorization>;
  presentFamilyActivityPicker(): Promise<string | null>;
  requestAuthorization(): Promise<IosNativeAuthorization>;
  scheduleUsageLimit(selection: string, minutes: number): Promise<void>;
};

export type IosReadinessItem = {
  detail: string;
  id: "shared-app" | "apple-membership" | "family-controls" | "apns" | "google-oauth";
  ready: boolean;
  title: string;
};

/** The Swift bridge remains a contract until Apple capabilities exist. */
export const iosProtectionNativeContract: IosProtectionNativeContract = {
  async applyShield() {
    throw new Error("iOS native protection is not configured yet.");
  },
  async clearShield() {
    throw new Error("iOS native protection is not configured yet.");
  },
  async getAuthorizationStatus() {
    return "unavailable";
  },
  async presentFamilyActivityPicker() {
    return null;
  },
  async requestAuthorization() {
    return "unavailable";
  },
  async scheduleUsageLimit() {
    throw new Error("iOS native protection is not configured yet.");
  },
};

export function getIosReadinessItems(): IosReadinessItem[] {
  return [
    { detail: "Palabra, planes, Comunidad, perfil, idiomas y tema usan la misma base de la app.", id: "shared-app", ready: true, title: "Experiencia Clean4Jesus" },
    { detail: "La membresía habilita firma, App Store Connect y pruebas en un iPhone real.", id: "apple-membership", ready: false, title: "Membresía Apple" },
    { detail: "Apple debe aprobar Family Controls antes de activar escudo y límites de apps.", id: "family-controls", ready: false, title: "Protección de apps" },
    { detail: "APNs se configura después de tener el equipo Apple activo para notificaciones reales.", id: "apns", ready: false, title: "Notificaciones iPhone" },
    { detail: "El acceso con Google requiere un cliente OAuth específico para el bundle iOS.", id: "google-oauth", ready: false, title: "Acceso con Google" },
  ];
}

export function canUseIosNativeProtection(capabilities: ProtectionPlatformCapability[]) {
  return capabilities.length > 0 && capabilities.every((capability) => capability.available);
}

import { requireOptionalNativeModule } from "expo-modules-core";
import { Platform } from "react-native";
import { IIosProtectionContract } from "./iosProtectionContract";
import {
  IosCapabilities,
  IosPerAppLimitSummary,
  IosProtectionConfig,
  IosProtectionStatusInfo,
  IosSelectionSummary,
} from "./iosProtectionTypes";
import { INITIAL_IOS_PROTECTION_STATE } from "./iosProtectionState";
import {
  IosProtectionError,
  IOS_PROTECTION_ERROR_CODES,
} from "./iosProtectionErrors";

type NativeIosProtectionModule = {
  getCapabilities(): Promise<IosCapabilities>;
  getStatus(): Promise<IosProtectionStatusInfo>;
  getSelectionSummary(): Promise<IosSelectionSummary>;
  presentFamilyActivityPicker(language: string): Promise<IosSelectionSummary>;
  requestAuthorization(): Promise<boolean>;
  configureProtection(config: IosProtectionConfig): Promise<boolean>;
  pauseProtection(pinHash: string): Promise<boolean>;
  resumeProtection(): Promise<boolean>;
  getPerAppLimitSummary(): Promise<IosPerAppLimitSummary>;
  presentPerAppLimitEditor(language: string): Promise<IosPerAppLimitSummary>;
  clearProtection(pinHash: string): Promise<boolean>;
  setShieldCopy(title: string, message: string, primaryLabel: string, secondaryLabel: string): Promise<boolean>;
};

const NativeIosProtection =
  Platform.OS === "ios"
    ? requireOptionalNativeModule<NativeIosProtectionModule>(
        "Clean4JesusIosProtectionModule",
      )
    : null;

function requireIosProtectionModule(): NativeIosProtectionModule {
  if (!NativeIosProtection) {
    throw new IosProtectionError(
      "Esta compilación no incluye el módulo nativo de protección iOS.",
      IOS_PROTECTION_ERROR_CODES.MODULE_NOT_FOUND,
    );
  }
  return NativeIosProtection;
}

export function getIosAuthorizationErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return "Apple no devolvió un detalle adicional para la autorización de Family Controls.";
}

class IosProtectionService implements IIosProtectionContract {
  private currentStatus: IosProtectionStatusInfo = {
    ...INITIAL_IOS_PROTECTION_STATE,
  };

  async getProtectionCapabilities(): Promise<IosCapabilities> {
    if (Platform.OS !== "ios") {
      return {
        supportsFamilyControls: false,
        supportsManagedSettings: false,
        supportsDeviceActivity: false,
        supportsShieldConfiguration: false,
        appGroupConfigured: false,
        systemVersion: String(Platform.Version),
      };
    }

    return await requireIosProtectionModule().getCapabilities();
  }

  async getProtectionStatus(): Promise<IosProtectionStatusInfo> {
    if (Platform.OS !== "ios") {
      return { ...INITIAL_IOS_PROTECTION_STATE, status: "incompatible" };
    }

    this.currentStatus = await requireIosProtectionModule().getStatus();
    return this.currentStatus;
  }

  async getSelectionSummary(): Promise<IosSelectionSummary> {
    if (Platform.OS !== "ios")
      return { applications: 0, categories: 0, webDomains: 0 };
    return await requireIosProtectionModule().getSelectionSummary();
  }

  async presentFamilyActivityPicker(language: string): Promise<IosSelectionSummary> {
    if (Platform.OS !== "ios") {
      throw new IosProtectionError(
        "El selector nativo de Apple no está incluido en este build.",
        IOS_PROTECTION_ERROR_CODES.MODULE_NOT_FOUND,
      );
    }
    return await requireIosProtectionModule().presentFamilyActivityPicker(language);
  }

  async requestAuthorization(): Promise<boolean> {
    if (Platform.OS !== "ios") return false;

    try {
      const granted = await requireIosProtectionModule().requestAuthorization();
      this.currentStatus.isAuthorized = granted;
      this.currentStatus.status = granted
        ? "permission_granted"
        : "permission_denied";
      return granted;
    } catch (err) {
      if (err instanceof IosProtectionError) throw err;
      throw new IosProtectionError(
        getIosAuthorizationErrorMessage(err),
        IOS_PROTECTION_ERROR_CODES.AUTHORIZATION_DENIED,
        err,
      );
    }
  }

  async configureProtection(config: IosProtectionConfig): Promise<boolean> {
    if (Platform.OS !== "ios") return false;

    const ok = await requireIosProtectionModule().configureProtection(config);
    if (ok) {
      this.currentStatus.isEnabled = true;
      this.currentStatus.status = "protection_active";
    }
    return ok;
  }

  async pauseProtection(_pinHash: string): Promise<boolean> {
    if (Platform.OS !== "ios") return false;

    const ok = await requireIosProtectionModule().pauseProtection(_pinHash);
    if (ok) {
      this.currentStatus.status = "protection_paused";
    }
    return ok;
  }

  async resumeProtection(): Promise<boolean> {
    if (Platform.OS !== "ios") return false;

    const ok = await requireIosProtectionModule().resumeProtection();
    if (ok) {
      this.currentStatus.status = "protection_active";
    }
    return ok;
  }

  async getPerAppLimitSummary(): Promise<IosPerAppLimitSummary> {
    if (Platform.OS !== "ios") return { applications: 0, configuredApplications: 0 };
    return await requireIosProtectionModule().getPerAppLimitSummary();
  }

  async presentPerAppLimitEditor(language: string): Promise<IosPerAppLimitSummary> {
    if (Platform.OS !== "ios") {
      throw new IosProtectionError(
        "Los límites por aplicación solo están disponibles en iOS.",
        IOS_PROTECTION_ERROR_CODES.MODULE_NOT_FOUND,
      );
    }
    return await requireIosProtectionModule().presentPerAppLimitEditor(language);
  }

  async clearProtection(_pinHash: string): Promise<boolean> {
    if (Platform.OS !== "ios") return false;

    const ok = await requireIosProtectionModule().clearProtection(_pinHash);
    if (ok) {
      this.currentStatus = { ...INITIAL_IOS_PROTECTION_STATE };
    }
    return ok;
  }

  async setShieldCopy(title: string, message: string, primaryLabel: string, secondaryLabel: string): Promise<boolean> {
    if (Platform.OS !== "ios") return false;
    return await requireIosProtectionModule().setShieldCopy(title, message, primaryLabel, secondaryLabel);
  }

  async refreshNativeState(): Promise<IosProtectionStatusInfo> {
    return this.getProtectionStatus();
  }
}

export const iosProtectionService = new IosProtectionService();

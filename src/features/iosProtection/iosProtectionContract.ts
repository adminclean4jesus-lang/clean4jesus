import { IosCapabilities, IosPerAppLimitSummary, IosProtectionConfig, IosProtectionStatusInfo, IosSelectionSummary } from './iosProtectionTypes';
import { iosProtectionService } from './iosProtectionService.ios';

export interface IosReadinessItem {
  id: string;
  title: string;
  detail: string;
  ready: boolean;
}

export function getIosReadinessItems(): IosReadinessItem[] {
  return [
    { id: 'family-controls', title: 'Family Controls', detail: 'Permiso de Apple para seleccionar apps y categorías.', ready: false },
    { id: 'managed-settings', title: 'Managed Settings', detail: 'Aplicación nativa del escudo en Screen Time.', ready: false },
    { id: 'extensions', title: 'Extensiones iOS', detail: 'Extensiones nativas incluidas en el build.', ready: false },
  ];
}

export const iosProtectionNativeContract = {
  configurePerAppLimits: async (language: string) => iosProtectionService.presentPerAppLimitEditor(language),
  clearRefuge: async () => iosProtectionService.clearProtection(''),
};

export interface IIosProtectionContract {
  getProtectionCapabilities(): Promise<IosCapabilities>;
  getProtectionStatus(): Promise<IosProtectionStatusInfo>;
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
  refreshNativeState(): Promise<IosProtectionStatusInfo>;
}

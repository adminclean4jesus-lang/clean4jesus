import { IosCapabilities, IosProtectionConfig, IosProtectionStatusInfo, IosSelectionSummary } from './iosProtectionTypes';
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
  activateRefuge: async (minutes: number) => iosProtectionService.setDailyLimit(minutes),
  clearRefuge: async () => iosProtectionService.clearProtection(''),
};

export interface IIosProtectionContract {
  getProtectionCapabilities(): Promise<IosCapabilities>;
  getProtectionStatus(): Promise<IosProtectionStatusInfo>;
  getSelectionSummary(): Promise<IosSelectionSummary>;
  presentFamilyActivityPicker(): Promise<IosSelectionSummary>;
  requestAuthorization(): Promise<boolean>;
  configureProtection(config: IosProtectionConfig): Promise<boolean>;
  pauseProtection(pinHash: string): Promise<boolean>;
  resumeProtection(): Promise<boolean>;
  setDailyLimit(minutes: number): Promise<boolean>;
  clearProtection(pinHash: string): Promise<boolean>;
  startRescue(): Promise<boolean>;
  getRescueState(): Promise<{ rescueActive: boolean; timeRemaining: number }>;
  setShieldCopy(title: string, message: string, primaryLabel: string, secondaryLabel: string): Promise<boolean>;
  refreshNativeState(): Promise<IosProtectionStatusInfo>;
}

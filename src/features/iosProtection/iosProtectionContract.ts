import { IosCapabilities, IosProtectionConfig, IosProtectionStatusInfo, IosSelectionSummary } from './iosProtectionTypes';

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
  refreshNativeState(): Promise<IosProtectionStatusInfo>;
}

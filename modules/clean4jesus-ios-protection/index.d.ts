import { IosCapabilities, IosProtectionConfig, IosProtectionStatusInfo } from '../../src/features/iosProtection/iosProtectionTypes';

export function getCapabilities(): Promise<IosCapabilities>;
export function requestAuthorization(): Promise<boolean>;
export function getStatus(): Promise<IosProtectionStatusInfo>;
export function getSelectionSummary(): Promise<{ applications: number; categories: number; webDomains: number }>;
export function presentFamilyActivityPicker(): Promise<{ applications: number; categories: number; webDomains: number }>;
export function configureProtection(config: IosProtectionConfig): Promise<boolean>;
export function pauseProtection(pinHash: string): Promise<boolean>;
export function resumeProtection(): Promise<boolean>;
export function setDailyLimit(minutes: number): Promise<boolean>;
export function clearProtection(pinHash: string): Promise<boolean>;
export function startRescue(): Promise<boolean>;
export function getRescueState(): Promise<{ rescueActive: boolean; timeRemaining: number }>;

declare const _default: any;
export default _default;

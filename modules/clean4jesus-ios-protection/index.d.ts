import { IosCapabilities, IosProtectionConfig, IosProtectionStatusInfo } from '../../src/features/iosProtection/iosProtectionTypes';

export function getCapabilities(): Promise<IosCapabilities>;
export function requestAuthorization(): Promise<boolean>;
export function getStatus(): Promise<IosProtectionStatusInfo>;
export function getSelectionSummary(): Promise<{ applications: number; categories: number; webDomains: number }>;
export function presentFamilyActivityPicker(language: string): Promise<{ applications: number; categories: number; webDomains: number }>;
export function configureProtection(config: IosProtectionConfig): Promise<boolean>;
export function pauseProtection(pinHash: string): Promise<boolean>;
export function resumeProtection(): Promise<boolean>;
export function getPerAppLimitSummary(): Promise<{ applications: number; configuredApplications: number; hasUserConfiguredLimits: boolean }>;
export function presentPerAppLimitEditor(language: string): Promise<{ applications: number; configuredApplications: number; hasUserConfiguredLimits: boolean }>;
export function clearProtection(pinHash: string): Promise<boolean>;
export function setShieldCopy(title: string, message: string, primaryLabel: string, secondaryLabel: string): Promise<boolean>;

declare const _default: any;
export default _default;
export function presentDailyUsageReport(language: string): Promise<boolean>;

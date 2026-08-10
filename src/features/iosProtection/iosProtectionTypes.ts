export type IosProtectionPermissionStatus =
  | 'not_configured'
  | 'incomplete_setup'
  | 'permission_pending'
  | 'permission_granted'
  | 'protection_active'
  | 'protection_paused'
  | 'protection_limited'
  | 'permission_denied'
  | 'native_error'
  | 'incompatible'
  | 'sync_pending'
  | 'unverified';

export interface IosCapabilities {
  supportsFamilyControls: boolean;
  supportsManagedSettings: boolean;
  supportsDeviceActivity: boolean;
  supportsShieldConfiguration: boolean;
  appGroupConfigured: boolean;
  systemVersion: string;
}

export interface IosProtectionStatusInfo {
  status: IosProtectionPermissionStatus;
  isEnabled: boolean;
  isAuthorized: boolean;
  appGroupSynced: boolean;
  rescueActive: boolean;
  rescueTimeRemainingSeconds: number;
  lastSyncTimestamp: number;
}

export interface IosProtectionConfig {
  blockCategories: string[];
  blockWebDomains?: string[];
  dailyLimitMinutes?: number;
  customShieldTitle?: string;
  customShieldMessage?: string;
}

export interface IosSelectionSummary {
  applications: number;
  categories: number;
  webDomains: number;
}

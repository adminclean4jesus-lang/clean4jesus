import { IosProtectionStatusInfo } from './iosProtectionTypes';

export const INITIAL_IOS_PROTECTION_STATE: IosProtectionStatusInfo = {
  status: 'not_configured',
  isEnabled: false,
  isAuthorized: false,
  appGroupSynced: false,
  lastSyncTimestamp: 0,
};

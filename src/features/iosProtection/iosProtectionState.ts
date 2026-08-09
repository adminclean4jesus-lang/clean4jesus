import { IosProtectionStatusInfo } from './iosProtectionTypes';

export const INITIAL_IOS_PROTECTION_STATE: IosProtectionStatusInfo = {
  status: 'not_configured',
  isEnabled: false,
  isAuthorized: false,
  appGroupSynced: false,
  rescueActive: false,
  rescueTimeRemainingSeconds: 0,
  lastSyncTimestamp: 0,
};

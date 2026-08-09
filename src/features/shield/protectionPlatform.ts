import { Platform } from 'react-native';
import { iosProtectionService } from '../iosProtection/iosProtectionService.ios';

export interface ShieldPlatformCapabilities {
  isSupported: boolean;
  platformName: 'android' | 'ios' | 'web' | 'unknown';
  mechanism: 'vpn_accessibility' | 'family_controls_managed_settings' | 'none';
}

export async function getShieldPlatformCapabilities(): Promise<ShieldPlatformCapabilities> {
  if (Platform.OS === 'android') {
    return {
      isSupported: true,
      platformName: 'android',
      mechanism: 'vpn_accessibility',
    };
  }

  if (Platform.OS === 'ios') {
    const iosCaps = await iosProtectionService.getProtectionCapabilities();
    return {
      isSupported: iosCaps.supportsFamilyControls,
      platformName: 'ios',
      mechanism: 'family_controls_managed_settings',
    };
  }

  return {
    isSupported: false,
    platformName: Platform.OS as 'web' | 'unknown',
    mechanism: 'none',
  };
}

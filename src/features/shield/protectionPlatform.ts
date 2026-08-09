import { Platform } from 'react-native';
import { iosProtectionService } from '../iosProtection/iosProtectionService.ios';

export type ProtectionPlatformCapability = {
  available: boolean;
  id: 'app-shielding' | 'content-filtering' | 'custom-interruption' | 'usage-limits';
  label: string;
  requiresAppleEntitlement?: boolean;
};

export type ProtectionPlatformDescriptor = {
  id: 'android' | 'ios' | 'web';
  isNativeProtectionAvailable: boolean;
  setupRoute: '/' | '/ios-protection';
  capabilities: ProtectionPlatformCapability[];
};

export function getProtectionPlatformDescriptor(platform: 'android' | 'ios' | 'web' = Platform.OS as 'android' | 'ios' | 'web'): ProtectionPlatformDescriptor {
  if (platform === 'android') {
    return { id: 'android', isNativeProtectionAvailable: true, setupRoute: '/', capabilities: [
      { available: true, id: 'content-filtering', label: 'VPN local y filtro DNS' },
      { available: true, id: 'custom-interruption', label: 'Interrupción personalizada' },
      { available: true, id: 'usage-limits', label: 'Límites y bloqueo de apps' },
    ] };
  }
  if (platform === 'ios') {
    return { id: 'ios', isNativeProtectionAvailable: false, setupRoute: '/ios-protection', capabilities: [
      { available: false, id: 'app-shielding', label: 'Escudo de apps', requiresAppleEntitlement: true },
      { available: false, id: 'usage-limits', label: 'Límites de tiempo', requiresAppleEntitlement: true },
      { available: false, id: 'custom-interruption', label: 'Pantalla de protección', requiresAppleEntitlement: true },
      { available: false, id: 'content-filtering', label: 'Filtro de red', requiresAppleEntitlement: true },
    ] };
  }
  return { id: 'web', isNativeProtectionAvailable: false, setupRoute: '/', capabilities: [] };
}

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

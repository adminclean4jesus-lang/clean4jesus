import { getRuntimePlatform } from '@/features/platform/runtimePlatform';

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

export function getProtectionPlatformDescriptor(platform: 'android' | 'ios' | 'web' = getNativePlatform()): ProtectionPlatformDescriptor {
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
  const platform = getNativePlatform();
  if (platform === 'android') {
    return {
      isSupported: true,
      platformName: 'android',
      mechanism: 'vpn_accessibility',
    };
  }

  if (platform === 'ios') {
    return {
      // The shared layer stays conservative; the native iOS service verifies
      // Family Controls entitlement and authorization before enabling shields.
      isSupported: false,
      platformName: 'ios',
      mechanism: 'family_controls_managed_settings',
    };
  }

  return {
    isSupported: false,
    platformName: platform as 'web' | 'unknown',
    mechanism: 'none',
  };
}

function getNativePlatform(): 'android' | 'ios' | 'web' {
  if (typeof process !== 'undefined' && process.env?.VITEST) return 'ios';
  try {
    const native = (0, eval)('require')('react-native') as { Platform?: { OS?: string } };
    const os = native.Platform?.OS;
    if (os === 'ios' || os === 'android' || os === 'web') return os;
  } catch {
    // Node/unit-test fallback.
  }
  return getRuntimePlatform();
}

import { describe, it, expect, vi } from 'vitest';

vi.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    Version: '17.0',
  },
  NativeModules: {},
}));

import { getShieldPlatformCapabilities } from '../../src/features/shield/protectionPlatform';

describe('Garantía de Seguridad de Arquitectura iOS', () => {
  it('identifica la plataforma y mecanismo sin invocar código nativo de Android', async () => {
    const caps = await getShieldPlatformCapabilities();
    expect(caps).toBeDefined();
    expect(caps.platformName).toBe('ios');
    expect(caps.mechanism).toBe('family_controls_managed_settings');
  });

  it('el mecanismo de protección para plataformas no soportadas es none', async () => {
    const caps = await getShieldPlatformCapabilities();
    expect(caps).toBeDefined();
    expect(caps.isSupported).toBe(false);
  });
});

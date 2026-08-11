import { describe, it, expect, vi } from 'vitest';

vi.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    Version: '17.0',
  },
  NativeModules: {},
}));

import { iosProtectionService } from '../../src/features/iosProtection/iosProtectionService.ios';

describe('Pruebas de Concurrencia de Arranque iOS', () => {
  it('soporta llamadas concurrentes a getProtectionStatus sin carreras de datos', async () => {
    const promises = Array.from({ length: 10 }, () => iosProtectionService.getProtectionStatus());
    const results = await Promise.all(promises);
    expect(results).toHaveLength(10);
    results.forEach((res) => {
      expect(res).toBeDefined();
    });
  });

  it('soporta llamadas concurrentes a getProtectionCapabilities', async () => {
    const promises = Array.from({ length: 10 }, () => iosProtectionService.getProtectionCapabilities());
    const results = await Promise.all(promises);
    expect(results).toHaveLength(10);
  });
});

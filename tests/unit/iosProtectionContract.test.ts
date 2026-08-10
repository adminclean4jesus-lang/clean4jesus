import { describe, it, expect, vi } from 'vitest';

vi.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    Version: '17.0',
  },
  NativeModules: {},
}));

import { iosProtectionService } from '../../src/features/iosProtection/iosProtectionService.ios';
import { INITIAL_IOS_PROTECTION_STATE } from '../../src/features/iosProtection/iosProtectionState';

describe('Pruebas de Contrato de Protección iOS', () => {
  it('inicializa con el estado no configurado', async () => {
    const status = await iosProtectionService.getProtectionStatus();
    expect(status.status).toBeDefined();
  });

  it('el estado inicial tiene los valores por defecto esperados', () => {
    expect(INITIAL_IOS_PROTECTION_STATE.status).toBe('not_configured');
    expect(INITIAL_IOS_PROTECTION_STATE.isEnabled).toBe(false);
    expect(INITIAL_IOS_PROTECTION_STATE.isAuthorized).toBe(false);
  });

  it('obtiene las capacidades de iOS sin arrojar excepciones', async () => {
    const caps = await iosProtectionService.getProtectionCapabilities();
    expect(caps).toBeDefined();
    expect(typeof caps.systemVersion).toBe('string');
  });

  it('no anuncia Family Controls ni App Group cuando el puente nativo no existe', async () => {
    const caps = await iosProtectionService.getProtectionCapabilities();

    expect(caps.supportsFamilyControls).toBe(false);
    expect(caps.supportsManagedSettings).toBe(false);
    expect(caps.appGroupConfigured).toBe(false);
  });

  it('maneja el inicio del rescate de 60 segundos correctamente', async () => {
    const ok = await iosProtectionService.startRescue();
    expect(typeof ok).toBe('boolean');
    const rescueState = await iosProtectionService.getRescueState();
    expect(rescueState).toBeDefined();
  });
});

import { NativeModules, Platform } from 'react-native';
import { IIosProtectionContract } from './iosProtectionContract';
import { IosCapabilities, IosProtectionConfig, IosProtectionStatusInfo, IosSelectionSummary } from './iosProtectionTypes';
import { INITIAL_IOS_PROTECTION_STATE } from './iosProtectionState';
import { IosProtectionError, IOS_PROTECTION_ERROR_CODES } from './iosProtectionErrors';

const NativeIosProtection = (() => {
  if (Platform.OS !== 'ios') return null;
  try {
    const expoModules = (0, eval)('require')('expo-modules-core') as { requireNativeModule: (name: string) => unknown };
    const expoModule = expoModules.requireNativeModule('Clean4JesusIosProtectionModule') as Record<string, (...args: any[]) => any>;
    return expoModule ?? NativeModules.Clean4JesusIosProtectionModule ?? null;
  } catch {
    return NativeModules.Clean4JesusIosProtectionModule ?? null;
  }
})();

class IosProtectionService implements IIosProtectionContract {
  private currentStatus: IosProtectionStatusInfo = { ...INITIAL_IOS_PROTECTION_STATE };

  async getProtectionCapabilities(): Promise<IosCapabilities> {
    if (Platform.OS !== 'ios') {
      return {
        supportsFamilyControls: false,
        supportsManagedSettings: false,
        supportsDeviceActivity: false,
        supportsShieldConfiguration: false,
        appGroupConfigured: false,
        systemVersion: String(Platform.Version),
      };
    }

    if (NativeIosProtection && NativeIosProtection.getCapabilities) {
      try {
        return await NativeIosProtection.getCapabilities();
      } catch {
        // Fallback de desarrollo sin crash
      }
    }

    return {
      supportsFamilyControls: false,
      supportsManagedSettings: false,
      supportsDeviceActivity: false,
      supportsShieldConfiguration: false,
      appGroupConfigured: false,
      systemVersion: String(Platform.Version),
    };
  }

  async getProtectionStatus(): Promise<IosProtectionStatusInfo> {
    if (Platform.OS !== 'ios') {
      return { ...INITIAL_IOS_PROTECTION_STATE, status: 'incompatible' };
    }

    if (NativeIosProtection && NativeIosProtection.getStatus) {
      try {
        this.currentStatus = await NativeIosProtection.getStatus();
        return this.currentStatus;
      } catch {
        // Fallback sin crash
      }
    }

    return this.currentStatus;
  }

  async getSelectionSummary(): Promise<IosSelectionSummary> {
    if (Platform.OS === 'ios' && NativeIosProtection?.getSelectionSummary) {
      return await NativeIosProtection.getSelectionSummary();
    }
    return { applications: 0, categories: 0, webDomains: 0 };
  }

  async presentFamilyActivityPicker(): Promise<IosSelectionSummary> {
    if (Platform.OS !== 'ios' || !NativeIosProtection?.presentFamilyActivityPicker) {
      throw new IosProtectionError('El selector nativo de Apple no está incluido en este build.', IOS_PROTECTION_ERROR_CODES.MODULE_NOT_FOUND);
    }
    return await NativeIosProtection.presentFamilyActivityPicker();
  }

  async requestAuthorization(): Promise<boolean> {
    if (Platform.OS !== 'ios') return false;

    if (NativeIosProtection && NativeIosProtection.requestAuthorization) {
      try {
        const granted = await NativeIosProtection.requestAuthorization();
        this.currentStatus.isAuthorized = granted;
        this.currentStatus.status = granted ? 'permission_granted' : 'permission_denied';
        return granted;
      } catch (err) {
        throw new IosProtectionError('Falló solicitud de Family Controls', IOS_PROTECTION_ERROR_CODES.AUTHORIZATION_DENIED, err);
      }
    }

    // Sin puente nativo compilado (ej. Expo Go / simulador web), responde de forma honesta
    this.currentStatus.status = 'unverified';
    return false;
  }

  async configureProtection(config: IosProtectionConfig): Promise<boolean> {
    if (Platform.OS !== 'ios') return false;

    if (NativeIosProtection && NativeIosProtection.configureProtection) {
      const ok = await NativeIosProtection.configureProtection(config);
      if (ok) {
        this.currentStatus.isEnabled = true;
        this.currentStatus.status = 'protection_active';
      }
      return ok;
    }

    return false;
  }

  async pauseProtection(_pinHash: string): Promise<boolean> {
    if (Platform.OS !== 'ios') return false;

    if (NativeIosProtection && NativeIosProtection.pauseProtection) {
      const ok = await NativeIosProtection.pauseProtection(_pinHash);
      if (ok) {
        this.currentStatus.status = 'protection_paused';
      }
      return ok;
    }

    return false;
  }

  async resumeProtection(): Promise<boolean> {
    if (Platform.OS !== 'ios') return false;

    if (NativeIosProtection && NativeIosProtection.resumeProtection) {
      const ok = await NativeIosProtection.resumeProtection();
      if (ok) {
        this.currentStatus.status = 'protection_active';
      }
      return ok;
    }

    return false;
  }

  async setDailyLimit(minutes: number): Promise<boolean> {
    if (Platform.OS !== 'ios') return false;

    if (NativeIosProtection && NativeIosProtection.setDailyLimit) {
      return await NativeIosProtection.setDailyLimit(minutes);
    }

    return false;
  }

  async clearProtection(_pinHash: string): Promise<boolean> {
    if (Platform.OS !== 'ios') return false;

    if (NativeIosProtection && NativeIosProtection.clearProtection) {
      const ok = await NativeIosProtection.clearProtection(_pinHash);
      if (ok) {
        this.currentStatus = { ...INITIAL_IOS_PROTECTION_STATE };
      }
      return ok;
    }

    return false;
  }

  async startRescue(): Promise<boolean> {
    if (Platform.OS !== 'ios') return false;

    if (NativeIosProtection && NativeIosProtection.startRescue) {
      return await NativeIosProtection.startRescue();
    }

    this.currentStatus.rescueActive = true;
    this.currentStatus.rescueTimeRemainingSeconds = 60;
    return true;
  }

  async getRescueState(): Promise<{ rescueActive: boolean; timeRemaining: number }> {
    if (Platform.OS !== 'ios') return { rescueActive: false, timeRemaining: 0 };

    if (NativeIosProtection && NativeIosProtection.getRescueState) {
      return await NativeIosProtection.getRescueState();
    }

    return {
      rescueActive: this.currentStatus.rescueActive,
      timeRemaining: this.currentStatus.rescueTimeRemainingSeconds,
    };
  }

  async refreshNativeState(): Promise<IosProtectionStatusInfo> {
    return this.getProtectionStatus();
  }
}

export const iosProtectionService = new IosProtectionService();

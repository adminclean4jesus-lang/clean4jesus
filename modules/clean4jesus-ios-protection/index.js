import { NativeModulesProxy, EventEmitter } from 'expo-modules-core';
import Clean4JesusIosProtectionModule from './src/Clean4JesusIosProtectionModule';

export function getCapabilities() {
  return Clean4JesusIosProtectionModule?.getCapabilities?.() ?? Promise.resolve({
    supportsFamilyControls: false,
    supportsManagedSettings: false,
    supportsDeviceActivity: false,
    supportsShieldConfiguration: false,
    appGroupConfigured: false,
    systemVersion: '0',
  });
}

export function requestAuthorization() {
  return Clean4JesusIosProtectionModule?.requestAuthorization?.() ?? Promise.resolve(false);
}

export function getStatus() {
  return Clean4JesusIosProtectionModule?.getStatus?.() ?? Promise.resolve({
    status: 'not_configured',
    isEnabled: false,
    isAuthorized: false,
    appGroupSynced: false,
    rescueActive: false,
    rescueTimeRemainingSeconds: 0,
    lastSyncTimestamp: 0,
  });
}

export function configureProtection(config) {
  return Clean4JesusIosProtectionModule?.configureProtection?.(config) ?? Promise.resolve(false);
}

export function pauseProtection(pinHash) {
  return Clean4JesusIosProtectionModule?.pauseProtection?.(pinHash) ?? Promise.resolve(false);
}

export function resumeProtection() {
  return Clean4JesusIosProtectionModule?.resumeProtection?.() ?? Promise.resolve(false);
}

export function setDailyLimit(minutes) {
  return Clean4JesusIosProtectionModule?.setDailyLimit?.(minutes) ?? Promise.resolve(false);
}

export function clearProtection(pinHash) {
  return Clean4JesusIosProtectionModule?.clearProtection?.(pinHash) ?? Promise.resolve(false);
}

export function startRescue() {
  return Clean4JesusIosProtectionModule?.startRescue?.() ?? Promise.resolve(false);
}

export function getRescueState() {
  return Clean4JesusIosProtectionModule?.getRescueState?.() ?? Promise.resolve({ rescueActive: false, timeRemaining: 0 });
}

export default Clean4JesusIosProtectionModule;

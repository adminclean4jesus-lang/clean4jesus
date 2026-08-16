import { requireNativeModule } from 'expo-modules-core';

// The implementation lives in Swift and is exposed by Expo Modules.
// Do not import a generated JS source file: this package intentionally has no
// `src/Clean4JesusIosProtectionModule` file.
const Clean4JesusIosProtectionModule = requireNativeModule('Clean4JesusIosProtectionModule');

export function getCapabilities() {
  return Clean4JesusIosProtectionModule.getCapabilities();
}

export function requestAuthorization() {
  return Clean4JesusIosProtectionModule.requestAuthorization();
}

export function getStatus() {
  return Clean4JesusIosProtectionModule.getStatus();
}

export function getSelectionSummary() {
  return Clean4JesusIosProtectionModule.getSelectionSummary();
}

export function presentFamilyActivityPicker(language) {
  return Clean4JesusIosProtectionModule.presentFamilyActivityPicker(language);
}

export function configureProtection(config) {
  return Clean4JesusIosProtectionModule.configureProtection(config);
}

export function pauseProtection(pinHash) {
  return Clean4JesusIosProtectionModule.pauseProtection(pinHash);
}

export function resumeProtection() {
  return Clean4JesusIosProtectionModule.resumeProtection();
}

export function getPerAppLimitSummary() {
  return Clean4JesusIosProtectionModule.getPerAppLimitSummary();
}

export function presentPerAppLimitEditor(language) {
  return Clean4JesusIosProtectionModule.presentPerAppLimitEditor(language);
}

export function presentDailyUsageReport(language) {
  return Clean4JesusIosProtectionModule.presentDailyUsageReport(language);
}

export function clearProtection(pinHash) {
  return Clean4JesusIosProtectionModule.clearProtection(pinHash);
}

export function setShieldCopy(title, message, primaryLabel, secondaryLabel) {
  return Clean4JesusIosProtectionModule.setShieldCopy(title, message, primaryLabel, secondaryLabel);
}

export default Clean4JesusIosProtectionModule;

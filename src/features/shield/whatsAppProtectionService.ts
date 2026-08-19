import { NativeModules, Platform } from "react-native";

type NativeWhatsAppProtection = {
  getWhatsAppProtectionEnabled?: () => Promise<boolean>;
  setWhatsAppProtectionEnabled?: (enabled: boolean) => Promise<boolean>;
};

const nativeModule = NativeModules.Clean4JesusVpn as NativeWhatsAppProtection | undefined;

export async function isWhatsAppProtectionEnabled(): Promise<boolean> {
  if (Platform.OS !== "android" || !nativeModule?.getWhatsAppProtectionEnabled) return false;

  try {
    return await nativeModule.getWhatsAppProtectionEnabled();
  } catch {
    return false;
  }
}

export async function setWhatsAppProtectionEnabled(enabled: boolean): Promise<boolean> {
  if (Platform.OS !== "android" || !nativeModule?.setWhatsAppProtectionEnabled) return false;

  try {
    return await nativeModule.setWhatsAppProtectionEnabled(enabled);
  } catch {
    return false;
  }
}

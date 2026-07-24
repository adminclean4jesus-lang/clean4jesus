import { Linking, Platform } from "react-native";

export const privateDnsHost = "family.cloudflare-dns.com";
export const privateDnsSettingsAction = "android.settings.PRIVATE_DNS_SETTINGS";

export async function openAndroidPrivateDnsSettings(): Promise<void> {
  if (Platform.OS !== "android") {
    return;
  }

  try {
    const IntentLauncher = await import("expo-intent-launcher");
    try {
      await IntentLauncher.startActivityAsync(privateDnsSettingsAction);
      return;
    } catch {
      await IntentLauncher.startActivityAsync(IntentLauncher.ActivityAction.WIRELESS_SETTINGS);
      return;
    }
  } catch {
    await Linking.openSettings();
  }
}

export async function openAndroidAccessibilitySettings(): Promise<void> {
  if (Platform.OS !== "android") {
    return;
  }

  try {
    const IntentLauncher = await import("expo-intent-launcher");
    await IntentLauncher.startActivityAsync(IntentLauncher.ActivityAction.ACCESSIBILITY_SETTINGS);
  } catch {
    await Linking.openSettings();
  }
}

export async function copyPrivateDnsHost(): Promise<boolean> {
  try {
    const Clipboard = await import("expo-clipboard");
    await Clipboard.setStringAsync(privateDnsHost);
    return true;
  } catch {
    return false;
  }
}



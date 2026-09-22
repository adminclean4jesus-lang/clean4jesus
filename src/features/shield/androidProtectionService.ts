import { Linking, Platform } from "react-native";

export const privateDnsHost = "family.cloudflare-dns.com";
export const privateDnsSettingsAction = "android.settings.PRIVATE_DNS_SETTINGS";
export const accessibilitySettingsAction = "android.settings.ACCESSIBILITY_SETTINGS";
export const accessibilityDetailsSettingsAction = "android.settings.ACCESSIBILITY_DETAILS_SETTINGS";
export const clean4jesusPackage = "com.clean4jesus.app";

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

export async function openAndroidAccessibilitySettings(): Promise<boolean> {
  if (Platform.OS !== "android") {
    return false;
  }

  try {
    const IntentLauncher = await import("expo-intent-launcher");
    try {
      await IntentLauncher.startActivityAsync(accessibilityDetailsSettingsAction, {
        data: `package:${clean4jesusPackage}`,
      });
      return true;
    } catch {
      await IntentLauncher.startActivityAsync(
        IntentLauncher.ActivityAction.ACCESSIBILITY_SETTINGS,
      );
      return true;
    }
  } catch {
    try {
      await Linking.openSettings();
      return true;
    } catch {
      return false;
    }
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



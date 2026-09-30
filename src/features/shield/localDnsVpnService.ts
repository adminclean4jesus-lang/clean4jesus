import { NativeModules, Platform } from "react-native";

import { getJson, setJson, storageKeys } from "@/services/storage";

type Clean4JesusVpnModule = {
  getStatus: () => Promise<boolean>;
  isAccessibilityInterventionEnabled: () => Promise<boolean>;
  pauseAccessibilityIntervention: () => Promise<boolean>;
  startDnsVpn: () => Promise<boolean>;
  stopDnsVpn: () => Promise<boolean>;
  syncLanguage?: (language: string) => Promise<boolean>;
};

const nativeVpn = NativeModules.Clean4JesusVpn as Clean4JesusVpnModule | undefined;

export async function isLocalDnsVpnActive(): Promise<boolean> {
  if (Platform.OS !== "android" || !nativeVpn) {
    return false;
  }

  try {
    return Boolean(await nativeVpn.getStatus());
  } catch {
    return false;
  }
}

export async function startLocalDnsVpn(): Promise<boolean> {
  if (Platform.OS !== "android" || !nativeVpn) {
    return false;
  }

  try {
    const permissionAndStartConfirmed = Boolean(await nativeVpn.startDnsVpn());
    if (!permissionAndStartConfirmed) {
      return false;
    }

    return Boolean(await nativeVpn.getStatus());
  } catch {
    return false;
  }
}

export async function stopLocalDnsVpn(): Promise<boolean> {
  if (Platform.OS !== "android" || !nativeVpn) {
    return false;
  }

  try {
    return Boolean(await nativeVpn.stopDnsVpn());
  } catch {
    return false;
  }
}

export async function isAccessibilityInterventionActive(): Promise<boolean> {
  if (Platform.OS !== "android" || !nativeVpn) {
    return false;
  }

  try {
    return Boolean(await nativeVpn.isAccessibilityInterventionEnabled());
  } catch {
    return false;
  }
}

export async function pauseAccessibilityIntervention(): Promise<boolean> {
  if (Platform.OS !== "android" || !nativeVpn) {
    return false;
  }

  try {
    return Boolean(await nativeVpn.pauseAccessibilityIntervention());
  } catch {
    return false;
  }
}

export async function hasCompletedAccessibilityOnboarding(): Promise<boolean> {
  return getJson(storageKeys.accessibilityOnboardingCompleted, false);
}

export async function markAccessibilityOnboardingCompleted(): Promise<void> {
  await setJson(storageKeys.accessibilityOnboardingCompleted, true);
}

export async function syncNativeLanguage(language: string): Promise<boolean> {
  if (Platform.OS !== "android" || !nativeVpn?.syncLanguage) return Platform.OS !== "android";
  try {
    return Boolean(await nativeVpn.syncLanguage(language));
  } catch {
    return false;
  }
}

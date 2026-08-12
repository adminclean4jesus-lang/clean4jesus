import AsyncStorage from "@react-native-async-storage/async-storage";

export const storageKeys = {
  pin: "clean4jesus.pin",
  pinConfiguredThisInstall: "clean4jesus.pin.configuredThisInstall",
  shieldEnabled: "clean4jesus.shield.enabled",
  shieldState: "clean4jesus.shield.state",
  shieldSetupComplete: "clean4jesus.shield.setupComplete",
  dnsSetupConfirmed: "clean4jesus.dnsSetupConfirmed",
  bankingMode: "clean4jesus.bankingMode",
  habits: "clean4jesus.habits",
  devotionalPlanProgress: "clean4jesus.devotionalPlanProgress",
  devotionalReminderSettings: "clean4jesus.devotionalReminderSettings",
  languagePreference: "clean4jesus.languagePreference",
  languagePreferenceExplicit: "clean4jesus.languagePreference.explicit",
  appearancePreference: "clean4jesus.appearancePreference",
  interruptionCustomization: "clean4jesus.interruptionCustomization",
  profileAvatarUri: "clean4jesus.profileAvatarUri",
  profileAvatarUris: "clean4jesus.profileAvatarUris.v2",
};

export async function getJson<T>(key: string, fallback: T): Promise<T> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function setJson<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}



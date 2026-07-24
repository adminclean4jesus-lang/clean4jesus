import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export async function getSecureItem(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    return null;
  }

  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

export async function setSecureItem(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    return;
  }

  await SecureStore.setItemAsync(key, value, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

export async function deleteSecureItem(key: string): Promise<void> {
  if (Platform.OS === "web") return;
  await SecureStore.deleteItemAsync(key);
}

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

export const authStorage = {
  async getItem(key: string) {
    const secureValue = await SecureStore.getItemAsync(key);
    if (secureValue !== null) {
      return secureValue;
    }

    const legacyValue = await AsyncStorage.getItem(key);
    if (legacyValue !== null) {
      await SecureStore.setItemAsync(key, legacyValue);
      await AsyncStorage.removeItem(key);
    }
    return legacyValue;
  },
  async removeItem(key: string) {
    await Promise.all([
      SecureStore.deleteItemAsync(key),
      AsyncStorage.removeItem(key),
    ]);
  },
  setItem(key: string, value: string) {
    return SecureStore.setItemAsync(key, value);
  },
};

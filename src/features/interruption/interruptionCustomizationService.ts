import * as ImagePicker from "expo-image-picker";
import { NativeModules, Platform } from "react-native";

import { getJson, setJson, storageKeys } from "@/services/storage";

export const defaultInterruptionMessage = "Todo lo puedo en Cristo que me fortalece.";
export const defaultInterruptionReference = "Filipenses 4:13";

export type InterruptionCustomization = {
  imageUri: string | null;
  message: string;
  reference: string;
};

type NativeInterruptionModule = {
  copyInterruptionImage?: (uri: string) => Promise<string>;
  syncInterruptionCustomization?: (message: string, reference: string, imagePath: string) => Promise<boolean>;
};

const nativeModule = NativeModules.Clean4JesusVpn as NativeInterruptionModule | undefined;
const fallback: InterruptionCustomization = {
  imageUri: null,
  message: defaultInterruptionMessage,
  reference: defaultInterruptionReference,
};

export async function getInterruptionCustomization() {
  return getJson(storageKeys.interruptionCustomization, fallback);
}

export async function saveInterruptionCustomization(value: InterruptionCustomization) {
  const normalized = {
    imageUri: value.imageUri,
    message: value.message.trim().slice(0, 180) || defaultInterruptionMessage,
    reference: value.reference.trim().slice(0, 60) || defaultInterruptionReference,
  };
  if (Platform.OS === "android" && !await syncCustomizationToNative(normalized)) {
    throw new Error("native_customization_sync_failed");
  }
  await setJson(storageKeys.interruptionCustomization, normalized);
  return normalized;
}

export async function resetInterruptionCustomization() {
  if (Platform.OS === "android" && !await syncCustomizationToNative(fallback)) {
    throw new Error("native_customization_sync_failed");
  }
  await setJson(storageKeys.interruptionCustomization, fallback);
  return fallback;
}

export async function chooseInterruptionImage() {
  if (Platform.OS === "web") return null;
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return null;
  const result = await ImagePicker.launchImageLibraryAsync({
    allowsEditing: true,
    aspect: [4, 5],
    mediaTypes: ["images"],
    quality: 0.82,
  });
  if (result.canceled || !result.assets[0]?.uri) return null;
  return result.assets[0].uri;
}

async function syncCustomizationToNative(value: InterruptionCustomization) {
  if (Platform.OS !== "android" || !nativeModule?.syncInterruptionCustomization) return false;
  let imagePath = "";
  if (value.imageUri && nativeModule.copyInterruptionImage) {
    imagePath = await nativeModule.copyInterruptionImage(value.imageUri);
  }
  return nativeModule.syncInterruptionCustomization(value.message, value.reference, imagePath);
}

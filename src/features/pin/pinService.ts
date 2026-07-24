import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { NativeModules, Platform } from "react-native";

import { storageKeys } from "@/services/storage";
import { deleteSecureItem, getSecureItem, setSecureItem } from "@/services/secureStorage";

type NativeGuardianPin = {
  getGuardianPinLockoutRemainingMs?: () => Promise<number>;
  syncGuardianPin?: (pin: string) => Promise<boolean>;
  verifyGuardianPin?: (pin: string) => Promise<boolean>;
};

const nativeModule = NativeModules.Clean4JesusVpn as NativeGuardianPin | undefined;
const failedAttemptsKey = "clean4jesus.pin.failedAttempts";
const lockedUntilKey = "clean4jesus.pin.lockedUntil";

export async function hasPin(): Promise<boolean> {
  return Boolean(await getStoredPinHash());
}

export async function savePin(pin: string): Promise<void> {
  const pinHash = await hashPin(pin);
  if (Platform.OS === "android" && !await syncPinToNative(pinHash)) {
    throw new Error("native_pin_sync_failed");
  }
  await setSecureItem(storageKeys.pin, pinHash);
  await AsyncStorage.removeItem(storageKeys.pin);
}

export async function verifyPin(pin: string): Promise<boolean> {
  if (Platform.OS === "android" && nativeModule?.verifyGuardianPin) {
    const lockedUntil = await getPinLockoutRemainingMs();
    if (lockedUntil > 0) return false;
    return nativeModule.verifyGuardianPin(pin);
  }

  const lockedUntil = Number(await getSecureItem(lockedUntilKey)) || 0;
  if (lockedUntil > Date.now()) return false;
  const savedPinHash = await getStoredPinHash();
  if (!savedPinHash) {
    return false;
  }

  const valid = savedPinHash === (await hashPin(pin));
  if (valid) {
    await Promise.all([deleteSecureItem(failedAttemptsKey), deleteSecureItem(lockedUntilKey)]);
    return true;
  }
  const attempts = (Number(await getSecureItem(failedAttemptsKey)) || 0) + 1;
  if (attempts >= 5) {
    await Promise.all([setSecureItem(failedAttemptsKey, "0"), setSecureItem(lockedUntilKey, String(Date.now() + 30_000))]);
  } else {
    await setSecureItem(failedAttemptsKey, String(attempts));
  }
  return false;
}

export async function getPinLockoutRemainingMs() {
  if (Platform.OS === "android" && nativeModule?.getGuardianPinLockoutRemainingMs) {
    return Math.max(0, Number(await nativeModule.getGuardianPinLockoutRemainingMs()) || 0);
  }
  return Math.max(0, (Number(await getSecureItem(lockedUntilKey)) || 0) - Date.now());
}

export async function getStoredPin(): Promise<string | null> {
  return getStoredPinHash();
}

export async function syncPinToNative(pin?: string | null): Promise<boolean> {
  if (Platform.OS !== "android" || !nativeModule?.syncGuardianPin) {
    return false;
  }

  const pinToSync = pin ?? (await getStoredPinHash());
  if (!pinToSync) return false;
  return nativeModule.syncGuardianPin(pinToSync);
}

async function getStoredPinHash(): Promise<string | null> {
  const secureHash = await getSecureItem(storageKeys.pin);
  if (secureHash) {
    return secureHash;
  }

  const legacyPin = await AsyncStorage.getItem(storageKeys.pin);
  if (!legacyPin) {
    return null;
  }

  const migratedHash = await hashPin(legacyPin);
  await setSecureItem(storageKeys.pin, migratedHash);
  await AsyncStorage.removeItem(storageKeys.pin);
  return migratedHash;
}

async function hashPin(pin: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, pin);
}

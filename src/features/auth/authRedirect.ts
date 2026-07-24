import * as Linking from "expo-linking";

export const authCallbackUrl = Linking.createURL("auth/callback");

export function recoveryCallbackUrl() {
  return `${authCallbackUrl}?mode=recovery`;
}

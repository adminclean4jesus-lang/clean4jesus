import { NativeModules, Platform } from "react-native";

import { getSupabaseFunctionUrl, isSupabaseConfigured } from "@/lib/supabase";

type NativeFalsePositiveModule = {
  configureFalsePositiveReporting?: (endpoint: string, apiKey: string) => Promise<boolean>;
};

const nativeModule = NativeModules.Clean4JesusVpn as NativeFalsePositiveModule | undefined;

export async function configureFalsePositiveReporting() {
  if (Platform.OS !== "android" || !isSupabaseConfigured) return false;
  const apiKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!apiKey || !nativeModule?.configureFalsePositiveReporting) return false;
  try {
    return await nativeModule.configureFalsePositiveReporting(
      getSupabaseFunctionUrl("report-false-positive"),
      apiKey,
    );
  } catch {
    return false;
  }
}

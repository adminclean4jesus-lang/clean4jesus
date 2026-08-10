import { APP_VERSION } from "@/config/appInfo";
import {
  evaluateRuntimeGate,
  type RuntimeGateRecord,
  type VersionGateDecision,
} from "@/features/runtime/versionGateLogic";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? "";
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "";
const isRuntimeGateConfigured = supabaseUrl.startsWith("https://") && supabasePublishableKey.length > 20;

export async function fetchRuntimeGate(platform: "android" | "ios"): Promise<VersionGateDecision> {
  if (!isRuntimeGateConfigured) {
    return { reason: "missing_config", status: "pass" };
  }

  const select = "hard_block,message,minimum_supported_version,platform,recommended_version,title,update_url";
  const endpoint = `${supabaseUrl}/rest/v1/runtime_gates?select=${select}&platform=eq.${encodeURIComponent(platform)}&limit=1`;
  const response = await fetch(endpoint, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${supabasePublishableKey}`,
      apikey: supabasePublishableKey,
    },
  });

  if (!response.ok) {
    throw new Error("No pudimos verificar si esta app sigue siendo compatible.");
  }

  const rows: unknown = await response.json();
  const data = Array.isArray(rows) ? rows[0] as RuntimeGateRecord | undefined : undefined;
  if (!data) {
    return { reason: "missing_config", status: "pass" };
  }

  return evaluateRuntimeGate(APP_VERSION, data);
}

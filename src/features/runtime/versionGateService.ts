import { APP_VERSION } from "@/config/appInfo";
import {
  evaluateRuntimeGate,
  type RuntimeGateRecord,
  type VersionGateDecision,
} from "@/features/runtime/versionGateLogic";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

export async function fetchRuntimeGate(platform: "android" | "ios"): Promise<VersionGateDecision> {
  if (!isSupabaseConfigured) {
    return { reason: "missing_config", status: "pass" };
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("runtime_gates")
    .select("hard_block, message, minimum_supported_version, platform, recommended_version, title, update_url")
    .eq("platform", platform)
    .maybeSingle<RuntimeGateRecord>();

  if (error) {
    throw new Error("No pudimos verificar si esta app sigue siendo compatible.");
  }

  if (!data) {
    return { reason: "missing_config", status: "pass" };
  }

  return evaluateRuntimeGate(APP_VERSION, data);
}

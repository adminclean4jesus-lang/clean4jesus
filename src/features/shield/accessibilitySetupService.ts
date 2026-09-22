import { getJson, setJson, storageKeys } from "@/services/storage";
import { completeAccessibilityInterventionSetup } from "@/features/shield/localDnsVpnService";

export async function getAccessibilityConfigured(): Promise<boolean> {
  return getJson(storageKeys.accessibilityConfigured, false);
}

export async function markAccessibilityConfigured(): Promise<boolean> {
  const completed = await completeAccessibilityInterventionSetup();
  if (!completed) return false;
  await setJson(storageKeys.accessibilityConfigured, true);
  return true;
}

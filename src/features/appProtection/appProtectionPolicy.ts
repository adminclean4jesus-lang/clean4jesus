import type { AppProtectionRule } from "@/features/appProtection/appProtectionService";

export function requiresGuardianPin(currentRule: AppProtectionRule | undefined, nextRule: AppProtectionRule | null): boolean {
  if (!currentRule) return false;
  if (!nextRule) return true;
  if (currentRule.mode === "limited" && nextRule.mode === "limited") return false;
  if (currentRule.mode === "blocked" && nextRule.mode !== "blocked") return true;
  return false;
}

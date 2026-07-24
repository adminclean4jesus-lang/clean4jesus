import type { SupportedLanguage } from "@/features/i18n/i18n";
import type { DevotionalPlanSummary } from "@/types/devotionalPlan";
import { getDevotionalCatalogFallback } from "./devotionalCatalogFallback";

const snapshots: Partial<Record<SupportedLanguage, DevotionalPlanSummary[]>> = {};
let latestSnapshot: DevotionalPlanSummary[] | null = null;

export function setDevotionalCatalogSnapshot(language: SupportedLanguage, plans: DevotionalPlanSummary[]) {
  snapshots[language] = plans;
  latestSnapshot = plans;
}

export function getDevotionalCatalogSnapshot(language: SupportedLanguage): DevotionalPlanSummary[] {
  const plans = snapshots[language] ?? getDevotionalCatalogFallback(language);
  setDevotionalCatalogSnapshot(language, plans);
  return plans;
}

export function getDevotionalPlanSummaryFromCatalog(planId: string): DevotionalPlanSummary | null {
  return latestSnapshot?.find((plan) => plan.id === planId) ?? null;
}

export function getLatestDevotionalCatalog(): DevotionalPlanSummary[] {
  return latestSnapshot ?? getDevotionalCatalogFallback("es");
}

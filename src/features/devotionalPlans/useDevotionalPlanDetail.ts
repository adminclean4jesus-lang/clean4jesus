import { useCallback, useEffect, useState } from "react";

import { useI18n } from "@/features/i18n/I18nProvider";
import type { DevotionalPlan } from "@/types/devotionalPlan";
import { readCachedDevotionalPlanDetail, refreshDevotionalPlanDetail } from "./devotionalCatalogService";

export function useDevotionalPlanDetail(planId: string | null | undefined) {
  const { language } = useI18n();
  const [plan, setPlan] = useState<DevotionalPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    if (!planId) { setPlan(null); setLoading(false); return; }
    setLoading(true);
    setError(false);
    try {
      const cached = await readCachedDevotionalPlanDetail(language, planId);
      if (cached) setPlan(cached);
      const remote = await refreshDevotionalPlanDetail(language, planId);
      if (remote) setPlan(remote);
      else if (!cached) setError(true);
    } catch {
      const cached = await readCachedDevotionalPlanDetail(language, planId);
      if (cached) setPlan(cached);
      else setError(true);
    } finally {
      setLoading(false);
    }
  }, [language, planId]);

  useEffect(() => { setPlan(null); void load(); }, [load]);
  return { error, loading, plan, reload: load };
}

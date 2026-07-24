import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";

import { useI18n } from "@/features/i18n/I18nProvider";
import type { DevotionalPlanSummary } from "@/types/devotionalPlan";
import type { Devotional } from "@/types/devotional";
import {
  readCachedDevotionalCatalog,
  refreshDevotionalCatalog,
} from "./devotionalCatalogService";
import { getDevotionalCatalogSnapshot } from "./devotionalCatalogStore";
import { getDailyDevotionalFallback } from "./dailyDevotionalFallback";
import {
  getLocalDateKey,
  readCachedDailyDevotional,
  refreshDailyDevotional,
} from "./dailyDevotionalService";

type DevotionalCatalogContextValue = {
  dailyDevotional: Devotional;
  dailyRefreshing: boolean;
  plans: DevotionalPlanSummary[];
  refreshing: boolean;
};

const DevotionalCatalogContext = createContext<DevotionalCatalogContextValue | null>(null);

export function DevotionalCatalogProvider({ children }: PropsWithChildren) {
  const { language } = useI18n();
  const [plans, setPlans] = useState(() => getDevotionalCatalogSnapshot(language));
  const [dateKey, setDateKey] = useState(() => getLocalDateKey());
  const [dailyDevotional, setDailyDevotional] = useState(() => getDailyDevotionalFallback(language));
  const [dailyRefreshing, setDailyRefreshing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const nextDateKey = getLocalDateKey();
      setDateKey((current) => current === nextDateKey ? current : nextDateKey);
    }, 60_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let active = true;
    setPlans(getDevotionalCatalogSnapshot(language));
    setRefreshing(true);

    void (async () => {
      try {
        const cached = await readCachedDevotionalCatalog(language);
        if (active && cached) setPlans(cached);
        const remote = await refreshDevotionalCatalog(language);
        if (active && remote) setPlans(remote);
      } catch {
        // Cached/local content remains available when the network or backend fails.
      } finally {
        if (active) setRefreshing(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [language]);

  useEffect(() => {
    let active = true;
    setDailyDevotional(getDailyDevotionalFallback(language));
    setDailyRefreshing(true);

    void (async () => {
      try {
        const cached = await readCachedDailyDevotional(language, dateKey);
        if (active && cached) setDailyDevotional(cached);
        const remote = await refreshDailyDevotional(language, dateKey);
        if (active && remote) setDailyDevotional(remote);
      } catch {
        // The reviewed fallback or exact-date cache keeps Palabra usable offline.
      } finally {
        if (active) setDailyRefreshing(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [dateKey, language]);

  const value = useMemo(() => ({
    dailyDevotional,
    dailyRefreshing,
    plans,
    refreshing,
  }), [dailyDevotional, dailyRefreshing, plans, refreshing]);
  return <DevotionalCatalogContext.Provider value={value}>{children}</DevotionalCatalogContext.Provider>;
}

export function useDevotionalCatalog() {
  const value = useContext(DevotionalCatalogContext);
  if (!value) throw new Error("useDevotionalCatalog must be used inside DevotionalCatalogProvider");
  return value;
}

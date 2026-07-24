import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { darkColors, lightColors, ThemeColors } from "@/theme";
import { getJson, setJson, storageKeys } from "@/services/storage";

export type AppearancePreference = "dark" | "light";

type AppearanceContextValue = {
  colors: ThemeColors;
  isDark: boolean;
  ready: boolean;
  preference: AppearancePreference;
  setPreference: (preference: AppearancePreference) => Promise<void>;
};

const AppearanceContext = createContext<AppearanceContextValue | null>(null);

export function AppearanceProvider({ children }: PropsWithChildren) {
  const [preference, setPreferenceState] = useState<AppearancePreference>("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    void getJson<AppearancePreference>(storageKeys.appearancePreference, "light")
      .then((stored) => {
        if (mounted && (stored === "light" || stored === "dark")) {
          setPreferenceState(stored);
        }
      })
      .finally(() => {
        if (mounted) setReady(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const setPreference = useCallback(async (next: AppearancePreference) => {
    setPreferenceState(next);
    await setJson(storageKeys.appearancePreference, next);
  }, []);

  const value = useMemo<AppearanceContextValue>(() => ({
    colors: preference === "dark" ? darkColors : lightColors,
    isDark: preference === "dark",
    preference,
    ready,
    setPreference,
  }), [preference, ready, setPreference]);

  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>;
}

export function useAppAppearance() {
  const value = useContext(AppearanceContext);
  if (!value) throw new Error("useAppAppearance must be used inside AppearanceProvider.");
  return value;
}

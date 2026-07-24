import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { getJson, setJson, storageKeys } from "@/services/storage";
import { syncNativeLanguage } from "@/features/shield/localDnsVpnService";

import { detectSystemLanguage, normalizeLanguage, SupportedLanguage, translate } from "./i18n";

type I18nContextValue = {
  language: SupportedLanguage;
  ready: boolean;
  setLanguage: (nextLanguage: SupportedLanguage) => Promise<void>;
  t: typeof translate;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function initialLanguage() {
  return process.env.EXPO_PUBLIC_E2E === "true" ? "es" : detectSystemLanguage();
}

export function I18nProvider({ children }: PropsWithChildren) {
  const [language, setLanguageState] = useState<SupportedLanguage>(initialLanguage);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    void getJson<string | null>(storageKeys.languagePreference, null)
      .then((storedLanguage) => {
        if (mounted) {
          const normalized = storedLanguage ? normalizeLanguage(storedLanguage) : initialLanguage();
          setLanguageState(normalized);
          void syncNativeLanguage(normalized);
        }
      })
      .finally(() => {
        if (mounted) {
          setReady(true);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const setLanguage = useCallback(async (nextLanguage: SupportedLanguage) => {
    setLanguageState(nextLanguage);
    await setJson(storageKeys.languagePreference, nextLanguage);
    await syncNativeLanguage(nextLanguage);
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      ready,
      setLanguage,
      t: translate,
    }),
    [language, ready, setLanguage],
  );

  return <I18nContext.Provider value={value}>{ready ? children : null}</I18nContext.Provider>;
}

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) {
    throw new Error("useI18n must be used inside I18nProvider");
  }
  return value;
}

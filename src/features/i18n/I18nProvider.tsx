import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";

import { getJson, setJson, storageKeys } from "@/services/storage";
import { syncNativeLanguage } from "@/features/shield/localDnsVpnService";
import { iosProtectionService } from "@/features/iosProtection/iosProtectionService.ios";

import { detectSystemLanguage, resolveStartupLanguage, SupportedLanguage, translate } from "./i18n";
import { getIosProtectionText } from "./iosProtectionText";

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

async function syncIosShieldCopy(language: SupportedLanguage) {
  if (Platform.OS !== "ios") return;
  const copy = getIosProtectionText(language);
  try {
    await iosProtectionService.setShieldCopy(
      copy.shieldTitle,
      copy.shieldMessage,
      copy.shieldPrimaryAction,
      copy.shieldSecondaryAction,
    );
  } catch {
    // The native module is unavailable in web, tests, or a non-iOS build.
  }
}

export function I18nProvider({ children }: PropsWithChildren) {
  const [language, setLanguageState] = useState<SupportedLanguage>(initialLanguage);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    void Promise.all([
      getJson<string | null>(storageKeys.languagePreference, null),
      getJson<boolean>(storageKeys.languagePreferenceExplicit, false),
    ])
      .then(([storedLanguage, manuallySelected]) => {
        if (mounted) {
          const normalized = resolveStartupLanguage({
            manuallySelected,
            storedLanguage,
            systemLanguage: initialLanguage(),
          });
          setLanguageState(normalized);
          void syncNativeLanguage(normalized);
          void syncIosShieldCopy(normalized);
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
    await setJson(storageKeys.languagePreferenceExplicit, true);
    await syncNativeLanguage(nextLanguage);
    await syncIosShieldCopy(nextLanguage);
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

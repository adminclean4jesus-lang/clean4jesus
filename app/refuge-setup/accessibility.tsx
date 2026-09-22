import { RefugeSetupGuide } from "@/features/shield/RefugeSetupGuide";
import { useI18n } from "@/features/i18n/I18nProvider";
import { getAndroidSetupText } from "@/features/i18n/androidSetupText";
import { hasPin } from "@/features/pin/pinService";
import { markAccessibilityConfigured } from "@/features/shield/accessibilitySetupService";
import { openAndroidAccessibilitySettings } from "@/features/shield/androidProtectionService";
import { isAccessibilityInterventionActive, isLocalDnsVpnActive, prepareAccessibilityIntervention } from "@/features/shield/localDnsVpnService";
import { enableShield } from "@/features/shield/shieldService";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, AppState } from "react-native";

export default function AccessibilitySetupScreen() {
  const router = useRouter();
  const { language } = useI18n();
  const copy = getAndroidSetupText(language);
  const [active, setActive] = useState(false);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    void refresh();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void refresh();
    });
    return () => subscription.remove();
  }, []);

  async function refresh() {
    const [pinReady, vpnReady, accessibilityReady] = await Promise.all([
      hasPin(), isLocalDnsVpnActive(), isAccessibilityInterventionActive(),
    ]);
    if (!pinReady) {
      router.replace("/pin-setup?after=shield-setup");
      return;
    }
    if (!vpnReady) {
      router.replace("/refuge-setup/vpn");
      return;
    }
    setActive(accessibilityReady);
    setBusy(false);
  }

  async function openAccessibility() {
    const prepared = await prepareAccessibilityIntervention();
    if (!prepared || !(await openAndroidAccessibilitySettings())) {
      Alert.alert(copy.blocked.title, copy.blocked.body);
    }
  }

  async function handleAction() {
    if (!active) {
      await openAccessibility();
      return;
    }
    setBusy(true);
    const configured = await markAccessibilityConfigured();
    const shield = configured ? await enableShield() : { enabled: false };
    setBusy(false);
    if (!shield.enabled) {
      Alert.alert(copy.blocked.title, copy.blocked.body);
      return;
    }
    router.replace("/(tabs)");
  }

  return <RefugeSetupGuide
    actionDisabled={busy}
    actionLabel={busy ? copy.accessibility.checking : active ? copy.accessibility.done : copy.accessibility.action}
    backLabel={copy.back}
    brand={copy.brand}
    description={copy.accessibility.description}
    icon="accessibility"
    onAction={() => void handleAction()}
    onBack={() => router.replace("/refuge-setup/vpn")}
    progress={1}
    step={copy.step(2)}
    steps={[copy.accessibility.first, copy.accessibility.second, copy.accessibility.third]}
    title={copy.accessibility.title}
  />;
}

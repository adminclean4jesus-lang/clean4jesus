import { RefugeSetupGuide } from "@/features/shield/RefugeSetupGuide";
import { useI18n } from "@/features/i18n/I18nProvider";
import { getAndroidSetupText } from "@/features/i18n/androidSetupText";
import { hasPin } from "@/features/pin/pinService";
import { isLocalDnsVpnActive, startLocalDnsVpn } from "@/features/shield/localDnsVpnService";
import { prepareShield } from "@/features/shield/shieldService";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, AppState } from "react-native";

export default function VpnSetupScreen() {
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
    if (!(await hasPin())) {
      router.replace("/pin-setup?after=shield-setup");
      return;
    }
    setActive(await isLocalDnsVpnActive());
    setBusy(false);
  }

  async function handleAction() {
    if (active) {
      router.replace("/refuge-setup/accessibility");
      return;
    }
    setBusy(true);
    await prepareShield();
    const started = await startLocalDnsVpn();
    setActive(started);
    setBusy(false);
    if (!started) Alert.alert(copy.blocked.title, copy.blocked.body);
  }

  return <RefugeSetupGuide
    actionDisabled={busy}
    actionLabel={busy ? copy.vpn.checking : active ? copy.vpn.done : copy.vpn.action}
    backLabel={copy.back}
    brand={copy.brand}
    description={copy.vpn.description}
    icon="shield-outline"
    onAction={() => void handleAction()}
    onBack={() => router.replace("/")}
    progress={0.5}
    step={copy.step(1)}
    steps={[copy.vpn.first, copy.vpn.second, copy.vpn.third]}
    title={copy.vpn.title}
  />;
}

import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

import { AppHeader } from "@/components/AppHeader";
import { AppLoadingExperience } from "@/components/AppLoadingExperience";
import { InfoCard } from "@/components/InfoCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { useAppAppearance } from "@/features/appearance/AppearanceProvider";
import { useI18n } from "@/features/i18n/I18nProvider";
import {
  isAccessibilityInterventionActive,
  isLocalDnsVpnActive,
  pauseAccessibilityIntervention,
} from "@/features/shield/localDnsVpnService";
import { finishBankingMode, startBankingMode } from "@/features/shield/bankingModeService";
import { openAndroidAccessibilitySettings } from "@/features/shield/androidProtectionService";
import { fonts, ThemeColors } from "@/theme";

export default function BankingModeScreen() {
  const router = useRouter();
  const { colors } = useAppAppearance();
  const { language, t } = useI18n();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [accessibilityActive, setAccessibilityActive] = useState<boolean | null>(null);
  const [vpnActive, setVpnActive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pauseFailed, setPauseFailed] = useState(false);

  const refresh = useCallback(async () => {
    if (Platform.OS !== "android") {
      setAccessibilityActive(false);
      return;
    }
    const [accessibility, vpn] = await Promise.all([
      isAccessibilityInterventionActive(),
      isLocalDnsVpnActive(),
    ]);
    setAccessibilityActive(accessibility);
    setVpnActive(vpn);
    if (accessibility) {
      await finishBankingMode();
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const pauseForBanking = useCallback(async () => {
    setBusy(true);
    setPauseFailed(false);
    const paused = await pauseAccessibilityIntervention();
    if (paused) {
      await startBankingMode();
      await new Promise<void>((resolve) => setTimeout(resolve, 350));
    } else {
      setPauseFailed(true);
    }
    await refresh();
    setBusy(false);
  }, [refresh]);

  if (accessibilityActive === null) {
    return <AppLoadingExperience layout="contextual" message={t(language, "settings.status.preparing")} />;
  }

  const paused = !accessibilityActive;
  return (
    <Screen>
      <AppHeader
        eyebrow={t(language, "banking.eyebrow")}
        icon="bank-outline"
        onBack={() => router.back()}
        subtitle={t(language, "banking.subtitle")}
        title={t(language, "banking.title")}
      />

      <InfoCard tone={paused ? "light" : "outline"} style={styles.card}>
        <Text style={styles.cardTitle}>
          {t(language, paused ? "banking.pausedTitle" : "banking.activeTitle")}
        </Text>
        <Text style={styles.cardBody}>
          {t(language, paused ? "banking.pausedBody" : "banking.activeBody")}
        </Text>
      </InfoCard>

      <View style={styles.statusRow}>
        <View style={[styles.statusDot, { backgroundColor: vpnActive ? colors.success : colors.partial }]} />
        <Text style={styles.statusText}>
          {t(language, vpnActive ? "banking.vpnActive" : "banking.vpnInactive")}
        </Text>
      </View>

      {paused ? (
        <PrimaryButton
          label={t(language, "banking.reactivate")}
          onPress={() => void openAndroidAccessibilitySettings()}
        />
      ) : (
        <PrimaryButton
          disabled={busy}
          label={t(language, "banking.pause")}
          onPress={() => void pauseForBanking()}
        />
      )}

      {pauseFailed ? <Text style={styles.waiting}>{t(language, "banking.unavailable")}</Text> : null}
    </Screen>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: { gap: 8 },
    cardTitle: { color: colors.primaryDark, fontFamily: fonts.heading, fontSize: 18 },
    cardBody: { color: colors.text, fontFamily: fonts.body, fontSize: 14, lineHeight: 21 },
    statusRow: { alignItems: "center", flexDirection: "row", gap: 9, paddingHorizontal: 4 },
    statusDot: { borderRadius: 99, height: 9, width: 9 },
    statusText: { color: colors.muted, flex: 1, fontFamily: fonts.body, fontSize: 13, lineHeight: 19 },
    waiting: { color: colors.muted, fontFamily: fonts.body, fontSize: 12, lineHeight: 18, textAlign: "center" },
  });
}

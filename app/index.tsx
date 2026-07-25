import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, AppState, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { InfoCard } from "@/components/InfoCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { useAppAppearance } from "@/features/appearance/AppearanceProvider";
import { hasPin } from "@/features/pin/pinService";
import { openAndroidAccessibilitySettings } from "@/features/shield/androidProtectionService";
import { isAccessibilityInterventionActive, isLocalDnsVpnActive, startLocalDnsVpn } from "@/features/shield/localDnsVpnService";
import { enableShield, getShieldEnabled, prepareShield } from "@/features/shield/shieldService";
import { ShieldOrb } from "@/features/shield/ShieldOrb";
import { useI18n } from "@/features/i18n/I18nProvider";
import { getSecondaryText } from "@/features/i18n/secondaryText";
import { fonts, ThemeColors } from "@/theme";

export default function GateScreen() {
  if (Platform.OS === "ios") {
    return <Redirect href="/ios-protection" />;
  }

  return <AndroidGateScreen />;
}

function AndroidGateScreen() {
  const router = useRouter();
  const { colors } = useAppAppearance();
  const { language } = useI18n();
  const copy = getSecondaryText(language);
  const styles = useGateStyles();
  const { setup } = useLocalSearchParams<{ setup?: string }>();
  const [pinReady, setPinReady] = useState(false);
  const [shieldEnabled, setShieldEnabled] = useState(false);
  const [setupPending, setSetupPending] = useState(false);
  const [vpnReady, setVpnReady] = useState(false);
  const [accessibilityReady, setAccessibilityReady] = useState(false);

  useEffect(() => {
    void (async () => {
      const [currentShield, pinExists, vpnActive, accessibilityActive] = await Promise.all([
        getShieldEnabled(),
        hasPin(),
        isLocalDnsVpnActive(),
        isAccessibilityInterventionActive(),
      ]);
      const protectionReady = pinExists && vpnActive && accessibilityActive;
      setShieldEnabled(currentShield && protectionReady);
      setPinReady(pinExists);
      setVpnReady(vpnActive);
      setAccessibilityReady(accessibilityActive);

      if (setup === "1" && pinExists && !currentShield) {
        await prepareShield();
        setSetupPending(true);
      }

      if (currentShield && protectionReady) {
        router.replace("/(tabs)");
      } else if (currentShield) {
        setSetupPending(true);
      }
    })();
  }, [router, setup]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active") return;
      void refreshProtectionStatus();
    });

    return () => subscription.remove();
  }, []);

  async function refreshProtectionStatus() {
    const [pinExists, vpnActive, accessibilityActive] = await Promise.all([
      hasPin(),
      isLocalDnsVpnActive(),
      isAccessibilityInterventionActive(),
    ]);
    setPinReady(pinExists);
    setVpnReady(vpnActive);
    setAccessibilityReady(accessibilityActive);
    return { accessibilityActive, pinExists, vpnActive };
  }

  async function handleStartVpn() {
    const vpnActive = await startLocalDnsVpn();
    setVpnReady(vpnActive);
    return vpnActive;
  }

  async function handleActivate() {
    if (!pinReady) {
      router.push("/pin-setup?after=shield-setup");
      return;
    }

    await prepareShield();
    setShieldEnabled(false);
    setSetupPending(true);
  }

  async function handleConfirmSetup() {
    if (!vpnReady) {
      await handleStartVpn();
    }

    const status = await refreshProtectionStatus();
    if (!status.pinExists || !status.vpnActive || !status.accessibilityActive) {
      Alert.alert(
        copy.setupPending,
        copy.setupPendingBody,
      );
      return;
    }

    const next = await enableShield();
    setShieldEnabled(next.enabled);
    setSetupPending(false);
    router.replace("/(tabs)");
  }

  return (
    <Screen>
      <View style={styles.brandRow}>
        <View style={styles.brandBadge}>
          <MaterialCommunityIcons color={colors.primaryDark} name="shield-check-outline" size={20} />
        </View>
        <View style={styles.brandText}>
          <Text style={styles.brandEyebrow}>Clean4Jesus</Text>
          <Text style={styles.brandTitle}>{copy.gateDaily}</Text>
        </View>
      </View>

      <View style={styles.heroStage}>
        <Text style={styles.heroKicker}>{shieldEnabled ? copy.gateActive : copy.gateOff}</Text>
        <Text style={styles.heroTitle}>{shieldEnabled ? copy.gateReadyTitle : copy.gateSetupTitle}</Text>
        <Text style={styles.heroBody}>{copy.gateBody}</Text>
        <View style={styles.heroCenter}>
          <ShieldOrb enabled={shieldEnabled} />
        </View>
      </View>

      <InfoCard tone="outline" style={styles.noticeCard}>
        <CheckRow label="PIN" ready={pinReady} value={pinReady ? copy.ready : copy.create} />
        <View style={styles.divider} />
        <CheckRow label={copy.vpn} ready={vpnReady} value={vpnReady ? copy.active : copy.pending} />
        <View style={styles.divider} />
        <CheckRow label={copy.accessibility} ready={accessibilityReady} value={accessibilityReady ? copy.active : copy.pending} />
      </InfoCard>

      <InfoCard tone="light" style={styles.blockCard}>
        <Text style={styles.blockLabel}>{copy.steps}</Text>
        <Step ready={pinReady} text={copy.stepPin} />
        <Step ready={vpnReady} text={copy.stepVpn} />
        <Step ready={accessibilityReady} text={copy.stepAccessibility} />
      </InfoCard>

      {setupPending ? (
        <InfoCard tone="outline" style={styles.setupCard}>
          <Text style={styles.setupTitle}>{copy.gatePaused}</Text>
          <Text style={styles.setupBody}>{copy.gatePausedBody}</Text>
          <View style={styles.setupActions}>
            <Pressable onPress={() => void handleStartVpn()} style={[styles.setupLink, vpnReady && styles.setupLinkReady]}>
              <MaterialCommunityIcons color={colors.primaryDark} name="shield-outline" size={16} />
              <Text style={styles.setupLinkText}>{copy.vpn}</Text>
            </Pressable>
            <Pressable onPress={() => void openAndroidAccessibilitySettings()} style={[styles.setupLink, accessibilityReady && styles.setupLinkReady]}>
              <MaterialCommunityIcons color={colors.primaryDark} name="access-point" size={16} />
              <Text style={styles.setupLinkText}>{copy.accessibility}</Text>
            </Pressable>
          </View>
          <PrimaryButton label={copy.gateConfirm} onPress={handleConfirmSetup} />
        </InfoCard>
      ) : null}

      <View style={styles.actions}>
        <PrimaryButton label={shieldEnabled ? copy.gateEnter : copy.gatePrepare} onPress={handleActivate} />
        <Pressable onPress={() => void openAndroidAccessibilitySettings()} style={styles.secondaryLink}>
          <MaterialCommunityIcons color={colors.primaryDark} name="access-point" size={16} />
          <Text style={styles.secondaryLinkText}>{copy.openAccessibility}</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

function CheckRow({ label, ready, value }: { label: string; ready: boolean; value: string }) {
  const { colors } = useAppAppearance();
  const styles = useGateStyles();
  return (
    <View style={styles.noticeRow}>
      <View style={styles.checkLabelRow}>
        <View style={[styles.checkDot, ready && styles.checkDotReady]}>
          <MaterialCommunityIcons color={ready ? colors.surface : colors.muted} name={ready ? "check" : "circle-outline"} size={12} />
        </View>
        <Text style={styles.quickLabel}>{label}</Text>
      </View>
      <Text style={[styles.quickValue, ready && styles.quickValueReady]}>{value}</Text>
    </View>
  );
}

function Step({ ready, text }: { ready: boolean; text: string }) {
  const { colors } = useAppAppearance();
  const styles = useGateStyles();
  return (
    <View style={styles.stepRow}>
      <View style={[styles.stepDot, ready && styles.stepDotReady]}>
        {ready ? <MaterialCommunityIcons color={colors.surface} name="check" size={11} /> : null}
      </View>
      <Text style={[styles.stepText, ready && styles.stepTextReady]}>{text}</Text>
    </View>
  );
}

function useGateStyles() {
  const { colors } = useAppAppearance();
  return useMemo(() => createStyles(colors), [colors]);
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  brandRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  brandBadge: {
    alignItems: "center",
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  brandText: {
    flex: 1,
    gap: 2,
  },
  brandEyebrow: {
    color: colors.muted,
    fontFamily: fonts.label,
    fontSize: 10,
    letterSpacing: 0.9,
    textTransform: "uppercase",
  },
  brandTitle: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 16,
    lineHeight: 20,
  },
  heroStage: {
    gap: 8,
    paddingTop: 6,
  },
  heroKicker: {
    color: colors.primary,
    fontFamily: fonts.label,
    fontSize: 10,
    letterSpacing: 0.9,
    textTransform: "uppercase",
  },
  heroTitle: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 20,
    lineHeight: 25,
  },
  heroBody: {
    color: colors.muted,
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    lineHeight: 16,
  },
  heroCenter: {
    alignItems: "center",
    paddingVertical: 6,
  },
  noticeCard: {
    gap: 10,
  },
  quickLabel: {
    color: colors.muted,
    fontFamily: fonts.label,
    fontSize: 10,
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  quickValue: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 12,
  },
  quickValueReady: {
    color: colors.success,
  },
  checkLabelRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  checkDot: {
    alignItems: "center",
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    height: 22,
    justifyContent: "center",
    width: 22,
  },
  checkDotReady: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  blockCard: {
    gap: 10,
  },
  blockLabel: {
    color: colors.primary,
    fontFamily: fonts.label,
    fontSize: 11,
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  stepRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 8,
  },
  stepDot: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 4,
    height: 16,
    justifyContent: "center",
    marginTop: 5,
    width: 16,
  },
  stepDotReady: {
    backgroundColor: colors.success,
  },
  stepText: {
    color: colors.text,
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    lineHeight: 16,
  },
  stepTextReady: {
    color: colors.success,
    fontFamily: fonts.heading,
  },
  setupCard: {
    gap: 12,
  },
  setupTitle: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 16,
  },
  setupBody: {
    color: colors.muted,
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    lineHeight: 16,
  },
  setupActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  setupLink: {
    alignItems: "center",
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    minWidth: "48%",
    paddingVertical: 11,
  },
  setupLinkReady: {
    backgroundColor: colors.successSoft,
    borderColor: colors.success,
  },
  setupLinkText: {
    color: colors.primaryDark,
    fontFamily: fonts.heading,
    fontSize: 10,
  },
  actions: {
    gap: 8,
  },
  secondaryLink: {
    alignItems: "center",
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    paddingVertical: 11,
  },
  secondaryLinkText: {
    color: colors.primaryDark,
    fontFamily: fonts.heading,
    fontSize: 11,
  },
  divider: {
    backgroundColor: colors.border,
    height: StyleSheet.hairlineWidth,
  },
  noticeRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  });
}

import { MaterialCommunityIcons } from "@/components/MaterialCommunityIcon";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, AppState, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { ProgressBar } from "react-native-paper";

import { InfoCard } from "@/components/InfoCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { useAppAppearance } from "@/features/appearance/AppearanceProvider";
import { hasPin, syncPinToNative } from "@/features/pin/pinService";
import { openAndroidAccessibilitySettings } from "@/features/shield/androidProtectionService";
import { isAccessibilityInterventionActive, isLocalDnsVpnActive, startLocalDnsVpn } from "@/features/shield/localDnsVpnService";
import { enableShield, getShieldEnabled, prepareShield } from "@/features/shield/shieldService";
import { ShieldOrb } from "@/features/shield/ShieldOrb";
import { iosProtectionService } from "@/features/iosProtection/iosProtectionService.ios";
import { useI18n } from "@/features/i18n/I18nProvider";
import { getSecondaryText } from "@/features/i18n/secondaryText";
import { getIosGateText } from "@/features/i18n/iosGateText";
import { fonts, ThemeColors } from "@/theme";
import { LinearGradient } from "expo-linear-gradient";

export default function GateScreen() {
  if (Platform.OS === "ios") return <IosGateScreen />;
  return <AndroidGateScreen />;
}

/* ─────────────────────── iOS Gate ─────────────────────── */

function IosGateScreen() {
  const router = useRouter();
  const { colors } = useAppAppearance();
  const { language } = useI18n();
  const copy = getIosGateText(language);
  const styles = useMemo(() => createIosStyles(colors), [colors]);
  const [pinReady, setPinReady] = useState(false);
  const [familyControlsAuthorized, setFamilyControlsAuthorized] = useState(false);
  const [protectionActive, setProtectionActive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void refreshIosState();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void refreshIosState();
    });
    return () => subscription.remove();
  }, []);

  async function refreshIosState() {
    try {
      const [pinExists, status] = await Promise.all([
        hasPin(),
        iosProtectionService.getProtectionStatus(),
      ]);
      if (pinExists) await syncPinToNative();
      setPinReady(pinExists);
      setFamilyControlsAuthorized(status.isAuthorized);
      setProtectionActive(status.isEnabled);
    } catch {
      setPinReady(false);
      setFamilyControlsAuthorized(false);
      setProtectionActive(false);
    } finally {
      setLoading(false);
    }
  }

  const readiness = [pinReady, familyControlsAuthorized].filter(Boolean).length / 2;
  const refugeReady = pinReady && familyControlsAuthorized;
  const coverageLabel = Math.round(readiness * 100);

  async function handleRequestPermission() {
    try {
      const granted = await iosProtectionService.requestAuthorization();
      if (!granted) {
        await refreshIosState();
        Alert.alert(copy.permissionErrorTitle, copy.permissionErrorBody);
        return false;
      }

      const configured = await iosProtectionService.configureProtection({ blockCategories: ["adult"], blockWebDomains: [] });
      await refreshIosState();
      if (!configured) {
        Alert.alert(copy.permissionErrorTitle, copy.permissionErrorBody);
      }
      return configured;
    } catch {
      await refreshIosState();
      Alert.alert(copy.permissionErrorTitle, copy.permissionErrorBody);
      return false;
    }
  }

  async function handleEnter() {
    if (!pinReady) {
      router.push("/pin-setup?after=shield-setup");
      return;
    }
    if (!familyControlsAuthorized) {
      const prepared = await handleRequestPermission();
      if (prepared) router.replace("/(tabs)");
      return;
    }
    if (!protectionActive) {
      const prepared = await handleRequestPermission();
      if (prepared) router.replace("/(tabs)");
      return;
    }
    router.replace("/(tabs)");
  }

  if (loading) {
    return (
      <Screen>
        <View style={styles.loadingCenter}>
          <MaterialCommunityIcons color={colors.primary} name="shield-cross" size={48} />
          <Text style={styles.loadingText}>{copy.loading}</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.brandRow}>
        <View style={styles.brandBadge}>
          <MaterialCommunityIcons color={colors.primaryDark} name="shield-cross" size={20} />
        </View>
        <View style={styles.brandText}>
          <Text style={styles.brandEyebrow}>Clean4Jesus</Text>
          <Text style={styles.brandTitle}>{copy.title}</Text>
        </View>
      </View>

      <LinearGradient colors={[colors.surfaceAlt, colors.surface]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroCard}>
        <View style={styles.heroAccent} />
        <Text style={styles.heroKicker}>{refugeReady ? copy.kickerActive : copy.kickerSetup}</Text>
        <Text style={styles.heroTitle}>{refugeReady ? copy.readyTitle : copy.setupTitle}</Text>
        <Text style={styles.heroBody}>{copy.body}</Text>

        <View style={styles.orbCenter}>
          <ShieldOrb enabled={refugeReady} />
        </View>

        <View style={styles.progressBlock}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>{copy.coverage}</Text>
            <Text style={styles.progressValue}>{coverageLabel}%</Text>
          </View>
          <ProgressBar color={colors.primary} progress={readiness} style={styles.progressBar} />
        </View>
      </LinearGradient>

      <InfoCard tone="outline" style={styles.layersCard}>
        <IosCheckRow label="PIN" ready={pinReady} value={pinReady ? copy.ready : copy.create} />
        <View style={styles.divider} />
        <IosCheckRow label={copy.familyControls} ready={familyControlsAuthorized} value={familyControlsAuthorized ? copy.authorized : copy.notAuthorized} />
        {protectionActive ? (
          <>
            <View style={styles.divider} />
            <IosCheckRow label={copy.shieldActive} ready={true} value={copy.active} />
          </>
        ) : null}
      </InfoCard>

      <InfoCard tone="light" style={styles.stepsCard}>
        <Text style={styles.stepsLabel}>{copy.steps}</Text>
        <IosStep ready={pinReady} text={copy.stepPin} />
        <IosStep ready={familyControlsAuthorized} text={copy.stepFamilyControls} />
      </InfoCard>

      {!familyControlsAuthorized ? (
        <PrimaryButton label={copy.requestPermission} onPress={handleRequestPermission} />
      ) : null}

      <View style={styles.actions}>
        <PrimaryButton label={refugeReady ? copy.enter : copy.prepare} onPress={handleEnter} />
        <Pressable onPress={() => router.push("/ios-protection")} style={styles.secondaryLink}>
          <MaterialCommunityIcons color={colors.primaryDark} name="apple" size={16} />
          <Text style={styles.secondaryLinkText}>{copy.iosSettings}</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

function IosCheckRow({ label, ready, value }: { label: string; ready: boolean; value: string }) {
  const { colors } = useAppAppearance();
  const styles = useMemo(() => createIosStyles(colors), [colors]);
  return (
    <View style={styles.checkRow}>
      <View style={styles.checkLabelRow}>
        <View style={[styles.checkDot, ready && styles.checkDotReady]}>
          <MaterialCommunityIcons color={ready ? colors.surface : colors.muted} name={ready ? "check" : "circle-outline"} size={12} />
        </View>
        <Text style={styles.checkLabel}>{label}</Text>
      </View>
      <Text style={[styles.checkValue, ready && styles.checkValueReady]}>{value}</Text>
    </View>
  );
}

function IosStep({ ready, text }: { ready: boolean; text: string }) {
  const { colors } = useAppAppearance();
  const styles = useMemo(() => createIosStyles(colors), [colors]);
  return (
    <View style={styles.stepRow}>
      <View style={[styles.stepDot, ready && styles.stepDotReady]}>
        {ready ? <MaterialCommunityIcons color={colors.surface} name="check" size={11} /> : null}
      </View>
      <Text style={[styles.stepText, ready && styles.stepTextReady]}>{text}</Text>
    </View>
  );
}

function createIosStyles(colors: ThemeColors) {
  return StyleSheet.create({
    loadingCenter: { alignItems: "center", flex: 1, gap: 12, justifyContent: "center" },
    loadingText: { color: colors.muted, fontFamily: fonts.body, fontSize: 13 },
    brandRow: { alignItems: "center", flexDirection: "row", gap: 10 },
    brandBadge: { alignItems: "center", backgroundColor: colors.surfaceAlt, borderColor: colors.border, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, height: 42, justifyContent: "center", width: 42 },
    brandText: { flex: 1, gap: 2 },
    brandEyebrow: { color: colors.muted, fontFamily: fonts.label, fontSize: 10, letterSpacing: 0.9, textTransform: "uppercase" },
    brandTitle: { color: colors.text, fontFamily: fonts.display, fontSize: 16, lineHeight: 20 },
    heroCard: { borderColor: colors.border, borderRadius: 28, borderWidth: 1, gap: 10, overflow: "hidden", padding: 16 },
    heroAccent: { backgroundColor: colors.primary, height: 4, left: 0, position: "absolute", right: 0, top: 0 },
    heroKicker: { color: colors.primary, fontFamily: fonts.label, fontSize: 10, letterSpacing: 0.9, textTransform: "uppercase" },
    heroTitle: { color: colors.text, fontFamily: fonts.display, fontSize: 20, lineHeight: 25 },
    heroBody: { color: colors.muted, fontFamily: fonts.body, fontSize: 11, lineHeight: 16 },
    orbCenter: { alignItems: "center", paddingVertical: 6 },
    progressBlock: { gap: 6 },
    progressHeader: { flexDirection: "row", justifyContent: "space-between" },
    progressLabel: { color: colors.primary, fontFamily: fonts.label, fontSize: 10, textTransform: "uppercase" },
    progressValue: { color: colors.text, fontFamily: fonts.display, fontSize: 12 },
    progressBar: { backgroundColor: colors.surfaceAlt, borderRadius: 999, height: 7 },
    layersCard: { gap: 10 },
    checkRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
    checkLabelRow: { alignItems: "center", flexDirection: "row", gap: 8 },
    checkDot: { alignItems: "center", backgroundColor: colors.surfaceAlt, borderColor: colors.border, borderRadius: 999, borderWidth: 1, height: 22, justifyContent: "center", width: 22 },
    checkDotReady: { backgroundColor: colors.success, borderColor: colors.success },
    checkLabel: { color: colors.muted, fontFamily: fonts.label, fontSize: 10, letterSpacing: 0.7, textTransform: "uppercase" },
    checkValue: { color: colors.text, fontFamily: fonts.display, fontSize: 12 },
    checkValueReady: { color: colors.success },
    divider: { backgroundColor: colors.border, height: StyleSheet.hairlineWidth },
    stepsCard: { gap: 10 },
    stepsLabel: { color: colors.primary, fontFamily: fonts.label, fontSize: 11, letterSpacing: 0.7, textTransform: "uppercase" },
    stepRow: { alignItems: "flex-start", flexDirection: "row", gap: 8 },
    stepDot: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 4, height: 16, justifyContent: "center", marginTop: 5, width: 16 },
    stepDotReady: { backgroundColor: colors.success },
    stepText: { color: colors.text, flex: 1, fontFamily: fonts.body, fontSize: 11, lineHeight: 16 },
    stepTextReady: { color: colors.success, fontFamily: fonts.heading },
    actions: { gap: 8 },
    secondaryLink: { alignItems: "center", backgroundColor: colors.surfaceAlt, borderColor: colors.border, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, flexDirection: "row", gap: 6, justifyContent: "center", paddingVertical: 11 },
    secondaryLinkText: { color: colors.primaryDark, fontFamily: fonts.heading, fontSize: 11 },
  });
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

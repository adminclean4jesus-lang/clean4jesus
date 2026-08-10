import { MaterialCommunityIcons } from "@/components/MaterialCommunityIcon";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, AppState, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { ProgressBar } from "react-native-paper";

import { AppHeader } from "@/components/AppHeader";
import { AppLoadingExperience } from "@/components/AppLoadingExperience";
import { InfoCard } from "@/components/InfoCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { useAppAppearance } from "@/features/appearance/AppearanceProvider";
import { recordFall } from "@/features/habits/habitService";
import { hasPin } from "@/features/pin/pinService";
import { openAndroidAccessibilitySettings } from "@/features/shield/androidProtectionService";
import { isAccessibilityInterventionActive, isLocalDnsVpnActive, startLocalDnsVpn } from "@/features/shield/localDnsVpnService";
import { iosProtectionService } from "@/features/iosProtection/iosProtectionService.ios";
import { useShieldGate } from "@/features/shield/useShieldGate";
import { useI18n } from "@/features/i18n/I18nProvider";
import { uiText } from "@/features/i18n/uiText";
import { fonts, ThemeColors } from "@/theme";
import { LinearGradient } from "expo-linear-gradient";

const isIos = Platform.OS === "ios";

type LayerKey = "pin" | "familyControls" | "vpn" | "accessibility";

const layerLabels = isIos
  ? {
      es: { familyControls: "Family Controls", pin: "PIN" },
      en: { familyControls: "Family Controls", pin: "PIN" },
      fr: { familyControls: "Family Controls", pin: "PIN" },
      pt: { familyControls: "Family Controls", pin: "PIN" },
    } as const
  : {
      es: { accessibility: "Accesibilidad", pin: "PIN", vpn: "VPN local" },
      en: { accessibility: "Accessibility", pin: "PIN", vpn: "Local VPN" },
      fr: { accessibility: "Accessibilité", pin: "PIN", vpn: "VPN local" },
      pt: { accessibility: "Acessibilidade", pin: "PIN", vpn: "VPN local" },
    } as const;

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useAppAppearance();
  const { language } = useI18n();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { checked, enabled } = useShieldGate();
  const [pinReady, setPinReady] = useState(false);
  const [vpnReady, setVpnReady] = useState(false);
  const [accessibilityReady, setAccessibilityReady] = useState(false);
  const [familyControlsReady, setFamilyControlsReady] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    void refreshHomeState();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        void refreshHomeState();
      }
    });

    return () => subscription.remove();
  }, []);

  /* ── Readiness calculation differs by platform ── */
  const totalLayers = isIos ? 2 : 3;
  const readyCount = isIos
    ? [pinReady, familyControlsReady].filter(Boolean).length
    : [pinReady, vpnReady, accessibilityReady].filter(Boolean).length;
  const readiness = readyCount / totalLayers;
  const refugeReady = enabled && readiness === 1;
  const coverageLabel = Math.round(readiness * 100);
  const layers = (layerLabels as unknown as Record<string, Record<string, string>>)[language]
    ?? (layerLabels as unknown as Record<string, Record<string, string>>).en;

  const missingLayers = isIos
    ? [!pinReady ? layers.pin : null, !familyControlsReady ? layers.familyControls : null].filter(Boolean) as string[]
    : [!pinReady ? layers.pin : null, !vpnReady ? layers.vpn : null, !accessibilityReady ? layers.accessibility : null].filter(Boolean) as string[];

  async function refreshHomeState() {
    try {
      if (isIos) {
        const [pinExists, status] = await Promise.all([
          hasPin(),
          iosProtectionService.getProtectionStatus(),
        ]);
        setPinReady(pinExists);
        setFamilyControlsReady(status.isAuthorized);
      } else {
        const [pinExists, vpnActive, accessibilityActive] = await Promise.all([
          hasPin(),
          isLocalDnsVpnActive(),
          isAccessibilityInterventionActive(),
        ]);
        setPinReady(pinExists);
        setVpnReady(vpnActive);
        setAccessibilityReady(accessibilityActive);
      }
    } catch {
      setPinReady(false);
      setVpnReady(false);
      setAccessibilityReady(false);
      setFamilyControlsReady(false);
    }
  }

  async function handleLayerPress(layer: string) {
    if (layer === "pin") {
      router.push("/pin-setup?after=shield-setup");
      return;
    }

    if (isIos) {
      // On iOS, "familyControls" layer → navigate to iOS protection screen
      router.push("/ios-protection");
      return;
    }

    // Android layers
    if (layer === "vpn") {
      await startLocalDnsVpn();
      setTimeout(() => void refreshHomeState(), 900);
      return;
    }

    await openAndroidAccessibilitySettings();
  }

  if (!checked) {
    return <AppLoadingExperience layout="contextual" message={uiText(language, "refuge.loading")} />;
  }


  return (
    <Screen>
      <AppHeader
        eyebrow={uiText(language, "tabs.refuge")}
        icon="shield-sun-outline"
        title="Clean4Jesus"
        subtitle={refugeReady ? uiText(language, "refuge.subtitle.ready") : enabled ? uiText(language, "refuge.subtitle.partial") : uiText(language, "refuge.subtitle.paused")}
      />

      <View>
        <View style={styles.heroShell}>
          <View style={styles.heroAccent} />
          <LinearGradient colors={[colors.surfaceAlt, colors.surface]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroGradient}>
            <View style={styles.heroTop}>
              <View style={styles.heroCopy}>
                <Text style={styles.heroKicker}>{refugeReady ? uiText(language, "refuge.kicker.active") : enabled ? uiText(language, "refuge.kicker.partial") : uiText(language, "refuge.kicker.paused")}</Text>
                <Text style={styles.heroTitle}>{refugeReady ? uiText(language, "refuge.title.ready") : uiText(language, "refuge.title.start")}</Text>
                <Text style={styles.heroBody}>
                  {isIos
                    ? "Protección nativa con Screen Time y Family Controls de Apple. No usa VPN ni Accesibilidad."
                    : uiText(language, "refuge.body")}
                </Text>
              </View>
              <View style={[styles.heroMark, refugeReady && styles.heroMarkActive]}>
                <MaterialCommunityIcons color={refugeReady ? colors.primaryDark : colors.muted} name="shield-cross" size={34} />
              </View>
            </View>

            <View style={styles.progressBlock}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>{uiText(language, "refuge.coverage")}</Text>
                <Text style={styles.progressValue}>{coverageLabel}%</Text>
              </View>
              <ProgressBar color={colors.primary} progress={readiness} style={styles.heroBar} />
            </View>

            <Pressable onPress={() => setDetailsOpen((current) => !current)} style={({ pressed }) => [styles.detailsToggle, pressed && styles.detailsTogglePressed]}>
              <View style={styles.detailsToggleCopy}>
                <Text style={styles.detailsToggleTitle}>{coverageLabel === 100 ? uiText(language, "refuge.layers.ready") : uiText(language, "refuge.layers.show")}</Text>
                <Text style={styles.detailsToggleText}>
                  {coverageLabel === 100 ? uiText(language, "refuge.layers.ready") : uiText(language, "refuge.layers.missing", { items: missingLayers.join(", ") })}
                </Text>
              </View>
              <MaterialCommunityIcons color={colors.primary} name={detailsOpen ? "chevron-up" : "chevron-down"} size={22} />
            </Pressable>

            {detailsOpen ? (
                <View style={styles.layerGridWrap}>
                  <LayerButton label={layers.pin} ready={pinReady} value={pinReady ? uiText(language, "refuge.pin.ready") : uiText(language, "refuge.pin.create")} icon="lock-check-outline" onPress={() => void handleLayerPress("pin")} />
                  {isIos ? (
                    <LayerButton label={layers.familyControls} ready={familyControlsReady} value={familyControlsReady ? "Autorizado" : "Configurar"} icon="apple" onPress={() => void handleLayerPress("familyControls")} />
                  ) : (
                    <>
                      <LayerButton label={layers.vpn} ready={vpnReady} value={vpnReady ? uiText(language, "refuge.vpn.ready") : uiText(language, "refuge.vpn.activate")} icon="shield-outline" onPress={() => void handleLayerPress("vpn")} />
                      <LayerButton label={layers.accessibility} ready={accessibilityReady} value={accessibilityReady ? uiText(language, "refuge.accessibility.ready") : uiText(language, "refuge.accessibility.open")} icon="access-point" onPress={() => void handleLayerPress("accessibility")} />
                    </>
                  )}
                </View>
            ) : null}
          </LinearGradient>
        </View>
      </View>

      <View>
        <PrimaryButton
          label={uiText(language, "refuge.fall.button")}
          onPress={async () => {
            await recordFall();
            Alert.alert(uiText(language, "refuge.fall.title"), uiText(language, "refuge.fall.body"));
          }}
          variant="danger"
        />
      </View>
    </Screen>
  );
}

function LayerButton({
  icon,
  label,
  ready,
  value,
  onPress,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  ready: boolean;
  value: string;
  onPress: () => void;
}) {
  const { colors } = useAppAppearance();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.layerButton, ready && styles.layerButtonReady, pressed && styles.layerButtonPressed]}>
      <View style={[styles.layerIcon, ready && styles.layerIconReady]}>
        <MaterialCommunityIcons color={ready ? colors.success : colors.primary} name={ready ? "check" : icon} size={17} />
      </View>
      <Text numberOfLines={1} style={styles.layerLabel}>{label}</Text>
      <Text numberOfLines={1} style={styles.layerValue}>{value}</Text>
    </Pressable>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  loading: {
    color: colors.muted,
    fontFamily: "Inter_400Regular",
  },
  heroShell: {
    borderRadius: 28,
    overflow: "hidden",
  },
  heroAccent: {
    backgroundColor: colors.primary,
    height: 4,
    width: "100%",
  },
  heroGradient: {
    borderColor: colors.border,
    borderRadius: 28,
    borderWidth: 1,
    gap: 14,
    padding: 16,
  },
  heroTop: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
  },
  heroCopy: {
    flex: 1,
    gap: 6,
  },
  heroKicker: {
    color: colors.primary,
    fontFamily: fonts.label,
    fontSize: 10,
    textTransform: "uppercase",
  },
  heroTitle: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 19,
    lineHeight: 27,
  },
  heroBody: {
    color: colors.muted,
    fontFamily: "Inter_400Regular",
    fontSize: 11.5,
    lineHeight: 17,
  },
  heroMark: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    height: 72,
    justifyContent: "center",
    width: 72,
  },
  heroMarkActive: {
    backgroundColor: "rgba(176, 139, 74, 0.10)",
    borderColor: "rgba(176, 139, 74, 0.28)",
  },
  heroBar: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 999,
    height: 7,
  },
  progressBlock: {
    gap: 6,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressLabel: {
    color: colors.primary,
    fontFamily: fonts.label,
    fontSize: 10,
    textTransform: "uppercase",
  },
  progressValue: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 12,
  },
  detailsToggle: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  detailsTogglePressed: {
    opacity: 0.86,
  },
  detailsToggleCopy: {
    flex: 1,
    gap: 3,
  },
  detailsToggleTitle: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 12,
  },
  detailsToggleText: {
    color: colors.muted,
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    lineHeight: 16,
  },
  layerGridWrap: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
    paddingTop: 2,
  },
  layerButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    flexBasis: 0,
    flexGrow: 1,
    gap: 6,
    justifyContent: "center",
    minHeight: 96,
    paddingHorizontal: 6,
    paddingVertical: 10,
  },
  layerButtonReady: {
    backgroundColor: "rgba(46, 125, 50, 0.08)",
    borderColor: "rgba(46, 125, 50, 0.22)",
  },
  layerButtonPressed: {
    opacity: 0.86,
  },
  layerIcon: {
    alignItems: "center",
    backgroundColor: "rgba(26, 35, 126, 0.08)",
    borderRadius: 999,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  layerIconReady: {
    backgroundColor: "rgba(46, 125, 50, 0.12)",
  },
  layerLabel: {
    color: colors.muted,
    fontFamily: fonts.label,
    fontSize: 8.5,
    letterSpacing: 0.4,
    minHeight: 22,
    textAlign: "center",
    textTransform: "uppercase",
  },
  layerValue: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 12.5,
    textAlign: "center",
  },
  });
}

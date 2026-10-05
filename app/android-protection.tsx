import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, AppState, StyleSheet, Text, View } from "react-native";

import { MaterialCommunityIcons } from "@/components/MaterialCommunityIcon";
import { InfoCard } from "@/components/InfoCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { OfficialBrandMark } from "@/components/OfficialBrandMark";
import { useAppAppearance } from "@/features/appearance/AppearanceProvider";
import { hasPin } from "@/features/pin/pinService";
import { openAndroidAccessibilitySettings } from "@/features/shield/androidProtectionService";
import { enableShield } from "@/features/shield/shieldService";
import {
  isAccessibilityInterventionActive,
  isLocalDnsVpnActive,
  markAccessibilityOnboardingCompleted,
  startLocalDnsVpn,
} from "@/features/shield/localDnsVpnService";
import { fonts, ThemeColors } from "@/theme";

type SetupStep = "vpn" | "accessibility";

export default function AndroidProtectionScreen() {
  const router = useRouter();
  const { step } = useLocalSearchParams<{ step?: SetupStep }>();
  const { colors } = useAppAppearance();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [vpnReady, setVpnReady] = useState(false);
  const [accessibilityReady, setAccessibilityReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const finishingRef = useRef(false);
  const currentStep: SetupStep = step === "accessibility" ? "accessibility" : "vpn";

  const refresh = useCallback(async () => {
    const [vpn, accessibility] = await Promise.all([
      isLocalDnsVpnActive(),
      isAccessibilityInterventionActive(),
    ]);
    setVpnReady(vpn);
    setAccessibilityReady(accessibility);
    return { accessibility, vpn };
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => {
    if (currentStep === "accessibility" && vpnReady && accessibilityReady) {
      void finish({ accessibility: true, vpn: true });
    }
  }, [accessibilityReady, currentStep, vpnReady]);
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active") return;
      void refresh().then((status) => {
        if (currentStep === "accessibility" && status.vpn && status.accessibility) {
          void finish(status);
        }
      });
    });
    return () => subscription.remove();
  }, [currentStep, refresh]);

  async function activateVpn() {
    setBusy(true);
    try {
      const active = await startLocalDnsVpn();
      await refresh();
      if (!active) Alert.alert("La VPN sigue pendiente", "Acepta el aviso de Android y vuelve a Clean4Jesus.");
    } finally {
      setBusy(false);
    }
  }

  async function finish(knownStatus?: { accessibility: boolean; vpn: boolean }) {
    if (finishingRef.current) return;
    finishingRef.current = true;
    setBusy(true);
    try {
      const [pin, status] = await Promise.all([hasPin(), knownStatus ? Promise.resolve(knownStatus) : refresh()]);
      if (!pin || !status.vpn || !status.accessibility) {
        Alert.alert("Aún falta un paso", "Activa la VPN local y Accesibilidad para terminar de preparar tu refugio.");
        return;
      }
      await markAccessibilityOnboardingCompleted();
      await enableShield();
      router.replace("/(tabs)");
    } finally {
      finishingRef.current = false;
      setBusy(false);
    }
  }

  const accessibilityStep = currentStep === "accessibility";
  return (
    <Screen>
      <View style={styles.brandRow}><OfficialBrandMark size={44} /><Text style={styles.brandName}>Clean4Jesus</Text></View>
      <Text style={styles.kicker}>PREPARA TU REFUGIO</Text>
      <Text style={styles.title}>{accessibilityStep ? "Activa Accesibilidad" : "Activa tu VPN local"}</Text>
      <Text style={styles.body}>
        {accessibilityStep
          ? "Este paso permite mostrar la pantalla de interrupción en Chrome y redes sociales. Tus apps bancarias quedan fuera de este alcance."
          : "La VPN local bloquea dominios para adultos. Android mostrará un único aviso: tócala y elige Permitir."}
      </Text>

      <InfoCard tone="outline" style={styles.card}>
        <View style={styles.icon}><MaterialCommunityIcons color={colors.primaryDark} name={accessibilityStep ? "access-point" : "shield-outline"} size={30} /></View>
        {accessibilityStep ? <>
          <Text style={styles.cardTitle}>En Ajustes de Android</Text>
          <Text style={styles.cardBody}>1. Toca “Accesibilidad”.{"\n"}2. Elige Clean4Jesus.{"\n"}3. Activa “Usar Clean4Jesus” y vuelve aquí. Clean4Jesus cuidará automáticamente la compatibilidad al abrir una app bancaria.</Text>
          <PrimaryButton disabled={busy} label="Abrir Accesibilidad" onPress={() => void openAndroidAccessibilitySettings()} />
          <PrimaryButton disabled={busy || !accessibilityReady} label="Entrar a Clean4Jesus" onPress={() => void finish()} />
          {!vpnReady ? <PrimaryButton disabled={busy} label="Volver a activar VPN" onPress={() => router.replace("/android-protection?step=vpn")} variant="ghost" /> : null}
        </> : <>
          <Text style={styles.cardTitle}>Solo un toque</Text>
          <Text style={styles.cardBody}>Toca el botón, acepta el aviso de conexión de Android y regresa automáticamente a este paso.</Text>
          <PrimaryButton disabled={busy || vpnReady} label={vpnReady ? "VPN local activada" : "Activar VPN local"} onPress={() => void activateVpn()} />
          <PrimaryButton disabled={!vpnReady} label="Siguiente: Accesibilidad" onPress={() => router.replace("/android-protection?step=accessibility")} variant="ghost" />
        </>}
      </InfoCard>

      <View style={styles.statusRow}>
        <Status label="VPN local" ready={vpnReady} />
        <Status label="Accesibilidad" ready={accessibilityReady} />
      </View>
    </Screen>
  );
}

function Status({ label, ready }: { label: string; ready: boolean }) {
  const { colors } = useAppAppearance();
  return <View style={{ alignItems: "center", flexDirection: "row", gap: 7 }}><MaterialCommunityIcons color={ready ? colors.success : colors.muted} name={ready ? "check-circle" : "circle-outline"} size={18} /><Text style={{ color: colors.text, fontFamily: fonts.heading, fontSize: 12 }}>{label}</Text></View>;
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    brandRow: { alignItems: "center", flexDirection: "row", gap: 10, marginBottom: 8 },
    brandName: { color: colors.text, fontFamily: fonts.heading, fontSize: 20 },
    kicker: { color: colors.accent, fontFamily: fonts.label, fontSize: 11, letterSpacing: 1.3 },
    title: { color: colors.text, fontFamily: fonts.display, fontSize: 30, lineHeight: 38, marginTop: 9 },
    body: { color: colors.muted, fontFamily: fonts.body, fontSize: 15, lineHeight: 23, marginTop: 10 },
    card: { gap: 15, marginTop: 28, padding: 21 },
    icon: { alignItems: "center", backgroundColor: colors.accentSoft, borderRadius: 18, height: 60, justifyContent: "center", width: 60 },
    cardTitle: { color: colors.text, fontFamily: fonts.display, fontSize: 21 },
    cardBody: { color: colors.muted, fontFamily: fonts.body, fontSize: 14, lineHeight: 22 },
    statusRow: { gap: 14, marginTop: 24 },
  });
}

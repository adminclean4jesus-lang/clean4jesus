import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, AppState, StyleSheet, Text, View } from "react-native";

import { MaterialCommunityIcons } from "@/components/MaterialCommunityIcon";
import { InfoCard } from "@/components/InfoCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { useAppAppearance } from "@/features/appearance/AppearanceProvider";
import { hasPin } from "@/features/pin/pinService";
import { openAndroidAccessibilitySettings } from "@/features/shield/androidProtectionService";
import { enableShield } from "@/features/shield/shieldService";
import { isAccessibilityInterventionActive, isLocalDnsVpnActive, startLocalDnsVpn } from "@/features/shield/localDnsVpnService";
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
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void refresh();
    });
    return () => subscription.remove();
  }, [refresh]);

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

  async function finish() {
    setBusy(true);
    try {
      const [pin, status] = await Promise.all([hasPin(), refresh()]);
      if (!pin || !status.vpn || !status.accessibility) {
        Alert.alert("Aún falta un paso", "Activa la VPN local y Accesibilidad para terminar de preparar tu refugio.");
        return;
      }
      await enableShield();
      router.replace("/(tabs)");
    } finally {
      setBusy(false);
    }
  }

  const accessibilityStep = currentStep === "accessibility";
  return (
    <Screen>
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
          <Text style={styles.cardBody}>1. Toca “Accesibilidad”.{"\n"}2. Elige Clean4Jesus.{"\n"}3. Activa “Usar Clean4Jesus” y vuelve aquí.</Text>
          <PrimaryButton disabled={busy} label="Abrir Accesibilidad" onPress={() => void openAndroidAccessibilitySettings()} />
          <PrimaryButton disabled={busy || !accessibilityReady} label="Entrar a Clean4Jesus" onPress={() => void finish()} />
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

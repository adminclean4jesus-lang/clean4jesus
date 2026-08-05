import { MaterialCommunityIcons } from "@/components/MaterialCommunityIcon";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Alert, InteractionManager, Pressable, StyleSheet, Text, View } from "react-native";

import { InfoCard } from "@/components/InfoCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { useAppAppearance } from "@/features/appearance/AppearanceProvider";
import { useI18n } from "@/features/i18n/I18nProvider";
import { SupportedLanguage } from "@/features/i18n/i18n";
import {
  iosProtectionNativeContract,
  IosNativeAuthorization,
  IosRefugeStatus,
  IosSelectionSummary,
} from "@/features/iosProtection/iosProtectionContract";
import { hasPin } from "@/features/pin/pinService";
import { fonts, ThemeColors } from "@/theme";

const emptySelection = { applications: 0, categories: 0, webDomains: 0 };
const emptyStatus = { monitoringActive: false, shieldActive: false, usageLimitMinutes: 0, webFilterActive: false };
const limitOptions = [30, 60, 90] as const;

const copy = {
  es: {
    eyebrow: "Primer Refugio real para iPhone", title: "Protección que acompaña, no te encierra",
    body: "Clean4Jesus activa el filtro adulto de Apple y aplica una pausa personalizada cuando completas el tiempo que elegiste para apps y categorías vulnerables.",
    authorize: "1. Autorizar Tiempo en Pantalla", choose: "2. Elegir apps y categorías", limit: "3. Elegir límite diario", activate: "Activar con PIN", deactivate: "Pausar con PIN",
    allowed: "Autorizado", pending: "Pendiente", active: "Refugio iOS activo", inactive: "Refugio iOS en pausa", reached: "Límite alcanzado: la pantalla de protección está activa.",
    webOn: "Filtro web adulto activo", webOff: "Filtro web pendiente", monitoringOn: "Límite diario activo", monitoringOff: "Límite diario pendiente",
    apps: "apps", categories: "categorías", sites: "sitios", minutes: "minutos", pinReady: "PIN listo", pinMissing: "Falta crear el PIN", createPin: "Crear PIN de protección",
    close: "Entrar a Clean4Jesus", failure: "No pudimos completar este paso. Revisa Tiempo en Pantalla e inténtalo otra vez.",
    privacy: "Los nombres elegidos permanecen en tokens privados de Apple. Clean4Jesus no recibe texto, URLs ni historial.",
  },
  en: {
    eyebrow: "First real Refuge for iPhone", title: "Protection that supports without locking you in",
    body: "Clean4Jesus enables Apple's adult web filter and shows a personalized pause when you complete the time selected for vulnerable apps and categories.",
    authorize: "1. Authorize Screen Time", choose: "2. Choose apps and categories", limit: "3. Choose a daily limit", activate: "Activate with PIN", deactivate: "Pause with PIN",
    allowed: "Authorized", pending: "Pending", active: "iOS Refuge active", inactive: "iOS Refuge paused", reached: "Limit reached: the protection screen is active.",
    webOn: "Adult web filter active", webOff: "Web filter pending", monitoringOn: "Daily limit active", monitoringOff: "Daily limit pending",
    apps: "apps", categories: "categories", sites: "websites", minutes: "minutes", pinReady: "PIN ready", pinMissing: "Protection PIN missing", createPin: "Create protection PIN",
    close: "Enter Clean4Jesus", failure: "We could not complete this step. Check Screen Time and try again.",
    privacy: "Your choices remain private Apple tokens. Clean4Jesus receives no text, URLs, or browsing history.",
  },
  fr: {
    eyebrow: "Premier Refuge réel sur iPhone", title: "Une protection qui accompagne sans enfermer",
    body: "Clean4Jesus active le filtre adulte d’Apple et affiche une pause personnalisée lorsque la durée choisie pour les apps vulnérables est atteinte.",
    authorize: "1. Autoriser Temps d’écran", choose: "2. Choisir apps et catégories", limit: "3. Choisir une limite quotidienne", activate: "Activer avec le PIN", deactivate: "Suspendre avec le PIN",
    allowed: "Autorisé", pending: "En attente", active: "Refuge iOS actif", inactive: "Refuge iOS suspendu", reached: "Limite atteinte : l’écran de protection est actif.",
    webOn: "Filtre web adulte actif", webOff: "Filtre web en attente", monitoringOn: "Limite quotidienne active", monitoringOff: "Limite quotidienne en attente",
    apps: "apps", categories: "catégories", sites: "sites", minutes: "minutes", pinReady: "PIN prêt", pinMissing: "PIN de protection manquant", createPin: "Créer le PIN de protection",
    close: "Entrer dans Clean4Jesus", failure: "Cette étape n’a pas abouti. Vérifiez Temps d’écran et réessayez.",
    privacy: "Vos choix restent des jetons Apple privés. Clean4Jesus ne reçoit aucun texte, URL ou historique.",
  },
  pt: {
    eyebrow: "Primeiro Refúgio real no iPhone", title: "Proteção que acompanha sem prender você",
    body: "Clean4Jesus ativa o filtro adulto da Apple e mostra uma pausa personalizada quando termina o tempo escolhido para apps e categorias vulneráveis.",
    authorize: "1. Autorizar Tempo de Uso", choose: "2. Escolher apps e categorias", limit: "3. Escolher limite diário", activate: "Ativar com PIN", deactivate: "Pausar com PIN",
    allowed: "Autorizado", pending: "Pendente", active: "Refúgio iOS ativo", inactive: "Refúgio iOS pausado", reached: "Limite atingido: a tela de proteção está ativa.",
    webOn: "Filtro web adulto ativo", webOff: "Filtro web pendente", monitoringOn: "Limite diário ativo", monitoringOff: "Limite diário pendente",
    apps: "apps", categories: "categorias", sites: "sites", minutes: "minutos", pinReady: "PIN pronto", pinMissing: "Falta criar o PIN", createPin: "Criar PIN de proteção",
    close: "Entrar no Clean4Jesus", failure: "Não foi possível concluir esta etapa. Confira o Tempo de Uso e tente novamente.",
    privacy: "Suas escolhas permanecem como tokens privados da Apple. Clean4Jesus não recebe texto, URLs nem histórico.",
  },
} satisfies Record<SupportedLanguage, Record<string, string>>;

export default function IosProtectionScreen() {
  const router = useRouter();
  const { colors } = useAppAppearance();
  const { language } = useI18n();
  const t = copy[language];
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [authorization, setAuthorization] = useState<IosNativeAuthorization>("not-determined");
  const [selection, setSelection] = useState<IosSelectionSummary>(emptySelection);
  const [status, setStatus] = useState<IosRefugeStatus>(emptyStatus);
  const [limit, setLimit] = useState(60);
  const [pinReady, setPinReady] = useState(false);
  const [busy, setBusy] = useState(true);

  const refresh = useCallback(async () => {
    try {
      // Keep native module and Keychain calls off the same startup turn. On
      // physical iPhones concurrent TurboModule responses can race Fabric's
      // initial mount, so each read is deliberately awaited before the next.
      const nextAuthorization = await iosProtectionNativeContract.getAuthorizationStatus().catch(() => "unavailable" as const);
      const nextSelection = await iosProtectionNativeContract.getSelectionSummary().catch(() => emptySelection);
      const nextStatus = await iosProtectionNativeContract.getRefugeStatus().catch(() => emptyStatus);
      const nextPinReady = await hasPin().catch(() => false);
      const rescueRequested = await iosProtectionNativeContract.consumeRescueRequest().catch(() => false);
      setAuthorization(nextAuthorization);
      setSelection(nextSelection);
      setStatus(nextStatus);
      setPinReady(nextPinReady);
      if (nextStatus.usageLimitMinutes > 0) setLimit(nextStatus.usageLimitMinutes);
      if (nextAuthorization !== "unavailable") {
        await iosProtectionNativeContract.setLanguage(language).catch(() => undefined);
      }
      if (rescueRequested) router.push("/ios-rescue");
    } catch {
      // Startup diagnostics must never prevent the rest of the app from opening.
    } finally {
      setBusy(false);
    }
  }, [language, router]);

  useFocusEffect(useCallback(() => {
    const task = InteractionManager.runAfterInteractions(() => { void refresh(); });
    return () => task.cancel();
  }, [refresh]));

  const run = async (task: () => Promise<void>) => {
    setBusy(true);
    try {
      await task();
      await refresh();
    } catch {
      Alert.alert("Clean4Jesus", t.failure);
    } finally {
      setBusy(false);
    }
  };

  const activate = () => {
    if (!pinReady) {
      router.push("/pin-setup?after=ios-refuge");
      return;
    }
    router.push(`/pin-verify?action=activate-ios-refuge&minutes=${limit}`);
  };

  const active = status.monitoringActive && status.webFilterActive;
  const selectionCount = selection.applications + selection.categories + selection.webDomains;

  return (
    <Screen>
      <View style={styles.hero}>
        <View style={styles.icon}><MaterialCommunityIcons color={colors.primary} name="shield-lock-outline" size={32} /></View>
        <Text style={styles.eyebrow}>{t.eyebrow}</Text>
        <Text style={styles.title}>{t.title}</Text>
        <Text style={styles.body}>{t.body}</Text>
      </View>

      <InfoCard tone={active ? "lime" : "outline"} style={styles.statusCard}>
        <MaterialCommunityIcons color={active ? colors.success : colors.muted} name={active ? "shield-check" : "shield-outline"} size={25} />
        <View style={styles.statusCopy}>
          <Text style={styles.statusTitle}>{active ? t.active : t.inactive}</Text>
          <Text style={styles.statusDetail}>{selection.applications} {t.apps} · {selection.categories} {t.categories} · {selection.webDomains} {t.sites}</Text>
          {status.shieldActive ? <Text style={styles.reached}>{t.reached}</Text> : null}
        </View>
        {busy && <ActivityIndicator color={colors.primary} />}
      </InfoCard>

      <InfoCard tone="light" style={styles.steps}>
        <StatusRow label={t.authorize} ready={authorization === "approved"} value={authorization === "approved" ? t.allowed : t.pending} />
        <PrimaryButton disabled={busy || authorization === "approved"} label={t.authorize} onPress={() => run(async () => { await iosProtectionNativeContract.requestAuthorization(); })} variant="ghost" />

        <StatusRow label={t.choose} ready={selectionCount > 0} value={selectionCount > 0 ? `${selectionCount}` : t.pending} />
        <PrimaryButton disabled={busy || authorization !== "approved" || active} label={t.choose} onPress={() => run(async () => { setSelection(await iosProtectionNativeContract.presentFamilyActivityPicker()); })} variant="ghost" />

        <Text style={styles.sectionLabel}>{t.limit}</Text>
        <View style={styles.limitRow}>
          {limitOptions.map((minutes) => (
            <Pressable key={minutes} disabled={active} onPress={() => setLimit(minutes)} style={[styles.limitChip, limit === minutes && styles.limitChipActive, active && styles.limitChipDisabled]}>
              <Text style={[styles.limitText, limit === minutes && styles.limitTextActive]}>{minutes} {t.minutes}</Text>
            </Pressable>
          ))}
        </View>

        <StatusRow label={status.webFilterActive ? t.webOn : t.webOff} ready={status.webFilterActive} value={status.webFilterActive ? t.allowed : t.pending} />
        <StatusRow label={status.monitoringActive ? t.monitoringOn : t.monitoringOff} ready={status.monitoringActive} value={status.monitoringActive ? `${status.usageLimitMinutes} ${t.minutes}` : t.pending} />
        <StatusRow label={pinReady ? t.pinReady : t.pinMissing} ready={pinReady} value={pinReady ? t.allowed : t.pending} />

        {!pinReady ? <PrimaryButton disabled={busy} label={t.createPin} onPress={() => router.push("/pin-setup?after=ios-refuge")} variant="ghost" /> : null}
        {!active ? (
          <PrimaryButton disabled={busy || authorization !== "approved" || selectionCount === 0} label={t.activate} onPress={activate} />
        ) : (
          <PrimaryButton disabled={busy} label={t.deactivate} onPress={() => router.push("/pin-verify?action=disable-ios-refuge")} variant="danger" />
        )}
      </InfoCard>

      <InfoCard tone="outline"><Text style={styles.privacy}>{t.privacy}</Text></InfoCard>
      <PrimaryButton label={t.close} onPress={() => router.replace("/(tabs)")} variant="ghost" />
    </Screen>
  );
}

function StatusRow({ label, ready, value }: { label: string; ready: boolean; value: string }) {
  const { colors } = useAppAppearance();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.row}>
      <View style={styles.rowLabel}>
        <MaterialCommunityIcons color={ready ? colors.success : colors.muted} name={ready ? "check-circle" : "circle-outline"} size={17} />
        <Text style={styles.rowTitle}>{label}</Text>
      </View>
      <Text style={styles.badge}>{value}</Text>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    badge: { color: colors.primary, fontFamily: fonts.heading, fontSize: 11, maxWidth: "36%", textAlign: "right" },
    body: { color: colors.muted, fontFamily: fonts.body, fontSize: 14, lineHeight: 21 },
    eyebrow: { color: colors.primary, fontFamily: fonts.label, fontSize: 11, letterSpacing: 0.8, textTransform: "uppercase" },
    hero: { gap: 9, paddingTop: 8 },
    icon: { alignItems: "center", backgroundColor: colors.surfaceAlt, borderRadius: 18, height: 60, justifyContent: "center", width: 60 },
    limitChip: { alignItems: "center", backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 15, borderWidth: 1, flex: 1, paddingVertical: 11 },
    limitChipActive: { backgroundColor: colors.primaryDark, borderColor: colors.primaryDark },
    limitChipDisabled: { opacity: 0.65 },
    limitRow: { flexDirection: "row", gap: 8 },
    limitText: { color: colors.primaryDark, fontFamily: fonts.heading, fontSize: 11 },
    limitTextActive: { color: colors.onPrimary },
    privacy: { color: colors.muted, fontFamily: fonts.body, fontSize: 12, lineHeight: 18 },
    reached: { color: colors.danger, fontFamily: fonts.heading, fontSize: 11, lineHeight: 16, paddingTop: 3 },
    row: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", gap: 10 },
    rowLabel: { alignItems: "center", flexDirection: "row", flex: 1, gap: 7 },
    rowTitle: { color: colors.text, flex: 1, fontFamily: fonts.heading, fontSize: 13 },
    sectionLabel: { color: colors.primary, fontFamily: fonts.label, fontSize: 11, letterSpacing: 0.6, textTransform: "uppercase" },
    statusCard: { alignItems: "center", flexDirection: "row", gap: 12 },
    statusCopy: { flex: 1, gap: 2 },
    statusDetail: { color: colors.muted, fontFamily: fonts.body, fontSize: 11 },
    statusTitle: { color: colors.text, fontFamily: fonts.heading, fontSize: 15 },
    steps: { gap: 12 },
    title: { color: colors.text, fontFamily: fonts.display, fontSize: 26, lineHeight: 32 },
  });
}

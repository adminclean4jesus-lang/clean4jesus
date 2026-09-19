import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Card } from "react-native-paper";

import { MaterialCommunityIcons } from "@/components/MaterialCommunityIcon";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { useAppAppearance } from "@/features/appearance/AppearanceProvider";
import { useAuth } from "@/features/auth/AuthProvider";
import { cancelGuardianPinRequest, getGuardianPinRequestStatus, GuardianPinError, GuardianPinRequestStatus, requestGuardianPin, syncConfirmedGuardianPin } from "@/features/pin/guardianPinService";
import { hasPin, verifyPin } from "@/features/pin/pinService";
import { normalizePinInput, pinLength } from "@/features/pin/pinValidation";
import { fonts } from "@/theme";

export default function PinSetupScreen() {
  const router = useRouter();
  const { after } = useLocalSearchParams<{ after?: string }>();
  const styles = useStyles();
  const { colors } = useAppAppearance();
  const { status: authStatus } = useAuth();
  const [email, setEmail] = useState("");
  const [currentPin, setCurrentPin] = useState("");
  const [pinExists, setPinExists] = useState(false);
  const [status, setStatus] = useState<GuardianPinRequestStatus | null>(null);
  const [busy, setBusy] = useState(true);

  const refresh = useCallback(async () => {
    setBusy(true);
    try {
      const [exists, nextStatus] = await Promise.all([hasPin(), getGuardianPinRequestStatus()]);
      setPinExists(exists);
      setStatus(nextStatus);
    } catch {
      setStatus(null);
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  useEffect(() => {
    if (authStatus === "anonymous" || authStatus === "unconfigured") {
      router.replace("/");
    }
  }, [authStatus, router]);

  function continueAfterSetup() {
    router.replace(after === "shield-setup" ? "/?setup=1" : after === "ios-limit-configured" ? "/ios-protection" : "/");
  }

  async function send() {
    if (!email.trim()) return;
    setBusy(true);
    try {
      if (pinExists && !(await verifyPin(currentPin))) {
        Alert.alert("PIN actual incorrecto", "Pídele a tu persona de confianza el PIN vigente para cambiarlo.");
        setCurrentPin("");
        return;
      }
      setStatus(await requestGuardianPin(email));
      Alert.alert("Correo enviado", "Tu persona de confianza debe confirmar el correo. El PIN se generará y llegará únicamente a esa persona.");
    } catch (error) {
      if (error instanceof GuardianPinError && error.code === "sign_in_required") {
        Alert.alert("Primero protege tu cuenta", "Para guardar este PIN de forma segura, crea o inicia sesión en Clean4Jesus.", [{ text: "Ir al acceso", onPress: () => router.replace("/") }]);
      } else if (error instanceof GuardianPinError && error.code === "invalid_email") {
        Alert.alert("Revisa el correo", "Escribe una dirección completa y válida para tu persona de confianza.");
      } else if (error instanceof GuardianPinError && error.code === "backend_not_ready") {
        Alert.alert("Actualización del servicio pendiente", "La app está lista, pero el servicio seguro del PIN todavía no está actualizado. No se creó ninguna solicitud.");
      } else if (error instanceof GuardianPinError && error.code === "email_delivery_not_configured") {
        Alert.alert("Entrega de correo en preparación", "El servicio seguro de envío aún no está configurado. No se creó ningún PIN ni se guardó tu correo.");
      } else if (error instanceof GuardianPinError && error.code === "email_delivery_failed") {
        Alert.alert("El correo fue rechazado", "El proveedor no pudo entregar la solicitud. No se creó ningún PIN ni quedó una solicitud pendiente. Inténtalo de nuevo en unos minutos.");
      } else if (error instanceof GuardianPinError && error.code === "rate_limited") {
        Alert.alert("Límite de seguridad", "Ya alcanzaste el límite de tres solicitudes en 24 horas. Inténtalo de nuevo mañana.");
      } else {
        Alert.alert("No pudimos enviar el correo", "Comprueba la conexión y la dirección. No se creó ningún PIN.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function checkConfirmation() {
    setBusy(true);
    try {
      if (await syncConfirmedGuardianPin()) {
        Alert.alert("PIN protegido", "Tu persona de confianza ya tiene el PIN. La protección quedó configurada.", [{ text: "Continuar", onPress: continueAfterSetup }]);
        return;
      }
      await refresh();
      Alert.alert("Aún pendiente", "La persona elegida todavía debe confirmar el correo.");
    } catch {
      Alert.alert("No pudimos verificar", "Comprueba tu conexión e inténtalo de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  async function cancel() {
    setBusy(true);
    try {
      await cancelGuardianPinRequest();
      await refresh();
    } catch {
      Alert.alert("No pudimos cancelar", "Inténtalo nuevamente.");
    } finally {
      setBusy(false);
    }
  }

  const pending = status?.status === "pending";
  return (
    <Screen>
      <View style={styles.progressRow}>
        <ProgressStep complete label="Cuenta" number="1" />
        <View style={styles.progressLine} />
        <ProgressStep active label="Confianza" number="2" />
        <View style={styles.progressLine} />
        <ProgressStep label="Protección" number="3" />
      </View>
      <View style={styles.header}>
        <Text style={styles.kicker}>SEGURIDAD ACOMPAÑADA</Text>
        <Text style={styles.title}>{pinExists ? "Cambia tu persona de confianza" : "Protege tus decisiones con compañía"}</Text>
        <Text style={styles.subtitle}>No creas este PIN. Elige a una persona de confianza: ella confirma su correo y recibe el PIN de protección.</Text>
      </View>
      <View style={styles.trustBanner}>
        <View style={styles.trustMark}>
          <MaterialCommunityIcons color={colors.primaryDark} name="account-heart-outline" size={28} />
        </View>
        <View style={styles.trustCopy}>
          <Text style={styles.trustEyebrow}>UN PIN QUE NO VIVE CONTIGO</Text>
          <Text style={styles.trustTitle}>Tu persona de confianza lo guarda por ti.</Text>
          <Text style={styles.trustBody}>Clean4Jesus lo genera de forma segura después de que esa persona confirma la solicitud.</Text>
        </View>
      </View>
      <Card mode="elevated" style={styles.card}>
        <Card.Content style={styles.form}>
          <View style={styles.icon}><MaterialCommunityIcons color={colors.primaryDark} name="shield-account-outline" size={24} /></View>
          {pending ? <>
            <Text style={styles.cardTitle}>Esperando confirmación</Text>
            <Text style={styles.body}>El enlace expira el {status?.expiresAt ? new Date(status.expiresAt).toLocaleString() : "pronto"}. Cuando esa persona confirme, recibirá el PIN en su correo.</Text>
            <PrimaryButton disabled={busy} label="Ya confirmó: revisar" onPress={() => void checkConfirmation()} />
            <PrimaryButton disabled={busy} label="Cancelar solicitud" onPress={() => void cancel()} variant="ghost" />
          </> : <>
            <Text style={styles.cardTitle}>{pinExists ? "Envía un nuevo PIN protegido" : "¿Quién guardará el PIN?"}</Text>
            <Text style={styles.body}>Solo compartiremos el PIN con esta dirección después de que acepte acompañarte. Puede rechazar o ignorar la solicitud.</Text>
            {pinExists ? <TextInput accessibilityLabel="PIN actual" caretHidden inputMode="numeric" keyboardType="number-pad" maxLength={pinLength} onChangeText={(value) => setCurrentPin(normalizePinInput(value))} placeholder="PIN actual" placeholderTextColor={colors.mutedDark} secureTextEntry style={styles.input} value={currentPin} /> : null}
            <TextInput accessibilityLabel="Correo de la persona de confianza" autoCapitalize="none" autoComplete="email" keyboardType="email-address" onChangeText={setEmail} placeholder="persona@correo.com" placeholderTextColor={colors.mutedDark} style={styles.input} value={email} />
            <PrimaryButton disabled={busy || !email.trim() || (pinExists && !currentPin)} label={busy ? "Preparando..." : "Enviar solicitud"} onPress={() => void send()} />
          </>}
        </Card.Content>
      </Card>
      <Text style={styles.footnote}>El PIN no aparecerá en este teléfono ni se guardará como texto. Para cambiarlo después, necesitarás el PIN vigente.</Text>
    </Screen>
  );
}

function ProgressStep({ active = false, complete = false, label, number }: { active?: boolean; complete?: boolean; label: string; number: string }) {
  const { colors } = useAppAppearance();
  const styles = useStyles();
  return (
    <View style={styles.progressStep}>
      <View style={[styles.progressDot, (active || complete) && styles.progressDotActive]}>
        <Text style={[styles.progressNumber, (active || complete) && { color: colors.surface }]}>{complete ? "✓" : number}</Text>
      </View>
      <Text style={[styles.progressLabel, active && styles.progressLabelActive]}>{label}</Text>
    </View>
  );
}

function useStyles() {
  const { colors } = useAppAppearance();
  return useMemo(() => StyleSheet.create({
    progressRow: { alignItems: "flex-start", flexDirection: "row", marginBottom: 10 },
    progressStep: { alignItems: "center", gap: 5, width: 72 },
    progressLine: { backgroundColor: colors.border, flex: 1, height: 1, marginTop: 15 },
    progressDot: { alignItems: "center", backgroundColor: colors.surfaceAlt, borderColor: colors.border, borderRadius: 999, borderWidth: 1, height: 30, justifyContent: "center", width: 30 },
    progressDotActive: { backgroundColor: colors.primaryDark, borderColor: colors.primaryDark },
    progressNumber: { color: colors.muted, fontFamily: fonts.heading, fontSize: 11 },
    progressLabel: { color: colors.muted, fontFamily: fonts.label, fontSize: 9 },
    progressLabelActive: { color: colors.primaryDark, fontFamily: fonts.heading },
    header: { gap: 8 }, kicker: { color: colors.accent, fontFamily: fonts.label, fontSize: 11, letterSpacing: 1 },
    title: { color: colors.text, fontFamily: fonts.display, fontSize: 28, lineHeight: 35 }, subtitle: { color: colors.muted, fontFamily: fonts.body, fontSize: 14, lineHeight: 22 },
    trustBanner: { alignItems: "center", backgroundColor: colors.primaryDark, borderRadius: 20, flexDirection: "row", gap: 14, padding: 18 },
    trustMark: { alignItems: "center", backgroundColor: colors.accentSoft, borderRadius: 999, height: 56, justifyContent: "center", width: 56 },
    trustCopy: { flex: 1, gap: 4 },
    trustEyebrow: { color: colors.accent, fontFamily: fonts.label, fontSize: 9, letterSpacing: 1 },
    trustTitle: { color: "#FFFFFF", fontFamily: fonts.heading, fontSize: 15, lineHeight: 20 },
    trustBody: { color: "rgba(255,255,255,0.72)", fontFamily: fonts.body, fontSize: 11.5, lineHeight: 17 },
    card: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 20, borderWidth: 1 }, form: { gap: 14, paddingVertical: 6 },
    icon: { alignItems: "center", alignSelf: "flex-start", backgroundColor: colors.accentSoft, borderRadius: 999, height: 48, justifyContent: "center", width: 48 },
    cardTitle: { color: colors.text, fontFamily: fonts.display, fontSize: 20 }, body: { color: colors.muted, fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 20 },
    input: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 14, borderWidth: 1, color: colors.text, fontFamily: fonts.bodyMedium, fontSize: 15, minHeight: 54, paddingHorizontal: 16 },
    footnote: { color: colors.muted, fontFamily: "Inter_400Regular", fontSize: 11.5, lineHeight: 17 },
  }), [colors]);
}

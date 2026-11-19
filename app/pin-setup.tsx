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
  const [statusUnavailable, setStatusUnavailable] = useState(false);
  const [restoreError, setRestoreError] = useState(false);
  const [replacingPin, setReplacingPin] = useState(false);

  const refresh = useCallback(async () => {
    setBusy(true);
    setStatusUnavailable(false);
    setRestoreError(false);
    try {
      let exists = await hasPin();
      const nextStatus = await getGuardianPinRequestStatus();
      if (!exists && nextStatus.status === "confirmed") {
        try {
          exists = await syncConfirmedGuardianPin();
        } catch {
          setRestoreError(true);
        }
      }
      setPinExists(exists);
      setStatus(nextStatus);
    } catch {
      setStatus(null);
      setStatusUnavailable(true);
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
    router.replace(after === "shield-setup" ? "/android-protection?step=vpn" : after === "ios-limit-configured" ? "/ios-protection" : "/");
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
      setReplacingPin(false);
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
        Alert.alert("No pudimos enviar el correo", "El proveedor pidió esperar un momento antes de reintentar. No se creó ninguna solicitud.");
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
        setPinExists(true);
        setRestoreError(false);
        Alert.alert("PIN protegido", "Tu PIN ya está activo en este teléfono.");
        return;
      }
      await refresh();
      Alert.alert("Aún pendiente", "La persona elegida todavía debe confirmar el correo. No necesitas crear otra solicitud.");
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
  const confirmed = status?.status === "confirmed";
  const expired = status?.status === "expired";
  const canRequestReplacement = !busy
    && !statusUnavailable
    && !confirmed
    && !pending
    && (!pinExists || Boolean(currentPin));
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
          {busy && !status ? <>
            <Text style={styles.cardTitle}>Recuperando tu PIN protegido</Text>
            <Text style={styles.body}>Estamos verificando si ya hay una solicitud pendiente o un PIN activo en tu cuenta.</Text>
          </> : statusUnavailable ? <>
            <Text style={styles.cardTitle}>No pudimos verificar tu PIN</Text>
            <Text style={styles.body}>No crearemos una solicitud nueva hasta recuperar el estado seguro de tu cuenta. Comprueba tu conexión e inténtalo de nuevo.</Text>
            <PrimaryButton disabled={busy} label="Reintentar" onPress={() => void refresh()} />
          </> : pinExists && !replacingPin ? <>
            <Text style={styles.cardTitle}>Tu PIN ya está protegido</Text>
            <Text style={styles.body}>Ya existe un PIN activo para esta cuenta. No necesitas volver a escribir el correo de tu persona de confianza.</Text>
            <PrimaryButton disabled={busy} label="Continuar" onPress={continueAfterSetup} />
            <PrimaryButton disabled={busy} label="Cambiar PIN o persona" onPress={() => setReplacingPin(true)} variant="ghost" />
          </> : confirmed ? <>
            <Text style={styles.cardTitle}>Tu persona ya confirmó</Text>
            <Text style={styles.body}>{restoreError ? "El PIN está confirmado, pero este teléfono no pudo activarlo todavía. Vuelve a intentarlo con conexión." : "Estamos activando el PIN confirmado en este teléfono."}</Text>
            <PrimaryButton disabled={busy} label={restoreError ? "Activar este teléfono" : "Revisar PIN activo"} onPress={() => void checkConfirmation()} />
          </> : pending ? <>
            <Text style={styles.cardTitle}>Esperando confirmación</Text>
            <Text style={styles.body}>La solicitud a {status?.guardianEmail ?? "tu persona de confianza"} sigue activa. {formatExpiry(status?.expiresAt)}. Cuando confirme, el PIN quedará disponible sin que tengas que iniciar el proceso otra vez.</Text>
            <PrimaryButton disabled={busy} label="Ya confirmó: revisar" onPress={() => void checkConfirmation()} />
            <PrimaryButton disabled={busy} label="Cancelar solicitud" onPress={() => void cancel()} variant="ghost" />
          </> : <>
            <Text style={styles.cardTitle}>{replacingPin ? "Cambia tu PIN protegido" : expired ? "La solicitud de PIN venció" : "¿Quién guardará el PIN?"}</Text>
            {expired ? <Text style={styles.body}>La solicitud anterior {status?.guardianEmail ? `para ${status.guardianEmail} ` : ""}venció. Puedes enviar una nueva cuando quieras.</Text> : null}
            <Text style={styles.body}>Solo compartiremos el PIN con esta dirección después de que acepte acompañarte. Puede rechazar o ignorar la solicitud.</Text>
            {replacingPin ? <TextInput accessibilityLabel="PIN actual" caretHidden inputMode="numeric" keyboardType="number-pad" maxLength={pinLength} onChangeText={(value) => setCurrentPin(normalizePinInput(value))} placeholder="PIN actual" placeholderTextColor={colors.mutedDark} secureTextEntry style={styles.input} value={currentPin} /> : null}
            <TextInput accessibilityLabel="Correo de la persona de confianza" autoCapitalize="none" autoComplete="email" keyboardType="email-address" onChangeText={setEmail} placeholder="persona@correo.com" placeholderTextColor={colors.mutedDark} style={styles.input} value={email} />
            <PrimaryButton disabled={!canRequestReplacement || !email.trim()} label={busy ? "Preparando..." : expired ? "Enviar nueva solicitud" : "Enviar solicitud"} onPress={() => void send()} />
          </>}
        </Card.Content>
      </Card>
      <Text style={styles.footnote}>El PIN no aparecerá en este teléfono ni se guardará como texto. Para cambiarlo después, necesitarás el PIN vigente.</Text>
    </Screen>
  );
}

function formatExpiry(expiresAt: string | null | undefined) {
  if (!expiresAt) return "El enlace vence pronto";
  const expires = new Date(expiresAt);
  const remainingMs = expires.getTime() - Date.now();
  if (remainingMs <= 0) return `El enlace venció el ${expires.toLocaleString()}`;
  const remainingMinutes = Math.ceil(remainingMs / 60_000);
  const remaining = remainingMinutes < 60
    ? `${remainingMinutes} min`
    : `${Math.ceil(remainingMinutes / 60)} h`;
  return `Vence el ${expires.toLocaleString()} (faltan aprox. ${remaining})`;
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

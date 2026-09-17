import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Card } from "react-native-paper";

import { MaterialCommunityIcons } from "@/components/MaterialCommunityIcon";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { useAppAppearance } from "@/features/appearance/AppearanceProvider";
import { cancelGuardianPinRequest, getGuardianPinRequestStatus, GuardianPinRequestStatus, requestGuardianPin, syncConfirmedGuardianPin } from "@/features/pin/guardianPinService";
import { hasPin, verifyPin } from "@/features/pin/pinService";
import { normalizePinInput, pinLength } from "@/features/pin/pinValidation";
import { fonts } from "@/theme";

export default function PinSetupScreen() {
  const router = useRouter();
  const { after } = useLocalSearchParams<{ after?: string }>();
  const styles = useStyles();
  const { colors } = useAppAppearance();
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
    } catch {
      Alert.alert("No pudimos enviar el correo", "Revisa la dirección e inténtalo de nuevo más tarde.");
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
      <View style={styles.header}>
        <Text style={styles.kicker}>SEGURIDAD ACOMPAÑADA</Text>
        <Text style={styles.title}>{pinExists ? "Cambia tu persona de confianza" : "Protege tus decisiones con compañía"}</Text>
        <Text style={styles.subtitle}>No creas este PIN. Elige a una persona de confianza: ella confirma su correo y recibe el PIN de protección.</Text>
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

function useStyles() {
  const { colors } = useAppAppearance();
  return useMemo(() => StyleSheet.create({
    header: { gap: 8 }, kicker: { color: colors.accent, fontFamily: fonts.label, fontSize: 11, letterSpacing: 1 },
    title: { color: colors.text, fontFamily: fonts.display, fontSize: 24, lineHeight: 30 }, subtitle: { color: colors.muted, fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 20 },
    card: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 24, borderWidth: 1 }, form: { gap: 14 },
    icon: { alignItems: "center", alignSelf: "flex-start", backgroundColor: colors.surfaceAlt, borderRadius: 16, height: 48, justifyContent: "center", width: 48 },
    cardTitle: { color: colors.text, fontFamily: fonts.display, fontSize: 20 }, body: { color: colors.muted, fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 20 },
    input: { backgroundColor: colors.surfaceAlt, borderColor: colors.border, borderRadius: 16, borderWidth: 1, color: colors.text, fontFamily: fonts.heading, fontSize: 16, minHeight: 52, paddingHorizontal: 16, textAlign: "center" },
    footnote: { color: colors.muted, fontFamily: "Inter_400Regular", fontSize: 11.5, lineHeight: 17 },
  }), [colors]);
}

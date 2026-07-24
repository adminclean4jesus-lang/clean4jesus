import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, View } from "react-native";

import { PrimaryButton } from "@/components/PrimaryButton";
import { useAppAppearance } from "@/features/appearance/AppearanceProvider";
import { PasswordChecklist } from "@/features/auth/PasswordChecklist";
import { AuthServiceError, updatePassword } from "@/features/auth/authService";
import { hasPasswordRecoveryAuthorization } from "@/features/auth/recoveryState";
import { getSupabaseClient } from "@/lib/supabase";
import { fonts, ThemeColors } from "@/theme";
import { useI18n } from "@/features/i18n/I18nProvider";
import { coreFlowText } from "@/features/i18n/coreFlowText";
import { getAuthAuxText } from "@/features/i18n/authAuxText";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { colors } = useAppAppearance();
  const { language } = useI18n();
  const authCopy = getAuthAuxText(language);
  const styles = useResetPasswordStyles();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [saving, setSaving] = useState(false);
  const [authorization, setAuthorization] = useState<"checking" | "valid" | "invalid">("checking");

  useEffect(() => {
    let active = true;
    void getSupabaseClient().auth.getSession()
      .then(async ({ data }) => {
        const userId = data.session?.user.id;
        const valid = Boolean(userId && await hasPasswordRecoveryAuthorization(userId));
        if (active) {
          setAuthorization(valid ? "valid" : "invalid");
        }
      })
      .catch(() => {
        if (active) setAuthorization("invalid");
      });
    return () => {
      active = false;
    };
  }, []);

  async function save() {
    if (password !== confirmation) {
      Alert.alert(coreFlowText(language, "auth.reset.check"), coreFlowText(language, "auth.reset.match"));
      return;
    }
    setSaving(true);
    try {
      await updatePassword(password);
      Alert.alert(coreFlowText(language, "auth.reset.success"), coreFlowText(language, "auth.reset.successBody"), [
        { text: coreFlowText(language, "auth.backCommunity"), onPress: () => router.replace("/(tabs)/community") },
      ]);
    } catch (error) {
      const errorCode = error instanceof AuthServiceError ? error.code : null;
      if (errorCode === "password_recovery_invalid") {
        setAuthorization("invalid");
      }
      const message = errorCode === "password_recovery_invalid" ? authCopy.resetInvalid : authCopy.resetRetry;
      Alert.alert(authCopy.resetFailed, message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.eyebrow}>Clean4Jesus</Text>
      {authorization === "checking" ? (
        <>
          <Text style={styles.title}>{coreFlowText(language, "auth.reset.verifying")}</Text>
          <ActivityIndicator color={colors.primary} />
        </>
      ) : authorization === "invalid" ? (
        <>
          <Text style={styles.title}>{coreFlowText(language, "auth.reset.expired")}</Text>
          <Text style={styles.body}>{coreFlowText(language, "auth.reset.expired")}</Text>
          <PrimaryButton label={coreFlowText(language, "auth.backCommunity")} onPress={() => router.replace("/(tabs)/community")} />
        </>
      ) : (
        <>
          <Text style={styles.title}>{coreFlowText(language, "auth.reset.title")}</Text>
          <Text style={styles.body}>{coreFlowText(language, "auth.reset.body")}</Text>
          <TextInput autoCapitalize="none" onChangeText={setPassword} placeholder={coreFlowText(language, "auth.reset.new")} placeholderTextColor={colors.muted} secureTextEntry style={styles.input} value={password} />
          <TextInput autoCapitalize="none" onChangeText={setConfirmation} placeholder={coreFlowText(language, "auth.reset.confirm")} placeholderTextColor={colors.muted} secureTextEntry style={styles.input} value={confirmation} />
          <PasswordChecklist password={password} />
          <PrimaryButton disabled={saving} label={saving ? coreFlowText(language, "auth.reset.saving") : coreFlowText(language, "auth.reset.save")} onPress={() => void save()} />
        </>
      )}
    </View>
  );
}

function useResetPasswordStyles() {
  const { colors } = useAppAppearance();
  return useMemo(() => createStyles(colors), [colors]);
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  screen: { backgroundColor: colors.background, flex: 1, gap: 14, justifyContent: "center", padding: 24 },
  eyebrow: { color: colors.primary, fontFamily: fonts.label, fontSize: 11, textTransform: "uppercase" },
  title: { color: colors.text, fontFamily: fonts.display, fontSize: 26, lineHeight: 32 },
  body: { color: colors.muted, fontFamily: fonts.body, fontSize: 14, lineHeight: 22 },
  input: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 14, borderWidth: 1, color: colors.text, fontFamily: fonts.body, fontSize: 14, minHeight: 52, paddingHorizontal: 14 },
  });
}

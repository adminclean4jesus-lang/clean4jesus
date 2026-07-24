import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "@/components/PrimaryButton";
import { exchangeAuthCode } from "@/features/auth/authService";
import { useAppAppearance } from "@/features/appearance/AppearanceProvider";
import { fonts, ThemeColors } from "@/theme";
import { useI18n } from "@/features/i18n/I18nProvider";
import { getAuthText } from "@/features/i18n/authText";
import { getAuthAuxText } from "@/features/i18n/authAuxText";

export default function AuthCallbackScreen() {
  const router = useRouter();
  const { colors } = useAppAppearance();
  const { language } = useI18n();
  const copy = getAuthText(language);
  const auxCopy = getAuthAuxText(language);
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { code, error_description: errorDescription } = useLocalSearchParams<{
    code?: string;
    error_description?: string;
  }>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (errorDescription) {
      setError(auxCopy.callbackRejected);
      return;
    }
    if (!code) {
      setError(auxCopy.callbackMissing);
      return;
    }

    void exchangeAuthCode(code)
      .then(({ isPasswordRecovery }) => router.replace(isPasswordRecovery ? "/auth/reset-password" : "/(tabs)/community"))
      .catch(() => setError(auxCopy.callbackFailed));
  }, [auxCopy.callbackFailed, auxCopy.callbackMissing, auxCopy.callbackRejected, code, errorDescription, router]);

  return (
    <View style={styles.screen}>
      <View style={styles.icon}>
        <MaterialCommunityIcons color={colors.primaryDark} name={error ? "link-variant-off" : "shield-check-outline"} size={30} />
      </View>
      <Text style={styles.title}>{error ? copy.linkUnavailable : copy.callbackVerifying}</Text>
      <Text style={styles.body}>{error ?? copy.callbackBody}</Text>
      {error ? <PrimaryButton label={copy.backCommunity} onPress={() => router.replace("/(tabs)/community")} /> : <ActivityIndicator color={colors.primary} />}
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  screen: { alignItems: "center", backgroundColor: colors.background, flex: 1, gap: 16, justifyContent: "center", padding: 28 },
  icon: { alignItems: "center", backgroundColor: colors.surfaceAlt, borderRadius: 22, height: 64, justifyContent: "center", width: 64 },
  title: { color: colors.text, fontFamily: fonts.display, fontSize: 24, textAlign: "center" },
  body: { color: colors.muted, fontFamily: fonts.body, fontSize: 14, lineHeight: 22, maxWidth: 340, textAlign: "center" },
  });
}

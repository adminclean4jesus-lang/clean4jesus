import { useMemo } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { useAppAppearance } from "@/features/appearance/AppearanceProvider";
import { useI18n } from "@/features/i18n/I18nProvider";
import { getAuthAuxText } from "@/features/i18n/authAuxText";
import { fonts, ThemeColors } from "@/theme";

type Props = {
  onCancel: () => void;
  onSolved: (token: string) => void;
  visible: boolean;
};

// TypeScript and non-native tooling use this fallback. Metro selects the
// .native implementation with WebView for Android and iOS builds.
export function TurnstileChallengeModal({ onCancel, visible }: Props) {
  const { colors } = useAppAppearance();
  const { language } = useI18n();
  const copy = getAuthAuxText(language);
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Modal onRequestClose={onCancel} transparent visible={visible}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{copy.turnstileTitle}</Text>
          <Text style={styles.body}>{copy.turnstileNativeBody}</Text>
          <Pressable accessibilityRole="button" onPress={onCancel} style={styles.button}>
            <Text style={styles.buttonText}>{copy.close}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  backdrop: { alignItems: "center", backgroundColor: "rgba(15, 22, 78, 0.36)", flex: 1, justifyContent: "center", padding: 24 },
  card: { backgroundColor: colors.surface, borderRadius: 20, gap: 14, maxWidth: 440, padding: 24 },
  title: { color: colors.text, fontFamily: fonts.display, fontSize: 20, lineHeight: 26 },
  body: { color: colors.muted, fontFamily: fonts.body, fontSize: 13, lineHeight: 20 },
  button: { alignItems: "center", backgroundColor: colors.primaryDark, borderRadius: 16, padding: 14 },
  buttonText: { color: colors.surface, fontFamily: fonts.heading, fontSize: 13 },
  });
}

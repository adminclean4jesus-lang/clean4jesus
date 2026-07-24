import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppHeader } from "@/components/AppHeader";
import { Screen } from "@/components/Screen";
import { useAppAppearance } from "@/features/appearance/AppearanceProvider";
import { useI18n } from "@/features/i18n/I18nProvider";
import { getLegalAccessText } from "@/features/legal/legalAccessText";
import { LEGAL_URLS } from "@/features/legal/legalPolicy";
import { fonts, ThemeColors } from "@/theme";

export default function LegalScreen() {
  const router = useRouter();
  const { colors } = useAppAppearance();
  const { language } = useI18n();
  const copy = getLegalAccessText(language);
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Screen>
      <AppHeader eyebrow={copy.eyebrow} onBack={() => router.back()} subtitle={copy.intro} title={copy.title} />
      <View style={styles.list}>
        <LegalRow icon="shield-account-outline" label={copy.privacy} subtitle={copy.privacyHint} url={LEGAL_URLS.privacy} />
        <LegalRow icon="file-document-outline" label={copy.terms} subtitle={copy.termsHint} url={LEGAL_URLS.terms} />
        <LegalRow icon="account-group-outline" label={copy.guidelines} subtitle={copy.guidelinesHint} url={LEGAL_URLS.guidelines} />
        <LegalRow icon="account-remove-outline" label={copy.accountDeletion} subtitle={copy.accountDeletionHint} url={LEGAL_URLS.accountDeletion} />
        <LegalRow icon="lifebuoy" label={copy.support} subtitle={copy.supportHint} url={LEGAL_URLS.support} />
      </View>
    </Screen>
  );
}

function LegalRow({
  icon,
  label,
  subtitle,
  url,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  subtitle: string;
  url: string;
}) {
  const { colors } = useAppAppearance();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(url)} style={styles.row}>
      <MaterialCommunityIcons color={colors.primaryDark} name={icon} size={22} />
      <View style={styles.copy}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <MaterialCommunityIcons color={colors.muted} name="open-in-new" size={18} />
    </Pressable>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    copy: { flex: 1, gap: 4 },
    label: { color: colors.text, fontFamily: fonts.heading, fontSize: 14 },
    list: { gap: 10 },
    row: { alignItems: "center", backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 16, borderWidth: 1, flexDirection: "row", gap: 12, minHeight: 76, padding: 14 },
    subtitle: { color: colors.muted, fontFamily: fonts.body, fontSize: 11.5, lineHeight: 16 },
  });
}

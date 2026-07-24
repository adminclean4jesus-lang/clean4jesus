import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { useMemo } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "@/components/PrimaryButton";
import { useAppAppearance } from "@/features/appearance/AppearanceProvider";
import { useI18n } from "@/features/i18n/I18nProvider";
import type { TranslationKey } from "@/features/i18n/i18n";
import { LEGAL_URLS } from "@/features/legal/legalPolicy";
import { fonts, ThemeColors } from "@/theme";

export type CommunityLegalDocument = "guidelines" | "privacy" | "terms";

type Props = {
  document: CommunityLegalDocument | null;
  onClose: () => void;
};

export function CommunityLegalNoticeModal({ document, onClose }: Props) {
  const { colors } = useAppAppearance();
  const { language, t } = useI18n();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const selected = document
    ? {
        eyebrow: t(language, `legal.${document}.eyebrow` as TranslationKey),
        paragraphs: [
          t(language, `legal.${document}.p1` as TranslationKey),
          t(language, `legal.${document}.p2` as TranslationKey),
          t(language, `legal.${document}.p3` as TranslationKey),
        ],
        title: t(language, `legal.${document}.title` as TranslationKey),
      }
    : null;

  return (
    <Modal animationType="none" onRequestClose={onClose} presentationStyle="pageSheet" visible={Boolean(selected)}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <View style={styles.iconWrap}>
            <MaterialCommunityIcons color={colors.primaryDark} name="shield-account-outline" size={24} />
          </View>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>{selected?.eyebrow}</Text>
            <Text style={styles.title}>{selected?.title}</Text>
          </View>
          <Pressable accessibilityLabel={t(language, "legal.close")} onPress={onClose} style={styles.closeButton}>
            <MaterialCommunityIcons color={colors.text} name="close" size={22} />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          {selected?.paragraphs.map((paragraph) => (
            <Text key={paragraph} style={styles.paragraph}>{paragraph}</Text>
          ))}
          <View style={styles.draftNotice}>
            <MaterialCommunityIcons color={colors.accent} name="information-outline" size={20} />
            <Text style={styles.draftText}>{t(language, "legal.draftNotice")}</Text>
          </View>
          {document ? (
            <Pressable
              accessibilityRole="link"
              onPress={() => void Linking.openURL(LEGAL_URLS[document])}
              style={styles.fullDocumentLink}
            >
              <MaterialCommunityIcons color={colors.primaryDark} name="open-in-new" size={18} />
              <Text style={styles.fullDocumentText}>{t(language, "legal.openFull")}</Text>
            </Pressable>
          ) : null}
        </ScrollView>
        <PrimaryButton label={t(language, "legal.understood")} onPress={onClose} />
      </View>
    </Modal>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    screen: { backgroundColor: colors.background, flex: 1, gap: 18, padding: 20, paddingTop: 28 },
    header: { alignItems: "center", flexDirection: "row", gap: 12 },
    iconWrap: { alignItems: "center", backgroundColor: colors.surfaceAlt, borderRadius: 16, height: 46, justifyContent: "center", width: 46 },
    headerCopy: { flex: 1, gap: 4 },
    eyebrow: { color: colors.primary, fontFamily: fonts.label, fontSize: 10, textTransform: "uppercase" },
    title: { color: colors.text, fontFamily: fonts.display, fontSize: 21, lineHeight: 26 },
    closeButton: { alignItems: "center", backgroundColor: colors.surface, borderRadius: 18, height: 42, justifyContent: "center", width: 42 },
    content: { gap: 14, paddingBottom: 10 },
    paragraph: { color: colors.text, fontFamily: fonts.body, fontSize: 14, lineHeight: 22 },
    draftNotice: { alignItems: "flex-start", backgroundColor: colors.accentSoft, borderRadius: 14, flexDirection: "row", gap: 10, padding: 14 },
    draftText: { color: colors.text, flex: 1, fontFamily: fonts.bodyMedium, fontSize: 11.5, lineHeight: 18 },
    fullDocumentLink: { alignItems: "center", alignSelf: "flex-start", flexDirection: "row", gap: 8, paddingVertical: 8 },
    fullDocumentText: { color: colors.primaryDark, fontFamily: fonts.heading, fontSize: 12, textDecorationLine: "underline" },
  });
}

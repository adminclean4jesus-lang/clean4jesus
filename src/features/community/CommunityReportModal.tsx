import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "@/components/PrimaryButton";
import { useAppAppearance } from "@/features/appearance/AppearanceProvider";
import { fonts, ThemeColors } from "@/theme";
import type { CommunityReportReason } from "@/types/database";
import { useI18n } from "@/features/i18n/I18nProvider";
import { getCommunityFlowText } from "@/features/i18n/communityFlowText";

type Props = {
  onClose: () => void;
  onSubmit: (reason: CommunityReportReason) => Promise<void>;
  submitting: boolean;
  visible: boolean;
};

export function CommunityReportModal({ onClose, onSubmit, submitting, visible }: Props) {
  const { colors } = useAppAppearance();
  const { language } = useI18n();
  const copy = getCommunityFlowText(language);
  const reasons: Array<{ description: string; icon: keyof typeof MaterialCommunityIcons.glyphMap; label: string; value: CommunityReportReason }> = [
    { description: copy.spamBody, icon: "email-alert-outline", label: copy.spam, value: "spam" },
    { description: copy.harassmentBody, icon: "account-alert-outline", label: copy.harassment, value: "harassment" },
    { description: copy.sexualBody, icon: "eye-off-outline", label: copy.sexual, value: "sexual_content" },
    { description: copy.selfHarmBody, icon: "heart-pulse", label: copy.selfHarm, value: "self_harm" },
    { description: copy.otherBody, icon: "dots-horizontal-circle-outline", label: copy.other, value: "other" },
  ];
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <Modal animationType="none" onRequestClose={() => { if (!submitting) onClose(); }} presentationStyle="pageSheet" visible={visible}>
      <View style={styles.screen} testID="community-report-modal">
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>{copy.reportCare}</Text>
            <Text style={styles.title}>{copy.reportTitle}</Text>
          </View>
          <Pressable accessibilityLabel={copy.closeReport} disabled={submitting} onPress={onClose} style={styles.closeButton}>
            <MaterialCommunityIcons color={colors.text} name="close" size={22} />
          </Pressable>
        </View>
        <Text style={styles.intro}>{copy.reportIntro}</Text>
        <ScrollView contentContainerStyle={styles.list}>
          {reasons.map((reason) => (
            <Pressable disabled={submitting} key={reason.value} onPress={() => void onSubmit(reason.value)} style={styles.reason}>
              <View style={styles.reasonIcon}><MaterialCommunityIcons color={colors.primaryDark} name={reason.icon} size={21} /></View>
              <View style={styles.reasonCopy}>
                <Text style={styles.reasonLabel}>{reason.label}</Text>
                <Text style={styles.reasonDescription}>{reason.description}</Text>
              </View>
              <MaterialCommunityIcons color={colors.muted} name="chevron-right" size={21} />
            </Pressable>
          ))}
        </ScrollView>
        <PrimaryButton disabled={submitting} label={submitting ? copy.sendingReport : copy.cancel} onPress={onClose} variant="ghost" />
      </View>
    </Modal>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  screen: { backgroundColor: colors.background, flex: 1, gap: 16, padding: 20, paddingTop: 28 },
  header: { alignItems: "center", flexDirection: "row", gap: 12 },
  headerCopy: { flex: 1, gap: 4 },
  eyebrow: { color: colors.primary, fontFamily: fonts.label, fontSize: 10, textTransform: "uppercase" },
  title: { color: colors.text, fontFamily: fonts.display, fontSize: 23, lineHeight: 28 },
  closeButton: { alignItems: "center", backgroundColor: colors.surface, borderRadius: 18, height: 42, justifyContent: "center", width: 42 },
  intro: { color: colors.muted, fontFamily: fonts.body, fontSize: 13, lineHeight: 20 },
  list: { gap: 10, paddingBottom: 8 },
  reason: { alignItems: "center", backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 16, borderWidth: 1, flexDirection: "row", gap: 11, minHeight: 78, padding: 13 },
  reasonIcon: { alignItems: "center", backgroundColor: colors.surfaceAlt, borderRadius: 13, height: 42, justifyContent: "center", width: 42 },
  reasonCopy: { flex: 1, gap: 3 },
  reasonLabel: { color: colors.text, fontFamily: fonts.heading, fontSize: 14 },
  reasonDescription: { color: colors.muted, fontFamily: fonts.body, fontSize: 11.5, lineHeight: 17 },
  });
}

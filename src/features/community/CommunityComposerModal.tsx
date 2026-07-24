import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { PrimaryButton } from "@/components/PrimaryButton";
import { useAppAppearance } from "@/features/appearance/AppearanceProvider";
import { createCommunityPost } from "@/features/community/communityService";
import { fonts, ThemeColors } from "@/theme";
import type { CommunityPostKind } from "@/types/database";
import { useI18n } from "@/features/i18n/I18nProvider";
import { getCommunityFlowText } from "@/features/i18n/communityFlowText";

type Props = {
  initialKind: CommunityPostKind;
  onClose: () => void;
  onPublished: () => void;
  userId: string;
  visible: boolean;
};

export function CommunityComposerModal({ initialKind, onClose, onPublished, userId, visible }: Props) {
  const { colors } = useAppAppearance();
  const { language } = useI18n();
  const copy = getCommunityFlowText(language);
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [kind, setKind] = useState<CommunityPostKind>(initialKind);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => setKind(initialKind), [initialKind, visible]);

  async function publish() {
    setSubmitting(true);
    try {
      await createCommunityPost(userId, { body, kind, title });
      setTitle("");
      setBody("");
      onPublished();
      onClose();
    } catch {
      Alert.alert(copy.publishError, copy.retry);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal animationType="none" onRequestClose={onClose} presentationStyle="pageSheet" visible={visible}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.screen}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>{copy.shareCare}</Text>
            <Text style={styles.title}>{copy.openHeart}</Text>
          </View>
          <Pressable accessibilityLabel={copy.close} onPress={onClose} style={styles.closeButton}>
            <MaterialCommunityIcons color={colors.text} name="close" size={22} />
          </Pressable>
        </View>

        <View style={styles.kinds}>
          <KindButton active={kind === "prayer"} label={copy.prayer} onPress={() => setKind("prayer")} />
          <KindButton active={kind === "testimony"} label={copy.testimony} onPress={() => setKind("testimony")} />
          <KindButton active={kind === "update"} label={copy.update} onPress={() => setKind("update")} />
        </View>

        <View style={styles.form}>
          <TextInput
            maxLength={100}
            onChangeText={setTitle}
            placeholder={copy.shortTitle}
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={title}
          />
          <TextInput
            maxLength={2000}
            multiline
            onChangeText={setBody}
            placeholder={copy.bodyPlaceholder}
            placeholderTextColor={colors.muted}
            style={[styles.input, styles.bodyInput]}
            textAlignVertical="top"
            value={body}
          />
          <Text style={styles.counter}>{body.length}/2000</Text>
        </View>

        <View style={styles.safetyNotice}>
          <MaterialCommunityIcons color={colors.primary} name="shield-check-outline" size={18} />
          <Text style={styles.safetyText}>{copy.safety}</Text>
        </View>

        <PrimaryButton disabled={submitting} label={submitting ? copy.publishing : copy.publish} onPress={() => void publish()} />
      </KeyboardAvoidingView>
    </Modal>
  );
}

function KindButton({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  const { colors } = useAppAppearance();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <Pressable onPress={onPress} style={[styles.kindButton, active && styles.kindButtonActive]}>
      <Text style={[styles.kindText, active && styles.kindTextActive]}>{label}</Text>
    </Pressable>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  screen: { backgroundColor: colors.background, flex: 1, gap: 18, padding: 20, paddingTop: 28 },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  eyebrow: { color: colors.primary, fontFamily: fonts.label, fontSize: 10, textTransform: "uppercase" },
  title: { color: colors.text, fontFamily: fonts.display, fontSize: 24, marginTop: 4 },
  closeButton: { alignItems: "center", backgroundColor: colors.surface, borderRadius: 18, height: 42, justifyContent: "center", width: 42 },
  kinds: { flexDirection: "row", gap: 8 },
  kindButton: { alignItems: "center", backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 999, borderWidth: 1, flex: 1, paddingVertical: 10 },
  kindButtonActive: { backgroundColor: colors.primaryDark, borderColor: colors.primaryDark },
  kindText: { color: colors.primaryDark, fontFamily: fonts.bodyMedium, fontSize: 11 },
  kindTextActive: { color: colors.surface },
  form: { gap: 10 },
  input: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 16, borderWidth: 1, color: colors.text, fontFamily: fonts.body, fontSize: 14, minHeight: 52, padding: 14 },
  bodyInput: { lineHeight: 21, minHeight: 180 },
  counter: { color: colors.muted, fontFamily: fonts.label, fontSize: 10, textAlign: "right" },
  safetyNotice: { alignItems: "flex-start", backgroundColor: colors.surfaceAlt, borderRadius: 16, flexDirection: "row", gap: 10, padding: 14 },
  safetyText: { color: colors.muted, flex: 1, fontFamily: fonts.body, fontSize: 11.5, lineHeight: 17 },
  });
}

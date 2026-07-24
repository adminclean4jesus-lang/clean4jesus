import { useEffect, useMemo, useState } from "react";
import { Alert, Image, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";

import { AppHeader } from "@/components/AppHeader";
import { InfoCard } from "@/components/InfoCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { useAppAppearance } from "@/features/appearance/AppearanceProvider";
import {
  chooseInterruptionImage,
  defaultInterruptionMessage,
  defaultInterruptionReference,
  getInterruptionCustomization,
  resetInterruptionCustomization,
  saveInterruptionCustomization,
} from "@/features/interruption/interruptionCustomizationService";
import { fonts, ThemeColors } from "@/theme";
import { useI18n } from "@/features/i18n/I18nProvider";
import { coreFlowText } from "@/features/i18n/coreFlowText";
import { getSecondaryText } from "@/features/i18n/secondaryText";

export default function InterruptionSettingsScreen() {
  const router = useRouter();
  const { language } = useI18n();
  const copy = getSecondaryText(language);
  const styles = useInterruptionSettingsStyles();
  const [message, setMessage] = useState(defaultInterruptionMessage);
  const [reference, setReference] = useState(defaultInterruptionReference);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void getInterruptionCustomization().then((value) => {
      setMessage(value.message); setReference(value.reference); setImageUri(value.imageUri);
    });
  }, []);

  async function save() {
    setBusy(true);
    try {
      const value = await saveInterruptionCustomization({ imageUri, message, reference });
      setMessage(value.message); setReference(value.reference);
      Alert.alert(coreFlowText(language, "interruption.savedTitle"), coreFlowText(language, "interruption.savedBody"));
    } catch { Alert.alert(coreFlowText(language, "common.retry"), coreFlowText(language, "common.retry")); }
    finally { setBusy(false); }
  }

  return (
    <Screen>
      <AppHeader eyebrow={coreFlowText(language, "interruption.eyebrow")} icon="image-outline" onBack={() => router.back()} title={coreFlowText(language, "interruption.title")} subtitle={coreFlowText(language, "interruption.subtitle")} />
      <InfoCard tone="light" style={styles.preview}>
        {imageUri ? <Image resizeMode="cover" source={{ uri: imageUri }} style={styles.image} /> : <View style={styles.fallback}><Text style={styles.fallbackText}>C4J</Text></View>}
        <Text style={styles.message}>{message || defaultInterruptionMessage}</Text>
        <Text style={styles.reference}>{reference || defaultInterruptionReference}</Text>
      </InfoCard>
      <InfoCard tone="outline" style={styles.card}>
        <Text style={styles.label}>{copy.interruptionMessage}</Text>
        <TextInput accessibilityLabel={coreFlowText(language, "interruption.message")} maxLength={180} multiline onChangeText={setMessage} style={[styles.input, styles.multiline]} value={message} />
        <Text style={styles.label}>{copy.interruptionReference}</Text>
        <TextInput accessibilityLabel={copy.referenceA11y} maxLength={60} onChangeText={setReference} style={styles.input} value={reference} />
        <PrimaryButton label={imageUri ? copy.changeImage : copy.chooseImage} onPress={() => void chooseInterruptionImage().then((uri) => uri && setImageUri(uri))} variant="ghost" />
        {imageUri ? <PrimaryButton label={copy.removeImage} onPress={() => setImageUri(null)} variant="ghost" /> : null}
        <PrimaryButton disabled={busy} label={coreFlowText(language, "interruption.save")} onPress={() => void save()} />
        <PrimaryButton label={coreFlowText(language, "interruption.restore")} onPress={() => Alert.alert(coreFlowText(language, "interruption.restoreTitle"), coreFlowText(language, "interruption.restoreBody"), [{ text: coreFlowText(language, "common.cancel"), style: "cancel" }, { text: coreFlowText(language, "common.restore"), style: "destructive", onPress: () => void resetInterruptionCustomization().then((value) => { setMessage(value.message); setReference(value.reference); setImageUri(null); Alert.alert(coreFlowText(language, "interruption.restoredTitle"), coreFlowText(language, "interruption.restoredBody")); }) }])} variant="ghost" />
      </InfoCard>
      <Text style={styles.privacy}>{coreFlowText(language, "interruption.privacy")}</Text>
    </Screen>
  );
}

function useInterruptionSettingsStyles() {
  const { colors } = useAppAppearance();
  return useMemo(() => createStyles(colors), [colors]);
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  preview: { alignItems: "center", gap: 10, overflow: "hidden" },
  image: { borderRadius: 18, height: 260, width: "100%" },
  fallback: { alignItems: "center", backgroundColor: colors.primaryDark, borderRadius: 18, height: 180, justifyContent: "center", width: "100%" },
  fallbackText: { color: "#FFFFFF", fontFamily: fonts.display, fontSize: 34 },
  message: { color: colors.primaryDark, fontFamily: fonts.display, fontSize: 22, textAlign: "center" },
  reference: { color: colors.primaryDark, fontFamily: fonts.heading, fontSize: 13 },
  card: { gap: 10 },
  label: { color: colors.primary, fontFamily: fonts.label, fontSize: 10 },
  input: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 14, borderWidth: 1, color: colors.text, fontFamily: "Inter_400Regular", fontSize: 14, minHeight: 48, paddingHorizontal: 14, paddingVertical: 12 },
  multiline: { minHeight: 100, textAlignVertical: "top" },
  privacy: { color: colors.muted, fontFamily: "Inter_400Regular", fontSize: 11, lineHeight: 17, textAlign: "center" },
  });
}

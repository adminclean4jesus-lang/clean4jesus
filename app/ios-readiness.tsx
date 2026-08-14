import React from "react";
import { StyleSheet, ScrollView } from "react-native";
import { Text, Card, Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { useAppAppearance } from "@/features/appearance/AppearanceProvider";
import { useI18n } from "@/features/i18n/I18nProvider";
import { getIosReadinessText } from "@/features/i18n/iosReadinessText";
import { fonts, ThemeColors } from "@/theme";

export default function IosReadinessScreen() {
  const router = useRouter();
  const { colors } = useAppAppearance();
  const { language } = useI18n();
  const copy = getIosReadinessText(language);
  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.subtitle}>{copy.subtitle}</Text>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>{copy.shared}</Text>
            {copy.items.map((item) => <Text key={item} style={styles.item}>✓ {item}</Text>)}
          </Card.Content>
        </Card>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>{copy.native}</Text>
            {copy.nativeItems.map((item) => <Text key={item} style={styles.item}>✓ {item}</Text>)}
          </Card.Content>
        </Card>
        <Button mode="contained" onPress={() => router.back()} buttonColor={colors.primary} style={styles.button}>
          {copy.back}
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: 16 },
    title: { fontFamily: fonts.display, fontSize: 24, fontWeight: "bold", color: colors.primaryDark, marginBottom: 6 },
    subtitle: { fontFamily: fonts.body, fontSize: 14, color: colors.muted, marginBottom: 16 },
    card: { marginBottom: 16, backgroundColor: colors.surface, borderRadius: 12 },
    cardTitle: { fontFamily: fonts.heading, fontSize: 16, fontWeight: "600", color: colors.primaryDark, marginBottom: 12 },
    item: { fontFamily: fonts.body, fontSize: 14, color: colors.text, marginBottom: 6 },
    button: { marginTop: 8 },
  });
}

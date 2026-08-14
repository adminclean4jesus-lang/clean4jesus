import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Text, Button, Card } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { useAppAppearance } from "@/features/appearance/AppearanceProvider";
import { useI18n } from "@/features/i18n/I18nProvider";
import { getIosRescueText } from "@/features/i18n/iosRescueText";
import { iosProtectionService } from "@/features/iosProtection/iosProtectionService.ios";
import { fonts, ThemeColors } from "@/theme";

type Phase = "inhale" | "hold" | "exhale";

export default function IosRescueScreen() {
  const router = useRouter();
  const { colors } = useAppAppearance();
  const { language } = useI18n();
  const copy = getIosRescueText(language);
  const styles = createStyles(colors);
  const [seconds, setSeconds] = useState(60);
  const [phase, setPhase] = useState<Phase>("inhale");

  useEffect(() => {
    void iosProtectionService.startRescue();

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        const cycle = (60 - prev + 1) % 12;
        if (cycle < 4) setPhase("inhale");
        else if (cycle < 6) setPhase("hold");
        else setPhase("exhale");
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          <Text style={styles.title}>{copy.title}</Text>
          <Text style={styles.disclaimer}>{copy.subtitle}</Text>

          <View style={styles.timerCircle}>
            <Text style={styles.phaseText}>{seconds > 0 ? copy[phase] : copy.complete}</Text>
            <Text style={styles.timerText}>{seconds}s</Text>
          </View>

          <Text style={styles.verse}>{copy.verse}</Text>

          <Button mode="contained" onPress={() => router.back()} buttonColor={colors.primary} style={styles.button}>
            {copy.back}
          </Button>
        </Card.Content>
      </Card>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.primaryDark, justifyContent: "center", padding: 16 },
    card: { backgroundColor: colors.surface, borderRadius: 16, padding: 8 },
    content: { alignItems: "center" },
    title: { fontFamily: fonts.display, fontSize: 22, fontWeight: "bold", color: colors.primaryDark, marginBottom: 8, textAlign: "center" },
    disclaimer: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, textAlign: "center", marginBottom: 24 },
    timerCircle: { width: 140, height: 140, borderRadius: 70, backgroundColor: colors.surfaceAlt, justifyContent: "center", alignItems: "center", marginBottom: 24, borderWidth: 3, borderColor: colors.accent },
    phaseText: { fontFamily: fonts.heading, fontSize: 16, fontWeight: "600", color: colors.primaryDark },
    timerText: { fontFamily: fonts.display, fontSize: 32, fontWeight: "bold", color: colors.accent },
    verse: { fontFamily: fonts.body, fontSize: 14, fontStyle: "italic", color: colors.text, textAlign: "center", marginBottom: 24 },
    button: { width: "100%" },
  });
}

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { InfoCard } from "@/components/InfoCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { useAppAppearance } from "@/features/appearance/AppearanceProvider";
import { getIosReadinessItems } from "@/features/iosProtection/iosProtectionContract";
import { fonts, ThemeColors } from "@/theme";

export default function IosReadinessScreen() {
  const router = useRouter();
  const { colors } = useAppAppearance();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>iPhone</Text>
        <Text style={styles.title}>Preparación responsable</Text>
        <Text style={styles.body}>La experiencia compartida ya está preparada. Las capas que controlan otras apps se activarán únicamente después de la aprobación de Apple y una prueba real.</Text>
      </View>
      <InfoCard tone="outline" style={styles.privacyCard}>
        <MaterialCommunityIcons color={colors.primary} name="lock-outline" size={22} />
        <Text style={styles.privacyText}>Clean4Jesus no leerá ni enviará el contenido de otras apps. La protección iOS se diseñará con las APIs de Apple y sin capturar historial.</Text>
      </InfoCard>
      <View style={styles.list}>
        {getIosReadinessItems().map((item) => (
          <InfoCard key={item.id} tone="light" style={styles.item}>
            <View style={[styles.status, item.ready ? styles.statusReady : styles.statusPending]}>
              <MaterialCommunityIcons color={item.ready ? colors.success : colors.primary} name={item.ready ? "check" : "clock-outline"} size={16} />
            </View>
            <View style={styles.itemCopy}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemDetail}>{item.detail}</Text>
            </View>
          </InfoCard>
        ))}
      </View>
      <Pressable onPress={() => router.push("/(tabs)")} style={styles.link}><Text style={styles.linkText}>Seguir usando Clean4Jesus</Text></Pressable>
      <PrimaryButton label="Volver" onPress={() => router.back()} />
    </Screen>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    body: { color: colors.muted, fontFamily: fonts.body, fontSize: 16, lineHeight: 25 },
    eyebrow: { color: colors.primary, fontFamily: fonts.label, fontSize: 11, letterSpacing: 0.8, textTransform: "uppercase" },
    hero: { gap: 12, paddingTop: 20 },
    item: { alignItems: "flex-start", flexDirection: "row", gap: 12 },
    itemCopy: { flex: 1, gap: 4 },
    itemDetail: { color: colors.muted, fontFamily: fonts.body, fontSize: 13, lineHeight: 19 },
    itemTitle: { color: colors.text, fontFamily: fonts.heading, fontSize: 15, lineHeight: 21 },
    link: { alignItems: "center", paddingVertical: 4 },
    linkText: { color: colors.primary, fontFamily: fonts.heading, fontSize: 14 },
    list: { gap: 10 },
    privacyCard: { alignItems: "flex-start", flexDirection: "row", gap: 12 },
    privacyText: { color: colors.text, flex: 1, fontFamily: fonts.body, fontSize: 14, lineHeight: 21 },
    status: { alignItems: "center", borderRadius: 999, height: 30, justifyContent: "center", width: 30 },
    statusPending: { backgroundColor: colors.surfaceAlt },
    statusReady: { backgroundColor: colors.successSoft },
    title: { color: colors.text, fontFamily: fonts.display, fontSize: 30, lineHeight: 38 },
  });
}

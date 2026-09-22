import { MaterialCommunityIcons } from "@/components/MaterialCommunityIcon";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { useAppAppearance } from "@/features/appearance/AppearanceProvider";
import { fonts, ThemeColors } from "@/theme";
import { useMemo } from "react";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  actionLabel: string;
  backLabel: string;
  brand: string;
  children?: ReactNode;
  description: string;
  icon: string;
  onAction: () => void;
  onBack: () => void;
  progress: number;
  actionDisabled?: boolean;
  step: string;
  steps: [string, string, string];
  title: string;
};

export function RefugeSetupGuide({ actionDisabled, actionLabel, backLabel, brand, children, description, icon, onAction, onBack, progress, step, steps, title }: Props) {
  const { colors } = useAppAppearance();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return <Screen>
    <Pressable accessibilityRole="button" onPress={onBack} style={styles.back}>
      <MaterialCommunityIcons color={colors.primaryDark} name="arrow-left" size={18} />
      <Text style={styles.backText}>{backLabel}</Text>
    </Pressable>
    <View style={styles.brandRow}>
      <View style={styles.brandBadge}><MaterialCommunityIcons color={colors.surface} name="shield-cross" size={23} /></View>
      <Text style={styles.brand}>{brand}</Text>
    </View>
    <View style={styles.progress}><Text style={styles.progressText}>{step}</Text><View style={styles.progressTrack}><View style={[styles.progressValue, { width: `${progress * 100}%` }]} /></View></View>
    <View style={styles.icon}><MaterialCommunityIcons color={colors.primaryDark} name={icon} size={34} /></View>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.description}>{description}</Text>
    <View style={styles.steps}>{steps.map((item, index) => <View key={item} style={styles.step}><View style={styles.stepNumber}><Text style={styles.stepNumberText}>{index + 1}</Text></View><Text style={styles.stepText}>{item}</Text></View>)}</View>
    <PrimaryButton disabled={actionDisabled} label={actionLabel} onPress={onAction} />
    {children}
  </Screen>;
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    back: { alignItems: "center", flexDirection: "row", gap: 6, minHeight: 36 },
    backText: { color: colors.primaryDark, fontFamily: fonts.heading, fontSize: 13 },
    brandRow: { alignItems: "center", flexDirection: "row", gap: 10, marginTop: 4 },
    brandBadge: { alignItems: "center", backgroundColor: colors.primaryDark, borderRadius: 14, height: 42, justifyContent: "center", width: 42 },
    brand: { color: colors.primaryDark, fontFamily: fonts.display, fontSize: 17 },
    progress: { gap: 7, marginTop: 12 },
    progressText: { color: colors.primary, fontFamily: fonts.label, fontSize: 11, letterSpacing: 1, textTransform: "uppercase" },
    progressTrack: { backgroundColor: colors.surfaceAlt, borderRadius: 999, height: 7, overflow: "hidden" },
    progressValue: { backgroundColor: colors.primary, height: "100%" },
    icon: { alignItems: "center", backgroundColor: colors.surfaceAlt, borderColor: colors.border, borderRadius: 28, borderWidth: 1, height: 72, justifyContent: "center", marginTop: 20, width: 72 },
    title: { color: colors.text, fontFamily: fonts.display, fontSize: 27, lineHeight: 34, marginTop: 16 },
    description: { color: colors.muted, fontFamily: fonts.body, fontSize: 15, lineHeight: 23, marginTop: 8 },
    steps: { gap: 14, marginTop: 20 },
    step: { alignItems: "flex-start", flexDirection: "row", gap: 12 },
    stepNumber: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 999, height: 26, justifyContent: "center", marginTop: 1, width: 26 },
    stepNumberText: { color: colors.surface, fontFamily: fonts.heading, fontSize: 12 },
    stepText: { color: colors.text, flex: 1, fontFamily: fonts.body, fontSize: 14, lineHeight: 21 },
  });
}

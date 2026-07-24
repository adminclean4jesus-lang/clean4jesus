import { PropsWithChildren } from "react";
import { StyleProp, StyleSheet, View, ViewProps, ViewStyle } from "react-native";

import { useAppAppearance } from "@/features/appearance/AppearanceProvider";

type InfoCardProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  tone?: "dark" | "light" | "lime" | "outline";
}> & Omit<ViewProps, "style">;

export function InfoCard({ children, style, tone = "dark", ...viewProps }: InfoCardProps) {
  const { colors, isDark } = useAppAppearance();
  const toneStyle = tone === "light"
    ? { backgroundColor: isDark ? "#20293A" : "#F5F7FF", borderColor: colors.border, borderLeftColor: colors.accent }
    : tone === "lime"
      ? { backgroundColor: colors.successSoft, borderColor: colors.successSoft, borderLeftColor: colors.success }
      : tone === "outline"
        ? { backgroundColor: colors.surface, borderColor: colors.border, borderLeftColor: colors.border, borderLeftWidth: StyleSheet.hairlineWidth }
        : { backgroundColor: colors.surface, borderColor: colors.border, borderLeftColor: colors.primary };
  return <View {...viewProps} style={[styles.card, toneStyle, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    shadowColor: "#AFC0F4",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.07,
    shadowRadius: 18,
    elevation: 2,
  },
});

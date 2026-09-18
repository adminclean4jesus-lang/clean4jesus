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
        : { backgroundColor: colors.surface, borderColor: colors.border, borderTopColor: colors.accent, borderTopWidth: 3 };
  return <View {...viewProps} style={[styles.card, toneStyle, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    shadowColor: "#02174B",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 2,
  },
});

import { MaterialCommunityIcons } from "@/components/MaterialCommunityIcon";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useAppAppearance } from "@/features/appearance/AppearanceProvider";
import { fonts, ThemeColors } from "@/theme";

type AppLoadingExperienceProps = {
  layout?: "centered" | "contextual";
  message: string;
  title?: string;
};

export function AppLoadingExperience({
  layout = "centered",
  message,
  title = "Clean4Jesus",
}: AppLoadingExperienceProps) {
  const { colors } = useAppAppearance();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={[styles.shell, layout === "contextual" && styles.shellContextual]}>
      <View style={styles.center}>
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons color={colors.primaryDark} name="shield-cross" size={34} />
        </View>
        <Text
          style={styles.title}
        >
          {title}
        </Text>
        <Text style={styles.message}>
          {message}
        </Text>
      </View>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  shell: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  shellContextual: {
    justifyContent: "center",
    paddingBottom: 116,
    paddingTop: 96,
  },
  center: {
    alignItems: "center",
    gap: 12,
    justifyContent: "center",
    width: "100%",
  },
  iconWrap: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    elevation: 4,
    height: 78,
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 22,
    width: 78,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 22,
    lineHeight: 28,
    marginTop: 8,
    maxWidth: 280,
    textAlign: "center",
  },
  message: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    maxWidth: 220,
    textAlign: "center",
  },
  });
}

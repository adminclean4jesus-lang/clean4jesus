import { MaterialCommunityIcons } from "@/components/MaterialCommunityIcon";
import { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAppAppearance } from "@/features/appearance/AppearanceProvider";
import { coreFlowText } from "@/features/i18n/coreFlowText";
import { useI18n } from "@/features/i18n/I18nProvider";
import { fonts } from "@/theme";

type AppHeaderProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  version?: string;
  titleTrailing?: ReactNode;
  onBack?: () => void;
};

export function AppHeader({
  eyebrow,
  title,
  subtitle,
  icon = "cross",
  version,
  titleTrailing,
  onBack,
}: AppHeaderProps) {
  const { colors } = useAppAppearance();
  const { language } = useI18n();
  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        {onBack ? (
          <Pressable accessibilityLabel={coreFlowText(language, "common.back")} accessibilityRole="button" hitSlop={10} onPress={onBack} style={styles.backButton}>
            <MaterialCommunityIcons color={colors.primaryDark} name="arrow-left" size={20} />
          </Pressable>
        ) : null}
        <View style={[styles.iconMark, { backgroundColor: colors.primaryDark, borderColor: colors.primaryDark }]}>
          <MaterialCommunityIcons color="#FFFFFF" name={icon} size={16} />
        </View>
        <Text numberOfLines={1} style={[styles.brand, { color: colors.text }]}>
          Clean4Jesus
        </Text>
        {version ? <View style={[styles.versionChip, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
          <Text style={[styles.versionText, { color: colors.primaryDark }]}>{version}</Text>
        </View> : null}
      </View>
      <Text style={[styles.eyebrow, { color: colors.partial }]}>{eyebrow}</Text>
      <View style={styles.titleRow}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {titleTrailing ? <View style={styles.trailing}>{titleTrailing}</View> : null}
      </View>
      {subtitle ? <Text style={[styles.subtitle, { color: colors.muted }]}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 7,
    marginBottom: 4,
  },
  topRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    minWidth: 0,
  },
  iconMark: {
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  backButton: {
    alignItems: "center",
    borderRadius: 16,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  titleRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
  },
  versionChip: {
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  versionText: {
    fontFamily: fonts.label,
    fontSize: 9,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  eyebrow: {
    fontFamily: fonts.label,
    fontSize: 11.5,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  brand: {
    flex: 1,
    fontFamily: fonts.heading,
    fontSize: 20,
    letterSpacing: -0.3,
  },
  title: {
    flex: 1,
    fontFamily: fonts.display,
    fontSize: 28,
    lineHeight: 36,
  },
  trailing: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 22,
  },
});

import { MaterialCommunityIcons } from "@/components/MaterialCommunityIcon";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useAppAppearance } from "@/features/appearance/AppearanceProvider";
import { getPasswordChecks } from "@/features/auth/passwordPolicy";
import { fonts, ThemeColors } from "@/theme";
import { useI18n } from "@/features/i18n/I18nProvider";
import { getSecondaryText } from "@/features/i18n/secondaryText";

type PasswordChecklistProps = {
  displayName?: string;
  email?: string;
  password: string;
};

export function PasswordChecklist({ displayName, email, password }: PasswordChecklistProps) {
  const { colors } = useAppAppearance();
  const { language } = useI18n();
  const copy = getSecondaryText(language);
  const styles = usePasswordChecklistStyles();
  const checks = getPasswordChecks(password, { displayName, email });

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{copy.passwordTitle}</Text>
      <View style={styles.list}>
        {checks.map((check) => (
          <View key={check.key} style={styles.row}>
            <MaterialCommunityIcons
              color={check.passed ? colors.success : check.required ? colors.muted : colors.mutedDark}
              name={check.passed ? "check-circle" : check.required ? "checkbox-blank-circle-outline" : "minus-circle-outline"}
              size={16}
            />
            <Text style={[styles.label, check.passed && styles.labelPassed]}>{({ minLength: copy.passwordMin, hasLetter: copy.passwordLetter, hasNumber: copy.passwordNumber, emailFragment: copy.passwordEmail, nameFragment: copy.passwordName })[check.key]}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function usePasswordChecklistStyles() {
  const { colors } = useAppAppearance();
  return useMemo(() => createStyles(colors), [colors]);
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
    padding: 12,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 12,
  },
  list: {
    gap: 8,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  label: {
    color: colors.muted,
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 11.5,
    lineHeight: 16,
  },
  labelPassed: {
    color: colors.text,
  },
  });
}

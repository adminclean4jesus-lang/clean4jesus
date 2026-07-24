import { StyleSheet } from "react-native";
import { Button } from "react-native-paper";

import { useAppAppearance } from "@/features/appearance/AppearanceProvider";
import { fonts } from "@/theme";

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "danger" | "ghost";
  disabled?: boolean;
  testID?: string;
};

export function PrimaryButton({ label, onPress, variant = "primary", disabled, testID }: PrimaryButtonProps) {
  const { colors } = useAppAppearance();
  const buttonColor = variant === "danger" ? colors.danger : variant === "ghost" ? "transparent" : colors.primaryDark;
  const textColor = variant === "danger" ? colors.onPrimary : variant === "ghost" ? colors.primaryDark : colors.onPrimary;

  return (
    <Button
      buttonColor={buttonColor}
      contentStyle={styles.content}
      disabled={disabled}
      labelStyle={styles.label}
      mode={variant === "ghost" ? "outlined" : "contained"}
      onPress={onPress}
      style={[styles.button, { borderColor: colors.border }, variant === "ghost" && { backgroundColor: colors.surface }, variant === "danger" && styles.dangerButton]}
      testID={testID}
      textColor={textColor}
    >
      {label}
    </Button>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 20,
    shadowColor: "#A9B8F5",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 2,
  },
  dangerButton: {
    borderColor: "rgba(184, 92, 87, 0.24)",
  },
  content: {
    height: 48,
  },
  label: {
    fontFamily: fonts.heading,
    fontSize: 12.5,
    letterSpacing: 0,
  },
});

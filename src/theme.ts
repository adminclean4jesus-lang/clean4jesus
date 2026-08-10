import { MD3DarkTheme, MD3LightTheme, configureFonts } from "react-native-paper";
import { Appearance, Platform } from "react-native";

export const lightColors = {
  background: "#F8F9FA",
  surface: "#FFFFFF",
  surfaceAlt: "#EEF2FF",
  card: "#FFFFFF",
  cardText: "#17211D",
  primary: "#1A237E",
  primaryDark: "#0F164E",
  accent: "#F9A825",
  accentSoft: "rgba(249, 168, 37, 0.16)",
  danger: "#C62828",
  text: "#17211D",
  muted: "#66726D",
  mutedDark: "#8A958F",
  border: "#DDE4DE",
  success: "#2E7D32",
  successSoft: "rgba(46, 125, 50, 0.12)",
  partial: "#A67C00",
  partialSoft: "rgba(249, 168, 37, 0.18)",
  empty: "#EEF2EE",
  black: "#101815",
  onPrimary: "#FFFFFF",
  onAccent: "#17211D",
} as const;

export const darkColors = {
  background: "#10131B",
  surface: "#181D28",
  surfaceAlt: "#242C3C",
  card: "#181D28",
  cardText: "#F4F7FB",
  primary: "#AAB9FF",
  primaryDark: "#DCE3FF",
  accent: "#F6C652",
  accentSoft: "rgba(246, 198, 82, 0.18)",
  danger: "#FF8A86",
  text: "#F4F7FB",
  muted: "#B5BFCC",
  mutedDark: "#8E99A8",
  border: "#303A4C",
  success: "#79D59D",
  successSoft: "rgba(121, 213, 157, 0.14)",
  partial: "#F1C85D",
  partialSoft: "rgba(241, 200, 93, 0.18)",
  empty: "#242B36",
  black: "#090B10",
  onPrimary: "#10131B",
  onAccent: "#10131B",
} as const;

export type ThemeColors = { [Key in keyof typeof lightColors]: string };

// Legacy export for modules that do not render UI. Screens and components must
// consume useAppAppearance so a preference change updates without a reload.
export const colors = Appearance.getColorScheme() === "dark" ? darkColors : lightColors;

export const fonts = {
  // These faces are not bundled in the iOS binary. Passing their names to
  // UIKit during the first render can crash the React Native font bridge on
  // iOS 18. Use the proven system face there; Android retains its typography.
  display: Platform.OS === "ios" ? "System" : "LexendDeca_700Bold",
  heading: Platform.OS === "ios" ? "System" : "PlusJakartaSans_600SemiBold",
  body: Platform.OS === "ios" ? "System" : "Inter_400Regular",
  bodyMedium: Platform.OS === "ios" ? "System" : "PlusJakartaSans_500Medium",
  label: Platform.OS === "ios" ? "System" : "Inter_400Regular",
} as const;

const fontConfig = {
  fontFamily: fonts.body,
} as const;

export function createPaperTheme(palette: ThemeColors, dark = false) {
  const baseTheme = dark ? MD3DarkTheme : MD3LightTheme;

  return {
  ...baseTheme,
  roundness: 24,
  colors: {
    ...baseTheme.colors,
    primary: palette.primary,
    secondary: palette.accent,
    error: palette.danger,
    background: palette.background,
    surface: palette.surface,
    onSurface: palette.text,
    outline: palette.border,
  },
  fonts: configureFonts({ config: fontConfig }),
  };
}

export const paperTheme = createPaperTheme(lightColors);


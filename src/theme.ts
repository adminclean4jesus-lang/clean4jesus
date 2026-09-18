import { MD3DarkTheme, MD3LightTheme, configureFonts } from "react-native-paper";
import { Appearance } from "react-native";

export const lightColors = {
  background: "#F8F9FA",
  surface: "#FFFFFF",
  surfaceAlt: "#F3F4F5",
  card: "#FFFFFF",
  cardText: "#17211D",
  primary: "#02174B",
  primaryDark: "#02174B",
  accent: "#D9A441",
  accentSoft: "#FFDEA5",
  danger: "#BA1A1A",
  text: "#191C1D",
  muted: "#45464F",
  mutedDark: "#757680",
  border: "#E1E3E4",
  success: "#12835B",
  successSoft: "#D5F4E7",
  partial: "#775A19",
  partialSoft: "#FFF1D6",
  empty: "#E7E8E9",
  black: "#000000",
  onPrimary: "#FFFFFF",
  onAccent: "#17211D",
} as const;

export const darkColors = {
  background: "#071226",
  surface: "#101D35",
  surfaceAlt: "#192846",
  card: "#101D35",
  cardText: "#F4F7FB",
  primary: "#DCE1FF",
  primaryDark: "#DCE1FF",
  accent: "#E9C176",
  accentSoft: "rgba(233, 193, 118, 0.18)",
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
  display: "Montserrat_700Bold",
  heading: "Montserrat_600SemiBold",
  body: "Inter_400Regular",
  bodyMedium: "Inter_500Medium",
  label: "Inter_500Medium",
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


import { Image, ImageStyle, StyleProp, StyleSheet } from "react-native";

type OfficialBrandMarkProps = {
  size?: number;
  style?: StyleProp<ImageStyle>;
};

export function OfficialBrandMark({ size = 36, style }: OfficialBrandMarkProps) {
  return (
    <Image
      accessibilityIgnoresInvertColors
      accessibilityLabel="Logo oficial de Clean4Jesus"
      resizeMode="contain"
      source={require("../../assets/icon.png")}
      style={[styles.mark, { height: size, width: size }, style]}
    />
  );
}

const styles = StyleSheet.create({
  mark: { borderRadius: 10 },
});

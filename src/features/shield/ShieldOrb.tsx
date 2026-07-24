import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { useAppAppearance } from "@/features/appearance/AppearanceProvider";
import { ThemeColors } from "@/theme";

type ShieldOrbProps = { enabled: boolean };

export function ShieldOrb({ enabled }: ShieldOrbProps) {
  const { colors } = useAppAppearance();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const shieldColor = enabled ? colors.primaryDark : "#A0AAB5";

  return (
    <View style={styles.wrap}>
      {enabled ? <View style={styles.ring} /> : null}
      <View style={styles.orb}>
        <View style={styles.innerGlow}>
          <MaterialCommunityIcons color={shieldColor} name="shield-cross" size={48} />
        </View>
      </View>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  wrap: { alignItems: "center", height: 92, justifyContent: "center" },
  ring: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 48,
    height: 92,
    position: "absolute",
    width: 92,
  },
  orb: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 46,
    borderWidth: 1,
    elevation: 2,
    height: 84,
    justifyContent: "center",
    width: 84,
  },
  innerGlow: {
    alignItems: "center",
    backgroundColor: colors.surfaceAlt,
    borderRadius: 34,
    height: 68,
    justifyContent: "center",
    width: 68,
  },
  });
}

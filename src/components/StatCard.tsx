import { StyleSheet, Text, View } from "react-native";

import { useAppAppearance } from "@/features/appearance/AppearanceProvider";
import { fonts } from "@/theme";

type StatCardProps = {
  label: string;
  value: string | number;
};

export function StatCard({ label, value }: StatCardProps) {
  const { colors } = useAppAppearance();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.value, { color: colors.primaryDark }]}>{value}</Text>
      <Text style={[styles.label, { color: colors.muted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    elevation: 1,
    padding: 14,
  },
  value: {
    fontFamily: fonts.display,
    fontSize: 24,
  },
  label: {
    fontFamily: fonts.label,
    fontSize: 10,
    marginTop: 3,
    textTransform: "uppercase",
  },
});

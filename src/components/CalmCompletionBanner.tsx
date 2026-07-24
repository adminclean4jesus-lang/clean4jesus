import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { useAppAppearance } from "@/features/appearance/AppearanceProvider";
import { fonts } from "@/theme";

type CalmCompletionBannerProps = {
  body: string;
  title: string;
};

export function CalmCompletionBanner({ body, title }: CalmCompletionBannerProps) {
  const { colors } = useAppAppearance();
  return (
    <View style={styles.wrap}>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.successSoft }]}>
        <View style={[styles.iconWrap, { backgroundColor: colors.successSoft }]}>
          <MaterialCommunityIcons color={colors.success} name="shield-check-outline" size={24} />
        </View>
        <View style={styles.copy}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.body, { color: colors.muted }]}>{body}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 6 },
  card: {
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  iconWrap: {
    alignItems: "center",
    borderRadius: 999,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  copy: { flex: 1, gap: 2 },
  title: { fontFamily: fonts.heading, fontSize: 15, lineHeight: 19 },
  body: { fontFamily: fonts.body, fontSize: 12.5, lineHeight: 18 },
});

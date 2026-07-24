import { PropsWithChildren } from "react";
import { useSegments } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppAppearance } from "@/features/appearance/AppearanceProvider";
import { PERSISTENT_TAB_BAR_HEIGHT } from "@/components/PersistentTabBar";

type ScreenProps = PropsWithChildren<{
  scroll?: boolean;
}>;

export function Screen({ children, scroll = true }: ScreenProps) {
  const segments = useSegments();
  const { colors } = useAppAppearance();
  const insets = useSafeAreaInsets();
  const hasPersistentFooter = segments[0] === "(tabs)" || segments[0] === "plans";
  const bottomPadding = hasPersistentFooter
    ? PERSISTENT_TAB_BAR_HEIGHT + insets.bottom + 24
    : Math.max(insets.bottom + 20, 28);
  const edges = hasPersistentFooter ? (["top", "left", "right"] as const) : (["top", "left", "right", "bottom"] as const);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={edges}>
      {scroll ? (
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPadding }]} showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, { paddingBottom: bottomPadding }]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    gap: 14,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
});

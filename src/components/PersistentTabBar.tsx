import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useSegments } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppAppearance } from "@/features/appearance/AppearanceProvider";
import { useI18n } from "@/features/i18n/I18nProvider";
import { uiText } from "@/features/i18n/uiText";
import { fonts } from "@/theme";

export const PERSISTENT_TAB_BAR_HEIGHT = 68;

type TabItem = {
  href: "/(tabs)" | "/(tabs)/devotional" | "/(tabs)/community" | "/(tabs)/perfil";
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  key: "refugio" | "palabra" | "comunidad" | "ajustes";
};

const TAB_ITEMS: TabItem[] = [
  { href: "/(tabs)", icon: "shield-check-outline", key: "refugio" },
  { href: "/(tabs)/devotional", icon: "book-open-page-variant-outline", key: "palabra" },
  { href: "/(tabs)/community", icon: "account-group-outline", key: "comunidad" },
  { href: "/(tabs)/perfil", icon: "account-circle-outline", key: "ajustes" },
];

export function PersistentTabBar() {
  const router = useRouter();
  const segments = useSegments();
  const insets = useSafeAreaInsets();
  const { colors } = useAppAppearance();
  const { language } = useI18n();
  const activeKey = getActiveTabKey(segments);
  const bottomInset = Math.max(insets.bottom, 10);

  return (
    <View
      style={[styles.safeArea, { backgroundColor: colors.surface, borderTopColor: colors.border, height: PERSISTENT_TAB_BAR_HEIGHT + bottomInset }]}
      testID="persistent-tab-bar"
    >
      <View style={[styles.shell, { backgroundColor: colors.surface }]}>
        {TAB_ITEMS.map((item, index) => {
          const active = item.key === activeKey;

          return (
            <Pressable
              accessibilityRole="button"
              key={item.key}
              onPress={() => {
                if (!active) {
                  router.replace(item.href);
                }
              }}
              android_ripple={{ color: "rgba(26,35,126,0.08)", borderless: false }}
              style={[
                styles.item,
                TAB_POSITION_STYLES[index],
                active && { backgroundColor: colors.surfaceAlt },
              ]}
              testID={`persistent-tab-${item.key}`}
            >
              <MaterialCommunityIcons
                color={active ? colors.primaryDark : colors.muted}
                name={item.icon}
                size={22}
              />
              <Text
                allowFontScaling={false}
                maxFontSizeMultiplier={1}
                numberOfLines={1}
                style={[styles.label, { color: active ? colors.primaryDark : colors.muted }, active && styles.labelActive]}
                testID={`persistent-tab-label-${item.key}`}
              >
                {uiText(language, item.key === "refugio" ? "tabs.refuge" : item.key === "palabra" ? "tabs.word" : item.key === "comunidad" ? "tabs.community" : "tabs.profile")}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function getActiveTabKey(segments: string[]) {
  if (segments[0] === "plans") {
    return "palabra" as const;
  }

  if (segments[0] !== "(tabs)") {
    return null;
  }

  const section = segments[1] ?? "index";
  if (section === "devotional") {
    return "palabra" as const;
  }
  if (section === "community") {
    return "comunidad" as const;
  }
  if (section === "perfil") {
    return "ajustes" as const;
  }
  return "refugio" as const;
}

const styles = StyleSheet.create({
  safeArea: {
    bottom: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    elevation: 12,
    left: 0,
    position: "absolute",
    right: 0,
  },
  shell: {
    height: PERSISTENT_TAB_BAR_HEIGHT,
    position: "relative",
    width: "100%",
  },
  item: {
    alignItems: "center",
    bottom: 0,
    justifyContent: "center",
    position: "absolute",
    paddingVertical: 7,
    top: 0,
  },
  label: {
    fontFamily: fonts.label,
    fontSize: 10,
    includeFontPadding: false,
    lineHeight: 14,
    marginTop: 4,
    maxWidth: "100%",
    overflow: "hidden",
    textAlign: "center",
    width: "100%",
  },
  labelActive: {
    fontFamily: fonts.bodyMedium,
  },
});

const TAB_POSITION_STYLES = [
  { left: 0, right: "75%" },
  { left: "25%", right: "50%" },
  { left: "50%", right: "25%" },
  { left: "75%", right: 0 },
] as const;

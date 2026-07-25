import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Text } from "react-native";

import { useAppAppearance } from "@/features/appearance/AppearanceProvider";
import { useI18n } from "@/features/i18n/I18nProvider";
import { uiText } from "@/features/i18n/uiText";
import { fonts } from "@/theme";

function TabLabel({ color, text }: { color: string; text: string }) {
  return (
    <Text
        adjustsFontSizeToFit
        minimumFontScale={0.82}
        numberOfLines={1}
        style={{
          color,
          fontFamily: fonts.label,
          fontSize: 9,
          textAlign: "center",
          width: 74,
        }}
      >
        {text}
      </Text>
  );
}

export default function TabsLayout() {
  const { colors } = useAppAppearance();
  const { language } = useI18n();

  return (
    <Tabs
      tabBar={() => null}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primaryDark,
        tabBarInactiveTintColor: colors.muted,
        tabBarIconStyle: { marginBottom: 1 },
        tabBarItemStyle: { minWidth: 0 },
        tabBarLabelStyle: { fontFamily: fonts.label, fontSize: 9 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons color={color} name="shield-check-outline" size={size - 2} />,
          tabBarLabel: ({ color }) => <TabLabel color={color} text={uiText(language, "tabs.refuge")} />,
          title: uiText(language, "tabs.refuge"),
        }}
      />
      <Tabs.Screen
        name="devotional"
        options={{
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons color={color} name="book-open-page-variant-outline" size={size - 2} />,
          tabBarLabel: ({ color }) => <TabLabel color={color} text={uiText(language, "tabs.word")} />,
          title: uiText(language, "tabs.word"),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons color={color} name="account-group-outline" size={size - 2} />,
          tabBarLabel: ({ color }) => <TabLabel color={color} text={uiText(language, "tabs.community")} />,
          title: uiText(language, "tabs.community"),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons color={color} name="account-circle-outline" size={size - 2} />,
          tabBarLabel: ({ color }) => <TabLabel color={color} text={uiText(language, "tabs.profile")} />,
          title: uiText(language, "tabs.profile"),
        }}
      />
    </Tabs>
  );
}

import "../global.css";

import { Inter_400Regular, useFonts } from "@expo-google-fonts/inter";
import { LexendDeca_700Bold } from "@expo-google-fonts/lexend-deca";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from "@expo-google-fonts/plus-jakarta-sans";
import * as Notifications from "expo-notifications";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform } from "react-native";
import { PaperProvider } from "react-native-paper";

import { PersistentTabBar } from "@/components/PersistentTabBar";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { AppearanceProvider, useAppAppearance } from "@/features/appearance/AppearanceProvider";
import { primeDevotionalReminderPermissionsOnLaunch } from "@/features/devotionalPlans/devotionalReminderService";
import { DevotionalCatalogProvider } from "@/features/devotionalPlans/DevotionalCatalogProvider";
import { configureFalsePositiveReporting } from "@/features/falsePositive/falsePositiveReportingService";
import { I18nProvider, useI18n } from "@/features/i18n/I18nProvider";
import { coreFlowText } from "@/features/i18n/coreFlowText";
import { VersionGateProvider } from "@/features/runtime/VersionGateProvider";
import { createPaperTheme, fonts } from "@/theme";
import { useSegments } from "expo-router";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [loaded] = useFonts({
    Inter_400Regular,
    LexendDeca_700Bold,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  useEffect(() => {
    if (Platform.OS === "web") {
      return;
    }

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const route = response.notification.request.content.data?.route;
      if (typeof route === "string" && isAllowedNotificationRoute(route)) {
        router.push(route as Parameters<typeof router.push>[0]);
        void Notifications.clearLastNotificationResponseAsync();
      }
    });

    void Notifications.getLastNotificationResponseAsync().then((response) => {
      const route = response?.notification.request.content.data?.route;
      if (typeof route === "string" && isAllowedNotificationRoute(route)) {
        router.push(route as Parameters<typeof router.push>[0]);
        void Notifications.clearLastNotificationResponseAsync();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [router]);

  useEffect(() => {
    if (Platform.OS === "web") {
      return undefined;
    }

    const timeout = setTimeout(() => {
      void primeDevotionalReminderPermissionsOnLaunch();
    }, 700);

    return () => clearTimeout(timeout);
  }, []);

  if (!loaded) {
    return null;
  }

  const showPersistentTabBar = segments[0] === "(tabs)" || segments[0] === "plans";

  return (
    <AppearanceProvider>
      <RootContent loaded={loaded} router={router} segments={segments} />
    </AppearanceProvider>
  );
}

function RootContent({
  loaded,
  router,
  segments,
}: {
  loaded: boolean;
  router: ReturnType<typeof useRouter>;
  segments: string[];
}) {
  const { colors, isDark, ready } = useAppAppearance();

  if (!loaded || !ready) {
    return null;
  }

  const showPersistentTabBar = segments[0] === "(tabs)" || segments[0] === "plans";

  return (
    <PaperProvider theme={createPaperTheme(colors, isDark)}>
      <I18nProvider>
        <NavigatorContent colors={colors} isDark={isDark} showPersistentTabBar={showPersistentTabBar} />
      </I18nProvider>
    </PaperProvider>
  );
}

function NavigatorContent({ colors, isDark, showPersistentTabBar }: { colors: ReturnType<typeof useAppAppearance>["colors"]; isDark: boolean; showPersistentTabBar: boolean }) {
  const { language } = useI18n();

  useEffect(() => {
    void configureFalsePositiveReporting();
  }, []);

  return (
    <DevotionalCatalogProvider>
      <VersionGateProvider>
        <AuthProvider>
        <StatusBar style={isDark ? "light" : "dark"} />
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: colors.background },
            headerStyle: { backgroundColor: colors.background },
            headerShadowVisible: false,
            headerTintColor: colors.text,
            headerTitleStyle: { fontFamily: fonts.heading },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="ios-protection" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
          <Stack.Screen name="callback" options={{ headerShown: false }} />
          <Stack.Screen name="auth/reset-password" options={{ headerShown: false }} />
          <Stack.Screen name="app-protection" options={{ headerShown: false }} />
          <Stack.Screen name="trusted-person" options={{ headerShown: false }} />
          <Stack.Screen name="interruption-settings" options={{ headerShown: false }} />
          <Stack.Screen name="settings" options={{ headerShown: false }} />
          <Stack.Screen name="plans/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="plans/[id]/day/[day]" options={{ headerShown: false }} />
          <Stack.Screen name="pin-setup" options={{ title: coreFlowText(language, "pin.setup.title") }} />
          <Stack.Screen name="pin-verify" options={{ title: coreFlowText(language, "pin.verify.title") }} />
        </Stack>
        {showPersistentTabBar ? <PersistentTabBar /> : null}
        </AuthProvider>
      </VersionGateProvider>
    </DevotionalCatalogProvider>
  );
}

function isAllowedNotificationRoute(route: string) {
  return route === "/(tabs)/devotional" || /^\/plans\/[a-z0-9-]+(?:\/day\/[1-7])?$/.test(route);
}

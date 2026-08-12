
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform } from "react-native";
import { PaperProvider } from "react-native-paper";

import { PersistentTabBar } from "@/components/PersistentTabBar";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { AppearanceProvider, useAppAppearance } from "@/features/appearance/AppearanceProvider";
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

  useEffect(() => {
    if (Platform.OS !== "android") {
      return;
    }

    let disposed = false;
    let removeSubscription: (() => void) | undefined;

    void import("expo-notifications").then((Notifications) => {
      if (disposed) return;

      const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
        const route = response.notification.request.content.data?.route;
        if (typeof route === "string" && isAllowedNotificationRoute(route)) {
          router.push(route as Parameters<typeof router.push>[0]);
          void Notifications.clearLastNotificationResponseAsync();
        }
      });
      removeSubscription = () => subscription.remove();

      void Notifications.getLastNotificationResponseAsync().then((response) => {
        const route = response?.notification.request.content.data?.route;
        if (typeof route === "string" && isAllowedNotificationRoute(route)) {
          router.push(route as Parameters<typeof router.push>[0]);
          void Notifications.clearLastNotificationResponseAsync();
        }
      });
    });

    return () => {
      disposed = true;
      removeSubscription?.();
    };
  }, [router]);

  useEffect(() => {
    if (Platform.OS !== "android") {
      return undefined;
    }

    const timeout = setTimeout(() => {
      void import("@/features/devotionalPlans/devotionalReminderService").then(
        ({ primeDevotionalReminderPermissionsOnLaunch }) => primeDevotionalReminderPermissionsOnLaunch(),
      );
    }, 700);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <AppearanceProvider>
      <RootContent router={router} segments={segments} />
    </AppearanceProvider>
  );
}

function RootContent({
  router,
  segments,
}: {
  router: ReturnType<typeof useRouter>;
  segments: string[];
}) {
  const { colors, isDark, ready } = useAppAppearance();

  if (!ready) {
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
    <VersionGateProvider>
      <DevotionalCatalogProvider>
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
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
          <Stack.Screen name="callback" options={{ headerShown: false }} />
          <Stack.Screen name="auth/reset-password" options={{ headerShown: false }} />
          <Stack.Screen name="app-protection" options={{ headerShown: false }} />
          <Stack.Screen name="trusted-person" options={{ headerShown: false }} />
          <Stack.Screen name="interruption-settings" options={{ headerShown: false }} />
          <Stack.Screen name="settings" options={{ headerShown: false }} />
          <Stack.Screen name="ios-protection" options={{ title: "Protección iOS" }} />
          <Stack.Screen name="plans/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="plans/[id]/day/[day]" options={{ headerShown: false }} />
          <Stack.Screen name="pin-setup" options={{ title: coreFlowText(language, "pin.setup.title") }} />
          <Stack.Screen name="pin-verify" options={{ title: coreFlowText(language, "pin.verify.title") }} />
        </Stack>
        {showPersistentTabBar ? <PersistentTabBar /> : null}
        </AuthProvider>
      </DevotionalCatalogProvider>
    </VersionGateProvider>
  );
}

function isAllowedNotificationRoute(route: string) {
  return route === "/(tabs)/devotional" || /^\/plans\/[a-z0-9-]+(?:\/day\/[1-7])?$/.test(route);
}

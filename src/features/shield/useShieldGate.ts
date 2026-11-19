import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Platform } from "react-native";

import { iosProtectionService } from "@/features/iosProtection/iosProtectionService.ios";
import { getShieldEnabled } from "@/features/shield/shieldService";
import { isProtectionGateEnabled } from "@/features/shield/shieldGatePolicy";
import { useAuth } from "@/features/auth/AuthProvider";
import { hasPin } from "@/features/pin/pinService";

export function useShieldGate() {
  const router = useRouter();
  const { status } = useAuth();
  const [checked, setChecked] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const e2eReady = process.env.EXPO_PUBLIC_E2E === "true"
        && Platform.OS === "web"
        && typeof window !== "undefined"
        && window.localStorage.getItem("clean4jesus.e2e.authenticated") === "true";
      if (e2eReady) {
        setEnabled(true);
        setChecked(true);
        return () => { active = false; };
      }

      if (status === "loading") {
        setChecked(false);
        return () => {
          active = false;
        };
      }

      if (status !== "authenticated") {
        setChecked(true);
        setEnabled(false);
        router.replace("/");
        return () => {
          active = false;
        };
      }

      void (async () => {
        try {
          const [pinReady, localShieldEnabled, iosStatus] = await Promise.all([
            hasPin(),
            Platform.OS === "ios" ? Promise.resolve(false) : getShieldEnabled(),
            Platform.OS === "ios"
              ? iosProtectionService.getProtectionStatus()
              : Promise.resolve(null),
          ]);
          const nextEnabled = pinReady && isProtectionGateEnabled({
            platform: Platform.OS,
            iosProtectionEnabled: Boolean(iosStatus?.isEnabled),
            localShieldEnabled,
          });
          if (!active) {
            return;
          }

          setEnabled(nextEnabled);

          if (!nextEnabled) {
            router.replace("/");
          }
        } catch {
          if (!active) {
            return;
          }

          setEnabled(false);
          router.replace("/");
        } finally {
          if (active) {
            setChecked(true);
          }
        }
      })();

      return () => {
        active = false;
      };
    }, [router, status]),
  );

  return { checked, enabled };
}

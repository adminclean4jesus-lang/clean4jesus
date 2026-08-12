import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Platform } from "react-native";

import { iosProtectionService } from "@/features/iosProtection/iosProtectionService.ios";
import { getShieldEnabled } from "@/features/shield/shieldService";
import { isProtectionGateEnabled } from "@/features/shield/shieldGatePolicy";

export function useShieldGate() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      void (async () => {
        try {
          const [localShieldEnabled, iosStatus] = await Promise.all([
            Platform.OS === "ios" ? Promise.resolve(false) : getShieldEnabled(),
            Platform.OS === "ios"
              ? iosProtectionService.getProtectionStatus()
              : Promise.resolve(null),
          ]);
          const nextEnabled = isProtectionGateEnabled({
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
    }, [router]),
  );

  return { checked, enabled };
}

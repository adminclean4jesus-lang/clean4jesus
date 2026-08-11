import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";

import { getShieldEnabled } from "@/features/shield/shieldService";

export function useShieldGate() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      void (async () => {
        try {
          const nextEnabled = await getShieldEnabled();
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

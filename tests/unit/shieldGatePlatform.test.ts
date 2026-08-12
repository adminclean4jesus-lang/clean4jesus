import { describe, expect, it } from "vitest";

import { isProtectionGateEnabled } from "@/features/shield/shieldGatePolicy";

describe("platform protection gate", () => {
  it("keeps iOS tabs available when native Family Controls protection is active", () => {
    expect(
      isProtectionGateEnabled({
        iosProtectionEnabled: true,
        localShieldEnabled: false,
        platform: "ios",
      }),
    ).toBe(true);
  });

  it("continues using the local shield state on Android", () => {
    expect(
      isProtectionGateEnabled({
        iosProtectionEnabled: false,
        localShieldEnabled: true,
        platform: "android",
      }),
    ).toBe(true);
  });
});

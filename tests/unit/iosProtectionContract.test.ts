import { describe, expect, it } from "vitest";

import { canUseIosNativeProtection, getIosReadinessItems, iosProtectionNativeContract } from "../../src/features/iosProtection/iosProtectionContract";
import { getProtectionPlatformDescriptor } from "../../src/features/shield/protectionPlatform";

describe("iOS protection preparation", () => {
  it("keeps shared experiences available while native protection remains pending", () => {
    expect(getIosReadinessItems().find((item) => item.id === "shared-app")?.ready).toBe(true);
    expect(getIosReadinessItems().find((item) => item.id === "family-controls")?.ready).toBe(false);
  });

  it("does not expose a fake native authorization", async () => {
    await expect(iosProtectionNativeContract.getAuthorizationStatus()).resolves.toBe("unavailable");
    await expect(iosProtectionNativeContract.applyShield("apps")).rejects.toThrow("not configured");
  });

  it("requires every iOS capability before describing native protection as available", () => {
    expect(canUseIosNativeProtection(getProtectionPlatformDescriptor("ios").capabilities)).toBe(false);
  });
});

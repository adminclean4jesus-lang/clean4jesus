import { describe, expect, it } from "vitest";

import { getProtectionPlatformDescriptor } from "../../src/features/shield/protectionPlatform";

describe("protection platform boundary", () => {
  it("keeps Android on the proven native protection engine", () => {
    const platform = getProtectionPlatformDescriptor("android");

    expect(platform.isNativeProtectionAvailable).toBe(true);
    expect(platform.setupRoute).toBe("/");
  });

  it("never represents iOS protection as ready before Apple capabilities exist", () => {
    const platform = getProtectionPlatformDescriptor("ios");

    expect(platform.isNativeProtectionAvailable).toBe(false);
    expect(platform.setupRoute).toBe("/ios-protection");
    expect(platform.capabilities.every((capability) => capability.requiresAppleEntitlement)).toBe(true);
  });
});

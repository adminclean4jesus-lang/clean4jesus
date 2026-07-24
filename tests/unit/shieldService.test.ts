import { describe, expect, it } from "vitest";

import { isShieldReady, type ShieldState } from "../../src/features/shield/shieldService";

describe("shield readiness", () => {
  it("does not count as ready when setup is incomplete", () => {
    const state: ShieldState = {
      activatedAt: null,
      disabledAt: null,
      enabled: true,
      setupComplete: false,
      nativeStatus: "not-configured",
      primaryDns: "185.228.168.168",
      provider: "cleanbrowsing",
      secondaryDns: "185.228.169.168",
      statusMessage: "pending",
    };

    expect(isShieldReady(state)).toBe(false);
  });

  it("counts as ready only when enabled and configured", () => {
    const state: ShieldState = {
      activatedAt: "2026-06-26T00:00:00.000Z",
      disabledAt: null,
      enabled: true,
      setupComplete: true,
      nativeStatus: "active",
      primaryDns: "185.228.168.168",
      provider: "cleanbrowsing",
      secondaryDns: "185.228.169.168",
      statusMessage: "active",
    };

    expect(isShieldReady(state)).toBe(true);
  });
});

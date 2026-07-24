import { describe, expect, it } from "vitest";

import { requiresGuardianPin } from "../../src/features/appProtection/appProtectionPolicy";

describe("requiresGuardianPin", () => {
  it("does not ask for a pin when creating a new limited rule", () => {
    expect(requiresGuardianPin(undefined, { dailyLimitMinutes: 30, enabled: true, mode: "limited", packageName: "com.android.chrome" })).toBe(false);
  });

  it("does not ask for a pin when changing minutes inside limited mode", () => {
    expect(
      requiresGuardianPin(
        { dailyLimitMinutes: 30, enabled: true, mode: "limited", packageName: "com.android.chrome" },
        { dailyLimitMinutes: 120, enabled: true, mode: "limited", packageName: "com.android.chrome" },
      ),
    ).toBe(false);
  });

  it("asks for a pin when freeing a limited rule", () => {
    expect(requiresGuardianPin({ dailyLimitMinutes: 30, enabled: true, mode: "limited", packageName: "com.android.chrome" }, null)).toBe(true);
  });

  it("asks for a pin when moving from blocked to limited", () => {
    expect(
      requiresGuardianPin(
        { enabled: true, mode: "blocked", packageName: "com.android.chrome" },
        { dailyLimitMinutes: 30, enabled: true, mode: "limited", packageName: "com.android.chrome" },
      ),
    ).toBe(true);
  });
});

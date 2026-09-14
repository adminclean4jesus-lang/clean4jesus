import { afterEach, describe, expect, it, vi } from "vitest";

import {
  consumeIosPinSessionVerified,
  markIosPinSessionVerified,
} from "../../src/features/pin/pinSession";

afterEach(() => {
  consumeIosPinSessionVerified("edit-ios-limits");
  vi.useRealTimers();
});

describe("iOS guardian PIN edit ticket", () => {
  it("allows exactly one edit of the verified action", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-13T12:00:00Z"));
    markIosPinSessionVerified("edit-ios-limits");

    expect(consumeIosPinSessionVerified("edit-ios-limits")).toBe(true);
    expect(consumeIosPinSessionVerified("edit-ios-limits")).toBe(false);
  });

  it("rejects the other edit action and invalidates the ticket", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-13T12:00:00Z"));
    markIosPinSessionVerified("edit-ios-limits");

    expect(consumeIosPinSessionVerified("edit-ios-selection")).toBe(false);
    expect(consumeIosPinSessionVerified("edit-ios-limits")).toBe(false);
  });

  it("expires after sixty seconds", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-13T12:00:00Z"));
    markIosPinSessionVerified("edit-ios-selection");
    vi.advanceTimersByTime(60_000);

    expect(consumeIosPinSessionVerified("edit-ios-selection")).toBe(false);
  });
});

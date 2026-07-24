import { describe, expect, it } from "vitest";

import { cleanStreakFromStartDate, nextCleanStartDate, nextDailyStreak } from "../../src/features/habits/streak";

describe("clean streak", () => {
  it("counts days from the start date", () => {
    expect(cleanStreakFromStartDate("2026-06-15", new Date("2026-06-15T12:00:00.000Z"))).toBe(1);
    expect(cleanStreakFromStartDate("2026-06-15", new Date("2026-06-16T12:00:00.000Z"))).toBe(2);
  });

  it("moves the next clean start date to the day after a fall", () => {
    expect(nextCleanStartDate("2026-06-15")).toBe("2026-06-16");
  });
});

describe("nextDailyStreak", () => {
  it("starts a streak on first completion", () => {
    expect(
      nextDailyStreak({
        currentStreak: 0,
        bestStreak: 0,
        lastCompletedDate: null,
        completedDate: "2026-06-15",
      }),
    ).toEqual({
      currentStreak: 1,
      bestStreak: 1,
      lastCompletedDate: "2026-06-15",
      changed: true,
    });
  });

  it("does not increment twice on the same day", () => {
    expect(
      nextDailyStreak({
        currentStreak: 1,
        bestStreak: 1,
        lastCompletedDate: "2026-06-15",
        completedDate: "2026-06-15",
      }),
    ).toEqual({
      currentStreak: 1,
      bestStreak: 1,
      lastCompletedDate: "2026-06-15",
      changed: false,
    });
  });

  it("increments on consecutive days", () => {
    expect(
      nextDailyStreak({
        currentStreak: 1,
        bestStreak: 1,
        lastCompletedDate: "2026-06-15",
        completedDate: "2026-06-16",
      }).currentStreak,
    ).toBe(2);
  });

  it("resets after a skipped day", () => {
    expect(
      nextDailyStreak({
        currentStreak: 5,
        bestStreak: 5,
        lastCompletedDate: "2026-06-15",
        completedDate: "2026-06-17",
      }).currentStreak,
    ).toBe(1);
  });
});

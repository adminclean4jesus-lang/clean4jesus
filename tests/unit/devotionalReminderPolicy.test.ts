import { beforeEach, describe, expect, it, vi } from "vitest";

import { getDevotionalReminderTarget } from "../../src/features/devotionalPlans/devotionalReminderPolicy";

describe("getDevotionalReminderTarget", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-10T12:00:00.000Z"));
  });

  it("returns the generic daily reminder when there are no active plans", () => {
    const target = getDevotionalReminderTarget({});

    expect(target.kind).toBe("daily");
    expect(target.route).toBe("/(tabs)/devotional");
    expect(target.title).toBe("Palabra para hoy");
  });

  it("prioritizes the most overdue unfinished plan and opens the exact day", () => {
    const target = getDevotionalReminderTarget({
      "primeros-7-dias": {
        completedDays: [1, 2],
        planId: "primeros-7-dias",
        startedAt: "2026-07-01",
      },
      "volver-a-empezar": {
        completedDays: [1],
        planId: "volver-a-empezar",
        startedAt: "2026-07-08",
      },
    });

    expect(target.kind).toBe("plan");
    if (target.kind !== "plan") {
      throw new Error("Expected a plan reminder target");
    }

    expect(target.planId).toBe("primeros-7-dias");
    expect(target.day).toBe(3);
    expect(target.route).toBe("/plans/primeros-7-dias/day/3");
    expect(target.missedDays).toBeGreaterThan(0);
  });

  it("changes the copy when more than one plan is active", () => {
    const target = getDevotionalReminderTarget({
      "primeros-7-dias": {
        completedDays: [],
        planId: "primeros-7-dias",
        startedAt: "2026-07-10",
      },
      "fortaleza-noche": {
        completedDays: [],
        planId: "fortaleza-noche",
        startedAt: "2026-07-10",
      },
    });

    expect(target.title).toContain("2 planes");
    expect(target.body).toContain("También tienes 1 plan");
  });

  it("uses the current unread day when there are no missed days", () => {
    const target = getDevotionalReminderTarget({
      "volver-a-empezar": {
        completedDays: [1, 2],
        planId: "volver-a-empezar",
        startedAt: "2026-07-09",
      },
    });

    expect(target.kind).toBe("plan");
    if (target.kind !== "plan") {
      throw new Error("Expected a plan reminder target");
    }

    expect(target.day).toBe(3);
    expect(target.dayTitle.length).toBeGreaterThan(0);
    expect(target.route).toBe("/plans/volver-a-empezar/day/3");
  });
});

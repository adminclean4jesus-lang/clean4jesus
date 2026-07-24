import { getDevotionalPlanSummaryFromCatalog, getLatestDevotionalCatalog } from "@/features/devotionalPlans/devotionalCatalogStore";
import { markDevotionalRead } from "@/features/habits/habitService";
import { getJson, setJson, storageKeys } from "@/services/storage";
import { DevotionalPlanEnrollment, DevotionalPlanProgress } from "@/types/devotionalPlan";

const emptyProgress: DevotionalPlanProgress = {};
const dayMs = 24 * 60 * 60 * 1000;

function planDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function getDevotionalPlanProgress(): Promise<DevotionalPlanProgress> {
  return getJson<DevotionalPlanProgress>(storageKeys.devotionalPlanProgress, emptyProgress);
}

export async function enrollDevotionalPlan(planId: string, date = new Date()): Promise<DevotionalPlanEnrollment> {
  const plan = getDevotionalPlanSummaryFromCatalog(planId);
  if (!plan) {
    throw new Error(`Plan not found: ${planId}`);
  }

  const progress = await getDevotionalPlanProgress();
  const existing = progress[planId];
  if (existing) {
    return existing;
  }

  const enrollment: DevotionalPlanEnrollment = {
    completedDays: [],
    planId,
    startedAt: planDateKey(date),
  };

  await setJson(storageKeys.devotionalPlanProgress, {
    ...progress,
    [planId]: enrollment,
  });

  return enrollment;
}

export async function completeDevotionalPlanDay(planId: string, day: number): Promise<DevotionalPlanEnrollment> {
  const plan = getDevotionalPlanSummaryFromCatalog(planId);
  if (!plan || !Number.isInteger(day) || day < 1 || day > plan.dayCount) {
    throw new Error(`Plan day not found: ${planId}/${day}`);
  }

  const progress = await getDevotionalPlanProgress();
  const enrollment = progress[planId] ?? (await enrollDevotionalPlan(planId));
  const completedDays = enrollment.completedDays.includes(day)
    ? enrollment.completedDays
    : [...enrollment.completedDays, day].sort((a, b) => a - b);
  const next = {
    ...enrollment,
    completedDays,
  };

  await setJson(storageKeys.devotionalPlanProgress, {
    ...progress,
    [planId]: next,
  });

  await markDevotionalRead();
  return next;
}

export function addDays(dateKeyValue: string, days: number): string {
  const [year, month, day] = dateKeyValue.split("-").map(Number);
  return planDateKey(new Date(year, month - 1, day + days));
}

export function getPlanDayDate(enrollment: DevotionalPlanEnrollment | null | undefined, day: number): string | null {
  if (!enrollment) {
    return null;
  }

  return addDays(enrollment.startedAt, day - 1);
}

export function getCurrentPlanDay(enrollment: DevotionalPlanEnrollment | null | undefined, date = new Date()): number | null {
  if (!enrollment) {
    return null;
  }

  const [startYear, startMonth, startDay] = enrollment.startedAt.split("-").map(Number);
  const [currentYear, currentMonth, currentDay] = planDateKey(date).split("-").map(Number);
  const start = new Date(startYear, startMonth - 1, startDay).getTime();
  const current = new Date(currentYear, currentMonth - 1, currentDay).getTime();
  return Math.max(1, Math.floor((current - start) / dayMs) + 1);
}

export function getPlanStats(progress: DevotionalPlanProgress) {
  const enrolledCount = Object.keys(progress).length;
  const completedPlans = getLatestDevotionalCatalog().filter((plan) => {
    const enrollment = progress[plan.id];
    return enrollment && enrollment.completedDays.length >= plan.dayCount;
  }).length;
  const activeCount = Math.max(0, enrolledCount - completedPlans);

  return {
    activeCount,
    completedPlans,
    enrolledCount,
  };
}

export function getSuggestedPlanDay(planId: string, enrollment: DevotionalPlanEnrollment | null | undefined, date = new Date()) {
  const plan = getDevotionalPlanSummaryFromCatalog(planId);
  if (!plan || !enrollment) {
    return null;
  }

  const currentDay = Math.min(getCurrentPlanDay(enrollment, date) ?? 1, plan.dayCount);

  for (let day = 1; day <= currentDay; day += 1) {
    if (!enrollment.completedDays.includes(day)) {
      return day;
    }
  }

  for (let day = currentDay + 1; day <= plan.dayCount; day += 1) {
    if (!enrollment.completedDays.includes(day)) {
      return day;
    }
  }

  return plan.dayCount;
}

export function getMissedPlanDaysCount(planId: string, enrollment: DevotionalPlanEnrollment | null | undefined, date = new Date()) {
  const plan = getDevotionalPlanSummaryFromCatalog(planId);
  if (!plan || !enrollment) {
    return 0;
  }

  const currentDay = Math.min(getCurrentPlanDay(enrollment, date) ?? 1, plan.dayCount);
  let missed = 0;

  for (let day = 1; day < currentDay; day += 1) {
    if (!enrollment.completedDays.includes(day)) {
      missed += 1;
    }
  }

  return missed;
}

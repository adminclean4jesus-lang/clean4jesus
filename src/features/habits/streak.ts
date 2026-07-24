export function dateKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function utcDayNumber(key: string): number {
  return Math.floor(Date.parse(`${key}T00:00:00.000Z`) / 86400000);
}

export function shiftDateKey(key: string, offsetDays: number): string {
  const shifted = new Date(`${key}T00:00:00.000Z`);
  shifted.setUTCDate(shifted.getUTCDate() + offsetDays);
  return dateKey(shifted);
}

export function cleanStreakFromStartDate(startDate: string | null, date = new Date()): number {
  if (!startDate) {
    return 0;
  }

  const currentKey = dateKey(date);
  if (utcDayNumber(currentKey) < utcDayNumber(startDate)) {
    return 0;
  }

  return utcDayNumber(currentKey) - utcDayNumber(startDate) + 1;
}

export function nextCleanStartDate(lastFallDate: string): string {
  return shiftDateKey(lastFallDate, 1);
}

export function nextDailyStreak(params: {
  currentStreak: number;
  bestStreak: number;
  lastCompletedDate: string | null;
  completedDate: string;
}) {
  const { currentStreak, bestStreak, lastCompletedDate, completedDate } = params;

  if (lastCompletedDate === completedDate) {
    return {
      currentStreak,
      bestStreak: Math.max(bestStreak, currentStreak),
      lastCompletedDate,
      changed: false,
    };
  }

  const isConsecutive =
    lastCompletedDate !== null && utcDayNumber(completedDate) - utcDayNumber(lastCompletedDate) === 1;
  const nextCurrentStreak = isConsecutive ? currentStreak + 1 : 1;

  return {
    currentStreak: nextCurrentStreak,
    bestStreak: Math.max(bestStreak, nextCurrentStreak),
    lastCompletedDate: completedDate,
    changed: true,
  };
}

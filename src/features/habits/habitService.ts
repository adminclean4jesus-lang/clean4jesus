import { cleanStreakFromStartDate, dateKey, nextCleanStartDate, nextDailyStreak, shiftDateKey } from "@/features/habits/streak";
import { getJson, setJson, storageKeys } from "@/services/storage";

type LegacyHabitState = Partial<HabitState> & {
  lastCleanDate?: string | null;
};

export type HabitState = {
  cleanStreak: number;
  bestCleanStreak: number;
  cleanSinceDate: string | null;
  lastFallDate: string | null;
  fallDates: string[];
  devotionalStreak: number;
  bestDevotionalStreak: number;
  lastDevotionalReadDate: string | null;
  devotionalReadDates: string[];
  prayerCompletedDate: string | null;
  dailyCompletions: Record<string, string[]>;
};

export type SuggestedHabit = {
  id: string;
  name: string;
  icon: string;
};

export const suggestedHabits: SuggestedHabit[] = [
  { id: "exercise", name: "Ejercicio", icon: "run" },
  { id: "healthy-food", name: "Comí saludable", icon: "food-apple-outline" },
  { id: "bible", name: "Leí la Biblia", icon: "book-open-page-variant-outline" },
  { id: "prayer", name: "Oré", icon: "hands-pray" },
  { id: "water", name: "Bebí suficiente agua", icon: "cup-water" },
  { id: "sleep", name: "Dormí bien", icon: "sleep" },
];

export const emptyHabitState: HabitState = {
  cleanStreak: 0,
  bestCleanStreak: 0,
  cleanSinceDate: null,
  lastFallDate: null,
  fallDates: [],
  devotionalStreak: 0,
  bestDevotionalStreak: 0,
  lastDevotionalReadDate: null,
  devotionalReadDates: [],
  prayerCompletedDate: null,
  dailyCompletions: {},
};

export function todayKey(date = new Date()): string {
  return dateKey(date);
}

function deriveLegacyCleanSinceDate(lastCleanDate: string | null, cleanStreak: number): string | null {
  if (!lastCleanDate || cleanStreak <= 0) {
    return null;
  }

  return shiftDateKey(lastCleanDate, 1 - cleanStreak);
}

function normalizeHabits(habits: LegacyHabitState): HabitState {
  const devotionalReadDates = habits.devotionalReadDates ?? [];
  const sortedDates = [...devotionalReadDates].sort();
  const lastDevotionalReadDate = habits.lastDevotionalReadDate ?? sortedDates.at(-1) ?? null;
  const cleanSinceDate =
    habits.cleanSinceDate ?? deriveLegacyCleanSinceDate(habits.lastCleanDate ?? null, habits.cleanStreak ?? 0) ?? todayKey();

  return {
    ...emptyHabitState,
    ...habits,
    cleanSinceDate,
    lastFallDate: habits.lastFallDate ?? null,
    fallDates: habits.fallDates ?? [],
    bestCleanStreak: habits.bestCleanStreak ?? habits.cleanStreak ?? 0,
    bestDevotionalStreak: habits.bestDevotionalStreak ?? 0,
    devotionalReadDates,
    lastDevotionalReadDate,
    dailyCompletions: habits.dailyCompletions ?? {},
  };
}

function syncCleanStreak(habits: HabitState, date = new Date()) {
  const cleanSinceDate = habits.cleanSinceDate ?? todayKey(date);
  const cleanStreak = cleanStreakFromStartDate(cleanSinceDate, date);
  const bestCleanStreak = Math.max(habits.bestCleanStreak, cleanStreak);
  const next = {
    ...habits,
    cleanSinceDate,
    cleanStreak,
    bestCleanStreak,
  };

  const changed =
    next.cleanStreak !== habits.cleanStreak ||
    next.bestCleanStreak !== habits.bestCleanStreak ||
    next.cleanSinceDate !== habits.cleanSinceDate;

  return { changed, habits: next };
}

async function loadHabits(): Promise<HabitState> {
  return normalizeHabits(await getJson<LegacyHabitState>(storageKeys.habits, emptyHabitState));
}

export async function getHabits(): Promise<HabitState> {
  const habits = await loadHabits();
  const synced = syncCleanStreak(habits);

  if (synced.changed) {
    await saveHabits(synced.habits);
  }

  return synced.habits;
}

export async function saveHabits(habits: HabitState): Promise<void> {
  await setJson(storageKeys.habits, habits);
}

export async function refreshCleanStreak(date = new Date()): Promise<HabitState> {
  const habits = await loadHabits();
  const synced = syncCleanStreak(habits, date);
  if (synced.changed) {
    await saveHabits(synced.habits);
  }
  return synced.habits;
}

export async function recordFall(date = new Date()): Promise<HabitState> {
  const habits = await getHabits();
  const today = todayKey(date);

  if (habits.lastFallDate === today) {
    return habits;
  }

  const next = {
    ...habits,
    cleanSinceDate: nextCleanStartDate(today),
    cleanStreak: 0,
    bestCleanStreak: Math.max(habits.bestCleanStreak, habits.cleanStreak),
    lastFallDate: today,
    fallDates: habits.fallDates.includes(today) ? habits.fallDates : [...habits.fallDates, today],
  };

  await saveHabits(next);
  return next;
}

export async function markDevotionalRead(date = new Date()): Promise<HabitState> {
  const habits = await getHabits();
  const today = todayKey(date);
  const devotionalReadDates = habits.devotionalReadDates.includes(today)
    ? habits.devotionalReadDates
    : [...habits.devotionalReadDates, today];
  const streak = nextDailyStreak({
    currentStreak: habits.devotionalStreak,
    bestStreak: habits.bestDevotionalStreak,
    lastCompletedDate: habits.lastDevotionalReadDate,
    completedDate: today,
  });
  const next = {
    ...habits,
    dailyCompletions: addCompletion(habits.dailyCompletions, today, "bible"),
    devotionalReadDates,
    devotionalStreak: streak.currentStreak,
    bestDevotionalStreak: streak.bestStreak,
    lastDevotionalReadDate: streak.lastCompletedDate,
  };
  await saveHabits(next);
  return next;
}

export async function markPrayerComplete(date = new Date()): Promise<HabitState> {
  const habits = await getHabits();
  const today = todayKey(date);
  const next = {
    ...habits,
    dailyCompletions: addCompletion(habits.dailyCompletions, today, "prayer"),
    prayerCompletedDate: today,
  };
  await saveHabits(next);
  return next;
}

export async function toggleHabitCompletion(habitId: string, date = new Date()): Promise<HabitState> {
  const habits = await getHabits();
  const today = todayKey(date);
  const completed = habits.dailyCompletions[today] ?? [];
  const nextCompleted = completed.includes(habitId)
    ? completed.filter((id) => id !== habitId)
    : [...completed, habitId];
  const next = {
    ...habits,
    dailyCompletions: {
      ...habits.dailyCompletions,
      [today]: nextCompleted,
    },
  };
  await saveHabits(next);
  return next;
}

export function getCompletedHabitIds(habits: HabitState, date = new Date()): string[] {
  return habits.dailyCompletions[todayKey(date)] ?? [];
}

export function getMonthCompletionStatus(habits: HabitState, date = new Date()) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

  return Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    const key = dateKey(new Date(Date.UTC(year, month, day)));
    const count = habits.dailyCompletions[key]?.length ?? 0;
    const status = count === 0 ? "none" : count >= suggestedHabits.length ? "complete" : "partial";
    return { day, key, count, status };
  });
}

function addCompletion(completions: Record<string, string[]>, date: string, habitId: string) {
  const completed = completions[date] ?? [];
  return {
    ...completions,
    [date]: completed.includes(habitId) ? completed : [...completed, habitId],
  };
}

export async function incrementCleanStreak(date = new Date()): Promise<HabitState> {
  return refreshCleanStreak(date);
}

export async function resetCleanStreak(): Promise<HabitState> {
  return recordFall();
}

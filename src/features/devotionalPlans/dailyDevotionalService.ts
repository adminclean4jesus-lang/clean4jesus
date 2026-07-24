import type { SupportedLanguage } from "@/features/i18n/i18n";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { getJson, setJson } from "@/services/storage";
import type { Devotional } from "@/types/devotional";

const cacheSchema = 1;

type DailyDevotionalCache = {
  dateKey: string;
  devotional: Devotional;
  fetchedAt: string;
  revision: number;
  schema: number;
};

type DailyDevotionalPayload = {
  dateKey: string;
  devotional: Devotional;
  revision: number;
  updatedAt: string;
};

function cacheKey(language: SupportedLanguage) {
  return `clean4jesus.dailyDevotional.v${cacheSchema}.${language}`;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function isValidDevotional(value: unknown): value is Devotional {
  if (!value || typeof value !== "object") return false;
  const devotional = value as Partial<Devotional>;
  return [
    devotional.id,
    devotional.title,
    devotional.verse,
    devotional.reference,
    devotional.reflection,
    devotional.question,
    devotional.prayer,
    devotional.theme,
    devotional.practice,
  ].every(isNonEmptyString);
}

function parsePayload(value: unknown): DailyDevotionalPayload | null {
  if (!value || typeof value !== "object") return null;
  const payload = value as Partial<DailyDevotionalPayload>;
  if (!isNonEmptyString(payload.dateKey) || !isValidDevotional(payload.devotional)) return null;
  return {
    dateKey: payload.dateKey,
    devotional: payload.devotional,
    revision: Number.isFinite(payload.revision) ? Number(payload.revision) : 0,
    updatedAt: isNonEmptyString(payload.updatedAt) ? payload.updatedAt : new Date().toISOString(),
  };
}

export function getLocalDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function readCachedDailyDevotional(
  language: SupportedLanguage,
  dateKey: string,
): Promise<Devotional | null> {
  const cached = await getJson<DailyDevotionalCache | null>(cacheKey(language), null);
  if (!cached || cached.schema !== cacheSchema || cached.dateKey !== dateKey || !isValidDevotional(cached.devotional)) return null;
  return cached.devotional;
}

export async function refreshDailyDevotional(
  language: SupportedLanguage,
  dateKey: string,
): Promise<Devotional | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await getSupabaseClient().rpc("get_daily_devotional", {
    p_locale: language,
    p_on_date: dateKey,
  });
  if (error) throw error;
  const payload = parsePayload(data);
  if (!payload || payload.dateKey !== dateKey) throw new Error("Invalid daily devotional response");
  await setJson<DailyDevotionalCache>(cacheKey(language), {
    dateKey,
    devotional: payload.devotional,
    fetchedAt: new Date().toISOString(),
    revision: payload.revision,
    schema: cacheSchema,
  });
  return payload.devotional;
}

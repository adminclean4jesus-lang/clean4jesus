import type { SupportedLanguage } from "@/features/i18n/i18n";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { getJson, setJson } from "@/services/storage";
import type { DevotionalPlan, DevotionalPlanSummary } from "@/types/devotionalPlan";
import { setDevotionalCatalogSnapshot } from "./devotionalCatalogStore";

const pageSize = 24;
const catalogCacheSchema = 2;
const detailCacheSchema = 1;

type CatalogCache = { schema: number; fetchedAt: string; plans: DevotionalPlanSummary[]; revision: number };
type DetailCache = { schema: number; fetchedAt: string; plan: DevotionalPlan; revision: number };
type CatalogPayload = { hasMore: boolean; plans: DevotionalPlanSummary[]; revision: number; updatedAt: string };
type DetailPayload = { plan: DevotionalPlan | null; revision?: number; updatedAt?: string };

function catalogCacheKey(language: SupportedLanguage) {
  return `clean4jesus.devotionalCatalog.v${catalogCacheSchema}.${language}`;
}

function detailCacheKey(language: SupportedLanguage, planId: string) {
  return `clean4jesus.devotionalPlanDetail.v${detailCacheSchema}.${language}.${planId}`;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function hasValidBase(plan: Partial<DevotionalPlan | DevotionalPlanSummary>) {
  return isNonEmptyString(plan.id) && isNonEmptyString(plan.title) && isNonEmptyString(plan.subtitle)
    && isNonEmptyString(plan.description) && isNonEmptyString(plan.icon)
    && ["primary", "accent", "success"].includes(String(plan.tone));
}

export function isValidPlanSummary(value: unknown): value is DevotionalPlanSummary {
  if (!value || typeof value !== "object") return false;
  const plan = value as Partial<DevotionalPlanSummary>;
  return hasValidBase(plan) && Number.isInteger(plan.dayCount) && Number(plan.dayCount) > 0
    && Array.isArray(plan.dayTitles) && plan.dayTitles.every((day) => Number.isInteger(day.day) && isNonEmptyString(day.title));
}

export function isValidPlanDetail(value: unknown): value is DevotionalPlan {
  if (!value || typeof value !== "object") return false;
  const plan = value as Partial<DevotionalPlan>;
  if (!hasValidBase(plan) || !Array.isArray(plan.days)) return false;
  return plan.days.length > 0 && plan.days.every((day, index) => (
    day?.day === index + 1 && isNonEmptyString(day.title) && isNonEmptyString(day.verse)
    && isNonEmptyString(day.reference) && isNonEmptyString(day.reflection)
    && isNonEmptyString(day.question) && isNonEmptyString(day.prayer) && isNonEmptyString(day.practice)
  ));
}

function parseCatalogPayload(value: unknown): CatalogPayload | null {
  if (!value || typeof value !== "object") return null;
  const payload = value as Partial<CatalogPayload>;
  if (!Array.isArray(payload.plans) || !payload.plans.every(isValidPlanSummary)) return null;
  return {
    hasMore: Boolean(payload.hasMore), plans: payload.plans,
    revision: Number.isFinite(payload.revision) ? Number(payload.revision) : 0,
    updatedAt: isNonEmptyString(payload.updatedAt) ? payload.updatedAt : new Date().toISOString(),
  };
}

export async function readCachedDevotionalCatalog(language: SupportedLanguage): Promise<DevotionalPlanSummary[] | null> {
  const cached = await getJson<CatalogCache | null>(catalogCacheKey(language), null);
  if (!cached || cached.schema !== catalogCacheSchema || !cached.plans.every(isValidPlanSummary)) return null;
  setDevotionalCatalogSnapshot(language, cached.plans);
  return cached.plans;
}

export async function refreshDevotionalCatalog(language: SupportedLanguage): Promise<DevotionalPlanSummary[] | null> {
  if (!isSupabaseConfigured) return null;
  const allPlans: DevotionalPlanSummary[] = [];
  let offset = 0;
  let revision = 0;
  while (offset < 240) {
    const { data, error } = await getSupabaseClient().rpc("get_devotional_plan_catalog", { p_limit: pageSize, p_locale: language, p_offset: offset });
    if (error) throw error;
    const payload = parseCatalogPayload(data);
    if (!payload) throw new Error("Invalid devotional catalog response");
    allPlans.push(...payload.plans);
    revision = Math.max(revision, payload.revision);
    if (!payload.hasMore || payload.plans.length === 0) break;
    offset += payload.plans.length;
  }
  if (allPlans.length === 0) return null;
  const plans = [...new Map(allPlans.map((plan) => [plan.id, plan])).values()];
  setDevotionalCatalogSnapshot(language, plans);
  await setJson<CatalogCache>(catalogCacheKey(language), { fetchedAt: new Date().toISOString(), plans, revision, schema: catalogCacheSchema });
  return plans;
}

export async function readCachedDevotionalPlanDetail(language: SupportedLanguage, planId: string): Promise<DevotionalPlan | null> {
  const cached = await getJson<DetailCache | null>(detailCacheKey(language, planId), null);
  return cached?.schema === detailCacheSchema && isValidPlanDetail(cached.plan) ? cached.plan : null;
}

export async function refreshDevotionalPlanDetail(language: SupportedLanguage, planId: string): Promise<DevotionalPlan | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await getSupabaseClient().rpc("get_devotional_plan_detail", { p_locale: language, p_plan_id: planId });
  if (error) throw error;
  const payload = data as DetailPayload | null;
  if (!payload?.plan) return null;
  if (!isValidPlanDetail(payload.plan) || payload.plan.id !== planId) throw new Error("Invalid devotional plan detail response");
  await setJson<DetailCache>(detailCacheKey(language, planId), {
    fetchedAt: new Date().toISOString(), plan: payload.plan,
    revision: Number.isFinite(payload.revision) ? Number(payload.revision) : 0, schema: detailCacheSchema,
  });
  return payload.plan;
}

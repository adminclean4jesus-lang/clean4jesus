import { beforeEach, describe, expect, it, vi } from "vitest";

const { cache, rpc, setJson } = vi.hoisted(() => ({
  cache: new Map<string, unknown>(), rpc: vi.fn(),
  setJson: vi.fn(async (key: string, value: unknown) => { cache.set(key, value); }),
}));

vi.mock("@/lib/supabase", () => ({ getSupabaseClient: () => ({ rpc }), isSupabaseConfigured: true }));
vi.mock("@/services/storage", () => ({
  getJson: async (key: string, fallback: unknown) => cache.get(key) ?? fallback,
  setJson,
}));

import {
  readCachedDevotionalCatalog,
  readCachedDevotionalPlanDetail,
  refreshDevotionalCatalog,
  refreshDevotionalPlanDetail,
} from "@/features/devotionalPlans/devotionalCatalogService";
import { getDevotionalCatalogSnapshot } from "@/features/devotionalPlans/devotionalCatalogStore";

const summary = {
  dayCount: 7,
  dayTitles: [{ day: 1, title: "Camina en la luz" }],
  description: "Una descripción editorial revisada.", icon: "book-open-outline",
  id: "plan-remoto", subtitle: "Una semana para volver a la luz.", title: "Plan remoto", tone: "primary",
};
const detail = {
  ...summary,
  days: [{
    day: 1, practice: "Da un paso concreto.", prayer: "Señor, guíame hoy.",
    question: "¿Qué paso darás?", reference: "Juan 1:5 · NTV",
    reflection: "Cristo nos llama a caminar en la luz con verdad, gracia y una obediencia concreta que transforme el corazón.",
    title: "Camina en la luz", verse: "Lectura base: Juan 1:5",
  }],
};
delete (detail as Partial<typeof summary>).dayCount;
delete (detail as Partial<typeof summary>).dayTitles;

describe("catálogo devocional bajo demanda", () => {
  beforeEach(() => { cache.clear(); rpc.mockReset(); setJson.mockClear(); });

  it("mantiene un índice local ligero antes de tener red", () => {
    const plans = getDevotionalCatalogSnapshot("es");
    expect(plans.length).toBeGreaterThanOrEqual(8);
    expect(plans[0].dayCount).toBe(7);
    expect(plans[0]).not.toHaveProperty("days");
  });

  it("rechaza un catálogo que intenta omitir su contrato de resumen", async () => {
    rpc.mockResolvedValueOnce({ data: { plans: [{ id: "roto" }] }, error: null });
    await expect(refreshDevotionalCatalog("es")).rejects.toThrow("Invalid devotional catalog response");
    expect(setJson).not.toHaveBeenCalled();
  });

  it("guarda únicamente metadatos del catálogo por idioma", async () => {
    rpc.mockResolvedValueOnce({ data: { hasMore: false, plans: [summary], revision: 3, updatedAt: "2026-07-21T12:00:00Z" }, error: null });
    await expect(refreshDevotionalCatalog("pt")).resolves.toEqual([summary]);
    expect(rpc).toHaveBeenCalledWith("get_devotional_plan_catalog", { p_limit: 24, p_locale: "pt", p_offset: 0 });
    await expect(readCachedDevotionalCatalog("pt")).resolves.toEqual([summary]);
  });

  it("descarga y conserva por separado el contenido completo de un plan", async () => {
    rpc.mockResolvedValueOnce({ data: { plan: detail, revision: 4, updatedAt: "2026-07-21T12:00:00Z" }, error: null });
    await expect(refreshDevotionalPlanDetail("es", "plan-remoto")).resolves.toEqual(detail);
    expect(rpc).toHaveBeenCalledWith("get_devotional_plan_detail", { p_locale: "es", p_plan_id: "plan-remoto" });
    await expect(readCachedDevotionalPlanDetail("es", "plan-remoto")).resolves.toEqual(detail);
  });
});

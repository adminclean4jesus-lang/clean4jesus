import { beforeEach, describe, expect, it, vi } from "vitest";

const { cache, rpc, setJson } = vi.hoisted(() => ({
  cache: new Map<string, unknown>(),
  rpc: vi.fn(),
  setJson: vi.fn(async (key: string, value: unknown) => {
    cache.set(key, value);
  }),
}));

vi.mock("@/lib/supabase", () => ({
  getSupabaseClient: () => ({ rpc }),
  isSupabaseConfigured: true,
}));

vi.mock("@/services/storage", () => ({
  getJson: async (key: string, fallback: unknown) => cache.get(key) ?? fallback,
  setJson,
}));

import { getDailyDevotionalFallback } from "@/features/devotionalPlans/dailyDevotionalFallback";
import {
  getLocalDateKey,
  readCachedDailyDevotional,
  refreshDailyDevotional,
} from "@/features/devotionalPlans/dailyDevotionalService";

const devotional = {
  id: "day-remote",
  practice: "Haz un paso visible hoy.",
  prayer: "Jesús, guíame en la verdad.",
  question: "¿Qué paso puedes dar?",
  reference: "Juan 3:21",
  reflection: "Cristo nos llama a caminar en la luz con verdad, gracia y una obediencia concreta que transforme el corazón cada día.",
  theme: "verdad",
  title: "Ven a la luz",
  verse: "El que practica la verdad viene a la luz.",
};

describe("devocional diario híbrido", () => {
  beforeEach(() => {
    cache.clear();
    rpc.mockReset();
    setJson.mockClear();
  });

  it("mantiene un fallback completo y traducido para cada idioma", () => {
    for (const language of ["es", "en", "fr", "pt"] as const) {
      const fallback = getDailyDevotionalFallback(language);
      expect(fallback.title.length).toBeGreaterThan(3);
      expect(fallback.reflection.length).toBeGreaterThan(80);
    }
  });

  it("usa una fecha del calendario local, no un corte UTC", () => {
    expect(getLocalDateKey(new Date(2026, 6, 21, 23, 59))).toBe("2026-07-21");
  });

  it("rechaza respuestas incompletas sin contaminar el caché", async () => {
    rpc.mockResolvedValueOnce({ data: { dateKey: "2026-07-21", devotional: { id: "roto" } }, error: null });
    await expect(refreshDailyDevotional("es", "2026-07-21")).rejects.toThrow("Invalid daily devotional response");
    expect(setJson).not.toHaveBeenCalled();
  });

  it("valida, guarda y recupera exactamente el devocional de la fecha", async () => {
    rpc.mockResolvedValueOnce({
      data: { dateKey: "2026-07-21", devotional, revision: 2, updatedAt: "2026-07-21T12:00:00Z" },
      error: null,
    });
    await expect(refreshDailyDevotional("pt", "2026-07-21")).resolves.toEqual(devotional);
    expect(rpc).toHaveBeenCalledWith("get_daily_devotional", {
      p_locale: "pt",
      p_on_date: "2026-07-21",
    });
    await expect(readCachedDailyDevotional("pt", "2026-07-21")).resolves.toEqual(devotional);
    await expect(readCachedDailyDevotional("pt", "2026-07-22")).resolves.toBeNull();
  });
});

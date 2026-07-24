import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const root = path.resolve(__dirname, "../..");
const migration = readFileSync(
  path.join(root, "supabase/migrations/20260721181500_daily_devotional_catalog_v1.sql"),
  "utf8",
);

describe("seguridad del devocional diario", () => {
  it.each(["daily_devotionals", "daily_devotional_translations"])(
    "activa RLS y revoca acceso directo en %s",
    (table) => {
      expect(migration).toContain(`alter table public.${table} enable row level security;`);
      expect(migration).toContain(`revoke all on public.${table} from public, anon, authenticated;`);
    },
  );

  it("expone solo contenido publicado mediante una RPC acotada", () => {
    expect(migration).toContain("devotional.status = 'published'");
    expect(migration).toContain("grant execute on function public.get_daily_devotional");
    expect(migration).toContain("candidate.locale in (requested.locale, 'es')");
    expect(migration).not.toMatch(/grant select on public\.daily_devotional/i);
  });
});

import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const root = path.resolve(__dirname, "../..");
const migration = readFileSync(
  path.join(root, "supabase/migrations/20260721143000_devotional_catalog_v1.sql"),
  "utf8",
);
const splitMigration = readFileSync(
  path.join(root, "supabase/migrations/20260722001215_split_devotional_catalog_detail.sql"),
  "utf8",
);

describe("seguridad del catálogo devocional", () => {
  it.each([
    "devotional_plans",
    "devotional_plan_translations",
    "devotional_plan_days",
    "devotional_plan_day_translations",
  ])("activa RLS y revoca acceso directo en %s", (table) => {
    expect(migration).toContain(`alter table public.${table} enable row level security;`);
    expect(migration).toContain(`revoke all on public.${table} from public, anon, authenticated;`);
  });

  it("expone solo una RPC acotada que filtra publicaciones", () => {
    expect(migration).toContain("security definer");
    expect(migration).toContain("plan.status = 'published'");
    expect(migration).toContain("least(greatest(coalesce(p_limit, 24), 1), 50)");
    expect(migration).toContain("grant execute on function public.get_published_devotional_catalog");
    expect(migration).not.toMatch(/grant select on public\.devotional_plan/i);
  });

  it("separa el índice ligero del contenido completo bajo demanda", () => {
    expect(splitMigration).toContain("get_devotional_plan_catalog");
    expect(splitMigration).toContain("get_devotional_plan_detail");
    expect(splitMigration).toContain("'dayCount', day_count");
    expect(splitMigration).toContain("'reflection', day_translation.reflection");
    const catalogFunction = splitMigration.split("create or replace function public.get_devotional_plan_detail")[0];
    expect(catalogFunction).not.toContain("day_translation.reflection");
    expect(splitMigration).toContain("revoke all on function public.get_devotional_plan_detail");
  });
});

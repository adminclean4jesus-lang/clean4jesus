import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/20260913130000_privacy_retention_v2.sql",
  "utf8",
);

describe("privacy retention v2 migration", () => {
  it("repairs the report schema and purges the rate-limit event table", () => {
    expect(migration).toContain("create or replace function private.purge_expired_privacy_data()");
    expect(migration).toContain("delete from public.false_positive_reports");
    expect(migration).toContain("delete from private.false_positive_rate_limit_events");
    expect(migration).toContain("interval '24 hours'");
    expect(migration).not.toContain("delete from private.false_positive_reports");
  });
});

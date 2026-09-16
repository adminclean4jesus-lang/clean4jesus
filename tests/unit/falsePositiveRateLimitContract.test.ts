import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const read = (file: string) => readFileSync(join(process.cwd(), file), "utf8").replace(/\r\n/g, "\n");

describe("false-positive rate limit contract", () => {
  it("uses a durable server-side atomic limiter", () => {
    const migration = read("supabase/migrations/20260830120000_false_positive_rate_limit_v2.sql");
    const functionSource = read("supabase/functions/report-false-positive/index.ts");

    expect(migration).toContain("private.false_positive_rate_limit_events");
    expect(migration).toContain("pg_advisory_xact_lock");
    expect(migration).toContain("consume_false_positive_rate_limit");
    expect(migration).toContain("grant execute on function");
    expect(functionSource).toContain('admin.rpc(');
    expect(functionSource).toContain('"consume_false_positive_rate_limit"');
    expect(functionSource).toContain('return json({ error: "rate_limited" }, 429)');
    expect(functionSource).not.toContain('.select("id", { count: "exact", head: true })');
  });

  it("requires a short-lived, single-use PIN ticket for iOS editor deep links", () => {
    const screen = read("app/ios-protection.tsx");
    const session = read("src/features/pin/pinSession.ts");
    const verify = read("app/pin-verify.tsx");

    expect(screen).toContain("consumeIosPinSessionVerified");
    expect(screen).toContain("/pin-verify?action=");
    expect(verify).toContain('markIosPinSessionVerified(action);\n      router.replace("/ios-protection?editLimits=1")');
    expect(verify).toContain('markIosPinSessionVerified(action);\n      router.replace("/ios-protection?editSelection=1")');
    expect(session).toContain("IOS_PIN_SESSION_TTL_MS = 60_000");
    expect(session).toContain("iosPinSessionVerifiedAt = 0");
    expect(session).toContain("consumeIosPinSessionVerified");
  });
});

import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const root = path.resolve(__dirname, "../..");
const migration = readFileSync(
  path.join(root, "supabase/migrations/20260716224022_accountability_phase_one.sql"),
  "utf8",
);
const reliabilityMigration = readFileSync(
  path.join(root, "supabase/migrations/20260716235500_accountability_delivery_reliability.sql"),
  "utf8",
);
const accountabilityFunction = readFileSync(
  path.join(root, "supabase/functions/accountability/index.ts"),
  "utf8",
);
const signalFunction = readFileSync(
  path.join(root, "supabase/functions/accountability-signal/index.ts"),
  "utf8",
);

const privateTables = [
  "accountability_relationships",
  "accountability_guardian_push_tokens",
  "accountability_owner_devices",
  "accountability_risk_signals",
  "accountability_notification_dispatches",
];

describe("Phase 1 accountability backend contract", () => {
  it.each(privateTables)("keeps private.%s behind RLS and explicit revokes", (table) => {
    expect(migration).toContain(`alter table private.${table} enable row level security;`);
    expect(migration).toContain(`revoke all on table private.${table} from public, anon, authenticated;`);
  });

  it("stores one-time codes and device credentials only as hashes", () => {
    expect(migration).toContain("share_code_hash bytea not null unique");
    expect(migration).toContain("share_code_consumed_at");
    expect(migration).toContain("credential_secret_hash text not null");
    expect(migration).toContain("extensions.crypt(p_device_secret, extensions.gen_salt('bf', 12))");
    const relationshipTable = migration.match(/create table private\.accountability_relationships \([\s\S]*?\n\);/)?.[0] ?? "";
    const deviceTable = migration.match(/create table private\.accountability_owner_devices \([\s\S]*?\n\);/)?.[0] ?? "";
    expect(relationshipTable).not.toMatch(/\n\s*share_code\s+text\b/i);
    expect(deviceTable).not.toMatch(/\n\s*device_secret\s+text\b/i);
  });

  it("requires bilateral versioned consent and permits either party to revoke", () => {
    expect(migration).toContain("owner_consented_version integer not null");
    expect(migration).toContain("guardian_consented_version integer");
    expect(migration).toContain("guardian_consented_version = consent_version");
    expect(migration).toContain("caller_id in (relationship.owner_user_id, relationship.guardian_user_id)");
    expect(migration).toContain("references auth.users (id) on delete cascade");
  });

  it("atomically enforces idempotency, threshold window and cooldown", () => {
    expect(migration).toContain("primary key (device_id, idempotency_key)");
    expect(migration).toContain("recent_signal_count >= target_relationship.risk_threshold");
    expect(migration).toContain("target_relationship.alerts_enabled");
    expect(migration).toContain("interval '30 minutes'");
    expect(migration).toContain("interval '6 hours'");
    expect(migration).toContain("for update;");
  });

  it("starts cooldown only after Expo accepts a notification and permits safe retry", () => {
    expect(reliabilityMigration).toContain("delivered_at timestamptz");
    expect(reliabilityMigration).toContain("failed_at timestamptz");
    expect(reliabilityMigration).toContain("process_accountability_risk_signal_v2");
    expect(reliabilityMigration).toContain("complete_accountability_notification_dispatch");
    expect(reliabilityMigration).toContain("interval '2 minutes'");
    expect(reliabilityMigration).toContain("interval '24 hours'");
    expect(signalFunction).toContain('ticket.status === "ok"');
    expect(signalFunction).toContain("p_delivered: notified");
  });

  it("lets only the accepted guardian govern generic alert rules", () => {
    expect(migration).toContain("configure_accountability_alerts");
    expect(migration).toContain("relationship.guardian_user_id = caller_id");
    expect(migration).toContain("risk_threshold between 3 and 10");
    expect(accountabilityFunction).toContain('body.operation === "configureAlerts"');
  });

  it("exposes signal processing only to service_role", () => {
    expect(migration).toContain("from public, anon, authenticated, service_role");
    expect(migration).toContain("to service_role;");
    expect(accountabilityFunction).not.toMatch(/SUPABASE_SERVICE_ROLE_KEY|service[_-]?role/i);
    expect(signalFunction).toContain('Deno.env.get("SUPABASE_SECRET_KEY")');
    expect(accountabilityFunction).toContain("--no-verify-jwt");
    expect(signalFunction).toContain("--no-verify-jwt");
  });

  it("accepts only the three credential signal fields and sends generic Expo push", () => {
    expect(signalFunction).toContain('keys.join(",") !== "deviceId,idempotencyKey,secret"');
    expect(signalFunction).toContain('https://exp.host/--/api/v2/push/send');
    expect(signalFunction).not.toMatch(/value\.(package|url|term|reason|content)/i);
    expect(migration).not.toMatch(/\b(package|url|term|reason|content)\w*\s+(text|jsonb?)/i);
  });
});

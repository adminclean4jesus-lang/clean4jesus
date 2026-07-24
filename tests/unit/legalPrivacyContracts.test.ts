import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const root = path.resolve(__dirname, "../..");
const read = (file: string) => readFileSync(path.join(root, file), "utf8");

describe("legal and privacy contracts", () => {
  it("keeps legal consent append-only, versioned and protected by RLS", () => {
    const migration = read("supabase/migrations/20260724002313_legal_consent_and_retention_v1.sql");

    expect(migration).toContain("create table public.legal_consents");
    expect(migration).toContain("enable row level security");
    expect(migration).toContain("public.record_legal_consent");
    expect(migration).toContain("public.has_current_legal_consent");
    expect(migration).toContain("grant select, insert on table public.legal_consents to authenticated");
  });

  it("automates the approved retention windows without deleting user content silently", () => {
    const migration = read("supabase/migrations/20260724002313_legal_consent_and_retention_v1.sql");

    expect(migration).toContain("private.purge_expired_privacy_data");
    expect(migration).toContain("interval '24 months'");
    expect(migration).toContain("interval '12 months'");
    expect(migration).toContain("clean4jesus-privacy-retention");
  });

  it("blocks Community until the signed-in user accepts the current legal bundle", () => {
    const gate = read("src/features/legal/CommunityLegalGate.tsx");
    const community = read("app/(tabs)/community.tsx");

    expect(gate).toContain("hasCurrentLegalAcceptance");
    expect(gate).toContain("recordLegalAcceptance");
    expect(gate).toContain('recordLegalAcceptance(language, "reconsent")');
    expect(gate).toContain("LEGAL_URLS.privacy");
    expect(gate).toContain("LEGAL_URLS.terms");
    expect(gate).toContain("LEGAL_URLS.guidelines");
    expect(community).toContain("<CommunityLegalGate>");
  });

  it("keeps legal information reachable without authentication", () => {
    const legalScreen = read("app/legal.tsx");
    const settings = read("app/settings.tsx");

    expect(legalScreen).toContain("LEGAL_URLS.accountDeletion");
    expect(legalScreen).toContain("LEGAL_URLS.support");
    expect(settings).toContain('router.push("/legal")');
  });
});

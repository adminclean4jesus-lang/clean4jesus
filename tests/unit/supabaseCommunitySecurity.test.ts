import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const root = path.resolve(__dirname, "../..");
const migration = readFileSync(
  path.join(root, "supabase/migrations/20260714225624_community_v1.sql"),
  "utf8",
);
const hardeningMigration = readFileSync(
  path.join(root, "supabase/migrations/20260714235900_auth_hardening_v1.sql"),
  "utf8",
);
const supabaseClient = readFileSync(path.join(root, "src/lib/supabase.ts"), "utf8");
const identityProjectionMigration = readFileSync(
  path.join(root, "supabase/migrations/20260715191250_community_public_identity_projection_v1.sql"),
  "utf8",
);
const communityService = readFileSync(path.join(root, "src/features/community/communityService.ts"), "utf8");
const communityScreen = readFileSync(path.join(root, "app/(tabs)/community.tsx"), "utf8");
const commentsModal = readFileSync(path.join(root, "src/features/community/CommunityCommentsModal.tsx"), "utf8");

const protectedTables = [
  "profiles",
  "community_posts",
  "community_prayers",
  "community_comments",
  "community_reports",
];

describe("contrato de seguridad de Comunidad 1.3", () => {
  it.each(protectedTables)("mantiene RLS activo en %s", (table) => {
    expect(migration).toContain(`alter table public.${table} enable row level security;`);
  });

  it("restringe escrituras al usuario autenticado", () => {
    expect(migration.match(/auth\.uid\(\)/g)?.length ?? 0).toBeGreaterThanOrEqual(12);
    expect(migration).toContain("revoke all on table public.community_posts from anon, authenticated;");
    expect(migration).not.toMatch(/grant\s+.+\s+to\s+anon/i);
  });

  it("no permite insertar comentarios en publicaciones ocultas", () => {
    expect(migration).toContain("where post.id = community_comments.post_id and post.status = 'published'");
  });

  it("solo carga una clave publica en el cliente movil", () => {
    expect(supabaseClient).toContain("EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
    expect(supabaseClient).not.toMatch(/service[_-]?role/i);
    expect(supabaseClient).not.toMatch(/SUPABASE_SECRET/i);
  });

  it("limita las columnas que cada miembro puede modificar", () => {
    expect(hardeningMigration).toContain("grant update (display_name, city, bio)");
    expect(hardeningMigration).toContain("grant update (title, body, kind)");
    expect(hardeningMigration).toContain("grant update (body)");
    expect(hardeningMigration).not.toMatch(/grant update \([^)]*status/i);
    expect(hardeningMigration).not.toMatch(/grant update \([^)]*clean_streak/i);
  });

  it("no expone la racha sensible al rol autenticado", () => {
    const profileSelectGrant = hardeningMigration.match(/grant select \([^)]+\)\s+on table public\.profiles/s)?.[0] ?? "";
    expect(profileSelectGrant).not.toContain("clean_streak");
  });

  it("aplica cuotas de escritura dentro de Postgres", () => {
    expect(hardeningMigration).toContain("private.enforce_community_write_rate()");
    expect(hardeningMigration).toContain("community_posts_rate_limit");
    expect(hardeningMigration).toContain("community_comments_rate_limit");
    expect(hardeningMigration).toContain("community_reports_rate_limit");
    expect(hardeningMigration).toContain("community_actor_mismatch");
  });

  it("proyecta identidad publica sin UUID estable", () => {
    expect(identityProjectionMigration).toContain('create policy "Members can read their own profile"');
    expect(identityProjectionMigration).toContain("revoke select on table public.community_posts from authenticated");
    expect(identityProjectionMigration).toContain("revoke select on table public.community_comments from authenticated");
    expect(identityProjectionMigration).not.toMatch(/returns table \([\s\S]*author_id uuid/);
    expect(communityService).toContain('rpc("list_community_posts_public"');
    expect(communityService).toContain('rpc("list_community_comments_public"');
    expect(communityService).not.toContain("author:profiles!community_posts_author_id_fkey");
  });

  it("descarta respuestas tardias y bloquea acciones comunitarias duplicadas", () => {
    expect(commentsModal).toContain("requestId === commentsRequestId.current");
    expect(commentsModal).toContain("commentsRequestId.current += 1");
    expect(communityScreen).toContain("prayerRequests.current.has(post.id)");
    expect(communityScreen).toContain("prayerRequests.current.delete(post.id)");
  });
});

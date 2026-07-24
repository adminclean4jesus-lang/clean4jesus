-- False-positive telemetry is intentionally private. It never stores visible
-- text, URLs, browser history, or the user's community identity.
create schema if not exists private;

revoke all on schema private from public, anon, authenticated;
grant usage on schema private to service_role;

create table private.false_positive_reports (
  id uuid primary key default gen_random_uuid(),
  device_id_hash text not null check (device_id_hash ~ '^[0-9a-f]{64}$'),
  app_package text not null check (length(app_package) between 1 and 255),
  rule_fingerprint text not null check (rule_fingerprint ~ '^[0-9a-f]{32,128}$'),
  locale text not null default 'es' check (locale in ('es', 'en', 'fr', 'pt')),
  app_version text not null default 'unknown' check (length(app_version) between 1 and 32),
  source text not null default 'native_interruption' check (source = 'native_interruption'),
  created_at timestamptz not null default now()
);

alter table private.false_positive_reports enable row level security;
revoke all on private.false_positive_reports from public, anon, authenticated;
grant select, insert on private.false_positive_reports to service_role;

create index false_positive_reports_device_created_idx
  on private.false_positive_reports (device_id_hash, created_at desc);

create index false_positive_reports_fingerprint_idx
  on private.false_positive_reports (rule_fingerprint, created_at desc);

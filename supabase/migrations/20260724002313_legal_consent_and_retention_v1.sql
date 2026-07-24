create table public.legal_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  legal_bundle_version text not null,
  privacy_policy_version text not null,
  terms_version text not null,
  community_guidelines_version text not null,
  locale text not null check (locale in ('es', 'en', 'fr', 'pt')),
  source text not null check (
    source in ('email_signup', 'email_signin', 'google_oauth', 'reconsent')
  ),
  accepted_at timestamptz not null default now(),
  unique (user_id, legal_bundle_version)
);

comment on table public.legal_consents is
  'Append-only evidence of the legal bundle explicitly accepted by each Community user.';

alter table public.legal_consents enable row level security;

revoke all on table public.legal_consents from public, anon, authenticated;
grant select, insert on table public.legal_consents to authenticated;
grant all on table public.legal_consents to service_role;

create policy legal_consents_select_own
on public.legal_consents
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy legal_consents_insert_own
on public.legal_consents
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create or replace function public.record_legal_consent(
  requested_locale text,
  requested_source text
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'authentication_required';
  end if;

  if requested_locale not in ('es', 'en', 'fr', 'pt') then
    raise exception 'invalid_locale';
  end if;

  if requested_source not in ('email_signup', 'email_signin', 'google_oauth', 'reconsent') then
    raise exception 'invalid_source';
  end if;

  insert into public.legal_consents (
    user_id,
    legal_bundle_version,
    privacy_policy_version,
    terms_version,
    community_guidelines_version,
    locale,
    source
  )
  values (
    (select auth.uid()),
    '2026-07-23',
    '1.0',
    '1.0',
    '1.0',
    requested_locale,
    requested_source
  )
  on conflict (user_id, legal_bundle_version) do nothing;
end;
$$;

revoke all on function public.record_legal_consent(text, text) from public, anon;
grant execute on function public.record_legal_consent(text, text) to authenticated;
grant execute on function public.record_legal_consent(text, text) to service_role;

create or replace function public.has_current_legal_consent()
returns boolean
language sql
security invoker
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.legal_consents
    where user_id = auth.uid()
      and legal_bundle_version = '2026-07-23'
      and privacy_policy_version = '1.0'
      and terms_version = '1.0'
      and community_guidelines_version = '1.0'
  );
$$;

revoke all on function public.has_current_legal_consent() from public, anon;
grant execute on function public.has_current_legal_consent() to authenticated;
grant execute on function public.has_current_legal_consent() to service_role;

create or replace function private.capture_signup_legal_consent()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_locale text;
begin
  if coalesce((new.raw_user_meta_data ->> 'legal_accepted')::boolean, false) is not true
    or coalesce((new.raw_user_meta_data ->> 'age_over_18')::boolean, false) is not true
    or new.raw_user_meta_data ->> 'legal_bundle_version' <> '2026-07-23'
    or new.raw_user_meta_data ->> 'privacy_policy_version' <> '1.0'
    or new.raw_user_meta_data ->> 'terms_version' <> '1.0'
    or new.raw_user_meta_data ->> 'community_guidelines_version' <> '1.0'
  then
    return new;
  end if;

  requested_locale := coalesce(new.raw_user_meta_data ->> 'legal_locale', 'es');
  if requested_locale not in ('es', 'en', 'fr', 'pt') then
    requested_locale := 'es';
  end if;

  insert into public.legal_consents (
    user_id,
    legal_bundle_version,
    privacy_policy_version,
    terms_version,
    community_guidelines_version,
    locale,
    source
  )
  values (
    new.id,
    '2026-07-23',
    '1.0',
    '1.0',
    '1.0',
    requested_locale,
    'email_signup'
  )
  on conflict (user_id, legal_bundle_version) do nothing;

  return new;
end;
$$;

revoke all on function private.capture_signup_legal_consent() from public;

create trigger on_auth_user_legal_consent
after insert on auth.users
for each row execute function private.capture_signup_legal_consent();

create or replace function private.prevent_false_positive_review_audit_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'DELETE'
    and current_setting('clean4jesus.retention_job', true) = 'on'
  then
    return old;
  end if;

  raise exception using errcode = '42501', message = 'false_positive_review_audit_immutable';
end;
$$;

revoke all on function private.prevent_false_positive_review_audit_mutation() from public;

create or replace function private.purge_expired_privacy_data()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  deleted_false_positive_actions integer := 0;
  deleted_false_positive_cases integer := 0;
  deleted_false_positive_reports integer := 0;
begin
  perform set_config('clean4jesus.retention_job', 'on', true);

  delete from private.false_positive_review_actions
  where created_at < now() - interval '24 months';
  get diagnostics deleted_false_positive_actions = row_count;

  delete from private.false_positive_review_cases
  where updated_at < now() - interval '24 months'
    and not exists (
      select 1
      from private.false_positive_review_actions action
      where action.case_id = false_positive_review_cases.id
    );
  get diagnostics deleted_false_positive_cases = row_count;

  delete from private.false_positive_reports
  where created_at < now() - interval '12 months';
  get diagnostics deleted_false_positive_reports = row_count;

  return jsonb_build_object(
    'false_positive_actions', deleted_false_positive_actions,
    'false_positive_cases', deleted_false_positive_cases,
    'false_positive_reports', deleted_false_positive_reports
  );
end;
$$;

revoke all on function private.purge_expired_privacy_data() from public, anon, authenticated;
grant execute on function private.purge_expired_privacy_data() to service_role;

create extension if not exists pg_cron;

select cron.schedule(
  'clean4jesus-privacy-retention',
  '17 3 * * *',
  'select private.purge_expired_privacy_data()'
);

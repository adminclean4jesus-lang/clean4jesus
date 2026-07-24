-- Human review workflow for anonymous false-positive signals.
-- This does not publish or change any blocking rule.

create type private.false_positive_review_status as enum (
  'pending',
  'in_review',
  'needs_evidence',
  'confirmed_false_positive',
  'kept_blocked'
);

create type private.false_positive_review_action as enum (
  'claim',
  'needs_evidence',
  'confirm_false_positive',
  'keep_blocked'
);

create table private.false_positive_review_cases (
  id uuid primary key default gen_random_uuid(),
  app_package text not null check (length(app_package) between 1 and 255),
  rule_fingerprint text not null check (rule_fingerprint ~ '^[0-9a-f]{32,128}$'),
  locale text not null check (locale in ('es', 'en', 'fr', 'pt')),
  status private.false_positive_review_status not null default 'pending',
  report_count integer not null default 1 check (report_count > 0),
  first_reported_at timestamptz not null,
  last_reported_at timestamptz not null,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  review_note text check (review_note is null or length(review_note) between 3 and 500),
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (app_package, rule_fingerprint, locale)
);

create table private.false_positive_review_actions (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references private.false_positive_review_cases(id) on delete restrict,
  actor_user_id uuid not null references auth.users(id) on delete restrict,
  actor_role_snapshot private.community_moderator_role not null,
  action private.false_positive_review_action not null,
  before_snapshot jsonb not null,
  after_snapshot jsonb not null,
  note text not null check (length(note) between 3 and 500),
  request_id uuid not null,
  created_at timestamptz not null default now(),
  unique (actor_user_id, request_id)
);

alter table private.false_positive_review_cases enable row level security;
alter table private.false_positive_review_actions enable row level security;

create index false_positive_review_cases_status_last_reported_idx
  on private.false_positive_review_cases (status, last_reported_at desc);

create index false_positive_review_cases_fingerprint_idx
  on private.false_positive_review_cases (rule_fingerprint, last_reported_at desc);

create index false_positive_review_actions_case_created_idx
  on private.false_positive_review_actions (case_id, created_at desc);

revoke all on private.false_positive_review_cases from public, anon, authenticated;
revoke all on private.false_positive_review_actions from public, anon, authenticated;

create or replace function private.set_false_positive_review_case_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke all on function private.set_false_positive_review_case_updated_at() from public;

create trigger false_positive_review_cases_set_updated_at
before update on private.false_positive_review_cases
for each row execute function private.set_false_positive_review_case_updated_at();

create or replace function private.prevent_false_positive_review_audit_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception using errcode = '42501', message = 'false_positive_review_audit_immutable';
end;
$$;

revoke all on function private.prevent_false_positive_review_audit_mutation() from public;

create trigger false_positive_review_actions_immutable
before update or delete on private.false_positive_review_actions
for each row execute function private.prevent_false_positive_review_audit_mutation();

create or replace function private.group_false_positive_report()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into private.false_positive_review_cases (
    app_package,
    rule_fingerprint,
    locale,
    first_reported_at,
    last_reported_at
  ) values (
    new.app_package,
    new.rule_fingerprint,
    new.locale,
    new.created_at,
    new.created_at
  )
  on conflict (app_package, rule_fingerprint, locale) do update
  set report_count = private.false_positive_review_cases.report_count + 1,
      last_reported_at = greatest(private.false_positive_review_cases.last_reported_at, excluded.last_reported_at);

  return new;
end;
$$;

revoke all on function private.group_false_positive_report() from public;

create trigger false_positive_reports_group_for_review
after insert on public.false_positive_reports
for each row execute function private.group_false_positive_report();

create or replace function public.list_false_positive_review_cases(
  p_status text default 'pending',
  p_limit integer default 50
)
returns table (
  id uuid,
  app_package text,
  rule_fingerprint text,
  locale text,
  status text,
  report_count integer,
  first_reported_at timestamptz,
  last_reported_at timestamptz,
  reviewed_at timestamptz,
  review_note text,
  version integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_status private.false_positive_review_status;
begin
  perform * from public.get_my_community_moderation_access();

  if coalesce(auth.jwt() ->> 'aal', 'aal1') <> 'aal2' then
    raise exception using errcode = '42501', message = 'moderator_mfa_required';
  end if;

  if p_limit < 1 or p_limit > 100 then
    raise exception using errcode = '22023', message = 'invalid_review_limit';
  end if;

  begin
    requested_status := p_status::private.false_positive_review_status;
  exception when invalid_text_representation then
    raise exception using errcode = '22023', message = 'invalid_false_positive_review_status';
  end;

  return query
  select review_case.id,
         review_case.app_package,
         review_case.rule_fingerprint,
         review_case.locale,
         review_case.status::text,
         review_case.report_count,
         review_case.first_reported_at,
         review_case.last_reported_at,
         review_case.reviewed_at,
         review_case.review_note,
         review_case.version
  from private.false_positive_review_cases review_case
  where review_case.status = requested_status
  order by review_case.last_reported_at desc
  limit p_limit;
end;
$$;

revoke all on function public.list_false_positive_review_cases(text, integer) from public, anon;
grant execute on function public.list_false_positive_review_cases(text, integer) to authenticated;

create or replace function public.apply_false_positive_review(
  p_case_id uuid,
  p_expected_version integer,
  p_action text,
  p_note text,
  p_request_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  actor_role private.community_moderator_role;
  requested_action private.false_positive_review_action;
  target_case private.false_positive_review_cases%rowtype;
  prior_action private.false_positive_review_actions%rowtype;
  next_status private.false_positive_review_status;
  before_state jsonb;
  after_state jsonb;
begin
  if actor_id is null then
    raise exception using errcode = '42501', message = 'moderator_required';
  end if;

  select moderator.role
  into actor_role
  from private.community_moderators moderator
  where moderator.user_id = actor_id
    and moderator.active = true;

  if actor_role is null then
    raise exception using errcode = '42501', message = 'moderator_required';
  end if;

  if coalesce(auth.jwt() ->> 'aal', 'aal1') <> 'aal2' then
    raise exception using errcode = '42501', message = 'moderator_mfa_required';
  end if;

  if p_expected_version < 1 or p_note is null or length(trim(p_note)) < 3 or length(trim(p_note)) > 500 then
    raise exception using errcode = '22023', message = 'invalid_false_positive_review_action';
  end if;

  begin
    requested_action := p_action::private.false_positive_review_action;
  exception when invalid_text_representation then
    raise exception using errcode = '22023', message = 'unsupported_false_positive_review_action';
  end;

  select * into prior_action
  from private.false_positive_review_actions audit
  where audit.actor_user_id = actor_id
    and audit.request_id = p_request_id;

  if found then
    if prior_action.action <> requested_action then
      raise exception using errcode = '40001', message = 'idempotency_key_payload_mismatch';
    end if;
    return prior_action.after_snapshot;
  end if;

  select * into target_case
  from private.false_positive_review_cases review_case
  where review_case.id = p_case_id
  for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'false_positive_review_not_found';
  end if;

  if target_case.version <> p_expected_version then
    raise exception using errcode = '40001', message = 'version_conflict';
  end if;

  if requested_action = 'claim' then
    next_status := 'in_review';
  elsif requested_action = 'needs_evidence' then
    next_status := 'needs_evidence';
  elsif requested_action = 'confirm_false_positive' then
    if actor_role <> 'admin' then
      raise exception using errcode = '42501', message = 'admin_required_for_false_positive_confirmation';
    end if;
    next_status := 'confirmed_false_positive';
  elsif requested_action = 'keep_blocked' then
    if actor_role <> 'admin' then
      raise exception using errcode = '42501', message = 'admin_required_to_keep_blocked';
    end if;
    next_status := 'kept_blocked';
  end if;

  before_state := jsonb_build_object(
    'case_id', target_case.id,
    'status', target_case.status,
    'version', target_case.version
  );

  update private.false_positive_review_cases
  set status = next_status,
      reviewed_by = actor_id,
      reviewed_at = now(),
      review_note = trim(p_note),
      version = target_case.version + 1
  where id = target_case.id
  returning * into target_case;

  after_state := jsonb_build_object(
    'case_id', target_case.id,
    'status', target_case.status,
    'version', target_case.version
  );

  insert into private.false_positive_review_actions (
    case_id,
    actor_user_id,
    actor_role_snapshot,
    action,
    before_snapshot,
    after_snapshot,
    note,
    request_id
  ) values (
    target_case.id,
    actor_id,
    actor_role,
    requested_action,
    before_state,
    after_state,
    trim(p_note),
    p_request_id
  );

  return after_state;
end;
$$;

revoke all on function public.apply_false_positive_review(uuid, integer, text, text, uuid) from public, anon;
grant execute on function public.apply_false_positive_review(uuid, integer, text, text, uuid) to authenticated;

-- Community moderation 1.3.2: private roles, durable evidence and atomic actions.

create type private.community_moderator_role as enum ('moderator', 'admin');
create type private.community_case_status as enum ('pending', 'in_review', 'resolved', 'dismissed');
create type private.community_target_type as enum ('post', 'comment');
create type private.community_moderation_action as enum (
  'claim',
  'hide_content',
  'restore_content',
  'resolve_no_action'
);

create table private.community_moderators (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role private.community_moderator_role not null default 'moderator',
  active boolean not null default true,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table private.community_moderation_cases (
  id uuid primary key default gen_random_uuid(),
  target_type private.community_target_type not null,
  target_id uuid not null,
  post_id uuid references public.community_posts (id) on delete set null,
  comment_id uuid references public.community_comments (id) on delete set null,
  status private.community_case_status not null default 'pending',
  assigned_to uuid references auth.users (id) on delete set null,
  claimed_at timestamptz,
  resolved_at timestamptz,
  report_count integer not null default 1 check (report_count > 0),
  version integer not null default 1 check (version > 0),
  title_snapshot text,
  content_snapshot text not null,
  author_id_snapshot uuid not null,
  reason_snapshot public.community_report_reason not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (target_type = 'post' and comment_id is null)
    or (target_type = 'comment' and post_id is null)
  )
);

create table private.community_moderation_actions (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null,
  actor_role_snapshot private.community_moderator_role not null,
  case_id uuid not null,
  report_id uuid,
  target_type private.community_target_type not null,
  target_id uuid not null,
  action private.community_moderation_action not null,
  before_snapshot jsonb not null,
  after_snapshot jsonb not null,
  reason_snapshot public.community_report_reason not null,
  note text not null check (char_length(note) between 3 and 500),
  request_id uuid not null,
  created_at timestamptz not null default now(),
  unique (actor_user_id, request_id)
);

alter table public.community_reports
  drop constraint community_reports_post_id_fkey,
  drop constraint community_reports_comment_id_fkey,
  drop constraint community_reports_check;

drop index public.community_reports_unique_post_reporter_idx;
drop index public.community_reports_unique_comment_reporter_idx;

alter table public.community_reports
  add column case_id uuid,
  add column target_type private.community_target_type,
  add column target_id uuid,
  add column title_snapshot text,
  add column content_snapshot text,
  add column author_id_snapshot uuid,
  add column reviewed_at timestamptz,
  add column resolution_note text check (resolution_note is null or char_length(resolution_note) <= 500),
  add constraint community_reports_post_id_fkey
    foreign key (post_id) references public.community_posts (id) on delete set null,
  add constraint community_reports_comment_id_fkey
    foreign key (comment_id) references public.community_comments (id) on delete set null;

update public.community_reports report
set target_type = 'post',
    target_id = post.id,
    title_snapshot = post.title,
    content_snapshot = post.body,
    author_id_snapshot = post.author_id
from public.community_posts post
where report.post_id = post.id;

update public.community_reports report
set target_type = 'comment',
    target_id = comment.id,
    content_snapshot = comment.body,
    author_id_snapshot = comment.author_id
from public.community_comments comment
where report.comment_id = comment.id;

alter table public.community_reports
  alter column target_type set not null,
  alter column target_id set not null,
  alter column content_snapshot set not null,
  alter column author_id_snapshot set not null,
  add constraint community_reports_target_shape_check check (
    (target_type = 'post' and comment_id is null)
    or (target_type = 'comment' and post_id is null)
  );

create unique index community_reports_unique_target_reporter_idx
  on public.community_reports (reporter_id, target_type, target_id);
create unique index community_moderation_cases_open_target_idx
  on private.community_moderation_cases (target_type, target_id)
  where status in ('pending', 'in_review');
create index community_moderation_cases_queue_idx
  on private.community_moderation_cases (status, created_at asc);
create index community_moderation_actions_case_idx
  on private.community_moderation_actions (case_id, created_at desc);
create index community_moderation_actions_actor_idx
  on private.community_moderation_actions (actor_user_id, created_at desc);

create trigger community_moderators_set_updated_at
before update on private.community_moderators
for each row execute function private.set_updated_at();

create trigger community_moderation_cases_set_updated_at
before update on private.community_moderation_cases
for each row execute function private.set_updated_at();

revoke all on table private.community_moderators from public, anon, authenticated;
revoke all on table private.community_moderation_cases from public, anon, authenticated;
revoke all on table private.community_moderation_actions from public, anon, authenticated;

revoke select on table public.community_reports from authenticated;
grant select (id, post_id, comment_id, reason, details, status, created_at)
  on table public.community_reports to authenticated;

create or replace function private.capture_community_report_evidence()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  post_record public.community_posts%rowtype;
  comment_record public.community_comments%rowtype;
begin
  if new.reporter_id is distinct from (select auth.uid()) then
    raise exception using errcode = '42501', message = 'reporter_mismatch';
  end if;

  if new.post_id is not null then
    select * into post_record
    from public.community_posts
    where id = new.post_id and status = 'published';

    if not found then
      raise exception using errcode = 'P0002', message = 'report_target_not_available';
    end if;
    if post_record.author_id = new.reporter_id then
      raise exception using errcode = '22023', message = 'self_report_not_allowed';
    end if;

    new.target_type := 'post';
    new.target_id := post_record.id;
    new.title_snapshot := post_record.title;
    new.content_snapshot := post_record.body;
    new.author_id_snapshot := post_record.author_id;
  elsif new.comment_id is not null then
    select * into comment_record
    from public.community_comments
    where id = new.comment_id and status = 'published';

    if not found then
      raise exception using errcode = 'P0002', message = 'report_target_not_available';
    end if;
    if comment_record.author_id = new.reporter_id then
      raise exception using errcode = '22023', message = 'self_report_not_allowed';
    end if;

    new.target_type := 'comment';
    new.target_id := comment_record.id;
    new.content_snapshot := comment_record.body;
    new.author_id_snapshot := comment_record.author_id;
  else
    raise exception using errcode = '22023', message = 'report_target_required';
  end if;

  return new;
end;
$$;

revoke all on function private.capture_community_report_evidence() from public;

create trigger community_reports_capture_evidence
before insert on public.community_reports
for each row execute function private.capture_community_report_evidence();

create or replace function private.attach_community_moderation_case()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_case_id uuid;
begin
  insert into private.community_moderation_cases (
    target_type,
    target_id,
    post_id,
    comment_id,
    title_snapshot,
    content_snapshot,
    author_id_snapshot,
    reason_snapshot
  ) values (
    new.target_type,
    new.target_id,
    new.post_id,
    new.comment_id,
    new.title_snapshot,
    new.content_snapshot,
    new.author_id_snapshot,
    new.reason
  )
  on conflict (target_type, target_id)
    where status in ('pending', 'in_review')
  do update set report_count = private.community_moderation_cases.report_count + 1
  returning id into selected_case_id;

  update public.community_reports
  set case_id = selected_case_id
  where id = new.id;

  return new;
end;
$$;

revoke all on function private.attach_community_moderation_case() from public;

create trigger community_reports_attach_case
after insert on public.community_reports
for each row execute function private.attach_community_moderation_case();

create or replace function private.prevent_moderation_audit_mutation()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  raise exception using errcode = '42501', message = 'moderation_audit_is_immutable';
end;
$$;

revoke all on function private.prevent_moderation_audit_mutation() from public;

create trigger community_moderation_actions_immutable
before update or delete on private.community_moderation_actions
for each row execute function private.prevent_moderation_audit_mutation();

create or replace function public.list_community_moderation_cases(
  p_status text default 'pending',
  p_limit integer default 50
)
returns table (
  id uuid,
  target_type text,
  target_id uuid,
  status text,
  assigned_to uuid,
  report_count integer,
  version integer,
  title_snapshot text,
  content_snapshot text,
  reason_snapshot text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
begin
  if actor_id is null or not exists (
    select 1 from private.community_moderators
    where user_id = actor_id and active = true
  ) then
    raise exception using errcode = '42501', message = 'moderator_required';
  end if;

  if p_status not in ('pending', 'in_review', 'resolved', 'dismissed') then
    raise exception using errcode = '22023', message = 'invalid_case_status';
  end if;

  return query
  select moderation_case.id,
         moderation_case.target_type::text,
         moderation_case.target_id,
         moderation_case.status::text,
         moderation_case.assigned_to,
         moderation_case.report_count,
         moderation_case.version,
         moderation_case.title_snapshot,
         moderation_case.content_snapshot,
         moderation_case.reason_snapshot::text,
         moderation_case.created_at
  from private.community_moderation_cases moderation_case
  where moderation_case.status::text = p_status
  order by moderation_case.created_at asc
  limit greatest(1, least(coalesce(p_limit, 50), 100));
end;
$$;

revoke all on function public.list_community_moderation_cases(text, integer)
  from public, anon;
grant execute on function public.list_community_moderation_cases(text, integer)
  to authenticated;

create or replace function public.apply_community_moderation(
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
  target_case private.community_moderation_cases%rowtype;
  requested_action private.community_moderation_action;
  before_state jsonb;
  after_state jsonb;
  existing_result jsonb;
begin
  select role into actor_role
  from private.community_moderators
  where user_id = actor_id and active = true;

  if actor_id is null or actor_role is null then
    raise exception using errcode = '42501', message = 'moderator_required';
  end if;
  if char_length(trim(coalesce(p_note, ''))) not between 3 and 500 then
    raise exception using errcode = '22023', message = 'invalid_moderation_note';
  end if;

  begin
    requested_action := p_action::private.community_moderation_action;
  exception when invalid_text_representation then
    raise exception using errcode = '22023', message = 'unsupported_moderation_action';
  end;

  select jsonb_build_object(
    'case_id', audit.case_id,
    'action', audit.action,
    'version', audit.after_snapshot -> 'version'
  ) into existing_result
  from private.community_moderation_actions audit
  where audit.actor_user_id = actor_id and audit.request_id = p_request_id;
  if existing_result is not null then
    return existing_result;
  end if;

  select * into target_case
  from private.community_moderation_cases
  where id = p_case_id
  for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'moderation_case_not_found';
  end if;
  if target_case.version <> p_expected_version then
    raise exception using errcode = '40001', message = 'moderation_case_version_conflict';
  end if;

  before_state := jsonb_build_object(
    'status', target_case.status,
    'assigned_to', target_case.assigned_to,
    'version', target_case.version
  );

  if requested_action = 'claim' then
    if target_case.status <> 'pending' then
      raise exception using errcode = '22023', message = 'invalid_case_transition';
    end if;
    update private.community_moderation_cases
    set status = 'in_review', assigned_to = actor_id, claimed_at = now(), version = version + 1
    where id = target_case.id;
  elsif requested_action in ('hide_content', 'resolve_no_action') then
    if target_case.status not in ('pending', 'in_review')
       or (target_case.assigned_to is not null and target_case.assigned_to <> actor_id) then
      raise exception using errcode = '22023', message = 'invalid_case_transition';
    end if;

    if requested_action = 'hide_content' then
      if target_case.target_type = 'post' and target_case.post_id is not null then
        update public.community_posts set status = 'hidden' where id = target_case.post_id;
      elsif target_case.target_type = 'comment' and target_case.comment_id is not null then
        update public.community_comments set status = 'hidden' where id = target_case.comment_id;
      end if;
    end if;

    update private.community_moderation_cases
    set status = case when requested_action = 'hide_content' then 'resolved' else 'dismissed' end,
        assigned_to = coalesce(assigned_to, actor_id),
        claimed_at = coalesce(claimed_at, now()),
        resolved_at = now(),
        version = version + 1
    where id = target_case.id;
  elsif requested_action = 'restore_content' then
    if actor_role <> 'admin' or coalesce(auth.jwt() ->> 'aal', 'aal1') <> 'aal2' then
      raise exception using errcode = '42501', message = 'admin_mfa_required';
    end if;
    if target_case.status <> 'resolved' then
      raise exception using errcode = '22023', message = 'invalid_case_transition';
    end if;

    if target_case.target_type = 'post' and target_case.post_id is not null then
      update public.community_posts set status = 'published' where id = target_case.post_id;
    elsif target_case.target_type = 'comment' and target_case.comment_id is not null then
      update public.community_comments set status = 'published' where id = target_case.comment_id;
    else
      raise exception using errcode = 'P0002', message = 'content_no_longer_exists';
    end if;

    update private.community_moderation_cases
    set status = 'dismissed', resolved_at = now(), version = version + 1
    where id = target_case.id;
  end if;

  select * into target_case
  from private.community_moderation_cases
  where id = p_case_id;

  after_state := jsonb_build_object(
    'status', target_case.status,
    'assigned_to', target_case.assigned_to,
    'version', target_case.version
  );

  insert into private.community_moderation_actions (
    actor_user_id,
    actor_role_snapshot,
    case_id,
    report_id,
    target_type,
    target_id,
    action,
    before_snapshot,
    after_snapshot,
    reason_snapshot,
    note,
    request_id
  ) values (
    actor_id,
    actor_role,
    target_case.id,
    (select id from public.community_reports where case_id = target_case.id order by created_at asc limit 1),
    target_case.target_type,
    target_case.target_id,
    requested_action,
    before_state,
    after_state,
    target_case.reason_snapshot,
    trim(p_note),
    p_request_id
  );

  update public.community_reports
  set status = case when target_case.status = 'in_review' then 'reviewed' else 'resolved' end,
      reviewed_at = now(),
      resolution_note = trim(p_note)
  where case_id = target_case.id;

  return jsonb_build_object(
    'case_id', target_case.id,
    'status', target_case.status,
    'action', requested_action,
    'version', target_case.version
  );
end;
$$;

revoke all on function public.apply_community_moderation(uuid, integer, text, text, uuid)
  from public, anon;
grant execute on function public.apply_community_moderation(uuid, integer, text, text, uuid)
  to authenticated;

create or replace function public.service_set_community_moderator(
  p_user_id uuid,
  p_role text,
  p_active boolean default true
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_role private.community_moderator_role;
begin
  begin
    selected_role := p_role::private.community_moderator_role;
  exception when invalid_text_representation then
    raise exception using errcode = '22023', message = 'invalid_moderator_role';
  end;

  if not exists (select 1 from auth.users where id = p_user_id) then
    raise exception using errcode = 'P0002', message = 'moderator_user_not_found';
  end if;

  insert into private.community_moderators (user_id, role, active)
  values (p_user_id, selected_role, p_active)
  on conflict (user_id) do update
  set role = excluded.role, active = excluded.active;
end;
$$;

revoke all on function public.service_set_community_moderator(uuid, text, boolean)
  from public, anon, authenticated;
grant execute on function public.service_set_community_moderator(uuid, text, boolean)
  to service_role;

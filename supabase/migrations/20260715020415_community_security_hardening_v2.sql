-- Community security hardening 1.3.3: stale-token guards, durable abuse
-- controls and concurrency-safe moderation.

create or replace function private.current_auth_user_exists()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and exists (
      select 1
      from auth.users
      where id = (select auth.uid())
    );
$$;

revoke all on function private.current_auth_user_exists()
  from public, anon, authenticated;
grant usage on schema private to authenticated;
grant execute on function private.current_auth_user_exists()
  to authenticated;

drop policy "Authenticated members can read profiles" on public.profiles;
drop policy "Members can update their own profile" on public.profiles;
drop policy "Members can read published posts and their own hidden posts" on public.community_posts;
drop policy "Members can create their own published posts" on public.community_posts;
drop policy "Members can update their own posts" on public.community_posts;
drop policy "Members can delete their own posts" on public.community_posts;
drop policy "Members can read prayer support" on public.community_prayers;
drop policy "Members can add their own prayer support" on public.community_prayers;
drop policy "Members can remove their own prayer support" on public.community_prayers;
drop policy "Members can read published comments and their own hidden comments" on public.community_comments;
drop policy "Members can create their own published comments" on public.community_comments;
drop policy "Members can update their own comments" on public.community_comments;
drop policy "Members can delete their own comments" on public.community_comments;
drop policy "Members can read their own reports" on public.community_reports;
drop policy "Members can submit their own reports" on public.community_reports;

create policy "Authenticated members can read profiles"
on public.profiles for select
to authenticated
using ((select private.current_auth_user_exists()));

create policy "Members can update their own profile"
on public.profiles for update
to authenticated
using (
  (select private.current_auth_user_exists())
  and (select auth.uid()) = id
)
with check (
  (select private.current_auth_user_exists())
  and (select auth.uid()) = id
);

create policy "Members can read published posts and their own hidden posts"
on public.community_posts for select
to authenticated
using (
  (select private.current_auth_user_exists())
  and (status = 'published' or (select auth.uid()) = author_id)
);

create policy "Members can create their own published posts"
on public.community_posts for insert
to authenticated
with check (
  (select private.current_auth_user_exists())
  and (select auth.uid()) = author_id
  and status = 'published'
);

create policy "Members can update their own published posts"
on public.community_posts for update
to authenticated
using (
  (select private.current_auth_user_exists())
  and (select auth.uid()) = author_id
  and status = 'published'
)
with check (
  (select private.current_auth_user_exists())
  and (select auth.uid()) = author_id
  and status = 'published'
);

create policy "Members can delete their own posts"
on public.community_posts for delete
to authenticated
using (
  (select private.current_auth_user_exists())
  and (select auth.uid()) = author_id
);

create policy "Members can read prayer support on published posts"
on public.community_prayers for select
to authenticated
using (
  (select private.current_auth_user_exists())
  and exists (
    select 1
    from public.community_posts post
    where post.id = community_prayers.post_id
      and post.status = 'published'
  )
);

create policy "Members can add prayer support to published posts"
on public.community_prayers for insert
to authenticated
with check (
  (select private.current_auth_user_exists())
  and (select auth.uid()) = user_id
  and exists (
    select 1
    from public.community_posts post
    where post.id = community_prayers.post_id
      and post.status = 'published'
  )
);

create policy "Members can remove prayer support from published posts"
on public.community_prayers for delete
to authenticated
using (
  (select private.current_auth_user_exists())
  and (select auth.uid()) = user_id
  and exists (
    select 1
    from public.community_posts post
    where post.id = community_prayers.post_id
      and post.status = 'published'
  )
);

create policy "Members can read comments on published posts"
on public.community_comments for select
to authenticated
using (
  (select private.current_auth_user_exists())
  and (status = 'published' or (select auth.uid()) = author_id)
  and exists (
    select 1
    from public.community_posts post
    where post.id = community_comments.post_id
      and post.status = 'published'
  )
);

create policy "Members can create comments on published posts"
on public.community_comments for insert
to authenticated
with check (
  (select private.current_auth_user_exists())
  and (select auth.uid()) = author_id
  and status = 'published'
  and exists (
    select 1
    from public.community_posts post
    where post.id = community_comments.post_id
      and post.status = 'published'
  )
);

create policy "Members can update comments on published posts"
on public.community_comments for update
to authenticated
using (
  (select private.current_auth_user_exists())
  and (select auth.uid()) = author_id
  and status = 'published'
  and exists (
    select 1
    from public.community_posts post
    where post.id = community_comments.post_id
      and post.status = 'published'
  )
)
with check (
  (select private.current_auth_user_exists())
  and (select auth.uid()) = author_id
  and status = 'published'
  and exists (
    select 1
    from public.community_posts post
    where post.id = community_comments.post_id
      and post.status = 'published'
  )
);

create policy "Members can delete comments on published posts"
on public.community_comments for delete
to authenticated
using (
  (select private.current_auth_user_exists())
  and (select auth.uid()) = author_id
  and exists (
    select 1
    from public.community_posts post
    where post.id = community_comments.post_id
      and post.status = 'published'
  )
);

create policy "Members can read their own reports"
on public.community_reports for select
to authenticated
using (
  (select private.current_auth_user_exists())
  and (select auth.uid()) = reporter_id
);

create policy "Members can submit their own reports"
on public.community_reports for insert
to authenticated
with check (
  (select private.current_auth_user_exists())
  and (select auth.uid()) = reporter_id
  and status = 'pending'
);

revoke insert on table public.community_posts from authenticated;
grant insert (author_id, kind, title, body)
  on table public.community_posts to authenticated;

revoke insert on table public.community_prayers from authenticated;
grant insert (post_id, user_id)
  on table public.community_prayers to authenticated;

revoke insert on table public.community_comments from authenticated;
grant insert (post_id, author_id, body)
  on table public.community_comments to authenticated;

revoke insert on table public.community_reports from authenticated;
grant insert (reporter_id, post_id, comment_id, reason, details)
  on table public.community_reports to authenticated;

alter table public.community_reports
  drop constraint community_reports_reporter_id_fkey,
  alter column reporter_id drop not null,
  add constraint community_reports_reporter_id_fkey
    foreign key (reporter_id) references public.profiles (id) on delete set null;

drop trigger community_moderation_actions_immutable
  on private.community_moderation_actions;

alter table private.community_moderation_cases
  add column details_snapshot text
    check (details_snapshot is null or char_length(details_snapshot) <= 500);

alter table private.community_moderation_actions
  add column details_snapshot text
    check (details_snapshot is null or char_length(details_snapshot) <= 500),
  add column request_payload jsonb;

update private.community_moderation_cases moderation_case
set details_snapshot = (
  select report.details
  from public.community_reports report
  where report.case_id = moderation_case.id
    and report.details is not null
  order by report.created_at asc
  limit 1
);

update private.community_moderation_actions moderation_action
set details_snapshot = coalesce(
      (
        select report.details
        from public.community_reports report
        where report.id = moderation_action.report_id
      ),
      (
        select moderation_case.details_snapshot
        from private.community_moderation_cases moderation_case
        where moderation_case.id = moderation_action.case_id
      )
    ),
    request_payload = jsonb_build_object(
      'case_id', moderation_action.case_id,
      'expected_version', (moderation_action.before_snapshot ->> 'version')::integer,
      'action', moderation_action.action::text,
      'note', moderation_action.note
    );

alter table private.community_moderation_actions
  alter column request_payload set not null,
  add constraint community_moderation_actions_request_payload_object_check
    check (jsonb_typeof(request_payload) = 'object');

create trigger community_moderation_actions_immutable
before update or delete on private.community_moderation_actions
for each row execute function private.prevent_moderation_audit_mutation();

create table private.community_rate_limit_events (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null,
  operation text not null check (operation in ('post', 'comment', 'report')),
  created_at timestamptz not null default now()
);

create index community_rate_limit_events_actor_operation_idx
  on private.community_rate_limit_events (actor_user_id, operation, created_at desc);

create index community_reports_case_idx
  on public.community_reports (case_id, created_at asc)
  where case_id is not null;

alter table private.community_rate_limit_events enable row level security;
revoke all on table private.community_rate_limit_events
  from public, anon, authenticated;

create or replace function private.enforce_community_write_rate()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  recent_writes integer;
  allowed_writes integer;
  actor_id uuid;
  operation_name text;
  window_start timestamptz;
begin
  if tg_table_name = 'community_posts' then
    actor_id := new.author_id;
    operation_name := 'post';
    allowed_writes := 5;
    window_start := now() - interval '10 minutes';
  elsif tg_table_name = 'community_comments' then
    actor_id := new.author_id;
    operation_name := 'comment';
    allowed_writes := 20;
    window_start := now() - interval '10 minutes';
  elsif tg_table_name = 'community_reports' then
    actor_id := new.reporter_id;
    operation_name := 'report';
    allowed_writes := 10;
    window_start := now() - interval '1 hour';
  else
    raise exception using errcode = '22023', message = 'unsupported_rate_limit_target';
  end if;

  if actor_id is distinct from (select auth.uid())
     or not (select private.current_auth_user_exists()) then
    raise exception using errcode = '42501', message = 'community_actor_mismatch';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(actor_id::text || ':' || operation_name, 0)
  );

  delete from private.community_rate_limit_events event
  where event.actor_user_id = actor_id
    and event.operation = operation_name
    and event.created_at < now() - interval '24 hours';

  select count(*) into recent_writes
  from private.community_rate_limit_events event
  where event.actor_user_id = actor_id
    and event.operation = operation_name
    and event.created_at >= window_start;

  if recent_writes >= allowed_writes then
    raise exception using errcode = 'P0001', message = 'community_rate_limit';
  end if;

  insert into private.community_rate_limit_events (actor_user_id, operation)
  values (actor_id, operation_name);

  return new;
end;
$$;

revoke all on function private.enforce_community_write_rate()
  from public, anon, authenticated;

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
  if new.reporter_id is distinct from (select auth.uid())
     or not (select private.current_auth_user_exists()) then
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
    select comment.* into comment_record
    from public.community_comments comment
    join public.community_posts post on post.id = comment.post_id
    where comment.id = new.comment_id
      and comment.status = 'published'
      and post.status = 'published';

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

revoke all on function private.capture_community_report_evidence()
  from public, anon, authenticated;

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
    reason_snapshot,
    details_snapshot
  ) values (
    new.target_type,
    new.target_id,
    new.post_id,
    new.comment_id,
    new.title_snapshot,
    new.content_snapshot,
    new.author_id_snapshot,
    new.reason,
    new.details
  )
  on conflict (target_type, target_id)
    where status in ('pending', 'in_review')
  do update set
    report_count = private.community_moderation_cases.report_count + 1,
    details_snapshot = coalesce(
      private.community_moderation_cases.details_snapshot,
      excluded.details_snapshot
    )
  returning id into selected_case_id;

  update public.community_reports
  set case_id = selected_case_id
  where id = new.id;

  return new;
end;
$$;

revoke all on function private.attach_community_moderation_case()
  from public, anon, authenticated;

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
  canonical_payload jsonb;
  existing_action private.community_moderation_actions%rowtype;
begin
  select role into actor_role
  from private.community_moderators
  where user_id = actor_id and active = true;

  if actor_id is null
     or actor_role is null
     or not (select private.current_auth_user_exists()) then
    raise exception using errcode = '42501', message = 'moderator_required';
  end if;
  if p_expected_version is null then
    raise exception using errcode = '22023', message = 'expected_version_required';
  end if;
  if p_request_id is null then
    raise exception using errcode = '22023', message = 'request_id_required';
  end if;
  if char_length(trim(coalesce(p_note, ''))) not between 3 and 500 then
    raise exception using errcode = '22023', message = 'invalid_moderation_note';
  end if;

  begin
    requested_action := p_action::private.community_moderation_action;
  exception when invalid_text_representation or null_value_not_allowed then
    raise exception using errcode = '22023', message = 'unsupported_moderation_action';
  end;
  if requested_action is null then
    raise exception using errcode = '22023', message = 'unsupported_moderation_action';
  end if;

  canonical_payload := jsonb_build_object(
    'case_id', p_case_id,
    'expected_version', p_expected_version,
    'action', requested_action::text,
    'note', trim(p_note)
  );

  select * into existing_action
  from private.community_moderation_actions audit
  where audit.actor_user_id = actor_id
    and audit.request_id = p_request_id;
  if found then
    if existing_action.request_payload <> canonical_payload then
      raise exception using errcode = '22023', message = 'idempotency_key_payload_mismatch';
    end if;
    return jsonb_build_object(
      'case_id', existing_action.case_id,
      'status', existing_action.after_snapshot -> 'status',
      'action', existing_action.action,
      'version', existing_action.after_snapshot -> 'version'
    );
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(actor_id::text || ':' || p_request_id::text, 1)
  );

  select * into existing_action
  from private.community_moderation_actions audit
  where audit.actor_user_id = actor_id
    and audit.request_id = p_request_id;
  if found then
    if existing_action.request_payload <> canonical_payload then
      raise exception using errcode = '22023', message = 'idempotency_key_payload_mismatch';
    end if;
    return jsonb_build_object(
      'case_id', existing_action.case_id,
      'status', existing_action.after_snapshot -> 'status',
      'action', existing_action.action,
      'version', existing_action.after_snapshot -> 'version'
    );
  end if;

  select * into target_case
  from private.community_moderation_cases
  where id = p_case_id
  for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'moderation_case_not_found';
  end if;

  -- Recheck after the case lock so retries cannot race the state transition.
  select * into existing_action
  from private.community_moderation_actions audit
  where audit.actor_user_id = actor_id
    and audit.request_id = p_request_id;
  if found then
    if existing_action.request_payload <> canonical_payload then
      raise exception using errcode = '22023', message = 'idempotency_key_payload_mismatch';
    end if;
    return jsonb_build_object(
      'case_id', existing_action.case_id,
      'status', existing_action.after_snapshot -> 'status',
      'action', existing_action.action,
      'version', existing_action.after_snapshot -> 'version'
    );
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
    set status = 'in_review',
        assigned_to = actor_id,
        claimed_at = now(),
        version = version + 1
    where id = target_case.id;
  elsif requested_action in ('hide_content', 'resolve_no_action') then
    if target_case.status not in ('pending', 'in_review')
       or (target_case.assigned_to is not null and target_case.assigned_to <> actor_id) then
      raise exception using errcode = '22023', message = 'invalid_case_transition';
    end if;

    if requested_action = 'hide_content' then
      if target_case.target_type = 'post' and target_case.post_id is not null then
        update public.community_posts
        set status = 'hidden'
        where id = target_case.post_id;
      elsif target_case.target_type = 'comment' and target_case.comment_id is not null then
        update public.community_comments
        set status = 'hidden'
        where id = target_case.comment_id;
      end if;
    end if;

    update private.community_moderation_cases
    set status = case
          when requested_action = 'hide_content' then 'resolved'::private.community_case_status
          else 'dismissed'::private.community_case_status
        end,
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
      update public.community_posts
      set status = 'published'
      where id = target_case.post_id;
      if not found then
        raise exception using errcode = 'P0002', message = 'content_no_longer_exists';
      end if;
    elsif target_case.target_type = 'comment' and target_case.comment_id is not null then
      update public.community_comments comment
      set status = 'published'
      from public.community_posts post
      where comment.id = target_case.comment_id
        and post.id = comment.post_id
        and post.status = 'published';
      if not found then
        raise exception using errcode = 'P0002', message = 'content_parent_not_published';
      end if;
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
    details_snapshot,
    note,
    request_id,
    request_payload
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
    target_case.details_snapshot,
    trim(p_note),
    p_request_id,
    canonical_payload
  );

  update public.community_reports
  set status = case
        when target_case.status = 'in_review' then 'reviewed'::public.community_report_status
        else 'resolved'::public.community_report_status
      end,
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

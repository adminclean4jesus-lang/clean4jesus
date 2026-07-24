-- Keep moderation state transitions strongly typed as private/public enums.

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

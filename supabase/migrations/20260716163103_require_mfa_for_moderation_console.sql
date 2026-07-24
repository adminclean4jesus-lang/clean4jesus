create or replace function public.get_my_community_moderation_access()
returns table (
  role text,
  assurance_level text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
begin
  if actor_id is null
     or not (select private.current_auth_user_exists()) then
    raise exception using errcode = '42501', message = 'moderator_required';
  end if;

  return query
  select moderator.role::text,
         coalesce(auth.jwt() ->> 'aal', 'aal1')
  from private.community_moderators moderator
  where moderator.user_id = actor_id
    and moderator.active = true;

  if not found then
    raise exception using errcode = '42501', message = 'moderator_required';
  end if;
end;
$$;

revoke all on function public.get_my_community_moderation_access()
  from public, anon;
grant execute on function public.get_my_community_moderation_access()
  to authenticated;

create or replace function public.list_community_moderation_cases_v2(
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
begin
  if coalesce(auth.jwt() ->> 'aal', 'aal1') <> 'aal2' then
    raise exception using errcode = '42501', message = 'moderator_mfa_required';
  end if;

  return query
  select moderation_case.id,
         moderation_case.target_type,
         moderation_case.target_id,
         moderation_case.status,
         moderation_case.assigned_to,
         moderation_case.report_count,
         moderation_case.version,
         moderation_case.title_snapshot,
         moderation_case.content_snapshot,
         moderation_case.reason_snapshot,
         moderation_case.created_at
  from public.list_community_moderation_cases(p_status, p_limit) moderation_case;
end;
$$;

create or replace function public.apply_community_moderation_v2(
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
begin
  if coalesce(auth.jwt() ->> 'aal', 'aal1') <> 'aal2' then
    raise exception using errcode = '42501', message = 'moderator_mfa_required';
  end if;

  return public.apply_community_moderation(
    p_case_id,
    p_expected_version,
    p_action,
    p_note,
    p_request_id
  );
end;
$$;

revoke all on function public.list_community_moderation_cases(text, integer)
  from authenticated;
revoke all on function public.apply_community_moderation(uuid, integer, text, text, uuid)
  from authenticated;

revoke all on function public.list_community_moderation_cases_v2(text, integer)
  from public, anon;
grant execute on function public.list_community_moderation_cases_v2(text, integer)
  to authenticated;

revoke all on function public.apply_community_moderation_v2(uuid, integer, text, text, uuid)
  from public, anon;
grant execute on function public.apply_community_moderation_v2(uuid, integer, text, text, uuid)
  to authenticated;

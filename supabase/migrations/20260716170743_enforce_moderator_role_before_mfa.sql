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
  perform * from public.get_my_community_moderation_access();

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
  perform * from public.get_my_community_moderation_access();

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

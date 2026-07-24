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
  if actor_id is null
     or not (select private.current_auth_user_exists())
     or not exists (
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

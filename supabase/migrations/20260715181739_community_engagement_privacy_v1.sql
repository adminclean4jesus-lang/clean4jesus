-- Prayer support identities are private. Clients receive only per-post totals
-- and whether the active member has already offered support.
drop policy "Members can read prayer support on published posts"
  on public.community_prayers;

revoke select on table public.community_prayers from authenticated;

create or replace function public.get_community_engagement(p_post_ids uuid[])
returns table (
  post_id uuid,
  prayer_count bigint,
  comment_count bigint,
  prayed_by_me boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not (select private.current_auth_user_exists()) then
    raise exception using errcode = '42501', message = 'active_session_required';
  end if;

  if p_post_ids is null or cardinality(p_post_ids) < 1 or cardinality(p_post_ids) > 50 then
    raise exception using errcode = '22023', message = 'post_ids_must_contain_between_1_and_50_items';
  end if;

  return query
  select
    post.id,
    (
      select count(*)
      from public.community_prayers prayer
      where prayer.post_id = post.id
    ),
    (
      select count(*)
      from public.community_comments comment
      where comment.post_id = post.id
        and comment.status = 'published'
    ),
    exists (
      select 1
      from public.community_prayers prayer
      where prayer.post_id = post.id
        and prayer.user_id = (select auth.uid())
    )
  from public.community_posts post
  where post.id = any(p_post_ids)
    and post.status = 'published';
end;
$$;

revoke all on function public.get_community_engagement(uuid[])
  from public, anon, authenticated;
grant execute on function public.get_community_engagement(uuid[])
  to authenticated;

comment on function public.get_community_engagement(uuid[]) is
  'Returns aggregate engagement for published posts without exposing prayer supporter identities.';

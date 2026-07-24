-- Community members expose only the identity fields required by the feed.
-- Stable auth/profile UUIDs remain private and full profiles are owner-only.

drop policy if exists "Authenticated members can read profiles" on public.profiles;

create policy "Members can read their own profile"
on public.profiles for select
to authenticated
using (
  (select private.current_auth_user_exists())
  and id = (select auth.uid())
);

-- Keep write privileges, but prevent clients from selecting author identifiers
-- directly from community content tables.
revoke select on table public.community_posts from authenticated;
grant select (id, kind, title, body, status, created_at, updated_at)
  on table public.community_posts to authenticated;

revoke select on table public.community_comments from authenticated;
grant select (id, post_id, body, status, created_at, updated_at)
  on table public.community_comments to authenticated;

create or replace function public.list_community_posts_public(
  p_kind public.community_post_kind default null
)
returns table (
  id uuid,
  kind public.community_post_kind,
  title text,
  body text,
  created_at timestamptz,
  author_display_name text,
  author_city text,
  author_avatar_url text,
  owned_by_me boolean
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.current_auth_user_exists() then
    raise exception using errcode = '42501', message = 'active_session_required';
  end if;

  return query
  select
    post.id,
    post.kind,
    post.title,
    post.body,
    post.created_at,
    profile.display_name,
    profile.city,
    profile.avatar_url,
    post.author_id = (select auth.uid())
  from public.community_posts post
  join public.profiles profile on profile.id = post.author_id
  where post.status = 'published'
    and (p_kind is null or post.kind = p_kind)
  order by post.created_at desc
  limit 50;
end;
$$;

create or replace function public.list_community_comments_public(p_post_id uuid)
returns table (
  id uuid,
  body text,
  created_at timestamptz,
  author_display_name text,
  author_avatar_url text,
  owned_by_me boolean
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.current_auth_user_exists() then
    raise exception using errcode = '42501', message = 'active_session_required';
  end if;

  return query
  select
    comment.id,
    comment.body,
    comment.created_at,
    profile.display_name,
    profile.avatar_url,
    comment.author_id = (select auth.uid())
  from public.community_comments comment
  join public.community_posts post on post.id = comment.post_id
  join public.profiles profile on profile.id = comment.author_id
  where comment.post_id = p_post_id
    and comment.status = 'published'
    and post.status = 'published'
  order by comment.created_at asc;
end;
$$;

revoke all on function public.list_community_posts_public(public.community_post_kind)
  from public, anon, authenticated;
grant execute on function public.list_community_posts_public(public.community_post_kind)
  to authenticated;

revoke all on function public.list_community_comments_public(uuid)
  from public, anon, authenticated;
grant execute on function public.list_community_comments_public(uuid)
  to authenticated;

comment on function public.list_community_posts_public(public.community_post_kind) is
  'Returns the published community feed with public display identity and no profile UUID.';
comment on function public.list_community_comments_public(uuid) is
  'Returns published comments with public display identity and no profile UUID.';

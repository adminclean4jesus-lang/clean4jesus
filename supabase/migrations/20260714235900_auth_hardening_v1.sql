-- Auth hardening 1.3.1: least privilege and server-side abuse controls.

revoke select, update on table public.profiles from authenticated;
grant select (id, display_name, city, bio, avatar_url, created_at, updated_at)
  on table public.profiles to authenticated;
grant update (display_name, city, bio)
  on table public.profiles to authenticated;

revoke update on table public.community_posts from authenticated;
grant update (title, body, kind)
  on table public.community_posts to authenticated;

revoke update on table public.community_comments from authenticated;
grant update (body)
  on table public.community_comments to authenticated;

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
  window_start timestamptz;
begin
  if tg_table_name = 'community_posts' then
    actor_id := new.author_id;
    allowed_writes := 5;
    window_start := now() - interval '10 minutes';
    select count(*) into recent_writes
      from public.community_posts
      where author_id = actor_id and created_at >= window_start;
  elsif tg_table_name = 'community_comments' then
    actor_id := new.author_id;
    allowed_writes := 20;
    window_start := now() - interval '10 minutes';
    select count(*) into recent_writes
      from public.community_comments
      where author_id = actor_id and created_at >= window_start;
  else
    actor_id := new.reporter_id;
    allowed_writes := 10;
    window_start := now() - interval '1 hour';
    select count(*) into recent_writes
      from public.community_reports
      where reporter_id = actor_id and created_at >= window_start;
  end if;

  if actor_id is distinct from (select auth.uid()) then
    raise exception using errcode = '42501', message = 'community_actor_mismatch';
  end if;

  if recent_writes >= allowed_writes then
    raise exception using errcode = 'P0001', message = 'community_rate_limit';
  end if;

  return new;
end;
$$;

revoke all on function private.enforce_community_write_rate() from public;

create trigger community_posts_rate_limit
before insert on public.community_posts
for each row execute function private.enforce_community_write_rate();

create trigger community_comments_rate_limit
before insert on public.community_comments
for each row execute function private.enforce_community_write_rate();

create trigger community_reports_rate_limit
before insert on public.community_reports
for each row execute function private.enforce_community_write_rate();

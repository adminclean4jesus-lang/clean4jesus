create schema if not exists private;
revoke all on schema private from public;

create type public.community_post_kind as enum ('prayer', 'testimony', 'update');
create type public.community_content_status as enum ('published', 'hidden');
create type public.community_report_reason as enum ('spam', 'harassment', 'sexual_content', 'self_harm', 'other');
create type public.community_report_status as enum ('pending', 'reviewed', 'resolved');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 40),
  city text check (city is null or char_length(city) <= 80),
  bio text check (bio is null or char_length(bio) <= 280),
  avatar_url text,
  clean_streak integer not null default 0 check (clean_streak between 0 and 100000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.community_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  kind public.community_post_kind not null,
  title text not null check (char_length(title) between 3 and 100),
  body text not null check (char_length(body) between 10 and 2000),
  status public.community_content_status not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.community_prayers (
  post_id uuid not null references public.community_posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table public.community_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 2 and 1000),
  status public.community_content_status not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.community_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  post_id uuid references public.community_posts (id) on delete cascade,
  comment_id uuid references public.community_comments (id) on delete cascade,
  reason public.community_report_reason not null,
  details text check (details is null or char_length(details) <= 500),
  status public.community_report_status not null default 'pending',
  created_at timestamptz not null default now(),
  check ((post_id is not null)::integer + (comment_id is not null)::integer = 1)
);

create index community_posts_feed_idx
  on public.community_posts (created_at desc)
  where status = 'published';
create index community_posts_author_idx on public.community_posts (author_id, created_at desc);
create index community_comments_post_idx on public.community_comments (post_id, created_at asc);
create index community_comments_author_idx on public.community_comments (author_id);
create index community_prayers_user_idx on public.community_prayers (user_id, created_at desc);
create index community_reports_pending_idx
  on public.community_reports (created_at asc)
  where status = 'pending';
create index community_reports_reporter_idx on public.community_reports (reporter_id, created_at desc);
create unique index community_reports_unique_post_reporter_idx
  on public.community_reports (reporter_id, post_id)
  where post_id is not null;
create unique index community_reports_unique_comment_reporter_idx
  on public.community_reports (reporter_id, comment_id)
  where comment_id is not null;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function private.set_updated_at() from public;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

create trigger community_posts_set_updated_at
before update on public.community_posts
for each row execute function private.set_updated_at();

create trigger community_comments_set_updated_at
before update on public.community_comments
for each row execute function private.set_updated_at();

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_name text;
begin
  requested_name := nullif(trim(coalesce(new.raw_user_meta_data ->> 'display_name', '')), '');

  if requested_name is null or char_length(requested_name) < 2 then
    requested_name := 'Nuevo miembro';
  end if;

  insert into public.profiles (id, display_name)
  values (new.id, left(requested_name, 40))
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke all on function private.handle_new_user() from public;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

alter table public.profiles enable row level security;
alter table public.community_posts enable row level security;
alter table public.community_prayers enable row level security;
alter table public.community_comments enable row level security;
alter table public.community_reports enable row level security;

create policy "Authenticated members can read profiles"
on public.profiles for select
to authenticated
using (true);

create policy "Members can update their own profile"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "Members can read published posts and their own hidden posts"
on public.community_posts for select
to authenticated
using (status = 'published' or (select auth.uid()) = author_id);

create policy "Members can create their own published posts"
on public.community_posts for insert
to authenticated
with check ((select auth.uid()) = author_id and status = 'published');

create policy "Members can update their own posts"
on public.community_posts for update
to authenticated
using ((select auth.uid()) = author_id)
with check ((select auth.uid()) = author_id);

create policy "Members can delete their own posts"
on public.community_posts for delete
to authenticated
using ((select auth.uid()) = author_id);

create policy "Members can read prayer support"
on public.community_prayers for select
to authenticated
using (true);

create policy "Members can add their own prayer support"
on public.community_prayers for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Members can remove their own prayer support"
on public.community_prayers for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "Members can read published comments and their own hidden comments"
on public.community_comments for select
to authenticated
using (status = 'published' or (select auth.uid()) = author_id);

create policy "Members can create their own published comments"
on public.community_comments for insert
to authenticated
with check (
  (select auth.uid()) = author_id
  and status = 'published'
  and exists (
    select 1
    from public.community_posts post
    where post.id = community_comments.post_id and post.status = 'published'
  )
);

create policy "Members can update their own comments"
on public.community_comments for update
to authenticated
using ((select auth.uid()) = author_id)
with check ((select auth.uid()) = author_id);

create policy "Members can delete their own comments"
on public.community_comments for delete
to authenticated
using ((select auth.uid()) = author_id);

create policy "Members can read their own reports"
on public.community_reports for select
to authenticated
using ((select auth.uid()) = reporter_id);

create policy "Members can submit their own reports"
on public.community_reports for insert
to authenticated
with check ((select auth.uid()) = reporter_id and status = 'pending');

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.community_posts from anon, authenticated;
revoke all on table public.community_prayers from anon, authenticated;
revoke all on table public.community_comments from anon, authenticated;
revoke all on table public.community_reports from anon, authenticated;

grant select, update on table public.profiles to authenticated;
grant select, insert, update, delete on table public.community_posts to authenticated;
grant select, insert, delete on table public.community_prayers to authenticated;
grant select, insert, update, delete on table public.community_comments to authenticated;
grant select, insert on table public.community_reports to authenticated;

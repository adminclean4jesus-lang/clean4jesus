create table if not exists public.daily_devotionals (
  id text primary key,
  theme text not null,
  status text not null default 'draft',
  rotation_order integer not null unique,
  content_version integer not null default 1,
  published_at timestamptz,
  updated_at timestamptz not null default timezone('utc', now()),
  constraint daily_devotionals_id_format check (id ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint daily_devotionals_status_check check (status in ('draft', 'published', 'archived')),
  constraint daily_devotionals_rotation_order_check check (rotation_order > 0),
  constraint daily_devotionals_content_version_check check (content_version > 0)
);

create table if not exists public.daily_devotional_translations (
  devotional_id text not null references public.daily_devotionals(id) on delete cascade,
  locale text not null,
  title text not null,
  verse text not null,
  reference text not null,
  reflection text not null,
  question text not null,
  prayer text not null,
  practice text not null,
  primary key (devotional_id, locale),
  constraint daily_devotional_translations_locale_check check (locale in ('es', 'en', 'fr', 'pt')),
  constraint daily_devotional_translations_title_check check (char_length(title) between 1 and 160),
  constraint daily_devotional_translations_reflection_check check (char_length(reflection) between 80 and 12000)
);

create index if not exists daily_devotionals_published_rotation_idx
  on public.daily_devotionals (rotation_order, id)
  where status = 'published';

create index if not exists daily_devotional_translations_locale_idx
  on public.daily_devotional_translations (locale, devotional_id);

alter table public.daily_devotionals enable row level security;
alter table public.daily_devotional_translations enable row level security;

revoke all on public.daily_devotionals from public, anon, authenticated;
revoke all on public.daily_devotional_translations from public, anon, authenticated;

create or replace function public.get_daily_devotional(
  p_locale text default 'es',
  p_on_date date default current_date
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with requested as (
    select
      case when p_locale in ('es', 'en', 'fr', 'pt') then p_locale else 'es' end as locale,
      coalesce(p_on_date, current_date) as day_key
  ),
  published as (
    select
      devotional.*,
      row_number() over (order by devotional.rotation_order, devotional.id) as row_number,
      count(*) over () as total
    from public.daily_devotionals devotional
    where devotional.status = 'published'
      and devotional.published_at is not null
      and devotional.published_at <= timezone('utc', now())
  ),
  selected as (
    select published.*
    from published, requested
    where published.row_number = 1 + mod(
      mod((requested.day_key - date '2026-01-01')::integer, published.total::integer) + published.total::integer,
      published.total::integer
    )
    limit 1
  ),
  localized as (
    select
      selected.id,
      selected.theme,
      selected.content_version,
      selected.updated_at,
      translation.title,
      translation.verse,
      translation.reference,
      translation.reflection,
      translation.question,
      translation.prayer,
      translation.practice
    from selected
    join lateral (
      select candidate.title, candidate.verse, candidate.reference, candidate.reflection,
             candidate.question, candidate.prayer, candidate.practice
      from public.daily_devotional_translations candidate, requested
      where candidate.devotional_id = selected.id
        and candidate.locale in (requested.locale, 'es')
      order by case when candidate.locale = requested.locale then 0 else 1 end
      limit 1
    ) translation on true
  )
  select jsonb_build_object(
    'revision', coalesce((select content_version from localized), 0),
    'dateKey', (select day_key::text from requested),
    'devotional', (
      select jsonb_build_object(
        'id', id,
        'title', title,
        'verse', verse,
        'reference', reference,
        'reflection', reflection,
        'question', question,
        'prayer', prayer,
        'theme', theme,
        'practice', practice
      )
      from localized
    ),
    'updatedAt', coalesce((select updated_at from localized), timezone('utc', now()))
  );
$$;

revoke all on function public.get_daily_devotional(text, date) from public;
grant execute on function public.get_daily_devotional(text, date) to anon, authenticated;

comment on function public.get_daily_devotional(text, date)
  is 'Returns one deterministic localized devotional for a local calendar date. Draft content and direct tables remain private.';

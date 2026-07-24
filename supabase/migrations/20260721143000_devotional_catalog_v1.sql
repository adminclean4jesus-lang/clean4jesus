create table if not exists public.devotional_plans (
  id text primary key,
  tone text not null,
  icon text not null,
  status text not null default 'draft',
  sort_order integer not null default 0,
  content_version integer not null default 1,
  published_at timestamptz,
  updated_at timestamptz not null default timezone('utc', now()),
  constraint devotional_plans_id_format check (id ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint devotional_plans_tone_check check (tone in ('primary', 'accent', 'success')),
  constraint devotional_plans_status_check check (status in ('draft', 'published', 'archived')),
  constraint devotional_plans_content_version_check check (content_version > 0)
);

create table if not exists public.devotional_plan_translations (
  plan_id text not null references public.devotional_plans(id) on delete cascade,
  locale text not null,
  title text not null,
  subtitle text not null,
  description text not null,
  primary key (plan_id, locale),
  constraint devotional_plan_translations_locale_check check (locale in ('es', 'en', 'fr', 'pt')),
  constraint devotional_plan_translations_title_check check (char_length(title) between 1 and 120),
  constraint devotional_plan_translations_subtitle_check check (char_length(subtitle) between 1 and 240),
  constraint devotional_plan_translations_description_check check (char_length(description) between 1 and 1200)
);

create table if not exists public.devotional_plan_days (
  plan_id text not null references public.devotional_plans(id) on delete cascade,
  day_number smallint not null,
  primary key (plan_id, day_number),
  constraint devotional_plan_days_number_check check (day_number between 1 and 366)
);

create table if not exists public.devotional_plan_day_translations (
  plan_id text not null,
  day_number smallint not null,
  locale text not null,
  title text not null,
  verse text not null,
  reference text not null,
  reflection text not null,
  question text not null,
  prayer text not null,
  practice text not null,
  primary key (plan_id, day_number, locale),
  foreign key (plan_id, day_number)
    references public.devotional_plan_days(plan_id, day_number)
    on delete cascade,
  constraint devotional_plan_day_translations_locale_check check (locale in ('es', 'en', 'fr', 'pt')),
  constraint devotional_plan_day_translations_title_check check (char_length(title) between 1 and 160),
  constraint devotional_plan_day_translations_reflection_check check (char_length(reflection) between 80 and 12000)
);

create index if not exists devotional_plans_published_order_idx
  on public.devotional_plans (sort_order, published_at desc, id)
  where status = 'published';

create index if not exists devotional_plan_translations_locale_idx
  on public.devotional_plan_translations (locale, plan_id);

create index if not exists devotional_plan_day_translations_locale_idx
  on public.devotional_plan_day_translations (locale, plan_id, day_number);

alter table public.devotional_plans enable row level security;
alter table public.devotional_plan_translations enable row level security;
alter table public.devotional_plan_days enable row level security;
alter table public.devotional_plan_day_translations enable row level security;

revoke all on public.devotional_plans from public, anon, authenticated;
revoke all on public.devotional_plan_translations from public, anon, authenticated;
revoke all on public.devotional_plan_days from public, anon, authenticated;
revoke all on public.devotional_plan_day_translations from public, anon, authenticated;

create or replace function public.get_published_devotional_catalog(
  p_locale text default 'es',
  p_limit integer default 24,
  p_offset integer default 0
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with requested as (
    select case when p_locale in ('es', 'en', 'fr', 'pt') then p_locale else 'es' end as locale
  ),
  page as (
    select plan.*
    from public.devotional_plans plan
    where plan.status = 'published'
      and plan.published_at is not null
      and plan.published_at <= timezone('utc', now())
    order by plan.sort_order, plan.published_at desc, plan.id
    limit least(greatest(coalesce(p_limit, 24), 1), 50)
    offset greatest(coalesce(p_offset, 0), 0)
  ),
  localized as (
    select
      plan.id,
      plan.tone,
      plan.icon,
      plan.sort_order,
      plan.content_version,
      plan.updated_at,
      translation.title,
      translation.subtitle,
      translation.description,
      coalesce((
        select jsonb_agg(
          jsonb_build_object(
            'day', day.day_number,
            'title', day_translation.title,
            'verse', day_translation.verse,
            'reference', day_translation.reference,
            'reflection', day_translation.reflection,
            'question', day_translation.question,
            'prayer', day_translation.prayer,
            'practice', day_translation.practice
          ) order by day.day_number
        )
        from public.devotional_plan_days day
        join lateral (
          select candidate.title, candidate.verse, candidate.reference,
                 candidate.reflection, candidate.question, candidate.prayer, candidate.practice
          from public.devotional_plan_day_translations candidate, requested
          where candidate.plan_id = day.plan_id
            and candidate.day_number = day.day_number
            and candidate.locale in (requested.locale, 'es')
          order by case when candidate.locale = requested.locale then 0 else 1 end
          limit 1
        ) day_translation on true
        where day.plan_id = plan.id
      ), '[]'::jsonb) as days
    from page plan
    join lateral (
      select candidate.title, candidate.subtitle, candidate.description
      from public.devotional_plan_translations candidate, requested
      where candidate.plan_id = plan.id
        and candidate.locale in (requested.locale, 'es')
      order by case when candidate.locale = requested.locale then 0 else 1 end
      limit 1
    ) translation on true
  )
  select jsonb_build_object(
    'revision', coalesce(max(content_version), 0),
    'hasMore', (
      select exists (
        select 1
        from public.devotional_plans remaining
        where remaining.status = 'published'
          and remaining.published_at is not null
          and remaining.published_at <= timezone('utc', now())
        order by remaining.sort_order, remaining.published_at desc, remaining.id
        offset greatest(coalesce(p_offset, 0), 0) + least(greatest(coalesce(p_limit, 24), 1), 50)
        limit 1
      )
    ),
    'plans', coalesce(jsonb_agg(
      jsonb_build_object(
        'id', id,
        'title', title,
        'subtitle', subtitle,
        'description', description,
        'tone', tone,
        'icon', icon,
        'days', days
      ) order by sort_order, id
    ), '[]'::jsonb),
    'updatedAt', coalesce(max(updated_at), timezone('utc', now()))
  )
  from localized;
$$;

revoke all on function public.get_published_devotional_catalog(text, integer, integer) from public;
grant execute on function public.get_published_devotional_catalog(text, integer, integer) to anon, authenticated;

comment on function public.get_published_devotional_catalog(text, integer, integer)
  is 'Returns a bounded, localized page of published devotional plans. Draft rows and direct table access remain private.';

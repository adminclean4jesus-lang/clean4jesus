create or replace function public.get_devotional_plan_catalog(
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
        select count(*)::integer
        from public.devotional_plan_days day
        where day.plan_id = plan.id
      ), 0) as day_count,
      coalesce((
        select jsonb_agg(
          jsonb_build_object('day', day.day_number, 'title', day_translation.title)
          order by day.day_number
        )
        from public.devotional_plan_days day
        join lateral (
          select candidate.title
          from public.devotional_plan_day_translations candidate, requested
          where candidate.plan_id = day.plan_id
            and candidate.day_number = day.day_number
            and candidate.locale in (requested.locale, 'es')
          order by case when candidate.locale = requested.locale then 0 else 1 end
          limit 1
        ) day_translation on true
        where day.plan_id = plan.id
      ), '[]'::jsonb) as day_titles
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
      select count(*) > greatest(coalesce(p_offset, 0), 0) + least(greatest(coalesce(p_limit, 24), 1), 50)
      from public.devotional_plans remaining
      where remaining.status = 'published'
        and remaining.published_at is not null
        and remaining.published_at <= timezone('utc', now())
    ),
    'plans', coalesce(jsonb_agg(
      jsonb_build_object(
        'id', id,
        'title', title,
        'subtitle', subtitle,
        'description', description,
        'tone', tone,
        'icon', icon,
        'dayCount', day_count,
        'dayTitles', day_titles
      ) order by sort_order, id
    ), '[]'::jsonb),
    'updatedAt', coalesce(max(updated_at), timezone('utc', now()))
  )
  from localized;
$$;

create or replace function public.get_devotional_plan_detail(
  p_plan_id text,
  p_locale text default 'es'
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
  published_plan as (
    select plan.*
    from public.devotional_plans plan
    where plan.id = p_plan_id
      and plan.status = 'published'
      and plan.published_at is not null
      and plan.published_at <= timezone('utc', now())
    limit 1
  ),
  localized as (
    select
      plan.id,
      plan.tone,
      plan.icon,
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
    from published_plan plan
    join lateral (
      select candidate.title, candidate.subtitle, candidate.description
      from public.devotional_plan_translations candidate, requested
      where candidate.plan_id = plan.id
        and candidate.locale in (requested.locale, 'es')
      order by case when candidate.locale = requested.locale then 0 else 1 end
      limit 1
    ) translation on true
  )
  select coalesce((
    select jsonb_build_object(
      'revision', content_version,
      'updatedAt', updated_at,
      'plan', jsonb_build_object(
        'id', id,
        'title', title,
        'subtitle', subtitle,
        'description', description,
        'tone', tone,
        'icon', icon,
        'days', days
      )
    )
    from localized
  ), jsonb_build_object('plan', null));
$$;

revoke all on function public.get_devotional_plan_catalog(text, integer, integer) from public;
revoke all on function public.get_devotional_plan_detail(text, text) from public;
grant execute on function public.get_devotional_plan_catalog(text, integer, integer) to anon, authenticated;
grant execute on function public.get_devotional_plan_detail(text, text) to anon, authenticated;

comment on function public.get_devotional_plan_catalog(text, integer, integer)
  is 'Returns lightweight localized plan metadata without long devotional bodies.';
comment on function public.get_devotional_plan_detail(text, text)
  is 'Returns one complete published devotional plan in the requested locale.';

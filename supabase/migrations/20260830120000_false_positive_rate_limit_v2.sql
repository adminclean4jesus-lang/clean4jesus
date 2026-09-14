-- Durable, atomic rate limiting for the false-positive reporting endpoint.
-- The Edge Function calls this function with the service role; clients have no
-- direct access to either the event table or the RPC.

create table if not exists private.false_positive_rate_limit_events (
  id bigint generated always as identity primary key,
  device_id_hash text not null check (device_id_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now()
);

alter table private.false_positive_rate_limit_events enable row level security;
revoke all on table private.false_positive_rate_limit_events from public, anon, authenticated;
revoke all on sequence private.false_positive_rate_limit_events_id_seq from public, anon, authenticated;

create index if not exists false_positive_rate_limit_events_device_created_idx
  on private.false_positive_rate_limit_events (device_id_hash, created_at desc);

create or replace function public.consume_false_positive_rate_limit(
  p_device_id_hash text,
  p_limit integer default 10,
  p_window_minutes integer default 60
)
returns boolean
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  window_start timestamptz;
  current_count integer;
begin
  if p_device_id_hash is null or p_device_id_hash !~ '^[0-9a-f]{64}$'
    or p_limit is null or p_limit < 1 or p_limit > 1000
    or p_window_minutes is null or p_window_minutes < 1 or p_window_minutes > 1440 then
    raise exception using errcode = '22023', message = 'invalid_false_positive_rate_limit';
  end if;
  window_start := now() - make_interval(mins => p_window_minutes);

  -- Serialize checks for the same device so concurrent requests cannot both
  -- observe the same count and exceed the configured limit.
  perform pg_advisory_xact_lock(hashtextextended(p_device_id_hash, 0));

  delete from private.false_positive_rate_limit_events
   where device_id_hash = p_device_id_hash
     and created_at < window_start;

  select count(*)::integer
    into current_count
    from private.false_positive_rate_limit_events
   where device_id_hash = p_device_id_hash
     and created_at >= window_start;

  if current_count >= p_limit then
    return false;
  end if;

  insert into private.false_positive_rate_limit_events (device_id_hash)
  values (p_device_id_hash);
  return true;
end;
$$;

revoke all on function public.consume_false_positive_rate_limit(text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.consume_false_positive_rate_limit(text, integer, integer)
  to service_role;

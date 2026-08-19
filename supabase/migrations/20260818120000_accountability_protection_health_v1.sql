-- Voluntary accompanied mode: minimal Android protection health checks.
-- No app names, screen text, URLs, searches, or browsing content are stored.

alter table private.accountability_relationships
  add column protection_health_owner_consented_at timestamptz,
  add column protection_health_guardian_consented_at timestamptz,
  add column protection_health_activated_at timestamptz,
  add column protection_health_grace_minutes integer not null default 30
    check (protection_health_grace_minutes between 30 and 1440);

alter table private.accountability_owner_devices
  add column last_health_check_at timestamptz,
  add column last_protection_healthy_at timestamptz,
  add column last_protection_unhealthy_at timestamptz;

create table private.accountability_protection_health_checkins (
  device_id uuid not null references private.accountability_owner_devices (id) on delete cascade,
  idempotency_key uuid not null,
  accessibility_enabled boolean not null,
  vpn_enabled boolean not null,
  received_at timestamptz not null default now(),
  primary key (device_id, idempotency_key)
);

create table private.accountability_protection_health_alerts (
  id uuid primary key default gen_random_uuid(),
  relationship_id uuid not null references private.accountability_relationships (id) on delete cascade,
  device_id uuid not null references private.accountability_owner_devices (id) on delete cascade,
  started_at timestamptz not null,
  recovered_at timestamptz,
  notified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index accountability_one_open_health_alert_per_device_idx
  on private.accountability_protection_health_alerts (device_id)
  where recovered_at is null;

create index accountability_health_alert_dispatch_idx
  on private.accountability_protection_health_alerts (notified_at, started_at)
  where recovered_at is null;

alter table private.accountability_protection_health_checkins enable row level security;
alter table private.accountability_protection_health_alerts enable row level security;
revoke all on table private.accountability_protection_health_checkins from public, anon, authenticated;
revoke all on table private.accountability_protection_health_alerts from public, anon, authenticated;

create or replace function private.accountability_verified_health_device(
  p_device_id uuid,
  p_device_secret text
)
returns private.accountability_owner_devices
language plpgsql
security definer
set search_path = ''
as $$
declare
  target private.accountability_owner_devices%rowtype;
begin
  select device.* into target
  from private.accountability_owner_devices device
  join private.accountability_relationships relationship on relationship.id = device.relationship_id
  where device.id = p_device_id
    and device.active
    and relationship.status = 'accepted'
    and relationship.protection_health_owner_consented_at is not null
    and relationship.protection_health_guardian_consented_at is not null
    and device.credential_secret_hash = extensions.crypt(p_device_secret, device.credential_secret_hash);
  if not found then
    raise exception using errcode = '28000', message = 'invalid_health_device_credential';
  end if;
  return target;
end;
$$;

revoke all on function private.accountability_verified_health_device(uuid, text) from public, anon, authenticated;

create or replace function public.record_accountability_protection_health_checkin(
  p_device_id uuid,
  p_device_secret text,
  p_idempotency_key uuid,
  p_accessibility_enabled boolean,
  p_vpn_enabled boolean
)
returns table (duplicate boolean, accepted boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_device private.accountability_owner_devices%rowtype;
  healthy boolean := p_accessibility_enabled and p_vpn_enabled;
begin
  target_device := private.accountability_verified_health_device(p_device_id, p_device_secret);
  insert into private.accountability_protection_health_checkins (
    device_id, idempotency_key, accessibility_enabled, vpn_enabled
  ) values (p_device_id, p_idempotency_key, p_accessibility_enabled, p_vpn_enabled)
  on conflict (device_id, idempotency_key) do nothing;

  if not found then
    duplicate := true;
    accepted := true;
    return next;
    return;
  end if;

  update private.accountability_owner_devices
  set last_health_check_at = now(),
      last_protection_healthy_at = case when healthy then now() else last_protection_healthy_at end,
      last_protection_unhealthy_at = case when healthy then null else coalesce(last_protection_unhealthy_at, now()) end
  where id = target_device.id;

  if healthy then
    update private.accountability_protection_health_alerts
    set recovered_at = now(), updated_at = now()
    where device_id = target_device.id and recovered_at is null;
  end if;

  delete from private.accountability_protection_health_checkins
  where received_at < now() - interval '7 days';
  duplicate := false;
  accepted := true;
  return next;
end;
$$;

revoke all on function public.record_accountability_protection_health_checkin(uuid, text, uuid, boolean, boolean)
  from public, anon, authenticated, service_role;
grant execute on function public.record_accountability_protection_health_checkin(uuid, text, uuid, boolean, boolean)
  to service_role;

create or replace function public.configure_accountability_protection_health(
  p_relationship_id uuid,
  p_enabled boolean,
  p_grace_minutes integer default 30
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := private.require_current_accountability_user();
begin
  if p_grace_minutes not between 30 and 1440 then
    raise exception using errcode = '22023', message = 'invalid_protection_health_grace';
  end if;
  if p_enabled then
    update private.accountability_relationships relationship
    set protection_health_owner_consented_at = now(),
        protection_health_guardian_consented_at = null,
        protection_health_activated_at = null,
        protection_health_grace_minutes = p_grace_minutes,
        updated_at = now()
    where relationship.id = p_relationship_id
      and relationship.owner_user_id = caller_id
      and relationship.status = 'accepted';
    if not found then raise exception using errcode = '42501', message = 'accepted_owner_relationship_required'; end if;
    return 'pending_guardian';
  end if;

  update private.accountability_relationships relationship
  set protection_health_owner_consented_at = null,
      protection_health_guardian_consented_at = null,
      protection_health_activated_at = null,
      updated_at = now()
  where relationship.id = p_relationship_id
    and relationship.owner_user_id = caller_id
    and relationship.status = 'accepted';
  if not found then raise exception using errcode = '42501', message = 'accepted_owner_relationship_required'; end if;
  update private.accountability_protection_health_alerts
  set recovered_at = now(), updated_at = now()
  where relationship_id = p_relationship_id and recovered_at is null;
  return 'disabled';
end;
$$;

create or replace function public.accept_accountability_protection_health(p_relationship_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := private.require_current_accountability_user();
begin
  update private.accountability_relationships relationship
  set protection_health_guardian_consented_at = now(),
      protection_health_activated_at = now(),
      updated_at = now()
  where relationship.id = p_relationship_id
    and relationship.guardian_user_id = caller_id
    and relationship.status = 'accepted'
    and relationship.protection_health_owner_consented_at is not null;
  if not found then raise exception using errcode = '42501', message = 'owner_health_consent_required'; end if;
  return 'active';
end;
$$;

revoke all on function public.configure_accountability_protection_health(uuid, boolean, integer) from public, anon, authenticated;
revoke all on function public.accept_accountability_protection_health(uuid) from public, anon, authenticated;
grant execute on function public.configure_accountability_protection_health(uuid, boolean, integer) to authenticated;
grant execute on function public.accept_accountability_protection_health(uuid) to authenticated;

create or replace function public.list_my_accountability_relationships()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', relationship.id,
        'role', case when relationship.owner_user_id = caller.user_id then 'owner' else 'guardian' end,
        'otherUserId', case when relationship.owner_user_id = caller.user_id then relationship.guardian_user_id else relationship.owner_user_id end,
        'status', relationship.status,
        'acceptedAt', relationship.accepted_at,
        'alertsEnabled', relationship.alerts_enabled,
        'riskThreshold', relationship.risk_threshold,
        'protectionHealthStatus', case
          when relationship.protection_health_owner_consented_at is null then 'disabled'
          when relationship.protection_health_guardian_consented_at is null then 'pending'
          else 'active'
        end,
        'protectionHealthGraceMinutes', relationship.protection_health_grace_minutes
      ) order by relationship.created_at desc
    ), '[]'::jsonb
  )
  from (select private.require_current_accountability_user() as user_id) caller
  join private.accountability_relationships relationship
    on caller.user_id in (relationship.owner_user_id, relationship.guardian_user_id);
$$;

-- This function only identifies dispatches. The Edge Function sends email/push.
create or replace function public.queue_accountability_protection_health_alerts()
returns table (alert_id uuid, guardian_user_id uuid, relationship_id uuid)
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into private.accountability_protection_health_alerts (relationship_id, device_id, started_at)
  select relationship.id,
         device.id,
         coalesce(device.last_protection_unhealthy_at, device.last_health_check_at, relationship.protection_health_activated_at)
  from private.accountability_relationships relationship
  join private.accountability_owner_devices device on device.relationship_id = relationship.id and device.active
  where relationship.status = 'accepted'
    and relationship.protection_health_owner_consented_at is not null
    and relationship.protection_health_guardian_consented_at is not null
    and relationship.protection_health_activated_at <= now() - make_interval(mins => relationship.protection_health_grace_minutes)
    and (
      coalesce(device.last_health_check_at, relationship.protection_health_activated_at) <= now() - make_interval(mins => relationship.protection_health_grace_minutes)
      or device.last_protection_unhealthy_at <= now() - make_interval(mins => relationship.protection_health_grace_minutes)
    )
  on conflict (device_id) where recovered_at is null do nothing;

  return query
  select alert.id, relationship.guardian_user_id, alert.relationship_id
  from private.accountability_protection_health_alerts alert
  join private.accountability_relationships relationship on relationship.id = alert.relationship_id
  where alert.relationship_id = relationship.id
    and alert.recovered_at is null
    and alert.notified_at is null;
end;
$$;

revoke all on function public.queue_accountability_protection_health_alerts() from public, anon, authenticated, service_role;
grant execute on function public.queue_accountability_protection_health_alerts() to service_role;

create or replace function public.complete_accountability_protection_health_alert(
  p_alert_id uuid,
  p_delivered boolean
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not p_delivered then return false; end if;
  update private.accountability_protection_health_alerts
  set notified_at = now(), updated_at = now()
  where id = p_alert_id and recovered_at is null and notified_at is null;
  return found;
end;
$$;

revoke all on function public.complete_accountability_protection_health_alert(uuid, boolean) from public, anon, authenticated, service_role;
grant execute on function public.complete_accountability_protection_health_alert(uuid, boolean) to service_role;

-- The URL and scheduler secret are kept in Supabase Vault. This job becomes
-- effective after Operations stores both secrets; it never embeds a key here.
create extension if not exists pg_net;
create extension if not exists pg_cron;
select cron.unschedule(jobid)
from cron.job
where jobname = 'clean4jesus-accountability-health-dispatch';

select cron.schedule(
  'clean4jesus-accountability-health-dispatch',
  '*/15 * * * *',
  $$
    select net.http_post(
      url := (select decrypted_secret from vault.decrypted_secrets where name = 'clean4jesus_project_url') || '/functions/v1/accountability-health',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-accountability-scheduler-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'clean4jesus_accountability_scheduler_secret')
      ),
      body := '{}'::jsonb,
      timeout_milliseconds := 5000
    );
  $$
);

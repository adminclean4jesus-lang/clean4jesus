-- Accountability Phase 1: private relationships, device credentials and generic risk alerts.

create extension if not exists pgcrypto with schema extensions;

create table private.accountability_relationships (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users (id) on delete cascade,
  guardian_user_id uuid references auth.users (id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'revoked')),
  consent_version integer not null check (consent_version > 0),
  owner_consented_version integer not null check (owner_consented_version > 0),
  owner_consented_at timestamptz not null,
  guardian_consented_version integer check (guardian_consented_version > 0),
  guardian_consented_at timestamptz,
  share_code_hash bytea not null unique,
  share_code_expires_at timestamptz not null,
  share_code_consumed_at timestamptz,
  accepted_at timestamptz,
  alerts_enabled boolean not null default true,
  risk_threshold integer not null default 3 check (risk_threshold between 3 and 10),
  revoked_at timestamptz,
  revoked_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (guardian_user_id is null or guardian_user_id <> owner_user_id),
  check (owner_consented_version = consent_version),
  check (
    (status = 'pending' and guardian_user_id is null and guardian_consented_version is null
      and guardian_consented_at is null and accepted_at is null and revoked_at is null)
    or
    (status = 'accepted' and guardian_user_id is not null
      and guardian_consented_version = consent_version
      and guardian_consented_at is not null and accepted_at is not null
      and share_code_consumed_at is not null and revoked_at is null)
    or
    (status = 'revoked' and revoked_at is not null and revoked_by is not null
      and revoked_by in (owner_user_id, guardian_user_id))
  )
);

create unique index accountability_one_live_guardian_per_owner_idx
  on private.accountability_relationships (owner_user_id)
  where status in ('pending', 'accepted');

create table private.accountability_guardian_push_tokens (
  id uuid primary key default gen_random_uuid(),
  relationship_id uuid not null references private.accountability_relationships (id) on delete cascade,
  guardian_user_id uuid not null references auth.users (id) on delete cascade,
  expo_push_token text not null check (
    expo_push_token ~ '^(ExponentPushToken|ExpoPushToken)\\[[A-Za-z0-9_-]+\\]$'
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (relationship_id, expo_push_token)
);

create table private.accountability_owner_devices (
  id uuid primary key,
  relationship_id uuid not null references private.accountability_relationships (id) on delete cascade,
  owner_user_id uuid not null references auth.users (id) on delete cascade,
  credential_secret_hash text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

create index accountability_owner_devices_relationship_idx
  on private.accountability_owner_devices (relationship_id)
  where active;

create table private.accountability_risk_signals (
  device_id uuid not null references private.accountability_owner_devices (id) on delete cascade,
  idempotency_key uuid not null,
  received_at timestamptz not null default now(),
  primary key (device_id, idempotency_key)
);

create index accountability_risk_signals_window_idx
  on private.accountability_risk_signals (device_id, received_at desc);

create table private.accountability_notification_dispatches (
  id uuid primary key default gen_random_uuid(),
  relationship_id uuid not null references private.accountability_relationships (id) on delete cascade,
  device_id uuid not null references private.accountability_owner_devices (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index accountability_notification_cooldown_idx
  on private.accountability_notification_dispatches (relationship_id, created_at desc);

alter table private.accountability_relationships enable row level security;
alter table private.accountability_guardian_push_tokens enable row level security;
alter table private.accountability_owner_devices enable row level security;
alter table private.accountability_risk_signals enable row level security;
alter table private.accountability_notification_dispatches enable row level security;

revoke all on table private.accountability_relationships from public, anon, authenticated;
revoke all on table private.accountability_guardian_push_tokens from public, anon, authenticated;
revoke all on table private.accountability_owner_devices from public, anon, authenticated;
revoke all on table private.accountability_risk_signals from public, anon, authenticated;
revoke all on table private.accountability_notification_dispatches from public, anon, authenticated;

create or replace function private.accountability_current_consent_version()
returns integer
language sql
immutable
set search_path = ''
as $$
  select 1;
$$;

revoke all on function private.accountability_current_consent_version() from public, anon, authenticated;

create or replace function private.require_current_accountability_user()
returns uuid
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  caller_id uuid := (select auth.uid());
begin
  if caller_id is null or not exists (
    select 1 from auth.users app_user where app_user.id = caller_id
  ) then
    raise exception using errcode = '42501', message = 'accountability_authentication_required';
  end if;
  return caller_id;
end;
$$;

revoke all on function private.require_current_accountability_user() from public, anon, authenticated;

create or replace function public.create_accountability_relationship(p_consent_version integer)
returns table (relationship_id uuid, share_code text, expires_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := private.require_current_accountability_user();
  generated_code text;
  generated_expiry timestamptz := now() + interval '24 hours';
begin
  if p_consent_version is distinct from private.accountability_current_consent_version() then
    raise exception using errcode = '22023', message = 'unsupported_consent_version';
  end if;

  generated_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 20));

  update private.accountability_relationships relationship
  set status = 'revoked',
      revoked_at = now(),
      revoked_by = caller_id,
      updated_at = now()
  where relationship.owner_user_id = caller_id
    and relationship.status = 'pending';

  insert into private.accountability_relationships (
    owner_user_id,
    consent_version,
    owner_consented_version,
    owner_consented_at,
    share_code_hash,
    share_code_expires_at
  ) values (
    caller_id,
    p_consent_version,
    p_consent_version,
    now(),
    extensions.digest(pg_catalog.convert_to(generated_code, 'UTF8'), 'sha256'),
    generated_expiry
  )
  returning id into relationship_id;

  share_code := generated_code;
  expires_at := generated_expiry;
  return next;
exception
  when unique_violation then
    raise exception using errcode = '23505', message = 'live_accountability_relationship_exists';
end;
$$;

revoke all on function public.create_accountability_relationship(integer) from public, anon, authenticated;
grant execute on function public.create_accountability_relationship(integer) to authenticated;

create or replace function public.accept_accountability_relationship(
  p_share_code text,
  p_consent_version integer
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := private.require_current_accountability_user();
  normalized_code text := upper(pg_catalog.btrim(p_share_code));
  relationship_id uuid;
begin
  if p_consent_version is distinct from private.accountability_current_consent_version() then
    raise exception using errcode = '22023', message = 'unsupported_consent_version';
  end if;
  if normalized_code !~ '^[A-F0-9]{20}$' then
    raise exception using errcode = '22023', message = 'invalid_share_code';
  end if;

  update private.accountability_relationships relationship
  set guardian_user_id = caller_id,
      guardian_consented_version = p_consent_version,
      guardian_consented_at = now(),
      share_code_consumed_at = now(),
      accepted_at = now(),
      status = 'accepted',
      updated_at = now()
  where relationship.share_code_hash = extensions.digest(
      pg_catalog.convert_to(normalized_code, 'UTF8'),
      'sha256'
    )
    and relationship.status = 'pending'
    and relationship.guardian_user_id is null
    and relationship.share_code_consumed_at is null
    and relationship.share_code_expires_at > now()
    and relationship.owner_user_id <> caller_id
    and relationship.consent_version = p_consent_version
  returning relationship.id into relationship_id;

  if relationship_id is null then
    raise exception using errcode = 'P0002', message = 'share_code_not_available';
  end if;
  return relationship_id;
end;
$$;

revoke all on function public.accept_accountability_relationship(text, integer) from public, anon, authenticated;
grant execute on function public.accept_accountability_relationship(text, integer) to authenticated;

create or replace function public.revoke_accountability_relationship(p_relationship_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := private.require_current_accountability_user();
begin
  update private.accountability_relationships relationship
  set status = 'revoked',
      revoked_at = now(),
      revoked_by = caller_id,
      updated_at = now()
  where relationship.id = p_relationship_id
    and relationship.status <> 'revoked'
    and caller_id in (relationship.owner_user_id, relationship.guardian_user_id);

  if not found then
    raise exception using errcode = 'P0002', message = 'accountability_relationship_not_found';
  end if;

  update private.accountability_owner_devices device
  set active = false,
      revoked_at = now()
  where device.relationship_id = p_relationship_id
    and device.active;

  delete from private.accountability_guardian_push_tokens push_token
  where push_token.relationship_id = p_relationship_id;

  return true;
end;
$$;

revoke all on function public.revoke_accountability_relationship(uuid) from public, anon, authenticated;
grant execute on function public.revoke_accountability_relationship(uuid) to authenticated;

create or replace function public.configure_accountability_alerts(
  p_relationship_id uuid,
  p_alerts_enabled boolean,
  p_risk_threshold integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := private.require_current_accountability_user();
begin
  if p_risk_threshold not between 3 and 10 then
    raise exception using errcode = '22023', message = 'invalid_risk_threshold';
  end if;

  update private.accountability_relationships relationship
  set alerts_enabled = p_alerts_enabled,
      risk_threshold = p_risk_threshold,
      updated_at = now()
  where relationship.id = p_relationship_id
    and relationship.guardian_user_id = caller_id
    and relationship.status = 'accepted';

  if not found then
    raise exception using errcode = '42501', message = 'accepted_guardian_relationship_required';
  end if;
  return true;
end;
$$;

revoke all on function public.configure_accountability_alerts(uuid, boolean, integer)
  from public, anon, authenticated;
grant execute on function public.configure_accountability_alerts(uuid, boolean, integer)
  to authenticated;

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
        'otherUserId', case
          when relationship.owner_user_id = caller.user_id then relationship.guardian_user_id
          else relationship.owner_user_id
        end,
        'status', relationship.status,
        'consentVersion', relationship.consent_version,
        'createdAt', relationship.created_at,
        'acceptedAt', relationship.accepted_at,
        'alertsEnabled', relationship.alerts_enabled,
        'riskThreshold', relationship.risk_threshold,
        'revokedAt', relationship.revoked_at
      ) order by relationship.created_at desc
    ),
    '[]'::jsonb
  )
  from (select private.require_current_accountability_user() as user_id) caller
  join private.accountability_relationships relationship
    on caller.user_id in (relationship.owner_user_id, relationship.guardian_user_id);
$$;

revoke all on function public.list_my_accountability_relationships() from public, anon, authenticated;
grant execute on function public.list_my_accountability_relationships() to authenticated;

create or replace function public.register_accountability_guardian_push_token(
  p_relationship_id uuid,
  p_expo_push_token text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := private.require_current_accountability_user();
  push_token_id uuid;
begin
  if p_expo_push_token !~ '^(ExponentPushToken|ExpoPushToken)\\[[A-Za-z0-9_-]+\\]$' then
    raise exception using errcode = '22023', message = 'invalid_expo_push_token';
  end if;
  if not exists (
    select 1
    from private.accountability_relationships relationship
    where relationship.id = p_relationship_id
      and relationship.guardian_user_id = caller_id
      and relationship.status = 'accepted'
      and relationship.owner_consented_version = private.accountability_current_consent_version()
      and relationship.guardian_consented_version = private.accountability_current_consent_version()
  ) then
    raise exception using errcode = '42501', message = 'accepted_guardian_relationship_required';
  end if;

  insert into private.accountability_guardian_push_tokens (
    relationship_id,
    guardian_user_id,
    expo_push_token
  ) values (p_relationship_id, caller_id, p_expo_push_token)
  on conflict (relationship_id, expo_push_token) do update
    set guardian_user_id = excluded.guardian_user_id,
        updated_at = now()
  returning id into push_token_id;

  return push_token_id;
end;
$$;

revoke all on function public.register_accountability_guardian_push_token(uuid, text) from public, anon, authenticated;
grant execute on function public.register_accountability_guardian_push_token(uuid, text) to authenticated;

create or replace function public.unregister_accountability_guardian_push_token(p_push_token_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := private.require_current_accountability_user();
begin
  delete from private.accountability_guardian_push_tokens push_token
  where push_token.id = p_push_token_id
    and push_token.guardian_user_id = caller_id;
  return found;
end;
$$;

revoke all on function public.unregister_accountability_guardian_push_token(uuid) from public, anon, authenticated;
grant execute on function public.unregister_accountability_guardian_push_token(uuid) to authenticated;

create or replace function public.register_accountability_owner_device(
  p_relationship_id uuid,
  p_device_id uuid,
  p_device_secret text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := private.require_current_accountability_user();
begin
  if p_device_secret !~ '^[A-Za-z0-9_-]{43}$' then
    raise exception using errcode = '22023', message = 'invalid_device_secret';
  end if;
  if not exists (
    select 1
    from private.accountability_relationships relationship
    where relationship.id = p_relationship_id
      and relationship.owner_user_id = caller_id
      and relationship.status = 'accepted'
      and relationship.owner_consented_version = private.accountability_current_consent_version()
      and relationship.guardian_consented_version = private.accountability_current_consent_version()
  ) then
    raise exception using errcode = '42501', message = 'accepted_owner_relationship_required';
  end if;

  insert into private.accountability_owner_devices (
    id,
    relationship_id,
    owner_user_id,
    credential_secret_hash
  ) values (
    p_device_id,
    p_relationship_id,
    caller_id,
    extensions.crypt(p_device_secret, extensions.gen_salt('bf', 12))
  );
  return p_device_id;
exception
  when unique_violation then
    raise exception using errcode = '23505', message = 'accountability_device_exists';
end;
$$;

revoke all on function public.register_accountability_owner_device(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.register_accountability_owner_device(uuid, uuid, text) to authenticated;

create or replace function public.revoke_accountability_owner_device(p_device_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := private.require_current_accountability_user();
begin
  update private.accountability_owner_devices device
  set active = false,
      revoked_at = now()
  where device.id = p_device_id
    and device.owner_user_id = caller_id
    and device.active;
  return found;
end;
$$;

revoke all on function public.revoke_accountability_owner_device(uuid) from public, anon, authenticated;
grant execute on function public.revoke_accountability_owner_device(uuid) to authenticated;

create or replace function public.process_accountability_risk_signal(
  p_device_id uuid,
  p_device_secret text,
  p_idempotency_key uuid
)
returns table (duplicate boolean, should_notify boolean, push_tokens text[])
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_device private.accountability_owner_devices%rowtype;
  target_relationship private.accountability_relationships%rowtype;
  recent_signal_count integer;
begin
  select * into target_device
  from private.accountability_owner_devices device
  where device.id = p_device_id
    and device.active
    and device.credential_secret_hash = extensions.crypt(p_device_secret, device.credential_secret_hash);

  if not found then
    raise exception using errcode = '28000', message = 'invalid_device_credential';
  end if;

  select * into target_relationship
  from private.accountability_relationships relationship
  where relationship.id = target_device.relationship_id
    and relationship.status = 'accepted'
    and relationship.owner_user_id = target_device.owner_user_id
    and relationship.owner_consented_version = private.accountability_current_consent_version()
    and relationship.guardian_consented_version = private.accountability_current_consent_version()
  for update;

  if not found then
    raise exception using errcode = '42501', message = 'accepted_accountability_relationship_required';
  end if;

  insert into private.accountability_risk_signals (device_id, idempotency_key)
  values (p_device_id, p_idempotency_key)
  on conflict (device_id, idempotency_key) do nothing;

  if not found then
    duplicate := true;
    should_notify := false;
    push_tokens := array[]::text[];
    return next;
    return;
  end if;

  duplicate := false;
  select count(*) into recent_signal_count
  from private.accountability_risk_signals signal
  where signal.device_id = p_device_id
    and signal.received_at >= now() - interval '30 minutes';

  should_notify := target_relationship.alerts_enabled
    and recent_signal_count >= target_relationship.risk_threshold
    and not exists (
    select 1
    from private.accountability_notification_dispatches dispatch
    where dispatch.relationship_id = target_relationship.id
      and dispatch.created_at >= now() - interval '6 hours'
  );

  if should_notify then
    select coalesce(array_agg(push_token.expo_push_token order by push_token.created_at), array[]::text[])
    into push_tokens
    from private.accountability_guardian_push_tokens push_token
    where push_token.relationship_id = target_relationship.id
      and push_token.guardian_user_id = target_relationship.guardian_user_id;

    if cardinality(push_tokens) = 0 then
      should_notify := false;
    else
      insert into private.accountability_notification_dispatches (relationship_id, device_id)
      values (target_relationship.id, p_device_id);
    end if;
  else
    push_tokens := array[]::text[];
  end if;

  return next;
end;
$$;

revoke all on function public.process_accountability_risk_signal(uuid, text, uuid)
  from public, anon, authenticated, service_role;
grant execute on function public.process_accountability_risk_signal(uuid, text, uuid)
  to service_role;

-- Make guardian alert cooldown depend on a push accepted by Expo, not merely attempted.

alter table private.accountability_notification_dispatches
  add column delivered_at timestamptz,
  add column failed_at timestamptz;

update private.accountability_notification_dispatches
set delivered_at = created_at
where delivered_at is null;

create index accountability_notification_delivery_cooldown_idx
  on private.accountability_notification_dispatches (relationship_id, delivered_at desc)
  where delivered_at is not null;

create or replace function public.process_accountability_risk_signal_v2(
  p_device_id uuid,
  p_device_secret text,
  p_idempotency_key uuid
)
returns table (duplicate boolean, should_notify boolean, dispatch_id uuid, push_tokens text[])
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

  delete from private.accountability_risk_signals where received_at < now() - interval '24 hours';
  delete from private.accountability_notification_dispatches where created_at < now() - interval '30 days';

  insert into private.accountability_risk_signals (device_id, idempotency_key)
  values (p_device_id, p_idempotency_key)
  on conflict (device_id, idempotency_key) do nothing;
  if not found then
    duplicate := true;
    should_notify := false;
    dispatch_id := null;
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
      select 1 from private.accountability_notification_dispatches dispatch
      where dispatch.relationship_id = target_relationship.id
        and (
          dispatch.delivered_at >= now() - interval '6 hours'
          or (dispatch.delivered_at is null and dispatch.failed_at is null
            and dispatch.created_at >= now() - interval '2 minutes')
        )
    );

  if should_notify then
    select coalesce(array_agg(push_token.expo_push_token order by push_token.created_at), array[]::text[])
    into push_tokens
    from private.accountability_guardian_push_tokens push_token
    where push_token.relationship_id = target_relationship.id
      and push_token.guardian_user_id = target_relationship.guardian_user_id;
    if cardinality(push_tokens) = 0 then
      should_notify := false;
      dispatch_id := null;
    else
      insert into private.accountability_notification_dispatches (relationship_id, device_id)
      values (target_relationship.id, p_device_id)
      returning id into dispatch_id;
    end if;
  else
    dispatch_id := null;
    push_tokens := array[]::text[];
  end if;
  return next;
end;
$$;

revoke all on function public.process_accountability_risk_signal_v2(uuid, text, uuid)
  from public, anon, authenticated, service_role;
grant execute on function public.process_accountability_risk_signal_v2(uuid, text, uuid) to service_role;

create or replace function public.complete_accountability_notification_dispatch(
  p_dispatch_id uuid,
  p_delivered boolean
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  update private.accountability_notification_dispatches dispatch
  set delivered_at = case when p_delivered then now() else null end,
      failed_at = case when p_delivered then null else now() end
  where dispatch.id = p_dispatch_id
    and dispatch.delivered_at is null
    and dispatch.failed_at is null;
  return found;
end;
$$;

revoke all on function public.complete_accountability_notification_dispatch(uuid, boolean)
  from public, anon, authenticated, service_role;
grant execute on function public.complete_accountability_notification_dispatch(uuid, boolean) to service_role;

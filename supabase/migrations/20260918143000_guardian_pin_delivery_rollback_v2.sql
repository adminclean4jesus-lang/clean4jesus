-- A failed email delivery must not leave a pending request or consume one of
-- the owner's three daily attempts. Only the authenticated owner can discard
-- the exact request created by the current delivery attempt.

-- v1 used a JavaScript-style double escape inside a PostgreSQL regular
-- expression. In PostgreSQL that excluded the literal letter "s", so valid
-- addresses such as user.jobs@example.com were rejected. POSIX character
-- classes avoid ambiguous backslash handling.
create or replace function public.create_guardian_pin_request(
  p_guardian_email text,
  p_confirmation_token_hash bytea
)
returns table (status text, expires_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := private.require_current_accountability_user();
  normalized_email text := lower(pg_catalog.btrim(p_guardian_email));
  request_expiry timestamptz := now() + interval '24 hours';
begin
  if normalized_email !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
    or char_length(normalized_email) > 320
    or octet_length(p_confirmation_token_hash) <> 32 then
    raise exception using errcode = '22023', message = 'invalid_guardian_pin_request';
  end if;

  if (
    select count(*)
    from private.guardian_pin_requests
    where owner_user_id = caller_id
      and created_at > now() - interval '24 hours'
  ) >= 3 then
    raise exception using errcode = '22023', message = 'guardian_pin_request_rate_limited';
  end if;

  update private.guardian_pin_requests
  set status = case when expires_at <= now() then 'expired' else 'cancelled' end,
      updated_at = now()
  where owner_user_id = caller_id and status = 'pending';

  insert into private.guardian_pin_requests(
    owner_user_id,
    guardian_email,
    confirmation_token_hash,
    expires_at
  ) values (
    caller_id,
    normalized_email,
    p_confirmation_token_hash,
    request_expiry
  );

  status := 'pending';
  expires_at := request_expiry;
  return next;
end;
$$;

create or replace function public.discard_my_guardian_pin_request(
  p_confirmation_token_hash bytea
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := private.require_current_accountability_user();
begin
  if octet_length(p_confirmation_token_hash) <> 32 then
    raise exception using errcode = '22023', message = 'invalid_guardian_pin_request';
  end if;

  delete from private.guardian_pin_requests request
  where request.owner_user_id = caller_id
    and request.confirmation_token_hash = p_confirmation_token_hash
    and request.status = 'pending';

  return found;
end;
$$;

revoke all on function public.discard_my_guardian_pin_request(bytea) from public, anon;
grant execute on function public.discard_my_guardian_pin_request(bytea) to authenticated;

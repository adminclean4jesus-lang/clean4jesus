-- Guardian PIN invitations stay valid for 24 hours, but beta participants
-- must be able to retry a delivery or correct an address without an
-- application-imposed day-long lockout. Provider-level anti-abuse controls
-- remain in place; this removes only the product's three-per-day cap.

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

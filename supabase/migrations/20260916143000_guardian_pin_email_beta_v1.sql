-- Email-only guardian PIN setup. The raw PIN is generated only after the
-- recipient consents, delivered once by email, and never stored in this table.

create table private.guardian_pin_requests (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  guardian_email text not null check (char_length(guardian_email) between 3 and 320),
  confirmation_token_hash bytea not null unique,
  pin_hash text check (pin_hash is null or pin_hash ~ '^[a-f0-9]{64}$'),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'expired')),
  expires_at timestamptz not null,
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((status = 'confirmed' and pin_hash is not null and confirmed_at is not null) or status <> 'confirmed')
);

create index guardian_pin_requests_owner_created_idx
  on private.guardian_pin_requests(owner_user_id, created_at desc);
create unique index guardian_pin_one_pending_per_owner_idx
  on private.guardian_pin_requests(owner_user_id) where status = 'pending';
alter table private.guardian_pin_requests enable row level security;
revoke all on table private.guardian_pin_requests from public, anon, authenticated;

create or replace function public.create_guardian_pin_request(
  p_guardian_email text,
  p_confirmation_token_hash bytea
)
returns table (status text, expires_at timestamptz)
language plpgsql security definer set search_path = '' as $$
declare
  caller_id uuid := private.require_current_accountability_user();
  normalized_email text := lower(pg_catalog.btrim(p_guardian_email));
  request_expiry timestamptz := now() + interval '24 hours';
begin
  if normalized_email !~ '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' or char_length(normalized_email) > 320
    or octet_length(p_confirmation_token_hash) <> 32 then
    raise exception using errcode = '22023', message = 'invalid_guardian_pin_request';
  end if;
  if (select count(*) from private.guardian_pin_requests where owner_user_id = caller_id and created_at > now() - interval '24 hours') >= 3 then
    raise exception using errcode = '22023', message = 'guardian_pin_request_rate_limited';
  end if;
  update private.guardian_pin_requests
  set status = case when expires_at <= now() then 'expired' else 'cancelled' end, updated_at = now()
  where owner_user_id = caller_id and status = 'pending';
  insert into private.guardian_pin_requests(owner_user_id, guardian_email, confirmation_token_hash, expires_at)
  values (caller_id, normalized_email, p_confirmation_token_hash, request_expiry);
  status := 'pending'; expires_at := request_expiry; return next;
end;
$$;

create or replace function public.get_my_guardian_pin_request(p_include_pin_hash boolean default false)
returns table (status text, expires_at timestamptz, pin_hash text)
language plpgsql security definer set search_path = '' as $$
declare caller_id uuid := private.require_current_accountability_user();
begin
  return query
  select case when request.status = 'pending' and request.expires_at <= now() then 'expired' else request.status end,
    request.expires_at,
    case when p_include_pin_hash and request.status = 'confirmed' then request.pin_hash else null end
  from private.guardian_pin_requests request
  where request.owner_user_id = caller_id
  order by request.created_at desc limit 1;
end;
$$;

create or replace function public.cancel_my_guardian_pin_request()
returns boolean language plpgsql security definer set search_path = '' as $$
declare caller_id uuid := private.require_current_accountability_user();
begin
  update private.guardian_pin_requests set status = 'cancelled', updated_at = now()
  where owner_user_id = caller_id and status = 'pending';
  return found;
end;
$$;

-- This is service-role only and is called by the public confirmation endpoint.
create or replace function public.confirm_guardian_pin_request(
  p_confirmation_token_hash bytea,
  p_pin_hash text
)
returns table (guardian_email text, status text)
language plpgsql security definer set search_path = '' as $$
begin
  if octet_length(p_confirmation_token_hash) <> 32 or p_pin_hash !~ '^[a-f0-9]{64}$' then
    raise exception using errcode = '22023', message = 'invalid_guardian_pin_confirmation';
  end if;
  update private.guardian_pin_requests request
  set status = 'confirmed', pin_hash = p_pin_hash, confirmed_at = now(), updated_at = now()
  where request.confirmation_token_hash = p_confirmation_token_hash
    and request.status = 'pending' and request.expires_at > now()
  returning request.guardian_email, request.status into guardian_email, status;
  if guardian_email is null then raise exception using errcode = 'P0002', message = 'guardian_pin_request_unavailable'; end if;
  return next;
end;
$$;

create or replace function public.reset_guardian_pin_confirmation(p_confirmation_token_hash bytea)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  if octet_length(p_confirmation_token_hash) <> 32 then
    raise exception using errcode = '22023', message = 'invalid_guardian_pin_confirmation';
  end if;
  update private.guardian_pin_requests request
  set status = 'pending', pin_hash = null, confirmed_at = null, updated_at = now()
  where request.confirmation_token_hash = p_confirmation_token_hash
    and request.status = 'confirmed' and request.expires_at > now();
  return found;
end;
$$;

revoke all on function public.create_guardian_pin_request(text, bytea) from public, anon;
revoke all on function public.get_my_guardian_pin_request(boolean) from public, anon;
revoke all on function public.cancel_my_guardian_pin_request() from public, anon;
revoke all on function public.confirm_guardian_pin_request(bytea, text) from public, anon, authenticated;
revoke all on function public.reset_guardian_pin_confirmation(bytea) from public, anon, authenticated;
grant execute on function public.create_guardian_pin_request(text, bytea) to authenticated;
grant execute on function public.get_my_guardian_pin_request(boolean) to authenticated;
grant execute on function public.cancel_my_guardian_pin_request() to authenticated;
grant execute on function public.confirm_guardian_pin_request(bytea, text) to service_role;
grant execute on function public.reset_guardian_pin_confirmation(bytea) to service_role;

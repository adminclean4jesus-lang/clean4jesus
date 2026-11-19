-- Lets an authenticated owner recover the state of their guardian PIN after
-- closing or reinstalling the app. The raw PIN remains unavailable here.

drop function if exists public.get_my_guardian_pin_request(boolean);

create function public.get_my_guardian_pin_request(p_include_pin_hash boolean default false)
returns table (status text, expires_at timestamptz, pin_hash text, guardian_email text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := private.require_current_accountability_user();
begin
  return query
  select
    case when request.status = 'pending' and request.expires_at <= now() then 'expired' else request.status end,
    request.expires_at,
    case when p_include_pin_hash and request.status = 'confirmed' then request.pin_hash else null end,
    request.guardian_email
  from private.guardian_pin_requests request
  where request.owner_user_id = caller_id
  order by request.created_at desc
  limit 1;
end;
$$;

revoke all on function public.get_my_guardian_pin_request(boolean) from public, anon;
grant execute on function public.get_my_guardian_pin_request(boolean) to authenticated;

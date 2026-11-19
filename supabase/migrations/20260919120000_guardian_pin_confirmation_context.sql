-- The confirmation endpoint is public, but the unguessable token is the only
-- credential it receives. Return the sender's safe display label so the
-- recipient knows who invited them before accepting responsibility for a PIN.
create or replace function public.get_guardian_pin_request_context(
  p_confirmation_token_hash bytea
)
returns table (guardian_email text, owner_label text)
language sql
security definer
set search_path = ''
as $$
  select
    request.guardian_email,
    coalesce(
      nullif(owner.raw_user_meta_data ->> 'display_name', ''),
      nullif(split_part(owner.email, '@', 1), ''),
      'Una persona de Clean4Jesus'
    ) as owner_label
  from private.guardian_pin_requests request
  join auth.users owner on owner.id = request.owner_user_id
  where request.confirmation_token_hash = p_confirmation_token_hash
    and request.status = 'pending'
    and request.expires_at > now()
  limit 1;
$$;

revoke all on function public.get_guardian_pin_request_context(bytea) from public, anon, authenticated;
grant execute on function public.get_guardian_pin_request_context(bytea) to service_role;

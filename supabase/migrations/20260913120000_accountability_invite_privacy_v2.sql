-- Validate an invitation before sending email without persisting a third-party
-- address in an unaccepted relationship.
create or replace function public.validate_accountability_invite_delivery(
  p_relationship_id uuid,
  p_share_code text
)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  caller_id uuid := private.require_current_accountability_user();
  normalized_code text := upper(pg_catalog.btrim(p_share_code));
begin
  if normalized_code !~ '^[A-F0-9]{20}$' then
    return false;
  end if;

  return exists (
    select 1
    from private.accountability_relationships relationship
    where relationship.id = p_relationship_id
      and relationship.owner_user_id = caller_id
      and relationship.status = 'pending'
      and relationship.guardian_user_id is null
      and relationship.share_code_consumed_at is null
      and relationship.share_code_expires_at > now()
      and relationship.share_code_hash = extensions.digest(
        pg_catalog.convert_to(normalized_code, 'UTF8'), 'sha256'
      )
  );
end;
$$;

revoke all on function public.validate_accountability_invite_delivery(uuid, text)
  from public, anon, authenticated;
grant execute on function public.validate_accountability_invite_delivery(uuid, text)
  to authenticated;

-- The old writer remains in migration history but is no longer callable by
-- mobile clients. Existing addresses are untouched for owner-led retention.
revoke all on function public.set_accountability_invite_email(uuid, text)
  from public, anon, authenticated;

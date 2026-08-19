-- Optional email delivery for trusted-person invitations.
-- The address is private relationship metadata; it is never exposed through the app API.

alter table private.accountability_relationships
  drop constraint if exists accountability_relationships_protection_health_grace_minutes_check;

alter table private.accountability_relationships
  alter column protection_health_grace_minutes set default 30,
  add constraint accountability_relationships_protection_health_grace_minutes_check
    check (protection_health_grace_minutes between 30 and 1440);

update private.accountability_relationships
set protection_health_grace_minutes = 30,
    updated_at = now()
where protection_health_grace_minutes > 30;

alter table private.accountability_relationships
  add column guardian_email text
    check (guardian_email is null or (char_length(guardian_email) between 3 and 320 and guardian_email ~* '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'));

create or replace function public.set_accountability_invite_email(
  p_relationship_id uuid,
  p_email text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := private.require_current_accountability_user();
  normalized_email text := lower(pg_catalog.btrim(p_email));
begin
  if normalized_email !~ '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' or char_length(normalized_email) > 320 then
    raise exception using errcode = '22023', message = 'invalid_guardian_email';
  end if;

  update private.accountability_relationships
  set guardian_email = normalized_email, updated_at = now()
  where id = p_relationship_id
    and owner_user_id = caller_id
    and status = 'pending';

  if not found then
    raise exception using errcode = '42501', message = 'accountability_invite_not_editable';
  end if;
  return true;
end;
$$;

revoke all on function public.set_accountability_invite_email(uuid, text) from public, anon, authenticated;
grant execute on function public.set_accountability_invite_email(uuid, text) to authenticated;

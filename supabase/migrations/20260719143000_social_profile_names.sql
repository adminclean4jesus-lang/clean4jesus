create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_name text;
begin
  requested_name := nullif(
    trim(
      coalesce(
        new.raw_user_meta_data ->> 'display_name',
        new.raw_user_meta_data ->> 'full_name',
        new.raw_user_meta_data ->> 'name',
        ''
      )
    ),
    ''
  );

  if requested_name is null or char_length(requested_name) < 2 then
    requested_name := nullif(split_part(coalesce(new.email, ''), '@', 1), '');
  end if;

  if requested_name is null or char_length(requested_name) < 2 then
    requested_name := 'Nuevo miembro';
  end if;

  insert into public.profiles (id, display_name)
  values (new.id, left(requested_name, 40))
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke all on function private.handle_new_user() from public;

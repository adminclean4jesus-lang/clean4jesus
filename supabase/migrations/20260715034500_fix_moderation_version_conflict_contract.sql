-- Keep optimistic-lock conflicts as domain errors. SQLSTATE 40001 is reserved
-- for transaction serialization and may be normalized before PostgREST returns it.
do $$
declare
  function_definition text;
  corrected_definition text;
begin
  select pg_catalog.pg_get_functiondef(
    'public.apply_community_moderation(uuid,integer,text,text,uuid)'::regprocedure
  ) into function_definition;

  corrected_definition := pg_catalog.replace(
    function_definition,
    '''40001''',
    '''P0001'''
  );

  if corrected_definition = function_definition then
    raise exception 'moderation_version_conflict_contract_not_found';
  end if;

  execute corrected_definition;
end;
$$;

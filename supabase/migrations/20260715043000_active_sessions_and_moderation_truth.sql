-- RLS must reject JWTs from sessions that have already been revoked, even if
-- the access token has not reached its exp claim yet.
create or replace function private.current_auth_user_exists()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from auth.users app_user
    join auth.sessions active_session
      on active_session.user_id = app_user.id
    where app_user.id = (select auth.uid())
      and active_session.id = nullif(auth.jwt() ->> 'session_id', '')::uuid
  );
$$;

revoke all on function private.current_auth_user_exists()
  from public, anon, authenticated;
grant execute on function private.current_auth_user_exists()
  to authenticated;

-- Rate-limit rows are operational data, not moderation evidence. Remove them
-- with the account and make age-based maintenance efficient.
delete from private.community_rate_limit_events event
where not exists (
  select 1 from auth.users app_user where app_user.id = event.actor_user_id
);

alter table private.community_rate_limit_events
  add constraint community_rate_limit_events_actor_user_id_fkey
  foreign key (actor_user_id) references auth.users(id) on delete cascade;

create index community_rate_limit_events_created_at_idx
  on private.community_rate_limit_events (created_at);

-- A moderator must never receive a successful hide result when the reported
-- content was deleted before the action ran. Replace one exact, known block
-- from the previously deployed function and abort the migration otherwise.
do $$
declare
  function_definition text;
  corrected_definition text;
  old_block text := $block$
    if requested_action = 'hide_content' then
      if target_case.target_type = 'post' and target_case.post_id is not null then
        update public.community_posts
        set status = 'hidden'
        where id = target_case.post_id;
      elsif target_case.target_type = 'comment' and target_case.comment_id is not null then
        update public.community_comments
        set status = 'hidden'
        where id = target_case.comment_id;
      end if;
    end if;
$block$;
  new_block text := $block$
    if requested_action = 'hide_content' then
      if target_case.target_type = 'post' and target_case.post_id is not null then
        update public.community_posts
        set status = 'hidden'
        where id = target_case.post_id;
        if not found then
          raise exception using errcode = 'P0002', message = 'content_no_longer_exists';
        end if;
      elsif target_case.target_type = 'comment' and target_case.comment_id is not null then
        update public.community_comments
        set status = 'hidden'
        where id = target_case.comment_id;
        if not found then
          raise exception using errcode = 'P0002', message = 'content_no_longer_exists';
        end if;
      else
        raise exception using errcode = 'P0002', message = 'content_no_longer_exists';
      end if;
    end if;
$block$;
begin
  select pg_catalog.pg_get_functiondef(
    'public.apply_community_moderation(uuid,integer,text,text,uuid)'::regprocedure
  ) into function_definition;

  if (length(function_definition) - length(pg_catalog.replace(function_definition, old_block, '')))
     <> length(old_block) then
    raise exception 'moderation_hide_contract_not_found_exactly_once';
  end if;

  corrected_definition := pg_catalog.replace(function_definition, old_block, new_block);
  execute corrected_definition;
end;
$$;

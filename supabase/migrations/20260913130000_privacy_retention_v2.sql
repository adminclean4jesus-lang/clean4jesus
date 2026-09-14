-- Repair the existing retention job after false_positive_reports moved from
-- private to public, and prune the new one-hour rate-limit events globally.
-- The existing clean4jesus-privacy-retention cron calls this function daily.
create or replace function private.purge_expired_privacy_data()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  deleted_false_positive_actions integer := 0;
  deleted_false_positive_cases integer := 0;
  deleted_false_positive_reports integer := 0;
  deleted_rate_limit_events integer := 0;
begin
  perform pg_catalog.set_config('clean4jesus.retention_job', 'on', true);

  delete from private.false_positive_review_actions
  where created_at < now() - interval '24 months';
  get diagnostics deleted_false_positive_actions = row_count;

  delete from private.false_positive_review_cases
  where updated_at < now() - interval '24 months'
    and not exists (
      select 1
      from private.false_positive_review_actions action
      where action.case_id = false_positive_review_cases.id
    );
  get diagnostics deleted_false_positive_cases = row_count;

  delete from public.false_positive_reports
  where created_at < now() - interval '12 months';
  get diagnostics deleted_false_positive_reports = row_count;

  delete from private.false_positive_rate_limit_events
  where created_at < now() - interval '24 hours';
  get diagnostics deleted_rate_limit_events = row_count;

  return pg_catalog.jsonb_build_object(
    'false_positive_actions', deleted_false_positive_actions,
    'false_positive_cases', deleted_false_positive_cases,
    'false_positive_reports', deleted_false_positive_reports,
    'false_positive_rate_limit_events', deleted_rate_limit_events
  );
end;
$$;

revoke all on function private.purge_expired_privacy_data() from public, anon, authenticated;
grant execute on function private.purge_expired_privacy_data() to service_role;

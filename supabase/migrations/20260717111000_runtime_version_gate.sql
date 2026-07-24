create table if not exists public.runtime_gates (
  platform text primary key,
  minimum_supported_version text not null,
  recommended_version text not null,
  hard_block boolean not null default true,
  title text not null,
  message text not null,
  update_url text,
  updated_at timestamptz not null default timezone('utc', now()),
  constraint runtime_gates_platform_check check (platform in ('android', 'ios'))
);

alter table public.runtime_gates enable row level security;

revoke all on public.runtime_gates from public;
grant select on public.runtime_gates to anon;
grant select on public.runtime_gates to authenticated;

drop policy if exists "runtime_gates_public_read" on public.runtime_gates;
create policy "runtime_gates_public_read"
on public.runtime_gates
for select
to anon, authenticated
using (true);

insert into public.runtime_gates (
  platform,
  minimum_supported_version,
  recommended_version,
  hard_block,
  title,
  message,
  update_url
)
values (
  'android',
  '1.3.6',
  '1.3.6',
  true,
  'Actualiza Clean4Jesus',
  'Esta version ya no es compatible con la proteccion y la comunidad actuales. Instala la version mas reciente para continuar en un entorno seguro.',
  null
)
on conflict (platform) do update
set minimum_supported_version = excluded.minimum_supported_version,
    recommended_version = excluded.recommended_version,
    hard_block = excluded.hard_block,
    title = excluded.title,
    message = excluded.message,
    update_url = excluded.update_url,
    updated_at = timezone('utc', now());

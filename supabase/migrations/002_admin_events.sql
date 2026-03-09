create table if not exists public.admin_events (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles(id) on delete cascade,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  entity_ref text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint admin_events_action_not_empty check (char_length(trim(action)) > 0),
  constraint admin_events_entity_type_not_empty check (char_length(trim(entity_type)) > 0)
);

create index if not exists idx_admin_events_created_at on public.admin_events(created_at desc);
create index if not exists idx_admin_events_entity on public.admin_events(entity_type, entity_id);
create index if not exists idx_admin_events_admin_id on public.admin_events(admin_id);

alter table public.admin_events enable row level security;

drop policy if exists "admin_events_select_admin" on public.admin_events;
create policy "admin_events_select_admin"
  on public.admin_events
  for select
  using (public.is_admin(auth.uid()));

drop policy if exists "admin_events_insert_admin" on public.admin_events;
create policy "admin_events_insert_admin"
  on public.admin_events
  for insert
  with check (public.is_admin(auth.uid()) and admin_id = auth.uid());

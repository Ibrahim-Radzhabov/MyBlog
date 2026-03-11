create table if not exists public.search_events (
  id uuid primary key default gen_random_uuid(),
  query text not null default '',
  category_slug text,
  tag_slug text,
  results_count integer not null default 0,
  path text not null default '/prompts',
  session_id text,
  referrer text,
  user_agent text,
  searched_at timestamptz not null default now(),
  constraint search_events_results_count_non_negative check (results_count >= 0)
);

create index if not exists idx_search_events_searched_at on public.search_events(searched_at desc);
create index if not exists idx_search_events_query on public.search_events(query);
create index if not exists idx_search_events_results_count on public.search_events(results_count);

alter table public.search_events enable row level security;

drop policy if exists "search_events_insert_public" on public.search_events;
create policy "search_events_insert_public"
  on public.search_events
  for insert
  with check (true);

drop policy if exists "search_events_select_admin" on public.search_events;
create policy "search_events_select_admin"
  on public.search_events
  for select
  using (public.is_admin(auth.uid()));

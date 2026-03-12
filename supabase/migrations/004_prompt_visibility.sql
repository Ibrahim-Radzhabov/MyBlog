DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'prompt_visibility') THEN
    CREATE TYPE public.prompt_visibility AS ENUM ('public', 'hidden');
  END IF;
END;
$$;

alter table public.prompts
  add column if not exists visibility public.prompt_visibility not null default 'public';

create index if not exists idx_prompts_visibility on public.prompts(visibility);

drop policy if exists "prompts_select_published" on public.prompts;
create policy "prompts_select_published"
  on public.prompts
  for select
  using (status = 'published' and visibility = 'public');

drop policy if exists "prompt_tags_select_published" on public.prompt_tags;
create policy "prompt_tags_select_published"
  on public.prompt_tags
  for select
  using (
    exists (
      select 1
      from public.prompts p
      where p.id = prompt_tags.prompt_id
        and (
          (p.status = 'published' and p.visibility = 'public')
          or public.is_admin(auth.uid())
        )
    )
  );

create extension if not exists pgcrypto;
create extension if not exists unaccent;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'profile_role') THEN
    CREATE TYPE public.profile_role AS ENUM ('admin', 'user');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'prompt_status') THEN
    CREATE TYPE public.prompt_status AS ENUM ('draft', 'published');
  END IF;
END;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  avatar_url text,
  role public.profile_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.prompts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  short_description text not null,
  full_prompt_text text not null,
  output_example text,
  variables_json jsonb not null default '[]'::jsonb,
  category_id uuid references public.categories(id) on delete set null,
  status public.prompt_status not null default 'draft',
  cover_image_url text,
  seo_title text,
  seo_description text,
  published_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  search_vector tsvector,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.prompt_tags (
  prompt_id uuid not null references public.prompts(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (prompt_id, tag_id)
);

create table if not exists public.prompt_views (
  id uuid primary key default gen_random_uuid(),
  prompt_id uuid not null references public.prompts(id) on delete cascade,
  viewed_at timestamptz not null default now(),
  session_id text,
  referrer text,
  user_agent text
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.prompts_search_vector_update()
returns trigger
language plpgsql
as $$
begin
  new.search_vector :=
    setweight(to_tsvector('simple', coalesce(unaccent(new.title), '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(unaccent(new.short_description), '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(unaccent(new.full_prompt_text), '')), 'C');

  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.email, ''),
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, public.profiles.full_name),
        avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
        updated_at = now();

  return new;
end;
$$;

create or replace function public.is_admin(user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = user_id
      and p.role = 'admin'
  );
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists set_categories_updated_at on public.categories;
create trigger set_categories_updated_at
before update on public.categories
for each row
execute function public.set_updated_at();

drop trigger if exists set_tags_updated_at on public.tags;
create trigger set_tags_updated_at
before update on public.tags
for each row
execute function public.set_updated_at();

drop trigger if exists set_prompts_updated_at on public.prompts;
create trigger set_prompts_updated_at
before update on public.prompts
for each row
execute function public.set_updated_at();

drop trigger if exists prompts_search_vector_tgr on public.prompts;
create trigger prompts_search_vector_tgr
before insert or update of title, short_description, full_prompt_text
on public.prompts
for each row
execute function public.prompts_search_vector_update();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

update public.prompts
set title = title;

create index if not exists idx_categories_slug on public.categories(slug);
create index if not exists idx_tags_slug on public.tags(slug);
create index if not exists idx_prompts_slug on public.prompts(slug);
create index if not exists idx_prompts_status on public.prompts(status);
create index if not exists idx_prompts_category_id on public.prompts(category_id);
create index if not exists idx_prompts_published_at on public.prompts(published_at desc);
create index if not exists idx_prompts_search_vector on public.prompts using gin(search_vector);
create index if not exists idx_prompt_tags_tag_id on public.prompt_tags(tag_id);
create index if not exists idx_prompt_views_prompt_id on public.prompt_views(prompt_id);
create index if not exists idx_prompt_views_viewed_at on public.prompt_views(viewed_at desc);

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.tags enable row level security;
alter table public.prompts enable row level security;
alter table public.prompt_tags enable row level security;
alter table public.prompt_views enable row level security;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
  on public.profiles
  for select
  using (auth.uid() = id or public.is_admin(auth.uid()));

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin"
  on public.profiles
  for update
  using (auth.uid() = id or public.is_admin(auth.uid()))
  with check (auth.uid() = id or public.is_admin(auth.uid()));

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self"
  on public.profiles
  for insert
  with check (auth.uid() = id);

drop policy if exists "categories_select_public" on public.categories;
create policy "categories_select_public"
  on public.categories
  for select
  using (true);

drop policy if exists "categories_admin_insert" on public.categories;
create policy "categories_admin_insert"
  on public.categories
  for insert
  with check (public.is_admin(auth.uid()));

drop policy if exists "categories_admin_update" on public.categories;
create policy "categories_admin_update"
  on public.categories
  for update
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "categories_admin_delete" on public.categories;
create policy "categories_admin_delete"
  on public.categories
  for delete
  using (public.is_admin(auth.uid()));

drop policy if exists "tags_select_public" on public.tags;
create policy "tags_select_public"
  on public.tags
  for select
  using (true);

drop policy if exists "tags_admin_insert" on public.tags;
create policy "tags_admin_insert"
  on public.tags
  for insert
  with check (public.is_admin(auth.uid()));

drop policy if exists "tags_admin_update" on public.tags;
create policy "tags_admin_update"
  on public.tags
  for update
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "tags_admin_delete" on public.tags;
create policy "tags_admin_delete"
  on public.tags
  for delete
  using (public.is_admin(auth.uid()));

drop policy if exists "prompts_select_published" on public.prompts;
create policy "prompts_select_published"
  on public.prompts
  for select
  using (status = 'published');

drop policy if exists "prompts_select_admin" on public.prompts;
create policy "prompts_select_admin"
  on public.prompts
  for select
  using (public.is_admin(auth.uid()));

drop policy if exists "prompts_insert_admin" on public.prompts;
create policy "prompts_insert_admin"
  on public.prompts
  for insert
  with check (public.is_admin(auth.uid()) and created_by = auth.uid());

drop policy if exists "prompts_update_admin" on public.prompts;
create policy "prompts_update_admin"
  on public.prompts
  for update
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "prompts_delete_admin" on public.prompts;
create policy "prompts_delete_admin"
  on public.prompts
  for delete
  using (public.is_admin(auth.uid()));

drop policy if exists "prompt_tags_select_published" on public.prompt_tags;
create policy "prompt_tags_select_published"
  on public.prompt_tags
  for select
  using (
    exists (
      select 1
      from public.prompts p
      where p.id = prompt_tags.prompt_id
        and (p.status = 'published' or public.is_admin(auth.uid()))
    )
  );

drop policy if exists "prompt_tags_insert_admin" on public.prompt_tags;
create policy "prompt_tags_insert_admin"
  on public.prompt_tags
  for insert
  with check (public.is_admin(auth.uid()));

drop policy if exists "prompt_tags_update_admin" on public.prompt_tags;
create policy "prompt_tags_update_admin"
  on public.prompt_tags
  for update
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "prompt_tags_delete_admin" on public.prompt_tags;
create policy "prompt_tags_delete_admin"
  on public.prompt_tags
  for delete
  using (public.is_admin(auth.uid()));

drop policy if exists "prompt_views_insert_public" on public.prompt_views;
create policy "prompt_views_insert_public"
  on public.prompt_views
  for insert
  with check (true);

drop policy if exists "prompt_views_select_admin" on public.prompt_views;
create policy "prompt_views_select_admin"
  on public.prompt_views
  for select
  using (public.is_admin(auth.uid()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'prompt-covers',
  'prompt-covers',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "prompt_covers_public_read" on storage.objects;
create policy "prompt_covers_public_read"
  on storage.objects
  for select
  using (bucket_id = 'prompt-covers');

drop policy if exists "prompt_covers_admin_insert" on storage.objects;
create policy "prompt_covers_admin_insert"
  on storage.objects
  for insert
  with check (bucket_id = 'prompt-covers' and public.is_admin(auth.uid()));

drop policy if exists "prompt_covers_admin_update" on storage.objects;
create policy "prompt_covers_admin_update"
  on storage.objects
  for update
  using (bucket_id = 'prompt-covers' and public.is_admin(auth.uid()))
  with check (bucket_id = 'prompt-covers' and public.is_admin(auth.uid()));

drop policy if exists "prompt_covers_admin_delete" on storage.objects;
create policy "prompt_covers_admin_delete"
  on storage.objects
  for delete
  using (bucket_id = 'prompt-covers' and public.is_admin(auth.uid()));

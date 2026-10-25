-- UD🏀KA / YSL ENT project persistence schema for Supabase Postgres.
-- Run in Supabase SQL Editor. Supabase Auth handles sign-up/sign-in.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  description text not null default '',
  aspect_ratio text not null default '9:16' check (aspect_ratio in ('9:16','16:9','1:1','4:5')),
  status text not null default 'draft' check (status in ('draft','ready','archived')),
  storyboard jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.generation_jobs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  kind text not null check (kind in ('text-to-video','image-to-video','image-generation','preview-export')),
  status text not null default 'queued' check (status in ('queued','running','succeeded','failed','cancelled')),
  prompt text not null check (char_length(prompt) between 1 and 12000),
  provider text not null default 'unconfigured',
  output_url text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_owner_updated_idx on public.projects(owner_id, updated_at desc);
create index if not exists jobs_owner_created_idx on public.generation_jobs(owner_id, created_at desc);
create index if not exists jobs_status_created_idx on public.generation_jobs(status, created_at);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at before update on public.projects for each row execute function public.set_updated_at();
drop trigger if exists jobs_set_updated_at on public.generation_jobs;
create trigger jobs_set_updated_at before update on public.generation_jobs for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.generation_jobs enable row level security;
drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile" on public.profiles for select to authenticated using (auth.uid() = id);
drop policy if exists "Users manage own projects" on public.projects;
create policy "Users manage own projects" on public.projects for all to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
drop policy if exists "Users read own generation jobs" on public.generation_jobs;
create policy "Users read own generation jobs" on public.generation_jobs for select to authenticated using (auth.uid() = owner_id);
drop policy if exists "Users create own generation jobs" on public.generation_jobs;
create policy "Users create own generation jobs" on public.generation_jobs for insert to authenticated with check (auth.uid() = owner_id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', ''))
  on conflict (id) do nothing;
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

-- To grant admin access, run manually for the trusted owner's authenticated user UUID:
-- update public.profiles set is_admin = true where id = '<AUTH_USER_UUID>';

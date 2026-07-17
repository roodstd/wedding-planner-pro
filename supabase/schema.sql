-- =========================================================
-- Wedding Planner Pro - Supabase schema
-- Jalankan file ini di: Supabase Dashboard -> SQL Editor -> New query
-- =========================================================

create extension if not exists "pgcrypto";

-- 1) Ruang kerja rundown milik tiap user (autosave, 1 baris per user)
create table if not exists public.workspace_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  details jsonb not null default '{}'::jsonb,
  rundown jsonb not null default '[]'::jsonb,
  checklist jsonb not null default '{}'::jsonb,
  checklist_custom jsonb not null default '{}'::jsonb,
  checklist_custom_categories jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 2) Preset / template rundown yang disimpan user ("Acara Tersimpan")
create table if not exists public.rundown_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  description text,
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- Auto-update updated_at setiap kali workspace_state disimpan
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_workspace_state_updated_at on public.workspace_state;
create trigger trg_workspace_state_updated_at
before update on public.workspace_state
for each row execute function public.set_updated_at();

-- =========================================================
-- Row Level Security - setiap user HANYA bisa akses datanya sendiri
-- =========================================================
alter table public.workspace_state enable row level security;
alter table public.rundown_templates enable row level security;

drop policy if exists "workspace: select own" on public.workspace_state;
create policy "workspace: select own" on public.workspace_state
  for select using (auth.uid() = user_id);

drop policy if exists "workspace: insert own" on public.workspace_state;
create policy "workspace: insert own" on public.workspace_state
  for insert with check (auth.uid() = user_id);

drop policy if exists "workspace: update own" on public.workspace_state;
create policy "workspace: update own" on public.workspace_state
  for update using (auth.uid() = user_id);

drop policy if exists "workspace: delete own" on public.workspace_state;
create policy "workspace: delete own" on public.workspace_state
  for delete using (auth.uid() = user_id);

drop policy if exists "templates: select own" on public.rundown_templates;
create policy "templates: select own" on public.rundown_templates
  for select using (auth.uid() = user_id);

drop policy if exists "templates: insert own" on public.rundown_templates;
create policy "templates: insert own" on public.rundown_templates
  for insert with check (auth.uid() = user_id);

drop policy if exists "templates: update own" on public.rundown_templates;
create policy "templates: update own" on public.rundown_templates
  for update using (auth.uid() = user_id);

drop policy if exists "templates: delete own" on public.rundown_templates;
create policy "templates: delete own" on public.rundown_templates
  for delete using (auth.uid() = user_id);

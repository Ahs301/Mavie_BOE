-- 06_admin_users_and_audit.sql
-- Goals:
--   1. Move admin whitelist from ADMIN_EMAILS env var to a table (admin_users).
--   2. Add admin_audit_log for traceability on all admin-visible mutations.
--
-- Safe to run multiple times: uses IF NOT EXISTS and idempotent policy creation.

begin;

-- =========================================================================
-- 1. admin_users
-- =========================================================================
create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  role text not null default 'admin' check (role in ('admin', 'superadmin')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  last_login_at timestamptz,
  notes text
);

create index if not exists idx_admin_users_email on public.admin_users (lower(email));

alter table public.admin_users enable row level security;

-- Only the current authenticated user can read their own admin row.
-- Elevation changes must happen via service_role (Supabase dashboard or migration).
drop policy if exists admin_users_self_read on public.admin_users;
create policy admin_users_self_read
  on public.admin_users
  for select
  to authenticated
  using (lower(email) = lower(auth.jwt() ->> 'email'));

-- Helper function for middleware / server actions.
create or replace function public.is_admin(user_email text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1 from public.admin_users
    where lower(email) = lower(user_email) and is_active = true
  );
$$;

grant execute on function public.is_admin(text) to authenticated, anon;

-- =========================================================================
-- 2. admin_audit_log
-- =========================================================================
create table if not exists public.admin_audit_log (
  id bigserial primary key,
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_email text,
  action text not null,
  entity_table text,
  entity_id text,
  diff jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists idx_audit_log_created_at on public.admin_audit_log (created_at desc);
create index if not exists idx_audit_log_actor on public.admin_audit_log (actor_user_id);
create index if not exists idx_audit_log_entity on public.admin_audit_log (entity_table, entity_id);

alter table public.admin_audit_log enable row level security;

-- Only superadmins can read audit log.
drop policy if exists audit_log_superadmin_read on public.admin_audit_log;
create policy audit_log_superadmin_read
  on public.admin_audit_log
  for select
  to authenticated
  using (
    exists(
      select 1 from public.admin_users
      where lower(email) = lower(auth.jwt() ->> 'email')
        and role = 'superadmin'
        and is_active = true
    )
  );

-- Inserts from authenticated (admin server actions).
drop policy if exists audit_log_admin_insert on public.admin_audit_log;
create policy audit_log_admin_insert
  on public.admin_audit_log
  for insert
  to authenticated
  with check (public.is_admin(auth.jwt() ->> 'email'));

commit;

-- =========================================================================
-- Seed: migrate emails from ADMIN_EMAILS env var manually via:
--   insert into public.admin_users (email, role) values ('owner@example.com', 'superadmin');
-- =========================================================================

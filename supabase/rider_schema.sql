-- Run this in Supabase SQL Editor.
-- This creates rider tables required by the app and basic RLS policies.

create extension if not exists "pgcrypto";

create table if not exists public.rider_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique not null references auth.users (id) on delete cascade,
  full_name text,
  contact text,
  assigned_area text,
  motor_model text,
  plate_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.deliveries (
  id uuid primary key default gen_random_uuid(),
  rider_auth_id uuid references auth.users (id) on delete set null,
  rider_email text,
  customer_name text not null,
  customer_phone text,
  address text not null,
  amount numeric(10,2) not null default 0,
  payment_method text not null default 'Cash on Delivery',
  payment_status text not null default 'pending',
  status text not null default 'in_progress',
  distance_km numeric(6,2),
  eta_text text,
  navigation_text text,
  items jsonb not null default '[]'::jsonb,
  delivered_at timestamptz,
  failed_at timestamptz,
  failed_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.rider_profiles enable row level security;
alter table public.deliveries enable row level security;

-- Rider can read and update own profile.
drop policy if exists rider_profiles_select_own on public.rider_profiles;
create policy rider_profiles_select_own
on public.rider_profiles
for select
to authenticated
using (auth.uid() = auth_user_id);

drop policy if exists rider_profiles_update_own on public.rider_profiles;
create policy rider_profiles_update_own
on public.rider_profiles
for update
to authenticated
using (auth.uid() = auth_user_id)
with check (auth.uid() = auth_user_id);

drop policy if exists rider_profiles_insert_own on public.rider_profiles;
create policy rider_profiles_insert_own
on public.rider_profiles
for insert
to authenticated
with check (auth.uid() = auth_user_id);

-- Rider can read own deliveries, and update status for own deliveries.
drop policy if exists deliveries_select_own on public.deliveries;
create policy deliveries_select_own
on public.deliveries
for select
to authenticated
using (
  auth.uid() = rider_auth_id
  or lower(coalesce(rider_email, '')) = lower(coalesce((auth.jwt() ->> 'email'), ''))
);

drop policy if exists deliveries_update_own on public.deliveries;
create policy deliveries_update_own
on public.deliveries
for update
to authenticated
using (
  auth.uid() = rider_auth_id
  or lower(coalesce(rider_email, '')) = lower(coalesce((auth.jwt() ->> 'email'), ''))
)
with check (
  auth.uid() = rider_auth_id
  or lower(coalesce(rider_email, '')) = lower(coalesce((auth.jwt() ->> 'email'), ''))
);

-- Optional seed for currently logged-in user in SQL editor.
-- Replace values as needed.
insert into public.rider_profiles (auth_user_id, full_name, contact, assigned_area, motor_model, plate_number)
values (
  '00000000-0000-0000-0000-000000000000',
  'Sample Rider',
  '09171234567',
  'Downtown',
  'Honda Click 125i',
  'ABC-1234'
)
on conflict (auth_user_id) do nothing;

-- Sample delivery. Replace rider_auth_id with a real auth.users.id.
insert into public.deliveries (
  rider_auth_id,
  rider_email,
  customer_name,
  customer_phone,
  address,
  amount,
  payment_method,
  payment_status,
  status,
  distance_km,
  eta_text,
  navigation_text,
  items
)
values (
  '00000000-0000-0000-0000-000000000000',
  'rider@example.com',
  'Juan Dela Cruz',
  '09175551234',
  'Blk 1 Lot 2 Sample St, Sample City',
  289,
  'Cash on Delivery',
  'pending',
  'in_progress',
  2.4,
  'ETA 15 mins',
  'Turn right after the barangay hall',
  '["1x Sinantol Special", "2x Garlic Rice"]'::jsonb
);

-- Run this in Supabase SQL Editor (new project).
-- This script creates the full schema used by both admin and rider apps.

create extension if not exists "pgcrypto";

-- Shared helper for updated_at columns.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Keep riders.area and riders.location in sync (app reads both).
create or replace function public.sync_rider_area_location()
returns trigger
language plpgsql
as $$
begin
  if new.area is null and new.location is not null then
    new.area = new.location;
  end if;

  if new.location is null and new.area is not null then
    new.location = new.area;
  end if;

  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique,
  role text not null default 'rider' check (role in ('admin', 'rider')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.riders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users (id) on delete set null,
  first_name text not null,
  last_name text not null,
  middle_initial text,
  address text,
  area text,
  location text,
  contact text,
  birthdate date,
  plate_number text,
  email text,
  emergency_name text,
  emergency_contact text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  flavor text not null,
  size text not null,
  price numeric(10,2) not null default 0,
  created_at timestamptz not null default now(),
  unique (flavor, size)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  address text not null,
  contact text,
  rider_id uuid references public.riders (id) on delete set null,
  rider_auth_id uuid references auth.users (id) on delete set null,
  rider_email text,
  total numeric(10,2) not null default 0,
  delivery_fee numeric(10,2) not null default 0,
  note text,
  status text not null default 'waiting',
  payment_method text not null default 'Cash on Delivery',
  payment_status text not null default 'pending',
  order_date timestamptz not null default now(),
  delivered_at timestamptz,
  failed_at timestamptz,
  failed_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-fill orders.rider_auth_id and orders.rider_email from riders row.
create or replace function public.fill_order_rider_identity()
returns trigger
language plpgsql
as $$
declare
  v_user_id uuid;
  v_email text;
begin
  if new.rider_id is null then
    return new;
  end if;

  select r.user_id, r.email
  into v_user_id, v_email
  from public.riders r
  where r.id = new.rider_id;

  if new.rider_auth_id is null then
    new.rider_auth_id = v_user_id;
  end if;

  if coalesce(trim(new.rider_email), '') = '' then
    new.rider_email = v_email;
  end if;

  return new;
end;
$$;

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_variant_id uuid not null references public.product_variants (id) on delete restrict,
  product_name text,
  quantity integer not null default 1,
  subtotal numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);

-- Rider tables used by rider pages as first source.
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

-- Triggers.
drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_riders_updated_at on public.riders;
create trigger trg_riders_updated_at
before update on public.riders
for each row execute function public.set_updated_at();

drop trigger if exists trg_riders_sync_area_location on public.riders;
create trigger trg_riders_sync_area_location
before insert or update on public.riders
for each row execute function public.sync_rider_area_location();

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

drop trigger if exists trg_orders_fill_rider_identity on public.orders;
create trigger trg_orders_fill_rider_identity
before insert or update on public.orders
for each row execute function public.fill_order_rider_identity();

drop trigger if exists trg_rider_profiles_updated_at on public.rider_profiles;
create trigger trg_rider_profiles_updated_at
before update on public.rider_profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_deliveries_updated_at on public.deliveries;
create trigger trg_deliveries_updated_at
before update on public.deliveries
for each row execute function public.set_updated_at();

-- Seed required product variants.
insert into public.product_variants (flavor, size, price)
values
  ('classic', 'small', 110),
  ('classic', 'large', 150),
  ('classic', 'bottled', 170),
  ('spicy', 'small', 110),
  ('spicy', 'large', 150),
  ('spicy', 'bottled', 170)
on conflict (flavor, size) do update set
  price = excluded.price;

-- RLS.
alter table public.profiles enable row level security;
alter table public.riders enable row level security;
alter table public.product_variants enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.rider_profiles enable row level security;
alter table public.deliveries enable row level security;

-- profiles policies.
drop policy if exists profiles_select_authenticated on public.profiles;
create policy profiles_select_authenticated
on public.profiles
for select
to authenticated
using (true);

drop policy if exists profiles_insert_authenticated on public.profiles;
create policy profiles_insert_authenticated
on public.profiles
for insert
to authenticated
with check (true);

drop policy if exists profiles_update_authenticated on public.profiles;
create policy profiles_update_authenticated
on public.profiles
for update
to authenticated
using (true)
with check (true);

-- riders policies.
drop policy if exists riders_select_authenticated on public.riders;
create policy riders_select_authenticated
on public.riders
for select
to authenticated
using (true);

drop policy if exists riders_insert_authenticated on public.riders;
create policy riders_insert_authenticated
on public.riders
for insert
to authenticated
with check (true);

drop policy if exists riders_update_authenticated on public.riders;
create policy riders_update_authenticated
on public.riders
for update
to authenticated
using (true)
with check (true);

drop policy if exists riders_delete_authenticated on public.riders;
create policy riders_delete_authenticated
on public.riders
for delete
to authenticated
using (true);

-- product_variants policies.
drop policy if exists product_variants_select_authenticated on public.product_variants;
create policy product_variants_select_authenticated
on public.product_variants
for select
to authenticated
using (true);

drop policy if exists product_variants_write_admin on public.product_variants;
create policy product_variants_write_admin
on public.product_variants
for all
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

-- orders policies.
drop policy if exists orders_select_access on public.orders;
create policy orders_select_access
on public.orders
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
  or auth.uid() = rider_auth_id
  or exists (
    select 1
    from public.riders r
    where r.id = orders.rider_id
      and r.user_id = auth.uid()
  )
  or lower(coalesce(rider_email, '')) = lower(coalesce((auth.jwt() ->> 'email'), ''))
);

drop policy if exists orders_insert_admin on public.orders;
create policy orders_insert_admin
on public.orders
for insert
to authenticated
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

drop policy if exists orders_update_access on public.orders;
create policy orders_update_access
on public.orders
for update
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
  or auth.uid() = rider_auth_id
  or exists (
    select 1
    from public.riders r
    where r.id = orders.rider_id
      and r.user_id = auth.uid()
  )
  or lower(coalesce(rider_email, '')) = lower(coalesce((auth.jwt() ->> 'email'), ''))
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
  or auth.uid() = rider_auth_id
  or exists (
    select 1
    from public.riders r
    where r.id = orders.rider_id
      and r.user_id = auth.uid()
  )
  or lower(coalesce(rider_email, '')) = lower(coalesce((auth.jwt() ->> 'email'), ''))
);

drop policy if exists orders_delete_admin on public.orders;
create policy orders_delete_admin
on public.orders
for delete
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

-- order_items policies.
drop policy if exists order_items_select_authenticated on public.order_items;
create policy order_items_select_authenticated
on public.order_items
for select
to authenticated
using (true);

drop policy if exists order_items_insert_admin on public.order_items;
create policy order_items_insert_admin
on public.order_items
for insert
to authenticated
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

drop policy if exists order_items_update_admin on public.order_items;
create policy order_items_update_admin
on public.order_items
for update
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

drop policy if exists order_items_delete_admin on public.order_items;
create policy order_items_delete_admin
on public.order_items
for delete
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

-- rider_profiles policies.
drop policy if exists rider_profiles_select_own_or_admin on public.rider_profiles;
create policy rider_profiles_select_own_or_admin
on public.rider_profiles
for select
to authenticated
using (
  auth.uid() = auth_user_id
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

drop policy if exists rider_profiles_insert_own_or_admin on public.rider_profiles;
create policy rider_profiles_insert_own_or_admin
on public.rider_profiles
for insert
to authenticated
with check (
  auth.uid() = auth_user_id
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

drop policy if exists rider_profiles_update_own_or_admin on public.rider_profiles;
create policy rider_profiles_update_own_or_admin
on public.rider_profiles
for update
to authenticated
using (
  auth.uid() = auth_user_id
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
)
with check (
  auth.uid() = auth_user_id
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

-- deliveries policies.
drop policy if exists deliveries_select_own_or_admin on public.deliveries;
create policy deliveries_select_own_or_admin
on public.deliveries
for select
to authenticated
using (
  auth.uid() = rider_auth_id
  or lower(coalesce(rider_email, '')) = lower(coalesce((auth.jwt() ->> 'email'), ''))
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

drop policy if exists deliveries_update_own_or_admin on public.deliveries;
create policy deliveries_update_own_or_admin
on public.deliveries
for update
to authenticated
using (
  auth.uid() = rider_auth_id
  or lower(coalesce(rider_email, '')) = lower(coalesce((auth.jwt() ->> 'email'), ''))
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
)
with check (
  auth.uid() = rider_auth_id
  or lower(coalesce(rider_email, '')) = lower(coalesce((auth.jwt() ->> 'email'), ''))
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

-- Optional: create your first admin profile row after creating/authing an admin user.
-- insert into public.profiles (id, email, role)
-- values ('<admin_auth_user_id>', 'admin@example.com', 'admin')
-- on conflict (id) do update set role = excluded.role, email = excluded.email;

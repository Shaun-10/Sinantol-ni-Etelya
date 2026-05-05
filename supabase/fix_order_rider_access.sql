-- Repair RLS policies for the current live schema shown in Supabase.
-- This version matches these tables:
-- orders: id, customer_name, address, contact, rider_id, total, status, created_at, updated_at
-- order_items: id, order_id, product_variant_id, quantity, subtotal, created_at

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    -- Fallback for the seeded admin login used by the app. If you set
    -- VITE_ADMIN_EMAIL to a different value, change this email too.
    or lower(coalesce(auth.jwt() ->> 'email', '')) = 'admin@admin.com';
$$;

grant execute on function public.is_admin() to authenticated;

-- Seed product variants used by Add Order. This works even without a unique
-- constraint on (flavor, size).
with variants(flavor, size, price) as (
  values
    ('classic', 'small', 110),
    ('classic', 'large', 150),
    ('classic', 'bottled', 170),
    ('spicy', 'small', 110),
    ('spicy', 'large', 150),
    ('spicy', 'bottled', 170)
)
insert into public.product_variants (flavor, size, price)
select v.flavor, v.size, v.price
from variants v
where not exists (
  select 1
  from public.product_variants pv
  where lower(pv.flavor) = lower(v.flavor)
    and lower(pv.size) = lower(v.size)
);

with variants(flavor, size, price) as (
  values
    ('classic', 'small', 110),
    ('classic', 'large', 150),
    ('classic', 'bottled', 170),
    ('spicy', 'small', 110),
    ('spicy', 'large', 150),
    ('spicy', 'bottled', 170)
)
update public.product_variants pv
set price = v.price
from variants v
where lower(pv.flavor) = lower(v.flavor)
  and lower(pv.size) = lower(v.size);

-- Profiles: admins can create rider profile rows; users can read/update self.
drop policy if exists profiles_select_authenticated on public.profiles;
drop policy if exists users_read_own_profile on public.profiles;
create policy profiles_select_authenticated
on public.profiles
for select
to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_insert_admin_or_self on public.profiles;
drop policy if exists profiles_insert_authenticated on public.profiles;
drop policy if exists allow_profile_insert on public.profiles;
create policy profiles_insert_admin_or_self
on public.profiles
for insert
to authenticated
with check (id = auth.uid() or public.is_admin());

drop policy if exists profiles_update_admin_or_self on public.profiles;
drop policy if exists profiles_update_authenticated on public.profiles;
drop policy if exists users_update_own_profile on public.profiles;
create policy profiles_update_admin_or_self
on public.profiles
for update
to authenticated
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

-- Riders: admins manage riders; riders read their own row.
drop policy if exists "Admins access all riders" on public.riders;
drop policy if exists "Riders access own record" on public.riders;
drop policy if exists riders_select_access on public.riders;
drop policy if exists riders_select_authenticated on public.riders;
drop policy if exists riders_select_admin on public.riders;
drop policy if exists rider_select_own on public.riders;
create policy riders_select_access
on public.riders
for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists riders_insert_admin on public.riders;
drop policy if exists riders_insert_authenticated on public.riders;
drop policy if exists rider_insert_own on public.riders;
create policy riders_insert_admin
on public.riders
for insert
to authenticated
with check (public.is_admin());

drop policy if exists riders_update_admin on public.riders;
drop policy if exists riders_update_authenticated on public.riders;
create policy riders_update_admin
on public.riders
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists riders_delete_admin on public.riders;
drop policy if exists riders_delete_authenticated on public.riders;
create policy riders_delete_admin
on public.riders
for delete
to authenticated
using (public.is_admin());

-- Product variants: the app reads these to create order_items.
drop policy if exists "Public read products" on public.product_variants;
drop policy if exists product_variants_select_authenticated on public.product_variants;
drop policy if exists product_variants_select_all on public.product_variants;
create policy product_variants_select_authenticated
on public.product_variants
for select
to authenticated
using (true);

-- Orders: admins create/read/update/delete; riders read/update assigned orders.
drop policy if exists "Admins see all orders" on public.orders;
drop policy if exists "Riders see assigned orders" on public.orders;
drop policy if exists "Riders see own orders" on public.orders;
drop policy if exists orders_select_access on public.orders;
drop policy if exists orders_select_admin on public.orders;
drop policy if exists orders_select_own on public.orders;
create policy orders_select_access
on public.orders
for select
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.riders r
    where r.id = orders.rider_id
      and r.user_id = auth.uid()
  )
);

drop policy if exists orders_insert_admin on public.orders;
create policy orders_insert_admin
on public.orders
for insert
to authenticated
with check (public.is_admin());

drop policy if exists orders_update_access on public.orders;
drop policy if exists orders_update_admin on public.orders;
drop policy if exists orders_update_own on public.orders;
create policy orders_update_access
on public.orders
for update
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.riders r
    where r.id = orders.rider_id
      and r.user_id = auth.uid()
  )
)
with check (
  public.is_admin()
  or exists (
    select 1
    from public.riders r
    where r.id = orders.rider_id
      and r.user_id = auth.uid()
  )
);

drop policy if exists orders_delete_admin on public.orders;
create policy orders_delete_admin
on public.orders
for delete
to authenticated
using (public.is_admin());

-- Order items: admins manage; riders read items from their assigned orders.
drop policy if exists "Admins see all order items" on public.order_items;
drop policy if exists "Riders see own order items" on public.order_items;
drop policy if exists order_items_select_access on public.order_items;
drop policy if exists order_items_select_admin on public.order_items;
drop policy if exists order_items_select_own on public.order_items;
create policy order_items_select_access
on public.order_items
for select
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.orders o
    join public.riders r on r.id = o.rider_id
    where o.id = order_items.order_id
      and r.user_id = auth.uid()
  )
);

drop policy if exists order_items_insert_admin on public.order_items;
create policy order_items_insert_admin
on public.order_items
for insert
to authenticated
with check (public.is_admin());

drop policy if exists order_items_update_admin on public.order_items;
create policy order_items_update_admin
on public.order_items
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists order_items_delete_admin on public.order_items;
create policy order_items_delete_admin
on public.order_items
for delete
to authenticated
using (public.is_admin());

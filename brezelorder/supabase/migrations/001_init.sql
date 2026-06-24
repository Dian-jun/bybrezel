create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  restaurant_id uuid null,
  full_name text null,
  role text not null default 'owner' check (role in ('owner', 'staff')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.restaurants (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.users (id) on delete restrict,
  name text not null,
  slug text not null unique,
  address text null,
  logo_url text null,
  contact_email text null,
  contact_phone text null,
  is_live boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'users_restaurant_id_fkey'
  ) then
    alter table public.users
      add constraint users_restaurant_id_fkey
      foreign key (restaurant_id) references public.restaurants (id) on delete set null;
  end if;
end $$;

create table if not exists public.restaurant_tables (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  name text not null,
  code text not null unique,
  seats integer null check (seats is null or seats >= 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.menu_categories (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  name text not null,
  description text null,
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  category_id uuid not null references public.menu_categories (id) on delete cascade,
  name text not null,
  description text null,
  price_cents integer not null check (price_cents >= 0),
  is_visible boolean not null default true,
  is_available boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  table_id uuid not null references public.restaurant_tables (id) on delete restrict,
  status text not null default 'new' check (status in ('new', 'accepted', 'preparing', 'served', 'cancelled')),
  notes text null,
  guest_name text null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  menu_item_id uuid not null references public.menu_items (id) on delete restrict,
  name_snapshot text not null,
  price_cents_snapshot integer not null check (price_cents_snapshot >= 0),
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.staff_calls (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  table_id uuid not null references public.restaurant_tables (id) on delete restrict,
  call_type text not null check (call_type in ('call_staff', 'request_bill', 'request_water', 'need_help')),
  status text not null default 'open' check (status in ('open', 'completed')),
  message text null,
  completed_at timestamptz null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_users_restaurant_id on public.users (restaurant_id);
create index if not exists idx_restaurants_slug on public.restaurants (slug);
create index if not exists idx_tables_restaurant_sort on public.restaurant_tables (restaurant_id, sort_order);
create index if not exists idx_categories_restaurant_sort on public.menu_categories (restaurant_id, sort_order);
create index if not exists idx_menu_items_restaurant_category on public.menu_items (restaurant_id, category_id, sort_order);
create index if not exists idx_orders_restaurant_status_created on public.orders (restaurant_id, status, created_at desc);
create index if not exists idx_order_items_order_id on public.order_items (order_id);
create index if not exists idx_staff_calls_restaurant_status_created on public.staff_calls (restaurant_id, status, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, full_name, role)
  values (new.id, new.raw_user_meta_data ->> 'full_name', 'owner')
  on conflict (id) do update set
    full_name = excluded.full_name,
    updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_auth_user();

drop trigger if exists set_users_updated_at on public.users;
create trigger set_users_updated_at before update on public.users
for each row execute procedure public.set_updated_at();

drop trigger if exists set_restaurants_updated_at on public.restaurants;
create trigger set_restaurants_updated_at before update on public.restaurants
for each row execute procedure public.set_updated_at();

drop trigger if exists set_tables_updated_at on public.restaurant_tables;
create trigger set_tables_updated_at before update on public.restaurant_tables
for each row execute procedure public.set_updated_at();

drop trigger if exists set_categories_updated_at on public.menu_categories;
create trigger set_categories_updated_at before update on public.menu_categories
for each row execute procedure public.set_updated_at();

drop trigger if exists set_menu_items_updated_at on public.menu_items;
create trigger set_menu_items_updated_at before update on public.menu_items
for each row execute procedure public.set_updated_at();

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at before update on public.orders
for each row execute procedure public.set_updated_at();

drop trigger if exists set_staff_calls_updated_at on public.staff_calls;
create trigger set_staff_calls_updated_at before update on public.staff_calls
for each row execute procedure public.set_updated_at();

create or replace function public.auth_user_restaurant_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select restaurant_id from public.users where id = auth.uid()
$$;

create or replace function public.is_restaurant_member(target_restaurant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users
    where id = auth.uid()
      and restaurant_id = target_restaurant_id
  )
$$;

alter table public.users enable row level security;
alter table public.restaurants enable row level security;
alter table public.restaurant_tables enable row level security;
alter table public.menu_categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.staff_calls enable row level security;

create policy "users_select_own_membership"
on public.users for select
to authenticated
using (id = auth.uid() or restaurant_id = public.auth_user_restaurant_id());

create policy "users_update_own_membership"
on public.users for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "users_insert_own_membership"
on public.users for insert
to authenticated
with check (id = auth.uid());

create policy "restaurants_public_live_read"
on public.restaurants for select
to anon, authenticated
using (is_live = true or public.is_restaurant_member(id));

create policy "restaurants_insert_owner"
on public.restaurants for insert
to authenticated
with check (owner_user_id = auth.uid());

create policy "restaurants_update_member"
on public.restaurants for update
to authenticated
using (public.is_restaurant_member(id))
with check (public.is_restaurant_member(id));

create policy "tables_public_read_live_restaurant"
on public.restaurant_tables for select
to anon, authenticated
using (
  exists (
    select 1 from public.restaurants
    where restaurants.id = restaurant_tables.restaurant_id
      and restaurants.is_live = true
  )
  or public.is_restaurant_member(restaurant_id)
);

create policy "tables_manage_member"
on public.restaurant_tables for all
to authenticated
using (public.is_restaurant_member(restaurant_id))
with check (public.is_restaurant_member(restaurant_id));

create policy "categories_public_read_visible"
on public.menu_categories for select
to anon, authenticated
using (
  (is_visible = true and exists (
    select 1 from public.restaurants
    where restaurants.id = menu_categories.restaurant_id
      and restaurants.is_live = true
  ))
  or public.is_restaurant_member(restaurant_id)
);

create policy "categories_manage_member"
on public.menu_categories for all
to authenticated
using (public.is_restaurant_member(restaurant_id))
with check (public.is_restaurant_member(restaurant_id));

create policy "menu_items_public_read_visible"
on public.menu_items for select
to anon, authenticated
using (
  (is_visible = true and exists (
    select 1 from public.restaurants
    where restaurants.id = menu_items.restaurant_id
      and restaurants.is_live = true
  ))
  or public.is_restaurant_member(restaurant_id)
);

create policy "menu_items_manage_member"
on public.menu_items for all
to authenticated
using (public.is_restaurant_member(restaurant_id))
with check (public.is_restaurant_member(restaurant_id));

create policy "orders_member_read_update"
on public.orders for select
to authenticated
using (public.is_restaurant_member(restaurant_id));

create policy "orders_member_update"
on public.orders for update
to authenticated
using (public.is_restaurant_member(restaurant_id))
with check (public.is_restaurant_member(restaurant_id));

create policy "order_items_member_read"
on public.order_items for select
to authenticated
using (
  exists (
    select 1 from public.orders
    where orders.id = order_items.order_id
      and public.is_restaurant_member(orders.restaurant_id)
  )
);

create policy "staff_calls_member_read_update"
on public.staff_calls for select
to authenticated
using (public.is_restaurant_member(restaurant_id));

create policy "staff_calls_member_update"
on public.staff_calls for update
to authenticated
using (public.is_restaurant_member(restaurant_id))
with check (public.is_restaurant_member(restaurant_id));

insert into storage.buckets (id, name, public)
values ('restaurant-assets', 'restaurant-assets', true)
on conflict (id) do nothing;

create policy "restaurant_assets_public_read"
on storage.objects for select
to public
using (bucket_id = 'restaurant-assets');

create policy "restaurant_assets_authenticated_write"
on storage.objects for insert
to authenticated
with check (bucket_id = 'restaurant-assets');

create policy "restaurant_assets_authenticated_update"
on storage.objects for update
to authenticated
using (bucket_id = 'restaurant-assets')
with check (bucket_id = 'restaurant-assets');

do $$
begin
  begin
    alter publication supabase_realtime add table public.orders;
  exception when duplicate_object then
    null;
  end;
  begin
    alter publication supabase_realtime add table public.staff_calls;
  exception when duplicate_object then
    null;
  end;
end $$;

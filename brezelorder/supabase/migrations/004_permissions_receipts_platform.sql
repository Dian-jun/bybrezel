alter table public.users
  add column if not exists email text null,
  add column if not exists is_platform_admin boolean not null default false;

alter table public.restaurants
  add column if not exists steuer_number text null,
  add column if not exists iban text null;

alter table public.orders
  add column if not exists guest_email text null,
  add column if not exists receipt_email_sent_at timestamptz null;

create table if not exists public.restaurant_memberships (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  role text not null default 'staff' check (role in ('owner', 'manager', 'staff')),
  permissions jsonb not null default jsonb_build_object(
    'can_manage_menu', false,
    'can_manage_tables', false,
    'can_manage_qr', false,
    'can_manage_staff', false,
    'can_view_analytics', false,
    'can_manage_settings', false,
    'can_manage_orders', true
  ),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (restaurant_id, user_id)
);

create index if not exists idx_restaurant_memberships_restaurant
  on public.restaurant_memberships (restaurant_id);

create index if not exists idx_restaurant_memberships_user
  on public.restaurant_memberships (user_id);

drop trigger if exists set_restaurant_memberships_updated_at on public.restaurant_memberships;
create trigger set_restaurant_memberships_updated_at
before update on public.restaurant_memberships
for each row execute procedure public.set_updated_at();

update public.users
set email = auth_users.email
from auth.users as auth_users
where auth_users.id = public.users.id
  and public.users.email is null;

insert into public.restaurant_memberships (restaurant_id, user_id, role, permissions)
select
  restaurants.id,
  restaurants.owner_user_id,
  'owner',
  jsonb_build_object(
    'can_manage_menu', true,
    'can_manage_tables', true,
    'can_manage_qr', true,
    'can_manage_staff', true,
    'can_view_analytics', true,
    'can_manage_settings', true,
    'can_manage_orders', true
  )
from public.restaurants
on conflict (restaurant_id, user_id) do nothing;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, full_name, email, role)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.email,
    'owner'
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    email = excluded.email,
    updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select is_platform_admin from public.users where id = auth.uid()), false)
$$;

create or replace function public.is_restaurant_member(target_restaurant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_platform_admin()
    or exists (
      select 1
      from public.restaurant_memberships
      where restaurant_id = target_restaurant_id
        and user_id = auth.uid()
    )
$$;

create or replace function public.has_restaurant_permission(target_restaurant_id uuid, permission_key text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_platform_admin()
    or exists (
      select 1
      from public.restaurant_memberships
      where restaurant_id = target_restaurant_id
        and user_id = auth.uid()
        and (
          role in ('owner', 'manager')
          or coalesce((permissions ->> permission_key)::boolean, false)
        )
    )
$$;

alter table public.restaurant_memberships enable row level security;

create policy "restaurant_memberships_select_member"
on public.restaurant_memberships for select
to authenticated
using (
  public.is_platform_admin()
  or user_id = auth.uid()
  or public.has_restaurant_permission(restaurant_id, 'can_manage_staff')
);

create policy "restaurant_memberships_manage_staff"
on public.restaurant_memberships for all
to authenticated
using (
  public.is_platform_admin()
  or public.has_restaurant_permission(restaurant_id, 'can_manage_staff')
)
with check (
  public.is_platform_admin()
  or public.has_restaurant_permission(restaurant_id, 'can_manage_staff')
);

grant select, insert, update, delete on table public.restaurant_memberships to authenticated, service_role;

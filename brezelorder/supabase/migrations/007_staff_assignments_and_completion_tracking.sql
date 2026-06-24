alter table public.restaurant_tables
  add column if not exists assigned_membership_id uuid null
    references public.restaurant_memberships (id) on delete set null;

create index if not exists idx_restaurant_tables_assigned_membership
  on public.restaurant_tables (assigned_membership_id);

alter table public.orders
  add column if not exists served_at timestamptz null,
  add column if not exists served_by_membership_id uuid null
    references public.restaurant_memberships (id) on delete set null;

create index if not exists idx_orders_served_by_membership
  on public.orders (served_by_membership_id);

alter table public.staff_calls
  add column if not exists completed_by_membership_id uuid null
    references public.restaurant_memberships (id) on delete set null;

create index if not exists idx_staff_calls_completed_by_membership
  on public.staff_calls (completed_by_membership_id);

update public.orders
set served_at = updated_at
where status = 'served'
  and served_at is null;


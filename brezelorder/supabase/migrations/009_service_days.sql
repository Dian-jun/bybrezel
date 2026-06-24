create table if not exists public.restaurant_service_days (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  service_date date not null,
  opened_at timestamptz not null default timezone('utc', now()),
  closed_at timestamptz null,
  opened_by_user_id uuid null references public.users (id) on delete set null,
  closed_by_user_id uuid null references public.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_service_days_restaurant_date
  on public.restaurant_service_days (restaurant_id, service_date desc);

create unique index if not exists idx_service_days_single_open_per_restaurant
  on public.restaurant_service_days (restaurant_id)
  where closed_at is null;

drop trigger if exists set_service_days_updated_at on public.restaurant_service_days;
create trigger set_service_days_updated_at before update on public.restaurant_service_days
for each row execute procedure public.set_updated_at();

alter table public.restaurant_service_days enable row level security;

create policy "service_days_select_for_members"
on public.restaurant_service_days for select
to authenticated
using (public.is_restaurant_member(restaurant_id));

create policy "service_days_insert_for_members"
on public.restaurant_service_days for insert
to authenticated
with check (public.is_restaurant_member(restaurant_id));

create policy "service_days_update_for_members"
on public.restaurant_service_days for update
to authenticated
using (public.is_restaurant_member(restaurant_id))
with check (public.is_restaurant_member(restaurant_id));

alter table public.orders
  add column if not exists service_day_id uuid null references public.restaurant_service_days (id) on delete set null;

alter table public.staff_calls
  add column if not exists service_day_id uuid null references public.restaurant_service_days (id) on delete set null;

with activity_dates as (
  select restaurant_id, (created_at at time zone 'Europe/Berlin')::date as service_date
  from public.orders
  union
  select restaurant_id, (created_at at time zone 'Europe/Berlin')::date as service_date
  from public.staff_calls
)
insert into public.restaurant_service_days (restaurant_id, service_date, opened_at, closed_at)
select
  restaurant_id,
  service_date,
  (service_date::timestamp at time zone 'Europe/Berlin'),
  ((service_date::timestamp + interval '23 hours 59 minutes') at time zone 'Europe/Berlin')
from activity_dates
on conflict do nothing;

update public.orders o
set service_day_id = rsd.id
from public.restaurant_service_days rsd
where o.service_day_id is null
  and rsd.restaurant_id = o.restaurant_id
  and rsd.service_date = (o.created_at at time zone 'Europe/Berlin')::date;

update public.staff_calls sc
set service_day_id = rsd.id
from public.restaurant_service_days rsd
where sc.service_day_id is null
  and rsd.restaurant_id = sc.restaurant_id
  and rsd.service_date = (sc.created_at at time zone 'Europe/Berlin')::date;

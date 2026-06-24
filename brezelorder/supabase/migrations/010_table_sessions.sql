create table if not exists public.table_sessions (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  table_id uuid not null references public.restaurant_tables(id) on delete cascade,
  service_day_id uuid references public.restaurant_service_days(id) on delete set null,
  status text not null default 'open' check (status in ('open', 'checkout_requested', 'paid', 'closed')),
  opened_at timestamptz not null default now(),
  checkout_requested_at timestamptz,
  paid_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists table_sessions_restaurant_idx
  on public.table_sessions (restaurant_id, opened_at desc);

create index if not exists table_sessions_table_idx
  on public.table_sessions (table_id, opened_at desc);

create unique index if not exists table_sessions_one_open_per_table_idx
  on public.table_sessions (table_id)
  where closed_at is null;

create or replace function public.set_table_sessions_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_table_sessions_updated_at on public.table_sessions;
create trigger set_table_sessions_updated_at
before update on public.table_sessions
for each row execute function public.set_table_sessions_updated_at();

alter table public.table_sessions enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'table_sessions'
      and policyname = 'members can read table sessions'
  ) then
    create policy "members can read table sessions"
      on public.table_sessions
      for select
      using (
        exists (
          select 1
          from public.users
          where users.id = auth.uid()
            and users.restaurant_id = table_sessions.restaurant_id
        )
      );
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'table_sessions'
      and policyname = 'members can update table sessions'
  ) then
    create policy "members can update table sessions"
      on public.table_sessions
      for update
      using (
        exists (
          select 1
          from public.users
          where users.id = auth.uid()
            and users.restaurant_id = table_sessions.restaurant_id
        )
      )
      with check (
        exists (
          select 1
          from public.users
          where users.id = auth.uid()
            and users.restaurant_id = table_sessions.restaurant_id
        )
      );
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'table_sessions'
      and policyname = 'members can insert table sessions'
  ) then
    create policy "members can insert table sessions"
      on public.table_sessions
      for insert
      with check (
        exists (
          select 1
          from public.users
          where users.id = auth.uid()
            and users.restaurant_id = table_sessions.restaurant_id
        )
      );
  end if;
end
$$;

alter table public.orders
  add column if not exists table_session_id uuid references public.table_sessions(id) on delete set null,
  add column if not exists guest_token text;

alter table public.staff_calls
  add column if not exists table_session_id uuid references public.table_sessions(id) on delete set null,
  add column if not exists guest_token text;

create index if not exists orders_table_session_idx
  on public.orders (table_session_id, created_at desc);

create index if not exists orders_guest_token_idx
  on public.orders (guest_token);

create index if not exists staff_calls_table_session_idx
  on public.staff_calls (table_session_id, created_at desc);

with session_sources as (
  select
    o.restaurant_id,
    o.table_id,
    o.service_day_id,
    o.created_at as activity_at,
    null::text as call_type
  from public.orders o
  where o.table_session_id is null

  union all

  select
    c.restaurant_id,
    c.table_id,
    c.service_day_id,
    c.created_at as activity_at,
    c.call_type::text as call_type
  from public.staff_calls c
  where c.table_session_id is null
),
grouped_sources as (
  select
    source.restaurant_id,
    source.table_id,
    source.service_day_id,
    min(source.activity_at) as opened_at,
    min(source.activity_at) filter (where source.call_type = 'request_bill') as checkout_requested_at,
    bool_or(source.call_type = 'request_bill') as requested_bill
  from session_sources source
  group by source.restaurant_id, source.table_id, source.service_day_id
)
insert into public.table_sessions (
  restaurant_id,
  table_id,
  service_day_id,
  status,
  opened_at,
  checkout_requested_at,
  closed_at,
  created_at,
  updated_at
)
select
  grouped.restaurant_id,
  grouped.table_id,
  grouped.service_day_id,
  case
    when service_days.closed_at is not null then 'closed'
    when grouped.requested_bill then 'checkout_requested'
    else 'open'
  end,
  grouped.opened_at,
  grouped.checkout_requested_at,
  service_days.closed_at,
  grouped.opened_at,
  coalesce(service_days.closed_at, grouped.opened_at)
from grouped_sources grouped
left join public.restaurant_service_days service_days
  on service_days.id = grouped.service_day_id
where not exists (
  select 1
  from public.table_sessions existing
  where existing.restaurant_id = grouped.restaurant_id
    and existing.table_id = grouped.table_id
    and existing.service_day_id is not distinct from grouped.service_day_id
);

update public.orders o
set table_session_id = ts.id
from public.table_sessions ts
where o.table_session_id is null
  and ts.restaurant_id = o.restaurant_id
  and ts.table_id = o.table_id
  and ts.service_day_id is not distinct from o.service_day_id;

update public.staff_calls c
set table_session_id = ts.id
from public.table_sessions ts
where c.table_session_id is null
  and ts.restaurant_id = c.restaurant_id
  and ts.table_id = c.table_id
  and ts.service_day_id is not distinct from c.service_day_id;

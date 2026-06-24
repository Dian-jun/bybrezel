create table if not exists public.pricing_inquiries (
  id uuid primary key default gen_random_uuid(),
  restaurant_name text not null,
  city text null,
  contact_name text not null,
  email text not null,
  phone text null,
  desired_plan text not null,
  staff_count integer null,
  status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'won', 'lost')),
  source text null,
  notes text null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists pricing_inquiries_status_idx
  on public.pricing_inquiries (status);

create index if not exists pricing_inquiries_created_at_idx
  on public.pricing_inquiries (created_at desc);

alter table public.pricing_inquiries enable row level security;

create trigger set_pricing_inquiries_updated_at
before update on public.pricing_inquiries
for each row execute function public.set_updated_at();

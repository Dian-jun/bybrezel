alter table public.menu_items
  add column if not exists image_url text null;

create table if not exists public.menu_item_variants (
  id uuid primary key default gen_random_uuid(),
  menu_item_id uuid not null references public.menu_items (id) on delete cascade,
  name text not null,
  price_cents integer not null check (price_cents >= 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_menu_item_variants_menu_item_sort
  on public.menu_item_variants (menu_item_id, sort_order);

drop trigger if exists set_menu_item_variants_updated_at on public.menu_item_variants;
create trigger set_menu_item_variants_updated_at
before update on public.menu_item_variants
for each row execute procedure public.set_updated_at();

alter table public.menu_item_variants enable row level security;

create policy "menu_item_variants_public_read"
on public.menu_item_variants for select
to anon, authenticated
using (
  exists (
    select 1
    from public.menu_items
    join public.restaurants on restaurants.id = menu_items.restaurant_id
    where menu_items.id = menu_item_variants.menu_item_id
      and (
        (menu_items.is_visible = true and restaurants.is_live = true)
        or public.is_restaurant_member(menu_items.restaurant_id)
      )
  )
);

create policy "menu_item_variants_manage_member"
on public.menu_item_variants for all
to authenticated
using (
  exists (
    select 1
    from public.menu_items
    where menu_items.id = menu_item_variants.menu_item_id
      and public.is_restaurant_member(menu_items.restaurant_id)
  )
)
with check (
  exists (
    select 1
    from public.menu_items
    where menu_items.id = menu_item_variants.menu_item_id
      and public.is_restaurant_member(menu_items.restaurant_id)
  )
);

grant select, insert, update, delete on table public.menu_item_variants to authenticated, service_role;
grant select on table public.menu_item_variants to anon;

alter table public.order_items
  add column if not exists menu_item_variant_id uuid null references public.menu_item_variants (id) on delete set null,
  add column if not exists variant_name_snapshot text null;

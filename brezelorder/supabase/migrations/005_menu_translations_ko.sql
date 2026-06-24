alter table public.menu_categories
  add column if not exists name_ko text null,
  add column if not exists description_ko text null;

alter table public.menu_items
  add column if not exists name_ko text null,
  add column if not exists description_ko text null;

alter table public.menu_item_variants
  add column if not exists name_ko text null;

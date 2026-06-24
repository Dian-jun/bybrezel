alter table public.order_items
  add column if not exists item_note text null,
  add column if not exists allergy_note text null;

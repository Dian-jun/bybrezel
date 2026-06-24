alter table public.restaurants
  add column if not exists floorplan_image_url text;

alter table public.restaurant_tables
  add column if not exists pos_rotation integer;

update public.restaurant_tables
set pos_rotation = coalesce(pos_rotation, 0);

alter table public.restaurant_tables
  alter column pos_rotation set default 0;

alter table public.restaurant_tables
  alter column pos_rotation set not null;

alter table public.restaurant_tables
  add column if not exists pos_x integer,
  add column if not exists pos_y integer,
  add column if not exists pos_w integer,
  add column if not exists pos_h integer;

with ranked_tables as (
  select
    id,
    row_number() over (order by sort_order asc, created_at asc) - 1 as idx
  from public.restaurant_tables
)
update public.restaurant_tables rt
set
  pos_x = coalesce(rt.pos_x, (ranked.idx % 4) * 3),
  pos_y = coalesce(rt.pos_y, (ranked.idx / 4) * 3),
  pos_w = coalesce(rt.pos_w, 2),
  pos_h = coalesce(rt.pos_h, 2)
from ranked_tables ranked
where ranked.id = rt.id;

alter table public.restaurant_tables
  alter column pos_x set default 0,
  alter column pos_y set default 0,
  alter column pos_w set default 2,
  alter column pos_h set default 2;

update public.restaurant_tables
set
  pos_x = coalesce(pos_x, 0),
  pos_y = coalesce(pos_y, 0),
  pos_w = coalesce(pos_w, 2),
  pos_h = coalesce(pos_h, 2);

alter table public.restaurant_tables
  alter column pos_x set not null,
  alter column pos_y set not null,
  alter column pos_w set not null,
  alter column pos_h set not null;

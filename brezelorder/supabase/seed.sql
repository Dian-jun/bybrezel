insert into public.menu_categories (restaurant_id, name, description, sort_order)
select id, 'Brezeln', 'Freshly baked pretzel classics', 1
from public.restaurants
where slug = 'demo-brezel'
on conflict do nothing;

insert into public.menu_categories (restaurant_id, name, description, sort_order)
select id, 'Drinks', 'Beer, soft drinks, and water', 2
from public.restaurants
where slug = 'demo-brezel'
on conflict do nothing;

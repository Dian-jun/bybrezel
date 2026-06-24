grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on table public.users to authenticated, service_role;
grant select, insert, update, delete on table public.restaurants to authenticated, service_role;
grant select, insert, update, delete on table public.restaurant_tables to authenticated, service_role;
grant select, insert, update, delete on table public.menu_categories to authenticated, service_role;
grant select, insert, update, delete on table public.menu_items to authenticated, service_role;
grant select, insert, update, delete on table public.orders to authenticated, service_role;
grant select, insert, update, delete on table public.order_items to authenticated, service_role;
grant select, insert, update, delete on table public.staff_calls to authenticated, service_role;

grant select on table public.restaurants to anon;
grant select on table public.restaurant_tables to anon;
grant select on table public.menu_categories to anon;
grant select on table public.menu_items to anon;

grant usage, select on all sequences in schema public to anon, authenticated, service_role;

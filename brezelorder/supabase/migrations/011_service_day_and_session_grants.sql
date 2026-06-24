grant select, insert, update, delete
on table public.restaurant_service_days
to authenticated, service_role;

grant select, insert, update, delete
on table public.table_sessions
to authenticated, service_role;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'pricing_inquiries'
      and column_name = 'staff_count'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'pricing_inquiries'
      and column_name = 'table_count'
  ) then
    alter table public.pricing_inquiries
      rename column staff_count to table_count;
  end if;
end $$;

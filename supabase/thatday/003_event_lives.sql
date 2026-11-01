-- Inline discovery: public, moderated stories plus only the caller's own drafts.
begin;
create index if not exists thatday_memories_event on public.thatday_remembered_events(event_id);
create index if not exists thatday_lives_related on public.thatday_personal_records(event_id,date_start,id) where relation='related' and visibility='public' and moderation_status='published';
create or replace function public.thatday_event_lives(p_event_id text,p_group text default 'related',p_offset integer default 0,p_limit integer default 5)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare ev public.thatday_historical_events; lim integer:=least(greatest(coalesce(p_limit,5),1),20); offst integer:=least(greatest(coalesce(p_offset,0),0),100000); uid uuid:=auth.uid();
begin
 if p_group is null or p_group not in ('related','same_day') then raise exception '기록 관계를 확인해 주세요.';end if;
 select * into ev from public.thatday_historical_events where id=p_event_id and verification_status in ('verified','curated_sample');
 if not found then raise exception '공개된 사건을 찾을 수 없습니다.';end if;
 return (with matches as (
 select r.id,r.event_id,r.relation,r.date_start,r.date_end,r.date_precision,r.original_text,r.presentation_style,r.visibility,r.moderation_status,r.created_at,p.display_name,(r.user_id=uid) is_own
 from public.thatday_personal_records r join public.thatday_profiles p on p.id=r.user_id
 where ((r.visibility='public' and r.moderation_status='published') or r.user_id=uid)
 and ((p_group='related' and r.event_id=ev.id and r.relation='related')
 or (p_group='same_day' and ev.date_precision='day' and r.date_precision='day' and r.date_start=ev.date_start and (r.event_id is null or r.relation='same_date')))
 ),page as(select * from matches order by date_start,id offset offst limit lim)
 select jsonb_build_object('records',coalesce((select jsonb_agg(to_jsonb(x) order by date_start,id) from page x),'[]'::jsonb),
 'next',case when (select count(*) from matches)>offst+lim then offst+lim else null end,
 'participants',(select count(*) from public.thatday_remembered_events where event_id=ev.id),
 'same_day_available',ev.date_precision='day'));
end $$;
revoke all on function public.thatday_event_lives(text,text,integer,integer) from public;
grant execute on function public.thatday_event_lives(text,text,integer,integer) to anon,authenticated;
commit;

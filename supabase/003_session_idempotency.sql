alter table public.study_sessions add column if not exists client_key text;
create unique index if not exists study_sessions_user_client_key_uidx
on public.study_sessions(user_id, client_key)
where client_key is not null;

create or replace function public.finish_study_session(
  p_active_ms integer,
  p_questions_worked integer,
  p_first_try_correct integer,
  p_pace_ms integer default null,
  p_target_low integer default null,
  p_target_high integer default null,
  p_client_key text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  u uuid := auth.uid();
  n integer;
begin
  if u is null then raise exception 'authentication required'; end if;
  insert into public.user_progress(user_id) values(u) on conflict do nothing;

  if p_client_key is not null and exists(
    select 1 from public.study_sessions where user_id=u and client_key=p_client_key
  ) then
    return (select to_jsonb(x) from public.user_progress x where x.user_id=u);
  end if;

  select completed_sessions+1 into n from public.user_progress where user_id=u for update;

  insert into public.study_sessions(
    user_id,session_number,active_ms,questions_worked,first_try_correct,
    pace_ms,target_low,target_high,client_key
  ) values(
    u,n,p_active_ms,p_questions_worked,p_first_try_correct,
    p_pace_ms,p_target_low,p_target_high,p_client_key
  );

  update public.user_progress set
    completed_sessions=n,
    total_active_ms=total_active_ms+p_active_ms,
    updated_at=now()
  where user_id=u;

  perform public.evaluate_achievements(u);
  return (select to_jsonb(x) from public.user_progress x where x.user_id=u);
end;
$$;

revoke execute on function public.finish_study_session(integer,integer,integer,integer,integer,integer,text) from public, anon;
grant execute on function public.finish_study_session(integer,integer,integer,integer,integer,integer,text) to authenticated;

revoke execute on function public.record_attempt(text,text,boolean,integer,text) from public, anon;
revoke execute on function public.import_local_state(jsonb,integer,bigint,text) from public, anon;
revoke execute on function public.save_position(text,text) from public, anon;
revoke execute on function public.evaluate_achievements(uuid) from public, anon;

grant execute on function public.record_attempt(text,text,boolean,integer,text) to authenticated;
grant execute on function public.import_local_state(jsonb,integer,bigint,text) to authenticated;
grant execute on function public.save_position(text,text) to authenticated;

-- Cloud sync helpers layered on top of schema.sql

create or replace function public.save_position(
  p_question_id text,
  p_topic_id text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare u uuid := auth.uid();
begin
  if u is null then raise exception 'authentication required'; end if;
  insert into public.user_progress(user_id,current_question_id,current_topic_id)
  values(u,p_question_id,p_topic_id)
  on conflict(user_id) do update set
    current_question_id=excluded.current_question_id,
    current_topic_id=excluded.current_topic_id,
    updated_at=now();
end;
$$;

grant execute on function public.save_position(text,text) to authenticated;

create or replace function public.import_local_state(
  p_questions jsonb,
  p_completed_sessions integer default 0,
  p_total_active_ms bigint default 0,
  p_current_question_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  u uuid := auth.uid();
  item jsonb;
  qid text;
  selected text;
  first_ok boolean;
  solved_ok boolean;
  tries integer;
begin
  if u is null then raise exception 'authentication required'; end if;
  insert into public.profiles(id) values(u) on conflict do nothing;
  insert into public.user_progress(user_id) values(u) on conflict do nothing;

  if jsonb_typeof(coalesce(p_questions,'[]'::jsonb)) = 'array' then
    for item in select value from jsonb_array_elements(coalesce(p_questions,'[]'::jsonb)) loop
      qid := nullif(item->>'id','');
      if qid is null then continue; end if;
      selected := nullif(item->>'last_selected','');
      first_ok := coalesce((item->>'first_correct')::boolean,false);
      solved_ok := coalesce((item->>'solved')::boolean,false);
      tries := greatest(1,coalesce((item->>'attempts')::integer,1));

      insert into public.question_progress(
        user_id,question_id,first_answer,latest_answer,first_correct,solved,attempt_count
      ) values(
        u,qid,selected,selected,first_ok,solved_ok,tries
      )
      on conflict(user_id,question_id) do update set
        latest_answer=coalesce(excluded.latest_answer,public.question_progress.latest_answer),
        solved=public.question_progress.solved or excluded.solved,
        attempt_count=greatest(public.question_progress.attempt_count,excluded.attempt_count),
        updated_at=now();
    end loop;
  end if;

  update public.user_progress p set
    unique_questions=s.unique_questions,
    solved_questions=s.solved_questions,
    first_try_correct=s.first_try_correct,
    total_attempts=s.total_attempts,
    completed_sessions=greatest(p.completed_sessions,greatest(0,p_completed_sessions)),
    total_active_ms=greatest(p.total_active_ms,greatest(0,p_total_active_ms)),
    current_question_id=coalesce(p_current_question_id,p.current_question_id),
    updated_at=now()
  from (
    select
      count(*)::integer as unique_questions,
      count(*) filter(where solved)::integer as solved_questions,
      count(*) filter(where first_correct)::integer as first_try_correct,
      coalesce(sum(attempt_count),0)::integer as total_attempts
    from public.question_progress
    where user_id=u
  ) s
  where p.user_id=u;

  perform public.evaluate_achievements(u);
  return (select to_jsonb(x) from public.user_progress x where x.user_id=u);
end;
$$;

grant execute on function public.import_local_state(jsonb,integer,bigint,text) to authenticated;

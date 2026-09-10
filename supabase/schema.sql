-- PRONABEC Razonamiento Verbal · persistent learner progress
-- PostgreSQL / Supabase

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  total_questions integer not null default 280,
  unique_questions integer not null default 0,
  solved_questions integer not null default 0,
  first_try_correct integer not null default 0,
  total_attempts integer not null default 0,
  completed_sessions integer not null default 0,
  total_active_ms bigint not null default 0,
  current_question_id text,
  current_topic_id text,
  updated_at timestamptz not null default now()
);

create table if not exists public.question_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id text not null,
  first_answer text,
  latest_answer text,
  first_correct boolean,
  solved boolean not null default false,
  attempt_count integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, question_id)
);

create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id text not null,
  selected_answer text not null,
  correct boolean not null,
  active_ms integer,
  created_at timestamptz not null default now()
);

create index if not exists attempts_user_created_idx
on public.attempts(user_id, created_at desc);

create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_number integer not null,
  active_ms integer not null,
  questions_worked integer not null default 0,
  first_try_correct integer not null default 0,
  pace_ms integer,
  target_low integer,
  target_high integer,
  finished_at timestamptz not null default now()
);

create index if not exists study_sessions_user_finished_idx
on public.study_sessions(user_id, finished_at desc);

create table if not exists public.achievements (
  user_id uuid not null references auth.users(id) on delete cascade,
  code text not null,
  unlocked_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  primary key (user_id, code)
);

alter table public.profiles enable row level security;
alter table public.user_progress enable row level security;
alter table public.question_progress enable row level security;
alter table public.attempts enable row level security;
alter table public.study_sessions enable row level security;
alter table public.achievements enable row level security;

create policy "profiles select own" on public.profiles for select using (auth.uid() = id);
create policy "profiles update own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "progress select own" on public.user_progress for select using (auth.uid() = user_id);
create policy "question progress select own" on public.question_progress for select using (auth.uid() = user_id);
create policy "attempts select own" on public.attempts for select using (auth.uid() = user_id);
create policy "sessions select own" on public.study_sessions for select using (auth.uid() = user_id);
create policy "achievements select own" on public.achievements for select using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles(id) values (new.id) on conflict do nothing;
  insert into public.user_progress(user_id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.evaluate_achievements(p_user uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare p public.user_progress%rowtype;
begin
  select * into p from public.user_progress where user_id = p_user;
  if not found then return; end if;

  if p.unique_questions >= 1 then insert into public.achievements(user_id,code) values(p_user,'first_step') on conflict do nothing; end if;
  if p.unique_questions >= 10 then insert into public.achievements(user_id,code) values(p_user,'questions_10') on conflict do nothing; end if;
  if p.unique_questions >= 25 then insert into public.achievements(user_id,code) values(p_user,'questions_25') on conflict do nothing; end if;
  if p.unique_questions >= 50 then insert into public.achievements(user_id,code) values(p_user,'questions_50') on conflict do nothing; end if;
  if p.unique_questions >= 100 then insert into public.achievements(user_id,code) values(p_user,'questions_100') on conflict do nothing; end if;
  if p.unique_questions >= 140 then insert into public.achievements(user_id,code) values(p_user,'halfway') on conflict do nothing; end if;
  if p.unique_questions >= 280 then insert into public.achievements(user_id,code) values(p_user,'complete_book') on conflict do nothing; end if;
  if p.completed_sessions >= 1 then insert into public.achievements(user_id,code) values(p_user,'session_1') on conflict do nothing; end if;
  if p.completed_sessions >= 5 then insert into public.achievements(user_id,code) values(p_user,'sessions_5') on conflict do nothing; end if;
  if p.completed_sessions >= 10 then insert into public.achievements(user_id,code) values(p_user,'sessions_10') on conflict do nothing; end if;
  if p.unique_questions >= 20 and p.first_try_correct::numeric/greatest(p.unique_questions,1) >= .70 then insert into public.achievements(user_id,code) values(p_user,'precision_70') on conflict do nothing; end if;
  if p.unique_questions >= 50 and p.first_try_correct::numeric/greatest(p.unique_questions,1) >= .85 then insert into public.achievements(user_id,code) values(p_user,'precision_85') on conflict do nothing; end if;
end;
$$;

create or replace function public.record_attempt(
  p_question_id text,
  p_selected_answer text,
  p_correct boolean,
  p_active_ms integer default null,
  p_topic_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  u uuid := auth.uid();
  prior public.question_progress%rowtype;
  was_seen boolean := false;
  was_solved boolean := false;
begin
  if u is null then raise exception 'authentication required'; end if;

  insert into public.profiles(id) values(u) on conflict do nothing;
  insert into public.user_progress(user_id) values(u) on conflict do nothing;

  select * into prior from public.question_progress where user_id=u and question_id=p_question_id;
  was_seen := found;
  if was_seen then was_solved := prior.solved; end if;

  insert into public.attempts(user_id,question_id,selected_answer,correct,active_ms)
  values(u,p_question_id,p_selected_answer,p_correct,p_active_ms);

  insert into public.question_progress(user_id,question_id,first_answer,latest_answer,first_correct,solved,attempt_count)
  values(u,p_question_id,p_selected_answer,p_selected_answer,p_correct,p_correct,1)
  on conflict(user_id,question_id) do update set
    latest_answer=excluded.latest_answer,
    solved=public.question_progress.solved or excluded.solved,
    attempt_count=public.question_progress.attempt_count+1,
    updated_at=now();

  update public.user_progress set
    unique_questions=unique_questions + case when was_seen then 0 else 1 end,
    solved_questions=solved_questions + case when (not was_solved) and p_correct then 1 else 0 end,
    first_try_correct=first_try_correct + case when (not was_seen) and p_correct then 1 else 0 end,
    total_attempts=total_attempts+1,
    current_question_id=p_question_id,
    current_topic_id=p_topic_id,
    updated_at=now()
  where user_id=u;

  perform public.evaluate_achievements(u);
  return (select to_jsonb(x) from public.user_progress x where x.user_id=u);
end;
$$;

create or replace function public.finish_study_session(
  p_active_ms integer,
  p_questions_worked integer,
  p_first_try_correct integer,
  p_pace_ms integer default null,
  p_target_low integer default null,
  p_target_high integer default null
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
  select completed_sessions+1 into n from public.user_progress where user_id=u for update;

  insert into public.study_sessions(user_id,session_number,active_ms,questions_worked,first_try_correct,pace_ms,target_low,target_high)
  values(u,n,p_active_ms,p_questions_worked,p_first_try_correct,p_pace_ms,p_target_low,p_target_high);

  update public.user_progress set
    completed_sessions=n,
    total_active_ms=total_active_ms+p_active_ms,
    updated_at=now()
  where user_id=u;

  perform public.evaluate_achievements(u);
  return (select to_jsonb(x) from public.user_progress x where x.user_id=u);
end;
$$;

grant execute on function public.record_attempt(text,text,boolean,integer,text) to authenticated;
grant execute on function public.finish_study_session(integer,integer,integer,integer,integer,integer) to authenticated;

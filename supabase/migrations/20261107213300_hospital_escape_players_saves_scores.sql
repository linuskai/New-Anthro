-- Hospital Escape: players without accounts. Each device holds a random secret (also its transfer code);
-- only its SHA-256 is stored. Tables are closed to clients; everything goes through the hx_* functions below.
create extension if not exists pgcrypto with schema extensions;

create table public.players (
  id uuid primary key default gen_random_uuid(),
  name text not null default '' check (char_length(name) <= 24),
  avatar text not null default '🧑‍⚕️' check (char_length(avatar) <= 16),
  auth_user uuid unique references auth.users(id) on delete set null, -- prepared: a real account (e-mail) later
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.player_tokens (
  token_hash text primary key,
  player_id uuid not null references public.players(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index player_tokens_player on public.player_tokens (player_id);
create table public.saves (
  player_id uuid primary key references public.players(id) on delete cascade,
  data jsonb not null check (pg_column_size(data) < 65536),
  updated_at timestamptz not null default now()
);
create table public.scores (
  player_id uuid not null references public.players(id) on delete cascade,
  mission text not null check (mission ~ '^[a-z_]{2,16}$'),
  score integer not null check (score between 0 and 100000),
  minutes integer not null check (minutes between 0 and 2000),
  rank text not null default '' check (char_length(rank) <= 4),
  updated_at timestamptz not null default now(),
  primary key (player_id, mission)
);
create index scores_board_score on public.scores (mission, score desc);
create index scores_board_time on public.scores (mission, minutes asc);

alter table public.players enable row level security;
alter table public.player_tokens enable row level security;
alter table public.saves enable row level security;
alter table public.scores enable row level security;
revoke all on public.players, public.player_tokens, public.saves, public.scores from anon, authenticated;

-- internal helpers (not callable by clients)
create or replace function public.hx_hash(p_token text) returns text
language sql immutable set search_path = '' as $$ select encode(extensions.digest(p_token, 'sha256'), 'hex') $$;

create or replace function public.hx_player(p_token text, p_create boolean default false) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_id uuid;
begin
  if p_token is null or p_token !~ '^[0-9a-f]{32,64}$' then raise exception 'invalid token'; end if;
  select player_id into v_id from public.player_tokens where token_hash = public.hx_hash(p_token);
  if v_id is null and p_create then
    insert into public.players default values returning id into v_id;
    insert into public.player_tokens (token_hash, player_id) values (public.hx_hash(p_token), v_id);
  end if;
  return v_id;
end $$;

create or replace function public.hx_clean(p text, n int) returns text
language sql immutable set search_path = '' as $$ select left(btrim(regexp_replace(coalesce(p, ''), '[[:cntrl:]<>]', '', 'g')), n) $$;

create or replace function public.hx_state(v_id uuid) returns json
language sql stable security definer set search_path = '' as $$
  select json_build_object(
    'name', p.name, 'avatar', p.avatar, 'account', p.auth_user is not null,
    'best', coalesce((select json_object_agg(s.mission, json_build_object('score', s.score, 'minutes', s.minutes, 'rank', s.rank)) from public.scores s where s.player_id = p.id), '{}'::json),
    'save', (select sv.data from public.saves sv where sv.player_id = p.id))
  from public.players p where p.id = v_id $$;

-- client API
create or replace function public.hx_sync(p_token text, p_name text default null, p_avatar text default null) returns json
language plpgsql security definer set search_path = '' as $$
declare v_id uuid := public.hx_player(p_token, true);
begin
  update public.players set
    name = case when p_name is null then name else public.hx_clean(p_name, 24) end,
    avatar = case when p_avatar is null or public.hx_clean(p_avatar, 16) = '' then avatar else public.hx_clean(p_avatar, 16) end,
    updated_at = now()
  where id = v_id;
  return public.hx_state(v_id);
end $$;

create or replace function public.hx_save(p_token text, p_data jsonb) returns void
language plpgsql security definer set search_path = '' as $$
declare v_id uuid := public.hx_player(p_token, true);
begin
  if p_data is null then delete from public.saves where player_id = v_id; return; end if;
  insert into public.saves (player_id, data, updated_at) values (v_id, p_data, now())
  on conflict (player_id) do update set data = excluded.data, updated_at = now();
end $$;

create or replace function public.hx_submit(p_token text, p_mission text, p_score integer, p_minutes integer, p_rank text default '') returns json
language plpgsql security definer set search_path = '' as $$
declare v_id uuid := public.hx_player(p_token, true); v_old public.scores;
begin
  select * into v_old from public.scores where player_id = v_id and mission = p_mission;
  insert into public.scores (player_id, mission, score, minutes, rank, updated_at)
  values (v_id, p_mission, greatest(0, least(p_score, 100000)), greatest(0, least(p_minutes, 2000)), public.hx_clean(p_rank, 4), now())
  on conflict (player_id, mission) do update set
    rank = case when excluded.score > public.scores.score then excluded.rank else public.scores.rank end,
    score = greatest(public.scores.score, excluded.score),
    minutes = least(public.scores.minutes, excluded.minutes),
    updated_at = now();
  return json_build_object('new_score', v_old is null or p_score > v_old.score, 'new_time', v_old is null or p_minutes < v_old.minutes);
end $$;

create or replace function public.hx_board(p_mission text, p_sort text default 'score', p_token text default null)
returns table (pos bigint, name text, avatar text, score integer, minutes integer, rank text, me boolean)
language sql stable security definer set search_path = '' as $$
  with me as (select pt.player_id from public.player_tokens pt where p_token is not null and pt.token_hash = public.hx_hash(p_token)),
  ranked as (
    select row_number() over (order by case when p_sort = 'time' then s.minutes end asc, case when p_sort = 'time' then null else s.score end desc, s.updated_at) as pos,
      p.name, p.avatar, s.score, s.minutes, s.rank, s.player_id = (select player_id from me) as me
    from public.scores s join public.players p on p.id = s.player_id where s.mission = p_mission)
  select pos, name, avatar, score, minutes, rank, coalesce(me, false) from ranked where pos <= 25 or me order by pos $$;

-- prepared for real accounts: once someone signs in with Supabase Auth, link this device's player to the account,
-- and on a new device after signing in, claim the same player there.
create or replace function public.hx_link_account(p_token text) returns json
language plpgsql security definer set search_path = '' as $$
declare v_id uuid := public.hx_player(p_token, true);
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  update public.players set auth_user = auth.uid(), updated_at = now() where id = v_id and (auth_user is null or auth_user = auth.uid());
  return public.hx_state(v_id);
end $$;
create or replace function public.hx_claim_device(p_token text) returns json
language plpgsql security definer set search_path = '' as $$
declare v_id uuid;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if p_token is null or p_token !~ '^[0-9a-f]{32,64}$' then raise exception 'invalid token'; end if;
  select id into v_id from public.players where auth_user = auth.uid();
  if v_id is null then return null; end if;
  insert into public.player_tokens (token_hash, player_id) values (public.hx_hash(p_token), v_id) on conflict (token_hash) do update set player_id = excluded.player_id;
  return public.hx_state(v_id);
end $$;

revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on function public.hx_sync(text, text, text), public.hx_save(text, jsonb), public.hx_submit(text, text, integer, integer, text),
  public.hx_board(text, text, text) to anon, authenticated;
grant execute on function public.hx_link_account(text), public.hx_claim_device(text) to authenticated;

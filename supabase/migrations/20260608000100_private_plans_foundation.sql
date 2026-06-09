begin;

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.systems (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  category text not null default '',
  icon_key text not null default 'target',
  color text not null default '#7F00FF',
  description text,
  status text not null default 'active' check (status in ('active', 'paused', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

create table if not exists public.routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  system_id uuid not null,
  name text not null check (char_length(trim(name)) > 0),
  icon_key text not null default 'target',
  cadence text not null default 'daily',
  start_date date not null default current_date,
  schedule_days text[] not null default '{}',
  target_amount numeric,
  unit text,
  reminder_time time,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  constraint routines_system_owner_fk
    foreign key (system_id, user_id)
    references public.systems(id, user_id)
    on delete cascade,
  constraint routines_schedule_days_check
    check (
      schedule_days <@ array[
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday'
      ]::text[]
    ),
  constraint routines_target_amount_check
    check (target_amount is null or target_amount >= 0)
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  system_id uuid not null,
  name text not null check (char_length(trim(name)) > 0),
  current_amount numeric not null default 0 check (current_amount >= 0),
  target_amount numeric not null check (target_amount > 0),
  unit text not null default '',
  status text not null default 'active' check (status in ('active', 'completed', 'paused')),
  deadline date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  constraint goals_system_owner_fk
    foreign key (system_id, user_id)
    references public.systems(id, user_id)
    on delete cascade
);

create table if not exists public.completion_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  system_id uuid not null,
  routine_id uuid,
  goal_id uuid,
  daily_action_id text,
  occurred_on date not null,
  status text not null check (status in ('planned', 'completed', 'missed')),
  planned_amount numeric,
  actual_amount numeric,
  unit text,
  reason text,
  source text not null default 'user' check (source in ('user', 'auto')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint completion_logs_system_owner_fk
    foreign key (system_id, user_id)
    references public.systems(id, user_id)
    on delete cascade,
  constraint completion_logs_routine_owner_fk
    foreign key (routine_id, user_id)
    references public.routines(id, user_id)
    on delete cascade,
  constraint completion_logs_goal_owner_fk
    foreign key (goal_id, user_id)
    references public.goals(id, user_id)
    on delete cascade,
  constraint completion_logs_amounts_check
    check (
      (planned_amount is null or planned_amount >= 0)
      and (actual_amount is null or actual_amount >= 0)
    )
);

create table if not exists public.reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  system_id uuid not null,
  routine_id uuid,
  goal_id uuid,
  daily_action_id text,
  occurred_on date not null,
  status text check (status is null or status in ('planned', 'completed', 'missed')),
  body text not null check (char_length(trim(body)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reflections_system_owner_fk
    foreign key (system_id, user_id)
    references public.systems(id, user_id)
    on delete cascade,
  constraint reflections_routine_owner_fk
    foreign key (routine_id, user_id)
    references public.routines(id, user_id)
    on delete cascade,
  constraint reflections_goal_owner_fk
    foreign key (goal_id, user_id)
    references public.goals(id, user_id)
    on delete cascade
);

create index if not exists systems_user_id_idx on public.systems(user_id);
create index if not exists routines_user_system_idx on public.routines(user_id, system_id);
create index if not exists goals_user_system_idx on public.goals(user_id, system_id);
create index if not exists completion_logs_user_date_idx on public.completion_logs(user_id, occurred_on desc);
create index if not exists completion_logs_system_date_idx on public.completion_logs(system_id, occurred_on desc);
create index if not exists reflections_user_date_idx on public.reflections(user_id, occurred_on desc);
create index if not exists reflections_system_date_idx on public.reflections(system_id, occurred_on desc);

create unique index if not exists completion_logs_daily_action_date_unique
  on public.completion_logs(user_id, daily_action_id, occurred_on)
  where daily_action_id is not null;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists systems_set_updated_at on public.systems;
create trigger systems_set_updated_at
before update on public.systems
for each row execute function public.set_updated_at();

drop trigger if exists routines_set_updated_at on public.routines;
create trigger routines_set_updated_at
before update on public.routines
for each row execute function public.set_updated_at();

drop trigger if exists goals_set_updated_at on public.goals;
create trigger goals_set_updated_at
before update on public.goals
for each row execute function public.set_updated_at();

drop trigger if exists completion_logs_set_updated_at on public.completion_logs;
create trigger completion_logs_set_updated_at
before update on public.completion_logs
for each row execute function public.set_updated_at();

drop trigger if exists reflections_set_updated_at on public.reflections;
create trigger reflections_set_updated_at
before update on public.reflections
for each row execute function public.set_updated_at();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

insert into public.profiles (user_id, display_name, avatar_url)
select
  users.id,
  coalesce(users.raw_user_meta_data ->> 'full_name', users.raw_user_meta_data ->> 'name'),
  users.raw_user_meta_data ->> 'avatar_url'
from auth.users as users
on conflict (user_id) do nothing;

revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;

alter table public.profiles enable row level security;
alter table public.systems enable row level security;
alter table public.routines enable row level security;
alter table public.goals enable row level security;
alter table public.completion_logs enable row level security;
alter table public.reflections enable row level security;

revoke all on table public.profiles from anon;
revoke all on table public.systems from anon;
revoke all on table public.routines from anon;
revoke all on table public.goals from anon;
revoke all on table public.completion_logs from anon;
revoke all on table public.reflections from anon;

grant select, insert, update, delete on table public.profiles to authenticated;
grant select, insert, update, delete on table public.systems to authenticated;
grant select, insert, update, delete on table public.routines to authenticated;
grant select, insert, update, delete on table public.goals to authenticated;
grant select, insert, update, delete on table public.completion_logs to authenticated;
grant select, insert, update, delete on table public.reflections to authenticated;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles',
    'systems',
    'routines',
    'goals',
    'completion_logs',
    'reflections'
  ]
  loop
    execute format('drop policy if exists "Users can select own rows" on public.%I', table_name);
    execute format('drop policy if exists "Users can insert own rows" on public.%I', table_name);
    execute format('drop policy if exists "Users can update own rows" on public.%I', table_name);
    execute format('drop policy if exists "Users can delete own rows" on public.%I', table_name);

    execute format(
      'create policy "Users can select own rows" on public.%I for select to authenticated using ((select auth.uid()) = user_id)',
      table_name
    );
    execute format(
      'create policy "Users can insert own rows" on public.%I for insert to authenticated with check ((select auth.uid()) = user_id)',
      table_name
    );
    execute format(
      'create policy "Users can update own rows" on public.%I for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)',
      table_name
    );
    execute format(
      'create policy "Users can delete own rows" on public.%I for delete to authenticated using ((select auth.uid()) = user_id)',
      table_name
    );
  end loop;
end;
$$;

commit;

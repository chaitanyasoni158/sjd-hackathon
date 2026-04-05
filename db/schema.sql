-- =========================
-- EXTENSIONS
-- =========================
create extension if not exists "uuid-ossp";

-- =========================
-- TRIGGER FUNCTION (updated_at auto-update)
-- =========================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- =========================
-- TABLES
-- =========================

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  age integer check (age is null or age between 13 and 120),
  sleep_goal_hours numeric(4,1) check (sleep_goal_hours is null or sleep_goal_hours between 0 and 24),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  daily_reminder_time time,
  focus_area text,
  theme text not null default 'dark' check (theme in ('light', 'dark')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.mood_check_ins (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mood text not null,
  intensity smallint not null check (intensity between 1 and 10),
  note text,
  checked_in_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.journal_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  body text not null,
  mood text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.habit_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null default current_date,
  habit_type text not null,
  value_numeric numeric(8,2),
  value_text text,
  unit text,
  target_value numeric(8,2),
  progress_percent smallint check (progress_percent is null or progress_percent between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint habit_logs_value_present check (value_numeric is not null or value_text is not null),
  constraint habit_logs_unique_per_day unique (user_id, log_date, habit_type)
);

create table public.assessment_submissions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  submitted_at timestamptz not null default now(),
  wellness_score smallint not null check (wellness_score between 0 and 100),
  anxiety_level text not null,
  sadness_level text not null,
  risk_level text not null,
  summary_text text,
  created_at timestamptz not null default now()
);

create table public.assessment_answers (
  id uuid primary key default uuid_generate_v4(),
  submission_id uuid not null references public.assessment_submissions(id) on delete cascade,
  question_order smallint not null,
  question_text text not null,
  selected_option_text text not null,
  selected_option_score smallint,
  created_at timestamptz not null default now(),
  constraint assessment_answers_unique_question_per_submission unique (submission_id, question_order)
);

create table public.user_alerts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  alert_type text not null,
  severity text not null,
  title text not null,
  message text not null,
  action_url text,
  is_read boolean not null default false,
  triggered_at timestamptz not null default now(),
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

-- =========================
-- TRIGGERS (updated_at)
-- =========================

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger set_preferences_updated_at
before update on public.user_preferences
for each row execute function public.set_updated_at();

create trigger set_journal_updated_at
before update on public.journal_entries
for each row execute function public.set_updated_at();

create trigger set_habits_updated_at
before update on public.habit_logs
for each row execute function public.set_updated_at();

-- =========================
-- INDEXES
-- =========================

create index idx_mood_user_time
  on public.mood_check_ins (user_id, checked_in_at desc);

create index idx_journal_user_time
  on public.journal_entries (user_id, created_at desc);

create index idx_habit_user_date
  on public.habit_logs (user_id, log_date desc);

create index idx_assessment_user_time
  on public.assessment_submissions (user_id, submitted_at desc);

create index idx_answers_submission
  on public.assessment_answers (submission_id, question_order);

create index idx_alerts_user_read
  on public.user_alerts (user_id, is_read, triggered_at desc);

-- =========================
-- RLS
-- =========================

alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.mood_check_ins enable row level security;
alter table public.journal_entries enable row level security;
alter table public.habit_logs enable row level security;
alter table public.assessment_submissions enable row level security;
alter table public.assessment_answers enable row level security;
alter table public.user_alerts enable row level security;

-- GENERIC OWNER POLICIES

create policy "users own profiles"
on public.profiles for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "users own preferences"
on public.user_preferences for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "users own mood"
on public.mood_check_ins for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "users own journal"
on public.journal_entries for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "users own habits"
on public.habit_logs for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "users own submissions"
on public.assessment_submissions for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "users own alerts"
on public.user_alerts for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- SPECIAL CASE (answers via submission ownership)

create policy "users own answers"
on public.assessment_answers for all
using (
  exists (
    select 1 from public.assessment_submissions s
    where s.id = submission_id
    and s.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.assessment_submissions s
    where s.id = submission_id
    and s.user_id = auth.uid()
  )
);
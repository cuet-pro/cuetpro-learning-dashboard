-- ═══════════════════════════════════════════════════════════════
-- CUET Pro — attempt persistence (Previous Year Papers + Mocks)
-- Run this in the Supabase SQL editor (or a migration runner).
--
-- The frontend currently persists attempts to localStorage, which works
-- end-to-end today (timer is derived from `started_at`, so closing the tab
-- never pauses it). To make the timer SERVER-authoritative and enable
-- cross-device resume, create these tables and sync `started_at` +
-- `time_remaining_seconds` from the server on each load.
-- ═══════════════════════════════════════════════════════════════

-- 5 NTA statuses for question_attempts.status
create type if not exists question_status as enum (
  'not_visited',
  'not_answered',
  'answered',
  'marked',
  'answered_marked'
);

create table if not exists public.mock_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  paper_id uuid not null,               -- pyq_papers.id (or mock_tests id)
  paper_name text,
  started_at timestamptz not null default now(),
  submitted_at timestamptz,             -- set on submit / auto-submit
  time_remaining_seconds integer,       -- server-computed remaining on save
  duration_seconds integer not null,
  answers jsonb not null default '{}'::jsonb,   -- { question_num: 'A'..'D' }
  marked jsonb not null default '[]'::jsonb,    -- [question_num, ...]
  summary jsonb,
  blur_count integer not null default 0,
  status text not null default 'in_progress',   -- in_progress | submitted
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.question_attempts (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.mock_attempts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  paper_id uuid not null,
  question_num integer not null,
  selected_option text,                 -- 'A'..'D', or null
  status question_status not null default 'not_visited',
  marked_for_review boolean not null default false,
  time_taken_seconds numeric not null default 0,  -- accumulated across visits
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (attempt_id, question_num)
);

create index if not exists mock_attempts_user_idx on public.mock_attempts (user_id, paper_id);
create index if not exists question_attempts_attempt_idx on public.question_attempts (attempt_id);

-- RLS: students read/write only their own attempts
alter table public.mock_attempts enable row level security;
alter table public.question_attempts enable row level security;

drop policy if exists "own mock_attempts" on public.mock_attempts;
create policy "own mock_attempts" on public.mock_attempts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own question_attempts" on public.question_attempts;
create policy "own question_attempts" on public.question_attempts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- ═══════════════════════════════════════════════════════════════
-- CUET Pro — PYQ vocabulary questions (real previous-year questions)
-- Extracted from the English notes dashboard (CHAPTERS.vocabulary.pyqBank).
-- Powers the "Word list" PYQ-tagged question cards in the dashboard.
--
-- Topics: analogies, antonyms, synonyms, idioms, word-usage, spelling,
-- foreign-words, phrasal-verbs, rearranging + gr-literary-devices.
-- 1,377 questions total (CUET English 2022–2024), each with 4 options,
-- an answer index, difficulty, source paper and explanation.
-- ═══════════════════════════════════════════════════════════════

create table if not exists public.pyq_vocab_questions (
  id uuid primary key default gen_random_uuid(),
  topic text not null,
  question text not null,
  options jsonb not null default '[]'::jsonb,
  answer_index integer not null,
  difficulty text,
  source text,
  explanation text,
  created_at timestamptz not null default now()
);

create index if not exists pyq_vocab_questions_topic_idx
  on public.pyq_vocab_questions (topic);

-- Public read (questions are study content; the anon key can SELECT).
alter table public.pyq_vocab_questions enable row level security;
drop policy if exists "public read pyq_vocab_questions" on public.pyq_vocab_questions;
create policy "public read pyq_vocab_questions" on public.pyq_vocab_questions
  for select using (true);
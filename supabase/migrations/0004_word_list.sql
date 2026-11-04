-- ═══════════════════════════════════════════════════════════════
-- CUET Pro — Word list / Word bank (rebuild)
-- Data model per the word-list build spec:
--   vocab_entries      → word/term bank (842 entries across 9 categories)
--   user_vocab_progress→ per-user Learned toggle + mistake count
--   user_bookmarks     → per-user bookmarks (words AND questions)
--   pyq_vocab_questions→ PYQ questions (created in 0003_pyq_vocab_questions.sql)
--
-- Synonyms & Antonyms share one 409-word list stored as category 'word';
-- `pyq_in` marks which bank(s) each word was asked in (149 synonyms / 156 antonyms).
-- Prefix/Suffix & Root words are migrated from the existing `vocab_words` table.
-- ═══════════════════════════════════════════════════════════════

create table if not exists public.vocab_entries (
  id text primary key,
  category text not null,            -- word | idioms | spelling | phrasal-verbs |
                                      -- foreign-words | literary-devices | prefix | suffix | root
  term text not null,
  meaning text,
  synonyms jsonb not null default '[]'::jsonb,
  antonyms jsonb not null default '[]'::jsonb,
  example text,
  wrong_spelling text,
  tip text,
  origin text,
  examples jsonb not null default '[]'::jsonb,
  level text,                        -- Easy | Medium | Hard
  is_high_yield boolean not null default false,
  pyq_in jsonb not null default '[]'::jsonb,  -- ['synonyms'] / ['antonyms'] / both
  created_at timestamptz not null default now()
);
create index if not exists vocab_entries_category_idx on public.vocab_entries (category);

create table if not exists public.user_vocab_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_id text not null references public.vocab_entries(id) on delete cascade,
  learned boolean not null default false,
  mistakes integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, entry_id)
);

create table if not exists public.user_bookmarks (
  user_id uuid not null references auth.users(id) on delete cascade,
  item_type text not null,           -- 'entry' | 'question'
  item_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, item_type, item_id)
);

-- RLS: entries public-read; progress + bookmarks per-user only.
alter table public.vocab_entries enable row level security;
alter table public.user_vocab_progress enable row level security;
alter table public.user_bookmarks enable row level security;

drop policy if exists "public read vocab_entries" on public.vocab_entries;
create policy "public read vocab_entries" on public.vocab_entries for select using (true);

drop policy if exists "own vocab progress" on public.user_vocab_progress;
create policy "own vocab progress" on public.user_vocab_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own bookmarks" on public.user_bookmarks;
create policy "own bookmarks" on public.user_bookmarks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- ═══════════════════════════════════════════════════════════════
-- CUET Pro — anonymous paper leaderboard (rank, percentile, scores)
-- Powers the post-submit analytics page: Rank tile, "what if" note,
-- score distribution and percentile. Requires 0001_attempt_tables.sql
-- first (mock_attempts must exist and be populated on submit).
--
-- Design notes:
--   • Aggregates are ANONYMOUS — counts + scores only, never names/user_ids.
--   • Rank & distribution use each student's FIRST attempt (retries don't
--     skew the leaderboard); a student's later retries still show for them.
--   • SECURITY DEFINER so the RPC can read other students' rows under RLS,
--     but it only ever returns numbers, never identifiers.
--   • The histogram is computed client-side from `scores` (see
--     src/lib/analytics.js `histogram`), so the RPC stays thin and cacheable.
-- ═══════════════════════════════════════════════════════════════

create index if not exists mock_attempts_paper_status_idx
  on public.mock_attempts (paper_id, status, submitted_at);

-- One leaderboard row: { total, rank, my_score, scores[] } for a paper.
create or replace function public.paper_leaderboard(p_paper_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  total int;
  my_score numeric;
  my_rank int := 1;
  scores jsonb;
begin
  -- total students who attempted this paper (first attempt each)
  select count(*) into total
  from (
    select distinct on (user_id) user_id
    from public.mock_attempts
    where paper_id = p_paper_id and status = 'submitted'
    order by user_id, submitted_at asc
  ) t;

  -- the calling student's first-attempt score
  select coalesce((summary->>'marks')::numeric, 0) into my_score
  from public.mock_attempts
  where paper_id = p_paper_id and status = 'submitted' and user_id = auth.uid()
  order by submitted_at asc
  limit 1;

  -- sorted first-attempt scores (desc) for the whole paper
  select coalesce(jsonb_agg(score order by score desc), '[]'::jsonb) into scores
  from (
    select distinct on (user_id) coalesce((summary->>'marks')::numeric, 0) as score
    from public.mock_attempts
    where paper_id = p_paper_id and status = 'submitted'
    order by user_id, submitted_at asc
  ) s;

  -- 1-based rank, ties share the same rank
  select count(*) + 1 into my_rank
  from jsonb_array_elements(coalesce(scores, '[]'::jsonb)) x
  where x.value::numeric > my_score;

  return jsonb_build_object(
    'total', total,
    'rank', my_rank,
    'my_score', my_score,
    'scores', scores
  );
end;
$$;

revoke all on function public.paper_leaderboard(uuid) from public;
grant execute on function public.paper_leaderboard(uuid) to authenticated;
/* ── PYQ/mock analytics helpers (pure, framework-free) ──
   These compute rank, percentile, histogram and the "what if" scenario from a
   list of first-attempt scores. Today the frontend has no server leaderboard,
   so callers pass `null`/`[]` and render the friendly empty states; the same
   functions consume the Postgres aggregate (see supabase/migrations) once it
   ships. Everything is deterministic and unit-testable. */

/* 1-based competition rank: ties share the same (highest) rank. */
export function rankOf(score, others) {
  const all = [...others, score].sort((a, b) => b - a)
  return all.indexOf(score) + 1
}

/* Top-N% (shown only when total ≥ 20). rank 1 of 124 → Top 1%. */
export function percentileOf(rank, total) {
  if (!total || total < 1) return null
  return Math.max(1, Math.round((rank / total) * 100))
}

/* Histogram of first-attempt scores. Bins span from the lowest observed score
   (can be negative) up to maxScore, `binWidth` wide. */
export function histogram(scores, binWidth, maxScore) {
  if (!scores || !scores.length) return []
  const lo = Math.min(...scores)
  const start = Math.floor(lo / binWidth) * binWidth
  const bins = []
  for (let x = start; x < maxScore; x += binWidth) {
    const hi = Math.min(x + binWidth, maxScore)
    bins.push({ lo: x, hi, count: scores.filter(s => s >= x && s < hi).length })
    if (hi >= maxScore) break
  }
  return bins
}

export function peakBin(bins) {
  let best = null
  bins.forEach(b => { if (!best || b.count > best.count) best = b })
  return best
}

/* "What if" note: score without negative marks, the rank that score would earn,
   and the rank delta (Z = current rank − Y). */
export function whatIf(currentRank, correct, sc, others) {
  const x = correct * sc.correct
  const y = 1 + (others || []).filter(s => s > x).length
  return { x, y, z: currentRank - y }
}

/* ── spotlight-tile tints ── */
export function attemptRateTint(rate) {
  if (rate >= 70) return 'good'
  if (rate >= 40) return 'avg'
  return 'bad'
}
export function accuracyTint(acc) {
  if (acc >= 75) return 'good'
  if (acc >= 50) return 'avg'
  return 'bad'
}
/* share = |negative marks| ÷ max marks, as a percent. */
export function negMarksTint(sharePct) {
  if (sharePct <= 2) return 'good'
  if (sharePct <= 6) return 'avg'
  return 'bad'
}

export const TINT_LABEL = { good: 'Good', avg: 'Average', bad: 'Needs work' }

/* Colour-coding is always paired with a word so it is never colour-alone. */
export const OUTCOME_TINT = { correct: 'good', wrong: 'bad', skipped: 'skip' }
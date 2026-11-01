/* ── PYQ/mock attempt engine (pure helpers + localStorage persistence) ──
   Timestamps are the source of truth for the timer: remaining time is derived
   from `started_at`, so closing the tab does not pause the clock. The same
   fields map 1:1 onto the server tables (mock_attempts.started_at /
   time_remaining_seconds) once they exist — see the migration file. */

export const PQ_LETTERS = 'ABCD'

export const STATUS = {
  NOT_VISITED: 'not_visited',
  NOT_ANSWERED: 'not_answered',
  ANSWERED: 'answered',
  MARKED: 'marked',
  ANSWERED_MARKED: 'answered_marked',
}

export const STATUS_LABEL = {
  not_visited: 'Not visited',
  not_answered: 'Not answered',
  answered: 'Answered',
  marked: 'Marked for review',
  answered_marked: 'Answered & marked',
}

/* Marking scheme — read from paper config when present, else CUET defaults. */
export function markingScheme(paper) {
  return { correct: paper?.correct_marks ?? 5, wrong: paper?.negative_marks ?? -1 }
}

export function paperDurationSeconds(paper) {
  return Math.round((paper?.duration_min || 45) * 60)
}

export function statusOf(num, answers, marked, visited) {
  if (marked.has(num)) return answers[num] ? STATUS.ANSWERED_MARKED : STATUS.MARKED
  if (answers[num]) return STATUS.ANSWERED
  if (visited.has(num)) return STATUS.NOT_ANSWERED
  return STATUS.NOT_VISITED
}

export function countStatuses(questions, answers, marked, visited) {
  const c = { not_visited: 0, not_answered: 0, answered: 0, marked: 0, answered_marked: 0 }
  questions.forEach(q => { c[statusOf(q.num, answers, marked, visited)]++ })
  return c
}

/* Marked-with-answer is counted as answered for scoring (NTA rule). */
export function computeSummary(questions, answers, scheme) {
  let c = 0, w = 0, u = 0
  questions.forEach(q => {
    const a = answers[q.num]
    if (!a) { u++; return }
    if (PQ_LETTERS.indexOf(a) === q.answer_index) c++
    else w++
  })
  return {
    c, w, u,
    total: questions.length,
    marks: c * scheme.correct + w * scheme.wrong,
    totalMarks: questions.length * scheme.correct,
    acc: questions.length ? Math.round((c / questions.length) * 100) : 0,
  }
}

export function fmtClock(s) {
  s = Math.max(0, Math.floor(s || 0))
  const m = Math.floor(s / 60)
  const sec = s % 60
  return String(m).padStart(2, '0') + ':' + String(sec).padStart(2, '0')
}

/* ── submitted-attempt history (the "My attempts" list) ── */
const HISTORY_KEY = 'cp_pyq_attempts'
export function loadPyqAttempts() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]') } catch { return [] }
}
export function savePyqAttempts(list) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(list)) } catch { /* ignore */ }
}

/* ── in-progress attempt (resume) ── */
const STATE_KEY = 'cp_pyq_inprogress'
export function loadAttemptState(paperId) {
  try { return JSON.parse(localStorage.getItem(STATE_KEY) || '{}')[paperId] || null } catch { return null }
}
export function saveAttemptState(paperId, state) {
  try {
    const all = JSON.parse(localStorage.getItem(STATE_KEY) || '{}')
    all[paperId] = state
    localStorage.setItem(STATE_KEY, JSON.stringify(all))
  } catch { /* ignore */ }
}
export function clearAttemptState(paperId) {
  try {
    const all = JSON.parse(localStorage.getItem(STATE_KEY) || '{}')
    delete all[paperId]
    localStorage.setItem(STATE_KEY, JSON.stringify(all))
  } catch { /* ignore */ }
}
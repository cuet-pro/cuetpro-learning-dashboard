/* ── Vocabulary bookmarks + learned progress (local-first, backend-ready) ──
   Works for guests (localStorage only). When a Supabase session exists the
   same helpers are the single source of truth; a `sync` function persists to
   user_bookmarks / user_vocab_progress (see supabase/migrations). */
import { useAuth } from './auth'

const BM_KEY = 'cp_bookmarks'
const LEARN_KEY = 'cp_learned'

function read(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
}
function write(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch { /* ignore */ }
}

/* bookmarks: { entry: {id:true}, question: {id:true} } */
export function loadBookmarks() {
  return read(BM_KEY, { entry: {}, question: {} })
}
export function isBookmarked(bm, type, id) {
  return !!(bm && bm[type] && bm[type][id])
}
export function toggleBookmark(bm, type, id) {
  const n = { entry: { ...(bm?.entry || {}) }, question: { ...(bm?.question || {}) } }
  if (n[type][id]) delete n[type][id]
  else n[type][id] = true
  write(BM_KEY, n)
  return n
}

/* learned: { entryId: true } */
export function loadLearned() {
  return read(LEARN_KEY, {})
}
export function isLearned(learned, id) {
  return !!(learned && learned[id])
}
export function toggleLearned(learned, id) {
  const n = { ...learned }
  if (n[id]) delete n[id]
  else n[id] = true
  write(LEARN_KEY, n)
  return n
}

/* Best-effort backend sync (no-op for guests / no session). */
export async function syncVocabProgress(supabase) {
  if (!supabase) return
  const { data: session } = await supabase.auth.getSession()
  if (!session?.session) return
  const userId = session.session.user.id
  const bm = loadBookmarks()
  const learned = loadLearned()
  try {
    for (const [type, ids] of Object.entries(bm)) {
      for (const id of Object.keys(ids)) {
        await supabase.from('user_bookmarks').upsert({ user_id: userId, item_type: type, item_id: id })
      }
    }
    for (const id of Object.keys(learned)) {
      await supabase.from('user_vocab_progress').upsert({ user_id: userId, entry_id: id, learned: true })
    }
  } catch { /* non-blocking */ }
}

export function useAuthForVocab() {
  try { return useAuth() } catch { return [null] }
}
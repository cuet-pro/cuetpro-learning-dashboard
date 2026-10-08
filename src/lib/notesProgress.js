/* Notes reading progress — per subject, in localStorage, plus the one-shot
   URL deep link (?subject=&book=&ch=&topic=) used for Resume / back-button. */

export const NOTES_PROG_KEY = 'cp_notes_progress'

export function readNotesProgress(label) {
  try { return (JSON.parse(localStorage.getItem(NOTES_PROG_KEY) || '{}')[label]) || null } catch { return null }
}

export function writeNotesProgress(label, prog) {
  try {
    const all = JSON.parse(localStorage.getItem(NOTES_PROG_KEY) || '{}')
    all[label] = { ...prog, ts: Date.now() }
    localStorage.setItem(NOTES_PROG_KEY, JSON.stringify(all))
  } catch { /* ignore */ }
}

export function lastReadSubject() {
  try {
    const all = JSON.parse(localStorage.getItem(NOTES_PROG_KEY) || '{}')
    let best = null, ts = 0
    for (const k in all) if (all[k] && all[k].ts > ts) { best = k; ts = all[k].ts }
    return best
  } catch { return null }
}

/* Deep link captured once at boot. Applied on the first Study Kit mount, then
   consumed by the first navigation so in-app sidebar navigation never re-triggers it. */
const LINK = (() => {
  try {
    const p = new URLSearchParams(window.location.search)
    const ch = p.get('ch')
    if (!ch) return null
    const subject = p.get('subject') || lastReadSubject()
    return subject ? { subject, book: p.get('book'), ch, topic: p.get('topic') } : null
  } catch { return null }
})()

let consumed = false

export function notesDeepLink() { return consumed ? null : LINK }
export function consumeNotesDeepLink() { consumed = true }

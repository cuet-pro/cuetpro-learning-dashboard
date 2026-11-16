/* ── GAT Notes data + progress ──
   Built from gat-notes.json (3 sections, 34 topics) + the per-topic
   interactive cheat-sheet HTML already stored in Supabase `cheat_sheets`. */

import index from '../data/gatNotes/index.json'
import { fetchCheatSheet } from './content'

export function getGatIndex() {
  return index
}

export async function loadGatTopicNotes(cheatNum) {
  if (!cheatNum) return ''
  const { data } = await fetchCheatSheet(cheatNum)
  return data?.html || ''
}

export function priorityClass(priority) {
  if (priority === 'HIGH') return 'high'
  if (priority === 'MED') return 'med'
  return 'low'
}

/* ── progress (per-topic done + resume) — localStorage ── */
const GAT_PROG_KEY = 'cp_gat_progress'

export function readGatProgress() {
  try { return JSON.parse(localStorage.getItem(GAT_PROG_KEY) || 'null') || {} } catch { return {} }
}
export function writeGatProgress(prog) {
  try { localStorage.setItem(GAT_PROG_KEY, JSON.stringify(prog)) } catch { /* ignore */ }
}
export function toggleGatTopicDone(topicId) {
  const p = readGatProgress()
  const done = Array.isArray(p.done) ? [...p.done] : []
  const i = done.indexOf(topicId)
  i >= 0 ? done.splice(i, 1) : done.push(topicId)
  writeGatProgress({ ...p, done })
  return !(i >= 0)
}

/* one-shot deep link: ?subject=General%20Test&topic=<topicId> */
let gatLinkConsumed = false
export function gatDeepLink() {
  if (gatLinkConsumed) return null
  try {
    const p = new URLSearchParams(window.location.search)
    if (decodeURIComponent(p.get('subject') || '') !== 'General Test') return null
    const topic = p.get('topic')
    if (!topic) return null
    return { topic }
  } catch { return null }
}
export function consumeGatDeepLink() { gatLinkConsumed = true }
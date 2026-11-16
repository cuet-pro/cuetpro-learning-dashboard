/* ── GAT Notes data + progress ──
   Built from gat-notes.json (3 sections, 34 topics) + the per-topic
   interactive cheat-sheet HTML already stored in Supabase `cheat_sheets`. */

import index from '../data/gatNotes/index.json'
import { fetchCheatSheet } from './content'

export function getGatIndex() {
  return index
}

/* real notes content — split per section, lazy-loaded */
const notesLoaders = {
  'general-knowledge': () => import('../data/gatNotes/notes-general-knowledge.json'),
  'quantitative-aptitude': () => import('../data/gatNotes/notes-quantitative-aptitude.json'),
  'logical-reasoning': () => import('../data/gatNotes/notes-logical-reasoning.json'),
}

export async function loadGatTopicNotes(sectionId, topicId) {
  const loader = notesLoaders[sectionId]
  if (!loader) return ''
  const m = await loader()
  return m.default[topicId] || ''
}

/* cheat sheet (interactive) — still available as a second tab */
export async function loadGatCheatSheet(cheatNum) {
  if (!cheatNum) return ''
  const { data } = await fetchCheatSheet(cheatNum)
  return data?.html || ''
}

export function priorityClass(priority) {
  if (priority === 'HIGH') return 'high'
  if (priority === 'MED') return 'med'
  return 'low'
}

/* strip sprite-icon <svg> refs (need a sprite sheet we don't ship),
   keep self-contained <svg class="br-map"> topic maps. */
export function sanitizeGatNotesHtml(html) {
  return String(html || '')
    .replace(/<svg class="ico[^"]*"[\s\S]*?<\/svg>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\s(href|src)\s*=\s*("javascript:[^"]*"|'javascript:[^']*')/gi, '')
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
/* ── English Notes data loader (lazy, code-split per chapter) ──
   The full portal JSON (~2.6 MB) is split into a small tree index + one file
   per chapter, so opening Notes never loads the whole bank at once. */

import index from '../data/englishNotes/index.json'

const chapterLoaders = {
  'reading-comprehension': () => import('../data/englishNotes/chapter-reading-comprehension.json'),
  'vocabulary': () => import('../data/englishNotes/chapter-vocabulary.json'),
  'grammar': () => import('../data/englishNotes/chapter-grammar.json'),
}

export function getEnglishIndex() {
  return index
}

export async function loadEnglishChapter(chapterId) {
  const loader = chapterLoaders[chapterId]
  if (!loader) return null
  const m = await loader()
  return m.default
}

/* importance pill from avg questions-per-paper (matches the portal's own scale) */
export function importanceOf(frequency) {
  if (frequency == null) return 'LOW'
  if (frequency >= 2) return 'HIGH'
  if (frequency >= 0.8) return 'MED'
  return 'LOW'
}

/* chapter weight dot from avgPerPaper */
export function chapterWeight(avgPerPaper) {
  if (avgPerPaper >= 20) return 'high'
  if (avgPerPaper >= 10) return 'medium'
  return 'low'
}

/* Minimal sanitizer for the notes HTML (static content from the source portal).
   Strips script/style tags and inline event handlers; keeps the structural
   markup the styles target. */
export function sanitizeNotesHtml(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<svg[\s\S]*?<\/svg>/gi, '')          // strip sprite icons (no sprite sheet here)
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\s(href|src)\s*=\s*("javascript:[^"]*"|'javascript:[^']*')/gi, '')
}
/* ── English Cheat Sheets data loader (lazy per chapter) ──
   28 visual cheat sheets parsed from the CUET Pro English cheat-sheet doc. */

import { getEnglishIndex } from './englishNotes'

const loaders = {
  'reading-comprehension': () => import('../data/englishCheats/cheats-reading-comprehension.json'),
  'vocabulary': () => import('../data/englishCheats/cheats-vocabulary.json'),
  'grammar': () => import('../data/englishCheats/cheats-grammar.json'),
}

export function getEnglishCheatIndex() {
  return getEnglishIndex()
}

export async function loadEnglishCheat(chapterId, topicId) {
  const loader = loaders[chapterId]
  if (!loader) return null
  const m = await loader()
  return m.default[topicId] || null
}

/* print a cheat sheet (or an arbitrary HTML doc) cleanly — shared print root */
export function printCheatHtml(html, title) {
  let root = document.getElementById('printRoot')
  if (!root) { root = document.createElement('div'); root.id = 'printRoot'; document.body.appendChild(root) }
  root.innerHTML = '<div class="rv-sheet"><div class="rv-head"><div><div class="rv-kick">CUET UG English · Cheat Sheet</div><h3>' +
    (title || '') + '</h3></div><span class="rv-brand">CUET Pro</span></div>' + html + '</div>'
  document.body.classList.add('printing')
  const done = () => { document.body.classList.remove('printing'); root.innerHTML = ''; window.removeEventListener('afterprint', done) }
  window.addEventListener('afterprint', done)
  setTimeout(() => window.print(), 80)
}
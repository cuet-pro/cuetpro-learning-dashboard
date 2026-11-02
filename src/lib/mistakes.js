/* ── Smart Revision · Mistake Replay store ──
   Every wrong question from a submitted PYQ/mock is auto-added here. Smart
   Revision's Mistake Replay reads this list to replay questions the student
   got wrong, with spaced-repetition timing on top. */
import { todayISO } from './spacedRepetition'

const KEY = 'cp_mistakes'

export function loadMistakes() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}

/* Add wrong questions, deduped by paperId + question num. Returns the number of
   NEW mistakes added (for the confirmation toast). */
export function addMistakes(items) {
  const list = loadMistakes()
  const seen = new Set(list.map(m => m.paperId + ':' + m.num))
  let added = 0
  items.forEach(it => {
    const k = it.paperId + ':' + it.num
    if (seen.has(k)) return
    seen.add(k)
    added++
    list.unshift({
      id: k,
      paperId: it.paperId,
      paperName: it.paperName,
      num: it.num,
      topic: it.topic,
      section: it.section,
      question: it.question,
      options: it.options,
      answer_index: it.answer_index,
      explanation: it.explanation,
      difficulty: it.difficulty,
      selected: it.selected,
      addedOn: todayISO(),
    })
  })
  try { localStorage.setItem(KEY, JSON.stringify(list.slice(0, 400))) } catch { /* ignore */ }
  return added
}

export function clearMistakes() {
  try { localStorage.setItem(KEY, '[]') } catch { /* ignore */ }
}
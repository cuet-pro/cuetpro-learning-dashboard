/* Content backend bridge — fetches learning content (syllabus, vocab, quizzes,
   flashcards, RC passages) from Supabase. Public read; the anon key can SELECT
   these tables directly. This replaces the static src/data/*.js files as the
   source of truth for English content (more subjects to follow). */
import { supabase } from './supabase'

/* Syllabus tree for a subject: subject → sections → topics. */
export async function fetchSyllabus(subjectKey = 'english') {
  const { data, error } = await supabase
    .from('subjects')
    .select('id, key, name, code, sections(id, key, name, order_num, topics(id, key, name, order_num))')
    .eq('key', subjectKey)
    .single()
  return { data, error }
}

/* Vocab words by category: word | root | prefix | suffix. */
export async function fetchVocab(category = null, limit = 50) {
  let q = supabase.from('vocab_words').select('id, word, category, meaning, synonyms, antonyms, difficulty')
  if (category) q = q.eq('category', category)
  q = q.order('word').limit(limit)
  const { data, error } = await q
  return { data, error }
}

/* Quiz questions by topic: synonyms | antonyms | direct-indirect-speech. */
export async function fetchQuiz(topic = null, limit = 20) {
  let q = supabase.from('quiz_questions').select('id, topic, question, options, answer, answer_index, explanation')
  if (topic) q = q.eq('topic', topic)
  q = q.limit(limit)
  const { data, error } = await q
  return { data, error }
}

/* Flashcards by topic. */
/* Word of the Day — one random synonym/antonym question for the daily challenge. */
export async function fetchWordOfTheDay() {
  const { data, error } = await supabase
    .from('quiz_questions')
    .select('id, topic, question, options, answer, answer_index, explanation')
    .in('topic', ['synonyms', 'antonyms'])
    .limit(200)
  if (error || !data || data.length === 0) return { data: null, error }
  const pick = data[Math.floor(Math.random() * data.length)]
  return { data: pick, error: null }
}

/* Daily Subject Quiz — a small shuffled set of MCQs across vocab & grammar topics. */
export async function fetchDailyQuiz(count = 3) {
  const { data, error } = await supabase
    .from('quiz_questions')
    .select('id, topic, question, options, answer, answer_index, explanation')
    .in('topic', ['synonyms', 'antonyms', 'direct-indirect-speech'])
    .limit(200)
  if (error || !data || data.length < count) return { data: null, error }
  const shuffled = [...data].sort(() => Math.random() - 0.5)
  return { data: shuffled.slice(0, count), error: null }
}

export async function fetchFlashcards(topic = null, limit = 30) {
  let q = supabase.from('flashcards').select('id, topic, front, back, order_num')
  if (topic) q = q.eq('topic', topic)
  q = q.order('order_num').limit(limit)
  const { data, error } = await q
  return { data, error }
}

/* Flashcard decks (topics) — fixed order + display names, with live counts. */
const FLASHCARD_TOPICS = [
  { topic: 'antonyms', name: 'Antonyms' },
  { topic: 'synonyms', name: 'Synonyms' },
  { topic: 'direct-indirect-speech', name: 'Direct & Indirect Speech' },
  { topic: 'voice', name: 'Voice (Active & Passive)' },
  { topic: 'tenses', name: 'Tenses' },
  { topic: 'articles', name: 'Articles' },
  { topic: 'subject-verb-agreement', name: 'Subject–Verb Agreement' },
  { topic: 'prefixes', name: 'Prefixes' },
  { topic: 'suffixes', name: 'Suffixes' },
  { topic: 'root-words', name: 'Root Words' },
  { topic: 'syn-ant-guide', name: 'Synonyms & Antonyms Guide' },
  { topic: 'reading-comprehension', name: 'Reading Comprehension' },
]

export async function fetchFlashcardTopics() {
  const { data, error } = await supabase.from('flashcards').select('topic')
  if (error || !data) return { data: FLASHCARD_TOPICS, error }
  const counts = {}
  for (const r of data) counts[r.topic] = (counts[r.topic] || 0) + 1
  return { data: FLASHCARD_TOPICS.map(t => ({ ...t, n: counts[t.topic] || 0 })), error: null }
}

/* RC passages by type: factual | narrative | literary. */
export async function fetchPassages(type = null, limit = 10) {
  let q = supabase.from('rc_passages').select('id, passage_type, title, passage, questions')
  if (type) q = q.eq('passage_type', type)
  q = q.limit(limit)
  const { data, error } = await q
  return { data, error }
}

/* RC of the Day — one random passage (with its questions) for the daily challenge. */
export async function fetchRcPassage() {
  const { data, error } = await supabase
    .from('rc_passages')
    .select('id, passage_type, title, passage, questions')
    .limit(30)
  if (error || !data || data.length === 0) return { data: null, error }
  const pick = data[Math.floor(Math.random() * data.length)]
  return { data: pick, error: null }
}

/* Vocab bank — all vocab_words grouped into UI categories (word/root/prefix/suffix).
   Mirrors the shape of the static VOCAB_CATEGORIES so the Word list modal drops it in
   unchanged. Word-bank meanings are cleaned (space-restored) in the backend. */
const VOCAB_BANK_DEFS = [
  { id: 'word-bank', name: 'Word bank', icon: '🔤', color: '#00C97F', unit: 'words', cat: 'word',
    cols: [{ h: 'Word', f: 'word', star: true }, { h: 'Meaning', f: 'mean' }, { h: 'Synonyms', f: 'syn', join: true }, { h: 'Antonyms', f: 'ant', join: true }] },
  { id: 'roots', name: 'Root words', icon: '🌱', color: '#2F6FDB', unit: 'roots', cat: 'root',
    cols: [{ h: 'Root', f: 'word', star: true }, { h: 'Meaning', f: 'mean' }, { h: 'Origin', f: 'origin' }] },
  { id: 'prefixes', name: 'Prefixes', icon: '🔗', color: '#7C5CFF', unit: 'prefixes', cat: 'prefix',
    cols: [{ h: 'Prefix', f: 'word', star: true }, { h: 'Meaning', f: 'mean' }] },
  { id: 'suffixes', name: 'Suffixes', icon: '🔚', color: '#F5A623', unit: 'suffixes', cat: 'suffix',
    cols: [{ h: 'Suffix', f: 'word', star: true }, { h: 'Meaning', f: 'mean' }, { h: 'Origin', f: 'origin' }] },
]

/* Split a "[Latin]" / "[Greek]" origin tag out of the meaning text so the
   table can show a clean Meaning column + a separate Origin column. */
function splitOrigin(meaning) {
  const m = (meaning || '').trim()
  const tag = m.match(/\[([^\]]+)\]\s*$/)
  if (tag) return { mean: m.slice(0, tag.index).trim(), origin: tag[1] }
  return { mean: m, origin: '' }
}

export async function fetchVocabBank() {
  const { data, error } = await supabase
    .from('vocab_words')
    .select('id, word, category, meaning, synonyms, antonyms, difficulty')
    .limit(1000)
  if (error || !data || data.length === 0) return { data: null, error }
  const byCat = {}
  for (const r of data) (byCat[r.category] ||= []).push(r)
  const categories = VOCAB_BANK_DEFS.map(d => ({
    id: d.id, name: d.name, icon: d.icon, color: d.color, unit: d.unit, cols: d.cols,
    items: (byCat[d.cat] || []).map(r => {
      const { mean, origin } = splitOrigin(r.meaning)
      return { id: r.id, word: r.word, mean, origin, syn: r.synonyms || [], ant: r.antonyms || [], pyq: false }
    }),
  })).filter(c => c.items.length > 0)
  return { data: categories, error: null }
}
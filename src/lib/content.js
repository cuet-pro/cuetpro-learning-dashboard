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

export async function fetchFlashcards(topic = null, limit = 30) {
  let q = supabase.from('flashcards').select('id, topic, front, back, order_num')
  if (topic) q = q.eq('topic', topic)
  q = q.order('order_num').limit(limit)
  const { data, error } = await q
  return { data, error }
}

/* RC passages by type: factual | narrative | literary. */
export async function fetchPassages(type = null, limit = 10) {
  let q = supabase.from('rc_passages').select('id, passage_type, title, passage, questions')
  if (type) q = q.eq('passage_type', type)
  q = q.limit(limit)
  const { data, error } = await q
  return { data, error }
}
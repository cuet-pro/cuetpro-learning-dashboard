/* ── Word List / Vocabulary — simple, structured table view ──
   Category tabs → one word bank table per category.
   Columns: # | Word | Meaning | Synonyms | Antonyms | Level | Action.
   Star (★) = important word, PYQ chip = asked in a real paper. */
import { useEffect, useMemo, useState } from 'react'
import { Search, X, Bookmark, Check, Star } from 'lucide-react'
import { fetchVocabEntries } from '../lib/content'
import {
  loadBookmarks, isBookmarked, toggleBookmark,
  loadLearned, isLearned, toggleLearned,
} from '../lib/vocabProgress'
import './wordlist.css'

const WORD_CATEGORIES = [
  { id: 'synonyms', name: 'Synonyms', source: 'word', emphasize: 'synonyms', unit: 'words' },
  { id: 'antonyms', name: 'Antonyms', source: 'word', emphasize: 'antonyms', unit: 'words' },
  { id: 'idioms', name: 'Idioms', source: 'idioms', unit: 'idioms' },
  { id: 'spelling', name: 'Spelling', source: 'spelling', unit: 'words' },
  { id: 'phrasal-verbs', name: 'Phrasal verbs', source: 'phrasal-verbs', unit: 'verbs' },
  { id: 'foreign-words', name: 'Foreign words', source: 'foreign-words', unit: 'phrases' },
  { id: 'literary-devices', name: 'Literary devices', source: 'literary-devices', unit: 'devices' },
  { id: 'prefix-suffix', name: 'Prefix / Suffix', sources: ['prefix', 'suffix'], unit: 'affixes' },
  { id: 'root-words', name: 'Root words', source: 'root', unit: 'roots' },
]
const FILTERS = ['All', 'Easy', 'Medium', 'Hard', 'PYQ']

export default function WordListModal({ onClose }) {
  const [entries, setEntries] = useState(null)
  const [bookmarks, setBookmarks] = useState(loadBookmarks)
  const [learned, setLearned] = useState(loadLearned)
  const [catId, setCatId] = useState('antonyms')
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('All')
  const [showBm, setShowBm] = useState(false)

  useEffect(() => { fetchVocabEntries().then(({ data }) => setEntries(data || [])) }, [])

  const bySource = useMemo(() => {
    const m = {}
    for (const e of entries || []) (m[e.category] ||= []).push(e)
    return m
  }, [entries])

  const cat = WORD_CATEGORIES.find(c => c.id === catId)
  const entriesFor = cat ? (cat.sources ? cat.sources.flatMap(s => bySource[s] || []) : (bySource[cat.source] || [])) : []

  const toggleBm = (type, id) => setBookmarks(b => toggleBookmark(b, type, id))
  const toggleLn = id => setLearned(l => toggleLearned(l, id))

  const isWordBank = cat && (cat.source === 'word')
  const isSyn = catId === 'synonyms'
  const isAnt = catId === 'antonyms'

  const filtered = entriesFor.filter(e => {
    if (filter === 'Easy' && e.level !== 'Easy') return false
    if (filter === 'Medium' && e.level !== 'Medium') return false
    if (filter === 'Hard' && e.level !== 'Hard') return false
    if (filter === 'PYQ' && !(e.pyq_in && e.pyq_in.length)) return false
    if (q) {
      const hay = [e.term, e.meaning, ...(e.synonyms || []), ...(e.antonyms || [])].join(' ').toLowerCase()
      if (!hay.includes(q.toLowerCase())) return false
    }
    return true
  })

  /* ── My bookmarks ── */
  if (showBm) {
    const bmIds = Object.keys(bookmarks.entry || {})
    const bmItems = bmIds.map(id => entries.find(e => e.id === id)).filter(Boolean)
    return (
      <div className="wlx">
        <div className="wlx-head">
          <h2 className="wlx-title">My bookmarks</h2>
          <button className="wlx-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <button className="wlx-back" onClick={() => setShowBm(false)}>← Back to words</button>
        {bmItems.length === 0 ? (
          <p className="wlx-empty">Nothing saved yet — tap Save on any word to bookmark it.</p>
        ) : (
          bmItems.map(e => (
            <div key={e.id} className="wlx-bm-row">
              <b>{e.term}</b>
              <span>{e.meaning}</span>
              <button className="wlx-act on" onClick={() => toggleBm('entry', e.id)}><Bookmark size={15} /></button>
            </div>
          ))
        )}
      </div>
    )
  }

  return (
    <div className="wlx">
      <div className="wlx-head">
        <h2 className="wlx-title">Vocabulary</h2>
        <button className="wlx-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
      </div>

      {/* search + filters */}
      <div className="wlx-ctrl">
        <div className="wlx-search"><Search size={15} /><input placeholder="Search word, meaning, synonym or antonym…" value={q} onChange={e => setQ(e.target.value)} /></div>
        <button className="wlx-bmlink" onClick={() => setShowBm(true)}><Bookmark size={14} /> Saved</button>
      </div>
      <div className="wlx-chips">
        {FILTERS.map(f => (
          <button key={f} className={filter === f ? 'on' : ''} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      {/* category tabs */}
      <div className="wlx-tabs">
        {WORD_CATEGORIES.map(c => (
          <button key={c.id} className={catId === c.id ? 'on' : ''} onClick={() => setCatId(c.id)}>
            {c.name}
          </button>
        ))}
      </div>

      {/* word bank table */}
      <div className="wlx-table-wrap">
        <table className="wlx-table">
          <thead>
            <tr>
              <th className="wlx-num-h">#</th>
              <th>Word</th>
              <th>Meaning</th>
              {isWordBank && <th className={isAnt ? 'emph' : ''}>Synonyms</th>}
              {isWordBank && <th className={isSyn ? 'emph' : ''}>Antonyms</th>}
              {catId === 'idioms' && <th>Example</th>}
              {catId === 'spelling' && <th>Common mix-up</th>}
              {catId === 'spelling' && <th>Tip</th>}
              {catId === 'literary-devices' && <th>Example</th>}
              {isWordBank && <th>Level</th>}
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e, i) => (
              <tr key={e.id}>
                <td className="wlx-sno">{i + 1}</td>
                <td className="wlx-term">
                  {e.term}
                  {e.is_high_yield && <Star size={12} className="wlx-star" />}
                  {e.pyq_in && e.pyq_in.length > 0 && <span className="wlx-chip pyq" title="Asked in a real CUET paper">PYQ</span>}
                </td>
                <td className="wlx-mean">{e.meaning || ''}{e.origin ? <i className="wlx-origin"> ({e.origin})</i> : ''}</td>
                {isWordBank && <td className={isAnt ? 'emph' : ''}>{(e.synonyms || []).join(', ')}</td>}
                {isWordBank && <td className={isSyn ? 'emph' : ''}>{(e.antonyms || []).join(', ')}</td>}
                {catId === 'idioms' && <td className="wlx-mean">{e.example || ''}</td>}
                {catId === 'spelling' && <td className="wlx-wrong">{e.wrong_spelling || ''}</td>}
                {catId === 'spelling' && <td className="wlx-mean">{e.tip || ''}</td>}
                {catId === 'literary-devices' && <td className="wlx-mean">{e.example || ''}</td>}
                {isWordBank && <td>{e.level && <span className={'wlx-level ' + e.level.toLowerCase()}>{e.level}</span>}</td>}
                <td className="wlx-actions">
                  <button className={'wlx-btn' + (isLearned(learned, e.id) ? ' on' : '')} onClick={() => toggleLn(e.id)}>
                    <Check size={13} /> Learned
                  </button>
                  <button className={'wlx-btn' + (isBookmarked(bookmarks, 'entry', e.id) ? ' on' : '')} onClick={() => toggleBm('entry', e.id)}>
                    <Bookmark size={13} /> Save
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 && <p className="wlx-empty">No words match this search or filter.</p>}
    </div>
  )
}
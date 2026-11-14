/* ── Word List / Vocabulary — premium table view ──
   Category tabs → one word bank table per category. Columns are dynamic per
   topic schema. Star (★) = important word, PYQ chip = asked in a real paper. */
import { useEffect, useMemo, useState } from 'react'
import { Search, X, Bookmark, Check, Star } from 'lucide-react'
import { fetchVocabEntries } from '../lib/content'
import {
  loadBookmarks, isBookmarked, toggleBookmark,
  loadLearned, isLearned, toggleLearned,
} from '../lib/vocabProgress'
import './wordlist.css'

const WORD_CATEGORIES = [
  { id: 'synonyms', name: 'Synonyms', source: 'word' },
  { id: 'antonyms', name: 'Antonyms', source: 'word' },
  { id: 'idioms', name: 'Idioms', source: 'idioms' },
  { id: 'spelling', name: 'Spelling', source: 'spelling' },
  { id: 'phrasal-verbs', name: 'Phrasal verbs', source: 'phrasal-verbs' },
  { id: 'foreign-words', name: 'Foreign words', source: 'foreign-words' },
  { id: 'literary-devices', name: 'Literary devices', source: 'literary-devices' },
  { id: 'prefix-suffix', name: 'Prefix / Suffix', sources: ['prefix', 'suffix'] },
  { id: 'root-words', name: 'Root words', source: 'root' },
]
const FILTERS = ['All', 'Easy', 'Medium', 'Hard', 'PYQ']

/* Column spec per topic: key → header label (term label is per-topic). */
const COLS = {
  'synonyms': ['num', 'term', 'meaning', 'syn', 'ant', 'level', 'action'],
  'antonyms': ['num', 'term', 'meaning', 'syn', 'ant', 'level', 'action'],
  'idioms': ['num', 'term', 'meaning', 'example', 'action'],
  'spelling': ['num', 'term', 'mixup', 'tip', 'action'],
  'phrasal-verbs': ['num', 'term', 'meaning', 'action'],
  'foreign-words': ['num', 'term', 'meaning', 'action'],
  'literary-devices': ['num', 'term', 'meaning', 'example', 'action'],
  'prefix-suffix': ['num', 'term', 'meaning', 'type', 'origin', 'examples', 'action'],
  'root-words': ['num', 'term', 'meaning', 'origin', 'examples', 'action'],
}
const TERM_LABEL = {
  'synonyms': 'Word', 'antonyms': 'Word', 'idioms': 'Idiom', 'spelling': 'Word',
  'phrasal-verbs': 'Phrasal verb', 'foreign-words': 'Expression',
  'literary-devices': 'Device', 'prefix-suffix': 'Affix', 'root-words': 'Root',
}
const HEADER = {
  num: '#', term: 'Word', meaning: 'Meaning', syn: 'Synonyms', ant: 'Antonyms',
  level: 'Level', example: 'Example', mixup: 'Common mix-up', tip: 'Tip',
  type: 'Type', origin: 'Origin', examples: 'Examples', action: 'Action',
}

export default function WordListModal({ onClose }) {
  const [entries, setEntries] = useState(null)
  const [bookmarks, setBookmarks] = useState(loadBookmarks)
  const [learned, setLearned] = useState(loadLearned)
  const [catId, setCatId] = useState('antonyms')
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('All')
  const [showBm, setShowBm] = useState(false)
  const [visible, setVisible] = useState(200)

  useEffect(() => { fetchVocabEntries().then(({ data }) => setEntries(data || [])) }, [])
  useEffect(() => { setVisible(200) }, [catId, filter, q])

  const bySource = useMemo(() => {
    const m = {}
    for (const e of entries || []) (m[e.category] ||= []).push(e)
    return m
  }, [entries])

  const cat = WORD_CATEGORIES.find(c => c.id === catId)
  const entriesFor = cat
    ? (cat.sources ? cat.sources.flatMap(s => bySource[s] || []) : (bySource[cat.source] || []))
        .sort((a, b) => (a.term || '').toLowerCase().localeCompare((b.term || '').toLowerCase()))
    : []
  const cols = COLS[catId]
  const isSyn = catId === 'synonyms'
  const isAnt = catId === 'antonyms'

  const toggleBm = (type, id) => setBookmarks(b => toggleBookmark(b, type, id))
  const toggleLn = id => setLearned(l => toggleLearned(l, id))

  const filtered = entriesFor.filter(e => {
    if (filter === 'Easy' && e.level !== 'Easy') return false
    if (filter === 'Medium' && e.level !== 'Medium') return false
    if (filter === 'Hard' && e.level !== 'Hard') return false
    if (filter === 'PYQ' && !(e.pyq_in && e.pyq_in.length)) return false
    if (q) {
      const hay = [e.term, e.meaning, ...(e.synonyms || []), ...(e.antonyms || []), ...(e.examples || [])].join(' ').toLowerCase()
      if (!hay.includes(q.toLowerCase())) return false
    }
    return true
  })

  const shown = filtered.slice(0, visible)

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
              <span>{e.category === 'spelling' ? (e.tip || '—') : (e.meaning || '—')}</span>
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

      <div className="wlx-ctrl">
        <div className="wlx-search"><Search size={15} /><input placeholder="Search word, meaning, synonym or antonym…" value={q} onChange={e => setQ(e.target.value)} /></div>
        <button className="wlx-bmlink" onClick={() => setShowBm(true)}><Bookmark size={14} /> Saved</button>
      </div>

      {(isSyn || isAnt) && (
        <div className="wlx-chips">
          {FILTERS.map(f => (
            <button key={f} className={filter === f ? 'on' : ''} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
      )}

      <div className="wlx-tabs">
        {WORD_CATEGORIES.map(c => (
          <button key={c.id} className={catId === c.id ? 'on' : ''} onClick={() => setCatId(c.id)}>
            {c.name}
          </button>
        ))}
      </div>

      <div className="wlx-table-card">
        {entries === null ? (
          <div className="wlx-loading"><span className="wlx-spinner" /> Loading vocabulary…</div>
        ) : (
          <>
            <div className="wlx-table-wrap">
              <table className="wlx-table">
                <thead>
                  <tr>
                    {cols.map(k => (
                      <th key={k} className={k === 'num' ? 'num' : ''}>{k === 'term' ? TERM_LABEL[catId] : HEADER[k]}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {shown.map((e, i) => (
                    <tr key={e.id}>
                      {cols.map(k => (
                        <Cell key={k} k={k} e={e} i={i} isSyn={isSyn} isAnt={isAnt}
                          learned={isLearned(learned, e.id)} saved={isBookmarked(bookmarks, 'entry', e.id)}
                          onLearned={() => toggleLn(e.id)} onSave={() => toggleBm('entry', e.id)} />
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && <p className="wlx-empty">No words match this search or filter.</p>}
            {shown.length < filtered.length && (
              <button className="wlx-more" onClick={() => setVisible(v => v + 200)}>
                Show more · {filtered.length - shown.length} more
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function Cell({ k, e, i, isSyn, isAnt, learned, saved, onLearned, onSave }) {
  const ex = (e.examples || []).filter(Boolean)
  switch (k) {
    case 'num': return <td className="wlx-sno">{i + 1}</td>
    case 'term':
      return (
        <td className="wlx-term">
          <span className="wlx-term-word">{e.term}</span>
          {e.is_high_yield && <Star size={12} className="wlx-star" aria-label="Important" />}
          {e.pyq_in && e.pyq_in.length > 0 && <span className="wlx-chip pyq" title="Asked in a real CUET paper">PYQ</span>}
        </td>
      )
    case 'meaning':
      return (
        <td className="wlx-mean">
          {e.meaning || '—'}
        </td>
      )
    case 'syn': return <td className={isAnt ? '' : 'emph'}>{e.synonyms && e.synonyms.length ? e.synonyms.join(', ') : '—'}</td>
    case 'ant': return <td className={isSyn ? '' : 'emph'}>{e.antonyms && e.antonyms.length ? e.antonyms.join(', ') : '—'}</td>
    case 'level':
      return <td>{e.level ? <span className={'wlx-level ' + e.level.toLowerCase()}>{e.level}</span> : '—'}</td>
    case 'example': return <td className="wlx-mean">{e.example || '—'}</td>
    case 'mixup': return <td className="wlx-wrong">{e.wrong_spelling || '—'}</td>
    case 'tip': return <td className="wlx-mean">{e.tip || '—'}</td>
    case 'type': return <td>{e.type ? <span className="wlx-type">{e.type}</span> : '—'}</td>
    case 'origin': return <td className="wlx-origin-cell">{e.origin || '—'}</td>
    case 'examples':
      return (
        <td className="wlx-examples" title={ex.join(', ')}>
          {ex.length ? ex.join(', ') : '—'}
        </td>
      )
    case 'action':
      return (
        <td className="wlx-actions">
          <button className={'wlx-btn' + (learned ? ' on' : '')} onClick={onLearned} aria-pressed={learned}>
            <Check size={13} /> Learned
          </button>
          <button className={'wlx-btn save' + (saved ? ' on' : '')} onClick={onSave} aria-pressed={saved}>
            <Bookmark size={13} /> Save
          </button>
        </td>
      )
    default: return <td />
  }
}
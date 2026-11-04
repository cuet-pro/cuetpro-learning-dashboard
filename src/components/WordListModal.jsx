/* ── Word List / Word Bank modal (rebuilt) ──
   Categories grid → category with "Word bank | PYQ questions" tabs.
   Word bank = table (Screenshot B); PYQ = interactive question cards (Screenshot A).
   Bookmarks + learned toggle, local-first (backend sync via vocabProgress). */
import { useEffect, useMemo, useState } from 'react'
import {
  Search, ArrowLeft, X, Bookmark, Check, ChevronRight, ChevronLeft,
  Flame, Download, GraduationCap, ChevronDown,
} from 'lucide-react'
import { fetchVocabEntries, fetchPyqVocabQuestions } from '../lib/content'
import {
  loadBookmarks, isBookmarked, toggleBookmark,
  loadLearned, isLearned, toggleLearned,
} from '../lib/vocabProgress'
import './wordlist.css'

/* ── category definitions ── */
const WORD_CATEGORIES = [
  { id: 'synonyms', name: 'Synonyms', source: 'word', emphasize: 'synonyms', icon: '🔄', color: '#00C97F', unit: 'words' },
  { id: 'antonyms', name: 'Antonyms', source: 'word', emphasize: 'antonyms', icon: '🔁', color: '#2F6FDB', unit: 'words' },
  { id: 'idioms', name: 'Idioms', source: 'idioms', icon: '💬', color: '#7C5CFF', unit: 'idioms' },
  { id: 'spelling', name: 'Spelling', source: 'spelling', icon: '✏️', color: '#F5A623', unit: 'words' },
  { id: 'phrasal-verbs', name: 'Phrasal verbs', source: 'phrasal-verbs', icon: '🔗', color: '#2F6FDB', unit: 'verbs' },
  { id: 'foreign-words', name: 'Foreign words', source: 'foreign-words', icon: '🌍', color: '#E5484D', unit: 'phrases' },
  { id: 'literary-devices', name: 'Literary devices', source: 'literary-devices', icon: '🎭', color: '#7C5CFF', unit: 'devices' },
  { id: 'prefix-suffix', name: 'Prefix / Suffix', sources: ['prefix', 'suffix'], icon: '🔗', color: '#7C5CFF', unit: 'affixes' },
  { id: 'root-words', name: 'Root words', source: 'root', icon: '🌱', color: '#2F6FDB', unit: 'roots' },
]
const PYQ_ONLY = [
  { id: 'analogies', name: 'Analogies', topic: 'vocab-analogies', icon: '🧩', color: '#7C5CFF' },
  { id: 'word-usage', name: 'Word usage', topic: 'vocab-word-usage', icon: '📝', color: '#E5484D' },
  { id: 'rearranging', name: 'Rearranging', topic: 'vocab-rearranging', icon: '🔀', color: '#7C5CFF' },
]
const CAT_TOPIC = {
  synonyms: 'vocab-synonyms', antonyms: 'vocab-antonyms', idioms: 'vocab-idioms',
  spelling: 'vocab-spelling', 'phrasal-verbs': 'vocab-phrasal-verbs',
  'foreign-words': 'vocab-foreign-words', 'literary-devices': 'gr-literary-devices',
}
const PQ = 'ABCD'

export default function WordListModal({ onClose }) {
  const [entries, setEntries] = useState(null)
  const [pyq, setPyq] = useState(null)
  const [bookmarks, setBookmarks] = useState(loadBookmarks)
  const [learned, setLearned] = useState(loadLearned)
  const [view, setView] = useState('categories') // categories | category | bookmarks
  const [catId, setCatId] = useState(null)

  useEffect(() => {
    fetchVocabEntries().then(({ data }) => setEntries(data || []))
    fetchPyqVocabQuestions().then(({ data }) => {
      const flat = []
      for (const c of data || []) for (const q of c.items) flat.push({ ...q, topic: c.topic })
      setPyq(flat)
    })
  }, [])

  /* entries by source-category */
  const bySource = useMemo(() => {
    const m = {}
    for (const e of entries || []) (m[e.category] ||= []).push(e)
    return m
  }, [entries])

  /* pyq questions by topic slug (vocab-antonyms, gr-literary-devices, …) */
  const pyqByTopic = useMemo(() => {
    const m = {}
    for (const q of pyq || []) (m[q.topic] ||= []).push(q)
    return m
  }, [pyq])

  const toggleBm = (type, id) => setBookmarks(b => toggleBookmark(b, type, id))
  const toggleLn = id => setLearned(l => toggleLearned(l, id))

  if (view === 'categories' || view === 'bookmarks') {
    return (
      <div className="wlx">
        <div className="wlx-head">
          <h2 className="wlx-title">{view === 'bookmarks' ? 'My bookmarks' : 'Word list'}</h2>
          <button className="wlx-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        {view === 'bookmarks' ? (
          <BookmarksView bookmarks={bookmarks} entries={bySource} pyq={pyqByTopic} onOpen={id => { setCatId(id); setView('category') }} onBack={() => setView('categories')} />
        ) : (
          <CategoriesGrid
            bySource={bySource} pyqByTopic={pyqByTopic} bookmarks={bookmarks} learned={learned}
            onOpen={id => { setCatId(id); setView('category') }}
            onBookmarks={() => setView('bookmarks')}
          />
        )}
      </div>
    )
  }

  const cat = WORD_CATEGORIES.find(c => c.id === catId) || PYQ_ONLY.find(c => c.id === catId)
  if (!cat) return null
  const entriesFor = cat.sources ? cat.sources.flatMap(s => bySource[s] || []) : (bySource[cat.source] || [])
  const topic = cat.topic || CAT_TOPIC[catId]
  const pyqFor = topic ? (pyqByTopic[topic] || []) : []

  return (
    <CategoryView
      cat={cat} entries={entriesFor} pyq={pyqFor}
      bookmarks={bookmarks} learned={learned}
      onBm={toggleBm} onLn={toggleLn}
      onBack={() => { setCatId(null); setView('categories') }}
    />
  )
}

/* ── Categories grid ── */
function CategoriesGrid({ bySource, pyqByTopic, bookmarks, learned, onOpen, onBookmarks }) {
  const cards = WORD_CATEGORIES.map(c => {
    const entries = c.sources ? c.sources.flatMap(s => bySource[s] || []) : (bySource[c.source] || [])
    const topic = CAT_TOPIC[c.id]
    const nPyq = topic ? (pyqByTopic[topic] || []).length : 0
    const nLearned = entries.filter(e => isLearned(learned, e.id)).length
    const nBm = entries.filter(e => isBookmarked(bookmarks, 'entry', e.id)).length
    return { ...c, entries, nPyq, nLearned, nBm }
  }).filter(c => c.entries.length > 0)
  const pyqCards = PYQ_ONLY.map(c => {
    const nPyq = (pyqByTopic[c.topic] || []).length
    return { ...c, nPyq, pyqOnly: true }
  }).filter(c => c.nPyq > 0)

  return (
    <div className="wlx">
      <div className="wlx-searchrow">
        <div className="wlx-search"><Search size={15} /><input placeholder="Search all categories…" /></div>
        <button className="wlx-bmlink" onClick={onBookmarks}><Bookmark size={14} /> My bookmarks</button>
      </div>
      <div className="wlx-grid">
        {cards.map(c => (
          <button key={c.id} className="wlx-card" onClick={() => onOpen(c.id)}>
            <span className="wlx-card-ico" style={{ background: c.color + '1a' }}>{c.icon}</span>
            <span className="wlx-card-t"><b>{c.name}</b><em>{c.entries.length} {c.unit}</em></span>
            <span className="wlx-card-meta">
              {c.nPyq > 0 && <i className="wlx-chip pyq">{c.nPyq} PYQ</i>}
              {c.nLearned > 0 && <i className="wlx-chip learned">{c.nLearned} learned</i>}
              {c.nBm > 0 && <i className="wlx-chip bm">{c.nBm} ★</i>}
            </span>
            <span className="wlx-card-bar"><i style={{ width: (c.entries.length ? c.nLearned / c.entries.length * 100 : 0) + '%' }} /></span>
            <ChevronRight size={15} className="wlx-card-arrow" />
          </button>
        ))}
        {pyqCards.map(c => (
          <button key={c.id} className="wlx-card pyqonly" onClick={() => onOpen(c.id)}>
            <span className="wlx-card-ico" style={{ background: c.color + '1a' }}>{c.icon}</span>
            <span className="wlx-card-t"><b>{c.name}</b><em>practice only</em></span>
            <span className="wlx-card-meta"><i className="wlx-chip pyq">{c.nPyq} PYQ</i></span>
            <ChevronRight size={15} className="wlx-card-arrow" />
          </button>
        ))}
      </div>
    </div>
  )
}

/* ── Category view (tabs: word bank | pyq) ── */
function CategoryView({ cat, entries, pyq, bookmarks, learned, onBm, onLn, onBack }) {
  const [tab, setTab] = useState('bank')
  const showPyq = pyq.length > 0
  const showBank = entries.length > 0
  const effTab = !showBank ? 'pyq' : tab

  return (
    <div className="wlx">
      <button className="wlx-back" onClick={onBack}><ArrowLeft size={14} /> All categories</button>
      <div className="wlx-cathead">
        <span className="wlx-card-ico" style={{ background: cat.color + '1a' }}>{cat.icon}</span>
        <h2 className="wlx-title">{cat.name}</h2>
      </div>
      {showBank && showPyq && (
        <div className="wlx-tabs">
          <button className={effTab === 'bank' ? 'on' : ''} onClick={() => setTab('bank')}>Word bank</button>
          <button className={effTab === 'pyq' ? 'on' : ''} onClick={() => setTab('pyq')}>PYQ questions</button>
        </div>
      )}
      {effTab === 'bank' ? (
        <WordBank cat={cat} entries={entries} bookmarks={bookmarks} learned={learned} onBm={onBm} onLn={onLn} />
      ) : (
        <PyqPractice cat={cat} pyq={pyq} bookmarks={bookmarks} onBm={onBm} />
      )}
    </div>
  )
}

/* ── Word bank table ── */
function WordBank({ cat, entries, bookmarks, learned, onBm, onLn }) {
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('All')

  const filtered = entries.filter(e => {
    if (filter === 'Learned' && !isLearned(learned, e.id)) return false
    if (filter === 'Bookmarked' && !isBookmarked(bookmarks, 'entry', e.id)) return false
    if (filter === 'PYQ only' && !(e.pyq_in && e.pyq_in.length)) return false
    if (filter === 'High-yield' && !e.is_high_yield) return false
    if (filter === 'Not yet learned' && isLearned(learned, e.id)) return false
    if (q) {
      const hay = [e.term, e.meaning, ...(e.synonyms || []), ...(e.antonyms || [])].join(' ').toLowerCase()
      if (!hay.includes(q.toLowerCase())) return false
    }
    return true
  })

  const isSyn = cat.id === 'synonyms'
  const isAnt = cat.id === 'antonyms'

  return (
    <div className="wlx-bank">
      <div className="wlx-bank-stats">
        <span className="wlx-stat" onClick={() => setFilter('Learned')}>{entries.filter(e => isLearned(learned, e.id)).length} / {entries.length} learned</span>
        <span className="wlx-stat" onClick={() => setFilter('Bookmarked')}>{entries.filter(e => isBookmarked(bookmarks, 'entry', e.id)).length} bookmarked</span>
        <span className="wlx-stat">0 in revision</span>
      </div>
      <div className="wlx-bank-ctrl">
        <div className="wlx-search"><Search size={15} /><input placeholder={`Search ${cat.name.toLowerCase()}…`} value={q} onChange={e => setQ(e.target.value)} /></div>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="wlx-select">
          {['All', 'High-yield', 'Not yet learned', 'Learned', 'Bookmarked', 'Revision from mistakes', 'PYQ only'].map(f => <option key={f}>{f}</option>)}
        </select>
      </div>
      <div className="wlx-table-wrap">
        <table className="wlx-table">
          <thead>
            <tr>
              <th>#</th>
              {isSyn && <th>High-yield</th>}
              <th>{cat.source === 'word' ? 'Word' : cat.id === 'idioms' ? 'Idiom' : cat.id === 'spelling' ? 'Correct spelling' : 'Term'}</th>
              <th>Meaning</th>
              {(isSyn || isAnt) && <th className={isAnt ? 'emph' : ''}>Synonyms</th>}
              {(isSyn || isAnt) && <th className={isSyn ? 'emph' : ''}>Antonyms</th>}
              {cat.id === 'idioms' && <th>Example</th>}
              {cat.id === 'spelling' && <th>Common wrong spelling</th>}
              {cat.id === 'spelling' && <th>Tip</th>}
              {cat.id === 'literary-devices' && <th>Example</th>}
              {(cat.id === 'prefix-suffix' || cat.id === 'root-words') && <th>Examples</th>}
              <th>Level</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e, i) => (
              <tr key={e.id}>
                <td className="wlx-sno">{i + 1}</td>
                {isSyn && <td className="wlx-hy">{e.is_high_yield ? <Flame size={13} /> : ''}</td>}
                <td className="wlx-term">
                  {e.term}
                  {e.pyq_in && e.pyq_in.length > 0 && <span className="wlx-chip pyq" title="Asked in a real CUET paper">PYQ</span>}
                </td>
                <td className="wlx-mean">{e.meaning || ''}{e.origin ? <i className="wlx-origin"> ({e.origin})</i> : ''}</td>
                {(isSyn || isAnt) && <td className={isAnt ? 'emph' : ''}>{(e.synonyms || []).join(', ')}</td>}
                {(isSyn || isAnt) && <td className={isSyn ? 'emph' : ''}>{(e.antonyms || []).join(', ')}</td>}
                {cat.id === 'idioms' && <td className="wlx-mean">{e.example || ''}</td>}
                {cat.id === 'spelling' && <td className="wlx-wrong">{e.wrong_spelling || ''}</td>}
                {cat.id === 'spelling' && <td className="wlx-mean">{e.tip || ''}</td>}
                {cat.id === 'literary-devices' && <td className="wlx-mean">{e.example || ''}</td>}
                {(cat.id === 'prefix-suffix' || cat.id === 'root-words') && <td className="wlx-mean">{e.meaning || ''}</td>}
                <td>{e.level && <span className={'wlx-level ' + e.level.toLowerCase()}>{e.level}</span>}</td>
                <td className="wlx-actions">
                  <button className={'wlx-act' + (isLearned(learned, e.id) ? ' on' : '')} onClick={() => onLn(e.id)} title="Learned"><Check size={15} /></button>
                  <button className={'wlx-act' + (isBookmarked(bookmarks, 'entry', e.id) ? ' on' : '')} onClick={() => onBm('entry', e.id)} title="Bookmark">
                    {isBookmarked(bookmarks, 'entry', e.id) ? <Bookmark size={15} /> : <Bookmark size={15} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 && <p className="wlx-empty">No matches — try a different search or filter.</p>}
    </div>
  )
}

/* ── PYQ practice view (interactive, paginated) ── */
function PyqPractice({ cat, pyq, bookmarks, onBm }) {
  const [q, setQ] = useState('')
  const [fpyq, setFpyq] = useState(false)
  const [fbm, setFbm] = useState(false)
  const [year, setYear] = useState('All')
  const [diff, setDiff] = useState('All')
  const [mode, setMode] = useState('practice') // practice | list
  const [page, setPage] = useState(0)
  const [picked, setPicked] = useState({})  // question id -> picked index

  const filtered = pyq.filter(p => {
    if (fbm && !isBookmarked(bookmarks, 'question', p.id)) return false
    if (year !== 'All' && !(p.source || '').includes(year)) return false
    if (diff !== 'All' && p.diff !== diff) return false
    if (q && !(p.q + ' ' + (p.opts || []).join(' ') + ' ' + (p.explain || '')).toLowerCase().includes(q.toLowerCase())) return false
    return true
  })

  const PER = 10
  const pages = Math.max(1, Math.ceil(filtered.length / PER))
  const cur = filtered.slice(page * PER, page * PER + PER)

  const years = ['All', ...new Set(pyq.map(p => (p.source || '').match(/\d{4}/)?.[0] || '2022')).values()]

  return (
    <div className="wlx-pyq">
      <div className="wlx-bank-ctrl">
        <div className="wlx-search"><Search size={15} /><input placeholder={`Search ${cat.name.toLowerCase()}…`} value={q} onChange={e => setQ(e.target.value)} /></div>
        <div className="wlx-chips">
          <button className={fpyq ? 'on' : ''} onClick={() => setFpyq(v => !v)}>PYQ only</button>
          <button className={fbm ? 'on' : ''} onClick={() => setFbm(v => !v)}>Bookmarked</button>
        </div>
        <select value={year} onChange={e => setYear(e.target.value)} className="wlx-select">{years.map(y => <option key={y}>{y}</option>)}</select>
        <select value={diff} onChange={e => setDiff(e.target.value)} className="wlx-select">
          {['All', 'Easy', 'Medium', 'Hard'].map(d => <option key={d}>{d}</option>)}
        </select>
        <div className="wlx-mode">
          <button className={mode === 'practice' ? 'on' : ''} onClick={() => setMode('practice')}>Practice</button>
          <button className={mode === 'list' ? 'on' : ''} onClick={() => setMode('list')}>List</button>
        </div>
      </div>

      <div className="wlx-pyq-count">Question {Math.min(page * PER + 1, filtered.length)} of {filtered.length}</div>

      {cur.map(p => (
        <PyqCard key={p.id} p={p} bookmarked={isBookmarked(bookmarks, 'question', p.id)} onBm={() => onBm('question', p.id)}
          picked={picked[p.id]} setPicked={v => setPicked(s => ({ ...s, [p.id]: v }))} showAll={mode === 'list'} />
      ))}

      {filtered.length > PER && (
        <div className="wlx-pager">
          <button disabled={page === 0} onClick={() => setPage(p => p - 1)}><ChevronLeft size={15} /></button>
          <span>{page + 1} / {pages}</span>
          <button disabled={page >= pages - 1} onClick={() => setPage(p => p + 1)}><ChevronRight size={15} /></button>
        </div>
      )}
      {filtered.length === 0 && <p className="wlx-empty">No questions match these filters.</p>}
    </div>
  )
}

function PyqCard({ p, bookmarked, onBm, picked, setPicked, showAll }) {
  const [show, setShow] = useState(false)
  const revealed = showAll || picked != null
  return (
    <div className="wlx-pcard">
      <div className="wlx-pcard-q">Q. {p.q}</div>
      <div className="wlx-pcard-opts">
        {(p.opts || []).map((o, i) => {
          const correct = i === p.answer
          let cls = 'wlx-pcard-opt'
          if (revealed && correct) cls += ' correct'
          else if (revealed && picked === i) cls += ' wrong'
          return (
            <button key={i} className={cls} disabled={revealed} onClick={() => setPicked(i)}>
              <span className="wlx-pcard-k">{PQ[i]}</span><span>{o}</span>
              {revealed && correct && <span className="wlx-pcard-tick">✓</span>}
            </button>
          )
        })}
      </div>
      <div className="wlx-pcard-meta">
        <span className="wlx-chip pyq">PYQ</span>
        {p.diff && <span className="wlx-level">{p.diff}</span>}
        {p.source && <span className="wlx-pcard-src">{p.source}</span>}
        <button className={'wlx-act' + (bookmarked ? ' on' : '')} onClick={onBm} title="Bookmark"><Bookmark size={15} /></button>
        {revealed && p.explain && (
          <button className="wlx-explain-toggle" onClick={() => setShow(v => !v)}>{show ? 'Hide explanation' : 'Explanation'}</button>
        )}
      </div>
      {revealed && show && p.explain && <p className="wlx-pcard-explain">{p.explain}</p>}
    </div>
  )
}

/* ── My bookmarks ── */
function BookmarksView({ bookmarks, entries, pyq, onOpen, onBack }) {
  const bmEntry = Object.keys(bookmarks.entry || {})
  const bmQ = Object.keys(bookmarks.question || {})
  const entryItems = bmEntry.map(id => {
    for (const cat of Object.values(entries)) {
      const e = cat.find(x => x.id === id)
      if (e) return e
    }
    return null
  }).filter(Boolean)
  const qItems = bmQ.map(id => {
    for (const arr of Object.values(pyq)) { const q = arr.find(x => x.id === id); if (q) return q }
    return null
  }).filter(Boolean)

  return (
    <div className="wlx-bm">
      <button className="wlx-back" onClick={onBack}><ArrowLeft size={14} /> Categories</button>
      {entryItems.length === 0 && qItems.length === 0 && <p className="wlx-empty">Nothing bookmarked yet — tap the bookmark icon on any word or question.</p>}
      {entryItems.length > 0 && (
        <>
          <div className="wlx-bm-head"><GraduationCap size={14} /> Bookmarked words ({entryItems.length})</div>
          {entryItems.map(e => <div key={e.id} className="wlx-bm-row"><b>{e.term}</b><span>{e.meaning}</span></div>)}
        </>
      )}
      {qItems.length > 0 && (
        <>
          <div className="wlx-bm-head">Bookmarked questions ({qItems.length})</div>
          {qItems.map(qq => <div key={qq.id} className="wlx-bm-row"><b>Q.</b><span>{qq.q.slice(0, 90)}…</span></div>)}
        </>
      )}
      <div className="wlx-bm-actions">
        <button className="btn btn-outline-sm">Practise bookmarked words</button>
        <button className="btn btn-outline-sm">Practise bookmarked questions</button>
      </div>
    </div>
  )
}
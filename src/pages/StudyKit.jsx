import { useEffect, useRef, useState } from 'react'
import { NotebookText, Layers, Timer, FileQuestion, Archive, ArrowLeft, ArrowRight, PlayCircle, Video, Sigma, Zap, ChevronRight, ChevronDown, CheckSquare, Search, GraduationCap, Highlighter, FlaskConical, Settings, Sun, Moon } from 'lucide-react'
import { boostRanking, weakTopicNames } from '../lib/analysisData'
import { ECON_UNITS } from '../data/econNotes'
import { GEO_UNITS } from '../data/geoNotes'
import { useProfile, STREAMS } from '../lib/profile'
import { notesDeepLink, readNotesProgress, writeNotesProgress, lastReadSubject } from '../lib/notesProgress'
import './studykit.css'

const NOTES_BY_STREAM = {
  Commerce: [
    { s: 'Economics', chapters: ['National Income Accounting', 'Money & Banking', 'Government Budget', 'Employment & SD'], done: 3 },
    { s: 'Accountancy', chapters: ['Partnership Accounts', 'Company Accounts', 'Financial Statement Analysis'], done: 2 },
    { s: 'Business Studies', chapters: ['Principles of Management', 'Business Finance', 'Marketing'], done: 1 },
  ],
  Humanities: [
    { s: 'History', chapters: ['Ancient India', 'Medieval India', 'Modern India'], done: 2 },
    { s: 'Political Science', chapters: ['Indian Constitution', 'Political Theory'], done: 1 },
    { s: 'Geography', chapters: ['Physical Geography', 'Human Geography'], done: 0 },
  ],
  Science: [
    { s: 'Physics', chapters: ['Mechanics', 'Electrostatics', 'Optics'], done: 2 },
    { s: 'Chemistry', chapters: ['Atomic Structure', 'Organic Chemistry', 'Thermodynamics'], done: 1 },
    { s: 'Biology', chapters: ['Cell Biology', 'Genetics', 'Ecology'], done: 1 },
  ],
}

const LEARNING_TOOLS = [
  { id: 'notes', tone: 'green', icon: NotebookText, title: 'Notes', desc: 'Concise NCERT-based notes, chapter by chapter.', cta: 'Pick up where you left off', progress: { done: 12, total: 18, label: 'chapters' } },
  { id: 'flashcards', tone: 'blue', icon: Layers, title: 'Flashcards', desc: 'Swipeable quick-revision cards, mark as learned.', cta: 'Flip 20 cards in 5 minutes', progress: { done: 56, total: 80, label: 'cards mastered' } },
  { id: 'videos', tone: 'amber', icon: Video, title: 'Video lectures', desc: 'Short concept videos — 5-10 min each.', cta: 'Watch one 7-minute concept', progress: { done: 7, total: 12, label: 'watched' } },
  { id: 'cheats', tone: 'violet', icon: Sigma, title: 'Cheat Sheets', desc: 'Every formula and key definition, one page per subject.', cta: 'Revise all formulas in 10 minutes', progress: { done: 4, total: 6, label: 'viewed' } },
  { id: 'ncert', tone: 'violet', icon: Highlighter, title: 'Marked NCERT', desc: 'NCERT textbook pages with exam-relevant lines highlighted, chapter by chapter.', cta: 'Open marked NCERT', progress: { done: 0, total: 18, label: 'chapters' } },
]
const TESTING_TOOLS = [
  { id: 'quizzes', tone: 'blue', icon: Timer, title: '5-Minute Quick Quizzes', desc: 'Short, low-pressure self-checks — repeat anytime.', cta: 'Take today’s quick quiz', meta: { streak: '3-day streak', last: 'Last score 82%' } },
  { id: 'mocks', tone: 'amber', icon: FileQuestion, title: 'Mock Tests', desc: 'Full-length, CUET-pattern, timed & auto-scored.', cta: 'Resume Mock 7 · 3 sections left', meta: { inProgress: 'Mock Test 7 · 60%', sub: 'Section 3 of 5 left' } },
  { id: 'pyqs', tone: 'red', icon: Archive, title: 'Previous Year Questions', desc: 'Shift-wise & topic-wise PYQ bank, filterable.', cta: 'Browse 2022–2026, shift-wise', progress: { done: 60, total: 100, label: 'attempted' } },
]
const ALL_TOOLS = [...LEARNING_TOOLS, ...TESTING_TOOLS]

export default function StudyKit({ onNavigate }) {
  const [profile] = useProfile()
  const stream = profile.stream
  const [subject, setSubject] = useState(() => {
    const dl = notesDeepLink()
    return (dl && (STREAMS[profile.stream] || []).includes(dl.subject)) ? dl.subject : 'all'
  })
  const [selected, setSelected] = useState(() => (notesDeepLink() ? 'notes' : null))
  const [query, setQuery] = useState('')
  const [weakOnly, setWeakOnly] = useState(false)
  const [examMode, setExamMode] = useState(false)
  const [lastActivity, setLastActivity] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cp_last') || 'null') } catch { return null }
  })

  const record = item => {
    const v = { ...item, ts: Date.now() }
    setLastActivity(v)
    localStorage.setItem('cp_last', JSON.stringify(v))
  }

  const boostScope = subject === 'all' ? stream : subject
  const ranked = boostRanking(boostScope)
  const top3 = ranked.slice(0, 3)
  const weakTopics = weakTopicNames(boostScope)
  const streamSubjects = STREAMS[stream] || []
  const showContinue = lastActivity && (!lastActivity.subject || streamSubjects.includes(lastActivity.subject))

  const notesProgress = subject === 'all'
    ? LEARNING_TOOLS.find(t => t.id === 'notes').progress
    : (() => {
        const s = (NOTES_BY_STREAM[stream] || []).find(n => n.s === subject)
        return s ? { done: s.done, total: s.chapters.length, label: 'chapters' } : { done: 0, total: 0, label: 'chapters' }
      })()

  /* searchable tool list — shows results across both categories */
  const q = query.trim().toLowerCase()
  const learningShown = q ? LEARNING_TOOLS.filter(t => (t.title + ' ' + t.desc).toLowerCase().includes(q)) : LEARNING_TOOLS
  const testingShown = q ? TESTING_TOOLS.filter(t => (t.title + ' ' + t.desc).toLowerCase().includes(q)) : TESTING_TOOLS
  const progFor = t => (t.id === 'notes' ? notesProgress : t.progress) || { done: 0, total: 0, label: '' }
  const tool = ALL_TOOLS.find(t => t.id === selected)

  /* open a tool; for Notes with no subject chosen, jump to the last-read subject */
  const openTool = t => {
    if (t.id === 'notes' && subject === 'all') {
      const s = lastReadSubject()
      if (s && (STREAMS[stream] || []).includes(s)) setSubject(s)
    }
    setSelected(t.id)
  }

  return (
    <div className="page">
      {!selected && (<>
      <header className="page-head">
        <div>
          <h1>Study Kit</h1>
          <p>Learning tools to build understanding, testing tools to prove it.</p>
        </div>
        {/* Stream — top-right, small; settings routes to Profile (single source of truth) */}
        <div className="sk-topright">
          <span className="sk-tr-stream"><GraduationCap size={13} /> {stream}</span>
          <button className="sk-tr-edit" title="Change stream in Profile" aria-label="Change stream" onClick={() => onNavigate('profile')}>
            <Settings size={14} />
          </button>
        </div>
      </header>

      {/* Subject pills — single scrolling line */}
      <div className="sk-pillsline">
        <button className={'subj-pill' + (subject === 'all' ? ' on' : '')} onClick={() => setSubject('all')}>All subjects</button>
        {STREAMS[stream].map(s => (
          <button key={s} className={'subj-pill' + (subject === s ? ' on' : '')} onClick={() => setSubject(s)}>{s}</button>
        ))}
      </div>

      {/* Continue strip */}
      {showContinue && (
        <section className="sk-continue">
          <div className="sk-continue-ico"><PlayCircle size={18} /></div>
          <div className="sk-continue-info">
            <b>{lastActivity.title}</b>
            <span>{lastActivity.detail}</span>
            <div className="cont-bar"><i style={{ width: lastActivity.pct + '%' }} /></div>
          </div>
          <button className="btn btn-primary-sm" onClick={() => { if (lastActivity && (lastActivity.subject === 'Economics' || lastActivity.subject === 'Geography')) { setSubject(lastActivity.subject); setSelected('notes') } else { alert('Deep-link → resume: ' + lastActivity.title) } }}>Resume</button>
        </section>
      )}

      {/* Focus mock banner */}
      <section className="sk-focusmock">
        <div className="sk-focusmock-ico"><Zap size={20} /></div>
        <div className="sk-focusmock-info">
          <h3>Focus mock</h3>
          <p>A short mock built only from what you need to work on right now — about 20 minutes.</p>
        </div>
        <button className="btn btn-primary-sm" onClick={() => alert('Deep-link → focus mock session (from boost topics: ' + top3.slice(0, 3).map(t => t.name).join(', ') + ')')}>Generate focus mock</button>
      </section>
      </>)}

      {/* Tools — Learning & Testing card grids (opens detail panel on tap) */}
      {selected ? (
        <section className="sk-detail">
          <div className="sk-detail-head">
            <button className="sk-back" onClick={() => setSelected(null)}>
              <ArrowLeft size={15} /> All tools
            </button>
            <span className={'sk-detail-ico tone-' + (tool?.tone || 'green')}>{tool && <tool.icon size={18} />}</span>
            <div className="sk-detail-t">
              <h3>{tool?.title}</h3>
              <p>{tool?.desc}</p>
            </div>
          </div>
          <div className="sk-detail-body">
            {selected === 'notes' && <NotesView stream={stream} subject={subject} record={record} />}
            {selected === 'ncert' && <NcertView stream={stream} subject={subject} />}
            {selected === 'flashcards' && <FlashView record={record} />}
            {selected === 'quizzes' && <QuizView />}
            {selected === 'pyqs' && <PyqView subject={subject} stream={stream} weakOnly={weakOnly} setWeakOnly={setWeakOnly} />}
            {selected === 'mocks' && <MockView examMode={examMode} setExamMode={setExamMode} />}
            {(selected === 'videos' || selected === 'cheats') && (
              <div className="sk-placeholder">
                <PlayCircle size={30} />
                <p>Working content for this tool ships in the next iteration — design is ready, content pipeline is in progress.</p>
              </div>
            )}
          </div>
        </section>
      ) : (
        <>
          <div className="sk-toolsearch">
            <Search size={14} />
            <input placeholder="Search tools…" value={query} onChange={e => setQuery(e.target.value)} />
          </div>

          {learningShown.length > 0 && (
            <section className="sk-tools">
              <h3 className="sk-tools-title">
                <GraduationCap size={15} /> Learning tools <em>{learningShown.length}</em>
              </h3>
              <div className="sk-cards">
                {learningShown.map((t, idx) => {
                  const p = progFor(t)
                  return (
                    <button
                      key={t.id}
                      className={'sk-tcard tone-' + t.tone}
                      style={{ animationDelay: (idx * 45) + 'ms' }}
                      onClick={() => { openTool(t) }}
                    >
                      <span className="sk-tcard-ico"><t.icon size={18} /></span>
                      <span className="sk-tcard-t">
                        <b>{t.title}</b>
                        <em>{p.total > 0 ? p.done + '/' + p.total + ' ' + p.label : t.desc}</em>
                      </span>
                      <span className="sk-tcard-cta">{t.cta} <ArrowRight size={12} /></span>
                      <span className="sk-tcard-cta">{t.cta} <ArrowRight size={12} /></span>
                      {p.total > 0 && (
                        <span className="sk-tcard-prog">
                          <i><s style={{ width: (p.done / p.total * 100) + '%' }} /></i>
                          <b className="sk-tcard-pct">{Math.round(p.done / p.total * 100)}%</b>
                        </span>
                      )}
                      <ChevronRight size={15} className="sk-tcard-arr" />
                    </button>
                  )
                })}
              </div>
            </section>
          )}

          {testingShown.length > 0 && (
            <section className="sk-tools">
              <h3 className="sk-tools-title">
                <FlaskConical size={15} /> Testing tools <em>{testingShown.length}</em>
              </h3>
              <div className="sk-cards">
                {testingShown.map((t, idx) => (
                  <button
                    key={t.id}
                    className={'sk-tcard tone-' + t.tone}
                    style={{ animationDelay: (idx * 45) + 'ms' }}
                    onClick={() => { setSelected(t.id) }}
                  >
                    <span className="sk-tcard-ico"><t.icon size={18} /></span>
                    <span className="sk-tcard-t">
                      <b>{t.title}</b>
                      <em>{t.meta ? (t.meta.streak || t.meta.inProgress) : t.desc}</em>
                    </span>
                    <span className="sk-tcard-cta">{t.cta} <ArrowRight size={12} /></span>
                    {t.progress && (
                      <span className="sk-tcard-prog">
                        <i><s style={{ width: t.progress.done + '%' }} /></i>
                        <b className="sk-tcard-pct">{t.progress.done}%</b>
                      </span>
                    )}
                    <ChevronRight size={15} className="sk-tcard-arr" />
                  </button>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}

/* Notes dashboard (Economics / Geography) with fullscreen expand */
/* Notes breakdown — nested accordion: book → chapter → topic.
   Open book/chapter/topic is reflected in the URL (?subject=&book=&ch=&topic=),
   restored from per-subject reading progress (lib/notesProgress) and honours
   the browser back button via popstate. */
// numeric URL params (book index · chapter num · topic num) → entities
function resolveNoteRef(units, book, ch, topic) {
  const u = book ? units[Number(book) - 1] : null
  const c = u && ch ? u.chapters.find(x => x.ready && x.num === Number(ch)) : null
  const t = c && topic ? c.topics.find(x => x.num === Number(topic)) : null
  return { unit: u, chapter: c, topic: t }
}
function noteBookIndex(units, key) {
  return units.findIndex(u => u.key === key) + 1
}
function NotesBreakdown({ units, base, label, record }) {
  const [open, setOpen] = useState(null)   // topic viewer {chapter, topic}
  const [jump, setJump] = useState('')      // controlled jump-select value
  const chapterEls = useRef({})
  const scrollRef = useRef(false)

  // chapter id → { unit, chapter }
  const chapterOf = cid => {
    for (const u of units) { const c = u.chapters.find(x => x.id === cid); if (c) return { unit: u, chapter: c } }
    return null
  }

  // accordion state: { book, chapter, topic, scroll } — resolved once:
  // URL params → per-subject reading progress → default (single book open, else all collapsed)
  const [acc, setAcc] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    const url = resolveNoteRef(units, params.get('book'), params.get('ch'), params.get('topic'))
    if (url.unit && url.chapter) return { book: url.unit.key, chapter: url.chapter.id, topic: url.topic ? url.topic.id : null, scroll: true }
    const prog = readNotesProgress(label)
    if (prog) {
      const pu = units.find(u => u.key === prog.book)
      const pc = pu && pu.chapters.find(c => c.id === prog.chapter)
      if (pu && pc) return { book: pu.key, chapter: pc.id, topic: prog.topic || null, scroll: true }
    }
    if (units.length === 1) return { book: units[0].key, chapter: null, topic: null, scroll: false }
    return { book: null, chapter: null, topic: null, scroll: false }
  })
  const openBook = acc.book
  const openChapter = acc.chapter
  const highlight = acc.topic

  // URL → state (browser back / forward)
  useEffect(() => {
    const onPop = () => {
      const p = new URLSearchParams(window.location.search)
      const r = resolveNoteRef(units, p.get('book'), p.get('ch'), p.get('topic'))
      if (r.unit && r.chapter) setAcc({ book: r.unit.key, chapter: r.chapter.id, topic: r.topic ? r.topic.id : null, scroll: false })
      else if (r.unit) setAcc({ book: r.unit.key, chapter: null, topic: null, scroll: false })
      else setAcc({ book: units.length === 1 ? units[0].key : null, chapter: null, topic: null, scroll: false })
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [units])

  // state → URL (reflect open book/chapter/topic; push history so back works)
  const synced = useRef(false)
  useEffect(() => {
    const p = new URLSearchParams()
    const u = openBook ? units.find(x => x.key === openBook) : null
    const c = u && openChapter ? u.chapters.find(x => x.id === openChapter) : null
    const t = c && highlight ? c.topics.find(x => x.id === highlight) : null
    if (u) { p.set('subject', label); p.set('book', String(noteBookIndex(units, u.key))) }
    if (c) p.set('ch', String(c.num))
    if (t) p.set('topic', String(t.num))
    const qs = p.toString()
    const search = qs ? '?' + qs : ''
    if (search === window.location.search) return   // already in sync (e.g. after popstate) — don't add a history entry
    const url = search || window.location.pathname
    if (synced.current) history.pushState(null, '', url)
    else { history.replaceState(null, '', url); synced.current = true }
  }, [openBook, openChapter, highlight, units, label])

  // mark a restored chapter for scroll-into-view (runs once on mount)
  useEffect(() => {
    if (acc.chapter && acc.scroll) scrollRef.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // consume scroll intent when the open chapter / highlighted topic changes
  useEffect(() => {
    if (scrollRef.current && openChapter) {
      scrollRef.current = false
      const el = chapterEls.current[openChapter]
      if (el) {
        const reduce = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
        el.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' })
      }
    }
  }, [openChapter, highlight])

  const toggleBook = key => {
    setJump('')
    setAcc(a => a.book === key
      ? { book: null, chapter: null, topic: null, scroll: false }
      : { book: key, chapter: null, topic: null, scroll: false })
  }
  const toggleChapter = id => {
    setJump('')
    const opening = acc.chapter !== id
    const found = chapterOf(id)
    setAcc(a => a.chapter === id
      ? { ...a, chapter: null, topic: null }
      : { ...a, chapter: id, topic: null })
    if (opening && found) writeNotesProgress(label, { book: found.unit.key, chapter: id, topic: null })
  }
  const openTopic = (chapterId, topicId) => {
    const found = chapterOf(chapterId)
    if (found) writeNotesProgress(label, { book: found.unit.key, chapter: chapterId, topic: topicId })
    setAcc(a => ({ ...a, chapter: chapterId, topic: topicId }))
    setOpen({ chapter: chapterId, topic: topicId })
  }

  const srcFor = (chapterId, topicId) => {
    const unit = units.find(u => u.chapters.some(c => c.id === chapterId))
    const parts = []
    if (unit && unit.key && /^b\d+$/.test(unit.key)) parts.push('book=' + unit.key)
    parts.push('chapter=' + chapterId)
    parts.push(topicId ? 'topic=' + topicId : 'view=chapter')
    parts.push('embed=1')
    return base + '?' + parts.join('&')
  }

  if (open) {
    const all = units.flatMap(u => u.chapters)
    const ch = all.find(c => c.id === open.chapter)
    const tp = ch && open.topic ? ch.topics.find(t => t.id === open.topic) : null
    const seq = []
    units.forEach(u => u.chapters.filter(c => c.ready).forEach(c => c.topics.forEach(t => seq.push({ chapter: c.id, topic: t.id, num: c.num + '.' + t.num, title: t.title }))))
    const curIdx = open.topic ? seq.findIndex(x => x.chapter === open.chapter && x.topic === open.topic) : -1
    const prev = curIdx > 0 ? seq[curIdx - 1] : null
    const next = curIdx >= 0 && curIdx < seq.length - 1 ? seq[curIdx + 1] : null
    return (
      <div className="econ-note-open">
        <div className="econ-crumb">
          <button className="econ-back" onClick={() => setOpen(null)}>
            <ArrowLeft size={14} /> All chapters
          </button>
          <span className="econ-crumb-t">
            {ch && ch.title} {tp && <><i>/</i> <b>{tp.title}</b></>}
          </span>
          {!open.topic && <span className="econ-soon-chip">chapter overview</span>}
        </div>
        <NoteDashboard
          src={srcFor(open.chapter, open.topic)}
          title={(tp ? tp.title : (ch ? ch.title : label)) + ' — CUET Pro'}
          subject={label}
          record={record}
        />
        {open.topic && (prev || next) && (
          <div className="econ-pager">
            {prev && (
              <button className="econ-pager-btn prev" onClick={() => setOpen({ chapter: prev.chapter, topic: prev.topic })}>
                <ArrowLeft size={15} />
                <span className="econ-pager-body"><em>Previous</em><b>{prev.num} · {prev.title}</b></span>
              </button>
            )}
            {next && (
              <button className="econ-pager-btn next" onClick={() => setOpen({ chapter: next.chapter, topic: next.topic })}>
                <span className="econ-pager-body"><em>Next</em><b>{next.num} · {next.title}</b></span>
                <ArrowRight size={15} />
              </button>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="econ-bd">
      <div className="econ-bd-head">
        <div className="econ-bd-title">
          <b>{label} notes</b>
        </div>
        <label className="econ-jump">
          <select value={jump} onChange={e => {
            const v = e.target.value
            setJump(v)
            if (!v) return
            const [cid, tid] = v.split('|')
            const found = chapterOf(cid)
            if (!found) return
            scrollRef.current = true
            setAcc({ book: found.unit.key, chapter: cid, topic: tid, scroll: false })
          }}>
            <option value="">Jump to a topic…</option>
            {units.map(u => u.chapters.filter(c => c.ready).map(c => (
              <optgroup key={c.id} label={(units.length > 1 ? (u.emoji ? u.emoji + ' ' : '') + u.name + ' · ' : '') + 'Ch ' + c.num + ' — ' + c.title}>
                {c.topics.map(t => (
                  <option key={c.id + t.id} value={c.id + '|' + t.id}>{c.num}.{t.num} · {t.title}</option>
                ))}
              </optgroup>
            )))}
          </select>
        </label>
      </div>

      {units.map((u, ui) => {
        const isBookOpen = openBook === u.key
        const ready = u.chapters.filter(c => c.ready)
        const soon = u.chapters.filter(c => !c.ready)
        return (
          <section className="econ-unit" key={u.key} style={{ animationDelay: (ui * 70) + 'ms' }}>
            <button type="button" className="econ-unit-head" aria-expanded={isBookOpen} onClick={() => toggleBook(u.key)}>
              <b>{(u.emoji ? u.emoji + ' ' : '') + u.name}</b>
              <span>{ready.length} of {u.chapters.length} chapters written</span>
              <ChevronDown size={18} className={'econ-unit-chev' + (isBookOpen ? ' open' : '')} />
            </button>

            {isBookOpen && (
              <div className="econ-unit-body">
                {ready.map(c => {
                  const isOpen = openChapter === c.id
                  return (
                    <div className={'econ-chapter' + (isOpen ? ' open' : '')} key={c.id} ref={el => { chapterEls.current[c.id] = el }}>
                      <button type="button" className="econ-chapter-head" aria-expanded={isOpen} onClick={() => toggleChapter(c.id)}>
                        <span className="econ-chapter-num">Ch {c.num}</span>
                        <div className="econ-chapter-t">
                          <b>{c.title}</b>
                          {isOpen && <p>{c.desc}</p>}
                        </div>
                        <span className="econ-chapter-meta">{c.topics.length} topics</span>
                        <ChevronDown size={16} className={'econ-chapter-chev' + (isOpen ? ' open' : '')} />
                      </button>
                      {isOpen && (
                        <div className="econ-topics">
                          {c.topics.map(t => (
                            <button className={'econ-topic' + (highlight === t.id ? ' hl' : '')} key={t.id} onClick={() => openTopic(c.id, t.id)}>
                              <span className="econ-topic-num">{c.num}.{t.num}</span>
                              <span className="econ-topic-t">{t.title}</span>
                              {t.frequency > 0 && (
                                <span className="econ-freq" title="How often CUET has asked this">
                                  asked {t.frequency}×<i>{Object.keys(t.years || {}).join(' · ')}</i>
                                </span>
                              )}
                              {!(t.frequency > 0) && t.tier && (
                                <span className={'econ-tier t-' + t.tier} title="Exam weightage">
                                  {t.tier === 'high' ? 'High' : t.tier === 'medium' ? 'Medium' : 'Low'}
                                </span>
                              )}
                              <ChevronRight size={14} className="econ-topic-arrow" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}

                {soon.length > 0 && (
                  <div className="econ-soon">
                    {soon.map(c => (
                      <button
                        className="econ-soon-row"
                        key={c.id}
                        title={c.desc}
                        onClick={() => setOpen({ chapter: c.id, topic: null })}
                      >
                        <span className="econ-soon-num">Ch {c.num}</span>
                        <span className="econ-soon-t">{c.title}</span>
                        <span className="econ-soon-chip">notes coming soon</span>
                        <ChevronRight size={14} className="econ-topic-arrow" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}

function NoteDashboard({ src, title, subject, record }) {
  const ref = useRef(null)
  const roRef = useRef(null)
  const rafRef = useRef(null)
  const [ready, setReady] = useState(false)

  function syncHeight() {
    const f = ref.current
    if (!f || !f.contentDocument) return
    const doc = f.contentDocument
    const de = doc.documentElement, b = doc.body
    const h = Math.max(de ? de.scrollHeight : 0, b ? b.scrollHeight : 0, de ? de.offsetHeight : 0)
    if (h > 0) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => { if (ref.current) ref.current.style.height = h + 'px' })
    }
    setReady(true)
  }

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); if (roRef.current) { roRef.current.disconnect(); roRef.current = null } }, [])

  function handleLoad() {
    record({ title: subject + ' notes', subject, detail: 'notes', pct: 40 })
    const f = ref.current
    if (!f || !f.contentDocument) return
    try {
      if (window.ResizeObserver) {
        if (roRef.current) roRef.current.disconnect()
        const ro = new ResizeObserver(() => syncHeight())
        roRef.current = ro
        if (f.contentDocument.body) ro.observe(f.contentDocument.body)
        if (f.contentDocument.documentElement) ro.observe(f.contentDocument.documentElement)
      }
    } catch {}
    let tries = 0
    const poll = () => { syncHeight(); if (tries++ < 40) setTimeout(poll, 250) }
    poll()
  }

  return (
    <div className="sk-note-inline">
      {!ready && (
        <div className="sk-note-loading">
          <span className="sk-note-loading-spin" />
          <span>Loading notes…</span>
        </div>
      )}
      <iframe
        ref={ref}
        src={src}
        title={title}
        className="sk-note-inline-frame"
        onLoad={handleLoad}
        scrolling="no"
        style={ready ? undefined : { position: 'absolute', visibility: 'hidden', width: '100%' }}
      />
    </div>
  )
}

function NotesView({ stream, subject, record }) {
  if (subject === 'Economics') {
    return <NotesBreakdown units={ECON_UNITS} base="/econ-notes/index.html" label="Economics" record={record} />
  }
  if (subject === 'Geography') {
    return <NotesBreakdown units={GEO_UNITS} base="/geo-notes/index.html" label="Geography" record={record} />
  }

  const subs = NOTES_BY_STREAM[stream] || NOTES_BY_STREAM.Commerce
  const list = subject === 'all' ? subs : subs.filter(n => n.s === subject)
  if (list.length === 0) return <p className="muted-empty">Notes for {subject} are being prepared — check back soon.</p>
  return (
    <div className="sk-subgrid">
      {list.map(n => (
        <div className="sk-subcard" key={n.s}>
          <div className="sk-subhead">
            <b>{n.s}</b>
            <span className="sk-prog">{n.done}/{n.chapters.length} done</span>
          </div>
          <div className="sk-bar"><i style={{ width: (n.done / n.chapters.length * 100) + '%' }} /></div>
          {n.chapters.map(c => (
            <button className="sk-chapter" key={c} onClick={() => { record({ title: n.s + ' notes', subject: n.s, detail: c, pct: 60 }); alert('Deep-link → ' + n.s + ' notes: ' + c) }}>
              <span className="sk-dot" style={{ background: n.chapters.indexOf(c) < n.done ? 'var(--green-500)' : 'var(--gray-200)' }} />
              {c}
              <ChevronRight size={13} className="sk-ch-chev" />
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}

function NcertView({ stream, subject }) {
  const subs = NOTES_BY_STREAM[stream] || NOTES_BY_STREAM.Commerce
  const list = subject === 'all' ? subs : subs.filter(n => n.s === subject)
  if (list.length === 0) return <p className="muted-empty">Marked NCERT for {subject} is being prepared — check back soon.</p>
  return (
    <div className="sk-subgrid">
      {list.map(n => (
        <div className="sk-subcard" key={n.s}>
          <div className="sk-subhead">
            <b>{n.s}</b>
            <span className="sk-prog">Marked NCERT</span>
          </div>
          {n.chapters.map(c => (
            <div className="sk-chapter" key={c} style={{ cursor: 'default' }}>
              <span className="sk-dot" style={{ background: 'var(--gray-200)' }} />
              {c}
            </div>
          ))}
        </div>
      ))}
      <p className="muted-empty">Marked NCERT PDFs are being prepared — each chapter's highlighted pages will appear here.</p>
    </div>
  )
}

const FLASHCARDS = [
  { f: 'Repo Rate', b: 'The rate at which RBI lends short-term funds to commercial banks' },
  { f: 'Liquidity', b: 'How quickly an asset can be converted into cash' },
  { f: 'Opportunity Cost', b: 'The value of the next best alternative you gave up' },
  { f: 'Fiscal Deficit', b: 'Total expenditure − total receipts, excluding borrowings' },
]
function FlashView({ record }) {
  const [idx, setIdx] = useState(0)
  const [flip, setFlip] = useState(false)
  const c = FLASHCARDS[idx]
  return (
    <div className="sk-subgrid">
      <div className={`sk-flash ${flip ? 'flip' : ''}`} onClick={() => setFlip(f => !f)}>
        <div className="sk-fc-inner">
          <div className="sk-fc-face sk-fc-front"><b>{c.f}</b><span>tap to flip</span></div>
          <div className="sk-fc-face sk-fc-back"><p>{c.b}</p><span>tap to flip back</span></div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn btn-outline-sm" onClick={() => { setFlip(false); setIdx((idx + 1) % FLASHCARDS.length) }}>Next card</button>
        <button className="btn btn-primary-sm" onClick={() => { record({ title: 'Flashcards', detail: 'deck · card ' + (idx + 1), pct: 30 }); alert('Marked learned — saved to progress') }}>Mark learned</button>
      </div>
    </div>
  )
}

const QUICK_QS = [
  { q: 'What happens when the Repo Rate increases?', o: ['Loans get cheaper', 'Loans get costlier', 'Nothing', 'GDP rises'], a: 1 },
  { q: 'Current Ratio formula:', o: ['CA/CL', 'CL/CA', 'Sales/Profit', 'Debt/Equity'], a: 0 },
]
function QuizView() {
  const [idx, setIdx] = useState(0)
  const [pick, setPick] = useState(null)
  const [score, setScore] = useState(0)
  const q = QUICK_QS[idx]
  const choose = i => {
    if (pick !== null) return
    setPick(i)
    if (i === q.a) setScore(s => s + 1)
    setTimeout(() => { if (idx + 1 < QUICK_QS.length) { setIdx(idx + 1); setPick(null) } }, 800)
  }
  return (
    <div className="sk-subgrid">
      <div className="sk-subcard">
        <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>{idx + 1}. {q.q}</p>
        <div className="ch-opts">
          {q.o.map((o, i) => {
            let cls = 'ch-opt'
            if (pick !== null) { if (i === q.a) cls += ' c'; else if (i === pick) cls += ' w' }
            return <button key={i} className={cls} onClick={() => choose(i)} disabled={pick !== null}>{o}</button>
          })}
        </div>
        <div className="ch-pts">{pick !== null ? (pick === q.a ? <span className="ok">✓ Correct!</span> : <span className="no">Wrong</span>) : `Q ${idx + 1}/2 · Score ${score}`}</div>
      </div>
    </div>
  )
}

/* ── PYQ: compact status-coded list, grouped by year accordion ── */
const PYQ_YEARS = [2026, 2025, 2024, 2023, 2022]
const PYQ_SCHEDULE = {
  2022: [['15 Jul', 1], ['15 Jul', 2], ['16 Jul', 1], ['16 Jul', 2]],
  2023: [['21 May', 1], ['21 May', 2], ['22 May', 1], ['22 May', 2]],
  2024: [['15 May', 1], ['15 May', 2], ['16 May', 1], ['16 May', 2]],
  2025: [['08 May', 1], ['08 May', 2], ['09 May', 1], ['09 May', 2]],
  2026: [['11 May', 1], ['11 May', 2], ['12 May', 1], ['12 May', 2]],
}
/* per-paper attempt state — same shape as mock/attempt tracking elsewhere:
   key absent = not attempted · {status:'progress'} = in progress · {status:'done',score} = completed */
const PYQ_ATTEMPTS = {
  '2026-0': { status: 'progress' },
  '2024-0': { status: 'done', score: 82 },
  '2024-1': { status: 'done', score: 74 },
  '2023-0': { status: 'done', score: 68 },
  '2022-0': { status: 'done', score: 71 },
}
const scoreTone = s => (s >= 75 ? 'good' : s >= 50 ? 'mid' : 'low')

function PyqRow({ p, attempt, scope }) {
  const ShiftIcon = p.shift === 1 ? Sun : Moon
  return (
    <div className="pyq-row">
      <span className={'pyq-row-shift ' + (p.shift === 1 ? 'day' : 'eve')}><ShiftIcon size={15} /></span>
      <span className="pyq-row-date">{p.date} · Shift {p.shift}</span>
      <span className="pyq-row-qs">{p.qs} Qs</span>
      <span className="pyq-row-action">
        {!attempt ? (
          <button className="btn btn-outline-sm" onClick={() => alert(`Deep-link → PYQ: ${scope} ${p.year} · ${p.date} Shift ${p.shift}`)}>Attempt</button>
        ) : attempt.status === 'progress' ? (
          <button className="pyq-resume" onClick={() => alert(`Deep-link → resume PYQ: ${scope} ${p.year} · ${p.date} Shift ${p.shift}`)}>Resume</button>
        ) : (
          <>
            <span className={'pyq-score ' + scoreTone(attempt.score)}>{attempt.score}%</span>
            <button className="pyq-review" onClick={() => alert(`Deep-link → review PYQ: ${scope} ${p.year} · ${p.date} Shift ${p.shift}`)}>Review</button>
          </>
        )}
      </span>
    </div>
  )
}

function PyqView({ subject, stream, weakOnly, setWeakOnly }) {
  const scope = subject === 'all' ? stream : subject
  const [year, setYear] = useState('all')
  const [openYears, setOpenYears] = useState(() => new Set([2026]))
  const weak = weakTopicNames(scope)

  const shiftsFor = y => {
    const qs = scope === 'General Test' ? 50 : 45
    return (PYQ_SCHEDULE[y] || []).map(([d, s], i) => ({ date: d, shift: s, qs, id: `${y}-${i}`, year: y }))
  }
  const papers = PYQ_YEARS.flatMap(y => shiftsFor(y))
  const attempted = papers.filter(p => PYQ_ATTEMPTS[p.id]?.status === 'done')
  const avg = attempted.length ? Math.round(attempted.reduce((s, p) => s + PYQ_ATTEMPTS[p.id].score, 0) / attempted.length) : null

  const meta = y => {
    const ps = shiftsFor(y)
    const done = ps.filter(p => PYQ_ATTEMPTS[p.id]?.status === 'done').length
    const prog = ps.filter(p => PYQ_ATTEMPTS[p.id]?.status === 'progress').length
    return { done, prog, pct: ps.length ? Math.round(done / ps.length * 100) : 0 }
  }

  const toggleYear = y => setOpenYears(s => {
    const n = new Set(s)
    if (n.has(y)) n.delete(y)
    else n.add(y)
    return n
  })

  const yearsToShow = year === 'all' ? PYQ_YEARS : [year]

  return (
    <div className="sk-pyq-flow">
      {/* year filter */}
      <div className="pyq-years">
        <span className="pyq-years-lbl">Year</span>
        <button className={'pyq-yearpill' + (year === 'all' ? ' on' : '')} onClick={() => setYear('all')}>All</button>
        {PYQ_YEARS.map(y => (
          <button key={y} className={'pyq-yearpill' + (year === y ? ' on' : '')} onClick={() => setYear(y)}>{y}</button>
        ))}
      </div>

      <div className="pyq-summary">
        <span className="pyq-summary-num">{attempted.length}/{papers.length}</span>
        <span className="pyq-summary-lbl">papers attempted</span>
        {avg != null && <span className="pyq-summary-avg">· {avg}% avg score</span>}
        <label className="sk-weak-only">
          <input type="checkbox" checked={weakOnly} onChange={e => setWeakOnly(e.target.checked)} />
          <CheckSquare size={13} /> Only show my weak topics
          {weakOnly && <span>· {weak.join(', ')}</span>}
        </label>
      </div>

      {yearsToShow.map(y => {
        const m = meta(y)
        const open = year !== 'all' ? true : openYears.has(y)
        const badge = m.done === 0 && m.prog === 0 ? { t: 'Not started', c: 'empty' } : m.done > 0 ? { t: m.pct + '% done', c: 'done' } : { t: 'In progress', c: 'prog' }
        return (
          <div className={'pyq-yearblock' + (open ? ' open' : '')} key={y}>
            <button type="button" className="pyq-yearhead" aria-expanded={open} onClick={() => { if (year === 'all') toggleYear(y) }}>
              <span className="pyq-year">{y}</span>
              <span className={'pyq-year-badge ' + badge.c}>{badge.t}</span>
              <ChevronDown size={16} className="pyq-year-chev" />
            </button>
            {open && (
              <div className="pyq-rows">
                {shiftsFor(y).map(p => <PyqRow key={p.id} p={p} attempt={PYQ_ATTEMPTS[p.id]} scope={scope} />)}
                {shiftsFor(y).length === 0 && <p className="muted-empty">No papers for this year yet.</p>}
              </div>
            )}
          </div>
        )
      })}
      {weakOnly && weak.length === 0 && <p className="muted-empty">No weak topics for {scope}.</p>}
    </div>
  )
}

function MockView({ examMode, setExamMode }) {
  return (
    <div className="sk-subgrid">
      <div className="sk-subcard">
        <div className="sk-subhead"><b>Mock Test 7 — in progress</b><span className="sk-prog">60%</span></div>
        <div className="sk-bar"><i style={{ width: '60%' }} /></div>
        <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: '10px 0' }}>Section 3 of 5 left — Accountancy (20 Qs). You stopped at Q31.</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary-sm" onClick={() => alert('Deep-link → resume at Q31')}>Resume mock</button>
          <button className="btn btn-outline-sm" onClick={() => alert('Restart from section 1')}>Restart</button>
        </div>
        <div className="sk-exam-mode" style={{ marginTop: 14 }}>
          <span>Exam mode</span>
          <button className={'sk-toggle' + (examMode ? ' on' : '')} onClick={() => setExamMode(m => !m)} aria-label="Toggle exam mode"><i /></button>
          <span className="sk-exam-hint">{examMode ? 'Fullscreen · timer cannot be paused' : 'Pause allowed'}</span>
        </div>
      </div>
      <div className="sk-subcard">
        <div className="sk-subhead"><b>Completed mocks</b><span className="sk-prog">4 done</span></div>
        <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: '6px 0' }}>Average percentile: <b style={{ color: 'var(--text-primary)' }}>71.8%ile</b></p>
        <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Mock 4 · 67.5%ile · Mock 5 · 60.8%ile · Mock 6 · 67.5%ile</p>
      </div>
    </div>
  )
}

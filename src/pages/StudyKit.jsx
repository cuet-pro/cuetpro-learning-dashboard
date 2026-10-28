import { useEffect, useRef, useState } from 'react'
import { NotebookText, Layers, Timer, FileQuestion, Archive, ArrowLeft, ArrowRight, PlayCircle, Video, Sigma, Zap, ChevronRight, ChevronDown, CheckSquare, Search, GraduationCap, Highlighter, FlaskConical, Settings, Sun, Moon, BookOpen, Lightbulb, AlertTriangle, RotateCcw, Clock, XCircle, Trophy, CheckCircle2 } from 'lucide-react'
import { weakTopicNames } from '../lib/analysisData'
import { ECON_UNITS } from '../data/econNotes'
import { GEO_UNITS } from '../data/geoNotes'
import { useProfile, STREAMS } from '../lib/profile'
import { notesDeepLink, readNotesProgress, writeNotesProgress, lastReadSubject } from '../lib/notesProgress'
import { takeStudyKitTool } from '../lib/studyKitRoute'
import { useGuestGate } from '../lib/guestGate'
import { useToast } from '../components/shell/Shell'
import { fetchFlashcards, fetchFlashcardTopics, fetchCheatSheets, fetchCheatSheet, fetchMocks, fetchMock, fetchQuiz, fetchDailyQuiz } from '../lib/content'
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
  { id: 'flashcards', tone: 'blue', icon: Layers, title: 'Flashcards', desc: 'Swipeable quick-revision cards, mark as learned.', cta: 'Flip 20 cards in 5 minutes', gate: { feature: 'Flashcards', action: 'flip your cards' }, progress: { done: 56, total: 80, label: 'cards mastered' } },
  { id: 'videos', tone: 'amber', icon: Video, title: 'Video lectures', desc: 'Short concept videos — 5-10 min each.', cta: 'Watch one 7-minute concept', progress: { done: 7, total: 12, label: 'watched' } },
  { id: 'cheats', tone: 'violet', icon: Sigma, title: 'Cheat Sheets', desc: 'Every formula and key definition, one page per subject.', cta: 'Revise all formulas in 10 minutes', progress: { done: 4, total: 6, label: 'viewed' } },
  { id: 'ncert', tone: 'violet', icon: Highlighter, title: 'Marked NCERT', desc: 'NCERT textbook pages with exam-relevant lines highlighted, chapter by chapter.', cta: 'Open marked NCERT', progress: { done: 0, total: 18, label: 'chapters' } },
]
const TESTING_TOOLS = [
  { id: 'quizzes', tone: 'blue', icon: Timer, title: '5-Minute Quick Quizzes', desc: 'Short, low-pressure self-checks — repeat anytime.', cta: 'Take today’s quick quiz', gate: { feature: 'Quick Quizzes', action: 'take a quick quiz' }, meta: { streak: '3-day streak', last: 'Last score 82%' } },
  { id: 'mocks', tone: 'amber', icon: FileQuestion, title: 'Mock Tests', desc: 'Full-length, CUET-pattern, timed & auto-scored.', cta: 'Resume Mock 7 · 3 sections left', gate: { feature: 'Mock Tests', action: 'attempt the mock test' }, meta: { inProgress: 'Mock Test 7 · 60%', sub: 'Section 3 of 5 left' } },
  { id: 'pyqs', tone: 'red', icon: Archive, title: 'Previous Year Questions', desc: 'Shift-wise & topic-wise PYQ bank, filterable.', cta: 'Browse 2022–2026, shift-wise', progress: { done: 60, total: 100, label: 'attempted' } },
]
const ALL_TOOLS = [...LEARNING_TOOLS, ...TESTING_TOOLS]

export default function StudyKit({ onNavigate }) {
  const [profile] = useProfile()
  const gate = useGuestGate()
  const toast = useToast()
  const stream = profile.stream
  const [subject, setSubject] = useState(() => {
    const dl = notesDeepLink()
    return (dl && (STREAMS[profile.stream] || []).includes(dl.subject)) ? dl.subject : 'all'
  })
  const [selected, setSelected] = useState(() => {
    const tool = takeStudyKitTool()
    if (tool) return tool
    return notesDeepLink() ? 'notes' : null
  })
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
    const run = () => {
      if (t.id === 'notes' && subject === 'all') {
        const s = lastReadSubject()
        if (s && (STREAMS[stream] || []).includes(s)) setSubject(s)
      }
      setSelected(t.id)
    }
    if (t.gate) gate(t.gate.feature, t.gate.action, run)
    else run()
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
          <button className="btn btn-primary-sm" onClick={() => gate('Continue Learning', 'resume your last activity', () => { if (lastActivity && (lastActivity.subject === 'Economics' || lastActivity.subject === 'Geography')) { setSubject(lastActivity.subject); setSelected('notes') } else toast('Resume — coming soon') })}>Resume</button>
        </section>
      )}

      {/* Focus mock banner */}
      <section className="sk-focusmock">
        <div className="sk-focusmock-ico"><Zap size={20} /></div>
        <div className="sk-focusmock-info">
          <h3>Focus mock</h3>
          <p>A short mock built only from what you need to work on right now — about 20 minutes.</p>
        </div>
        <button className="btn btn-primary-sm" onClick={() => gate('Focus Mock', 'generate a focus mock', () => toast('Focus mock — coming soon'))}>Generate focus mock</button>
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
            {selected === 'cheats' && <CheatSheetView record={record} />}
            {selected === 'videos' && (
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
                    onClick={() => { openTool(t) }}
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

function FlashView({ record }) {
  const gate = useGuestGate()
  const toast = useToast()
  const [topics, setTopics] = useState([])
  const [topic, setTopic] = useState(null)
  const [cards, setCards] = useState([])
  const [idx, setIdx] = useState(0)
  const [flip, setFlip] = useState(false)

  useEffect(() => {
    let alive = true
    fetchFlashcardTopics().then(({ data }) => {
      if (alive && data && data.length) { setTopics(data); setTopic(data[0].topic) }
    })
    return () => { alive = false }
  }, [])

  useEffect(() => {
    if (!topic) return
    let alive = true
    fetchFlashcards(topic, 100).then(({ data }) => {
      if (alive && data && data.length) { setCards(data); setIdx(0); setFlip(false) }
    })
    return () => { alive = false }
  }, [topic])

  const c = cards[idx]
  const total = cards.length

  return (
    <div className="sk-subgrid">
      <div className="fc-decks">
        <label className="fc-decks-lbl">Deck</label>
        <select className="fc-decks-sel" value={topic || ''} onChange={e => setTopic(e.target.value)}>
          {topics.map(t => <option key={t.topic} value={t.topic}>{t.name}{t.n ? ` (${t.n})` : ''}</option>)}
        </select>
      </div>
      {c ? (
        <>
          <div className={`sk-flash ${flip ? 'flip' : ''}`} onClick={() => gate('Flashcards', 'flip the card', () => setFlip(f => !f))}>
            <div className="sk-fc-inner">
              <div className="sk-fc-face sk-fc-front"><b>{c.front}</b><span>tap to flip</span></div>
              <div className="sk-fc-face sk-fc-back"><p>{c.back}</p><span>tap to flip back</span></div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span className="fc-count">{idx + 1} / {total}</span>
            <button className="btn btn-outline-sm" onClick={() => gate('Flashcards', 'go to the next card', () => { setFlip(false); setIdx((idx + 1) % total) })}>Next card</button>
            <button className="btn btn-primary-sm" onClick={() => gate('Flashcards', 'mark a card learned', () => { record({ title: 'Flashcards', detail: 'deck · card ' + (idx + 1), pct: 30 }); toast('Marked learned — saved to progress') })}>Mark learned</button>
          </div>
        </>
      ) : (
        <p className="muted-empty">Loading flashcards…</p>
      )}
    </div>
  )
}

/* ── Cheat Sheets — 28 quick-revision sheets, 3 pages each ─────────────── */

const CHEAT_CATS = ['Reading Comprehension', 'Vocabulary', 'Grammar']

function CheatCard({ cell }) {
  const lines = (cell || '').split('\n').map(l => l.trim()).filter(Boolean)
  if (lines.length === 0) return null
  const title = lines[0]
  const body = lines.slice(1)
  return (
    <div className="cs-card">
      <b className="cs-card-t">{title}</b>
      {body.map((l, i) => <span className="cs-card-l" key={i}>{l}</span>)}
    </div>
  )
}

function TrapTable({ rows }) {
  return (
    <table className="cs-trap">
      <thead>
        <tr><th className="w">WRONG</th><th className="r">RIGHT</th><th>WHY</th></tr>
      </thead>
      <tbody>
        {rows.slice(1).map((r, i) => (
          <tr key={i}>
            <td className="w">{r[0]}</td>
            <td className="r">{r[1]}</td>
            <td>{r[2]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function CheatTable({ rows }) {
  const isTrap = rows.length > 1 && rows[0].length === 3 && rows[0][0] === 'WRONG' && rows[0][1] === 'RIGHT'
  if (isTrap) return <TrapTable rows={rows} />
  const cells = rows.flat()
  return (
    <div className="cs-cards">
      {cells.map((cell, i) => <CheatCard cell={cell} key={i} />)}
    </div>
  )
}

const BOX_META = {
  'memory-hack': { icon: Lightbulb, cls: 'mem', label: 'Memory hack' },
  'exam-trap': { icon: AlertTriangle, cls: 'trap', label: 'Exam traps' },
  'recap': { icon: RotateCcw, cls: 'recap', label: '60-second recap' },
}

function CheatBox({ b }) {
  const meta = BOX_META[b.kind] || BOX_META['recap']
  const Icon = meta.icon
  const lines = (b.text || '').split('\n').map(l => l.trim()).filter(Boolean)
  return (
    <div className={'cs-box ' + meta.cls}>
      <div className="cs-box-head"><Icon size={14} /> <b>{b.title}</b></div>
      <div className="cs-box-body">{lines.map((l, i) => <p key={i}>{l}</p>)}</div>
    </div>
  )
}

function CheatBlock({ b }) {
  switch (b.t) {
    case 'heading': return <h5 className="cs-head">{b.text}</h5>
    case 'text': return <p className="cs-text">{b.text}</p>
    case 'answers': return <p className="cs-answers"><b>Answers</b>{b.text.replace(/^answers:\s*/i, '')}</p>
    case 'box': return <CheatBox b={b} />
    case 'table': return <CheatTable rows={b.rows} />
    default: return null
  }
}

function CheatSheetDoc({ sheet, onBack }) {
  return (
    <div className="cs-doc">
      <button className="sk-back" onClick={onBack}><ArrowLeft size={15} /> All cheat sheets</button>
      <header className="cs-doc-head">
        <span className="cs-doc-cat">{sheet.category}</span>
        <h3>{sheet.num}. {sheet.title}</h3>
        {sheet.tagline && <p className="cs-doc-tag">{sheet.tagline}</p>}
        {sheet.intro && <p className="cs-doc-intro">{sheet.intro}</p>}
      </header>
      {sheet.pages.map(p => (
        <section className="cs-page" key={p.n}>
          <div className="cs-page-head">
            <span className="cs-page-n">{p.n}</span>
            <div>
              <b>{p.title}</b>
              {p.subtitle && <em>{p.subtitle}</em>}
            </div>
          </div>
          <div className="cs-blocks">
            {p.blocks.map((b, i) => <CheatBlock b={b} key={i} />)}
          </div>
        </section>
      ))}
    </div>
  )
}

function CheatSheetView({ record }) {
  const [sheets, setSheets] = useState([])
  const [cat, setCat] = useState('Grammar')
  const [open, setOpen] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let alive = true
    fetchCheatSheets().then(({ data }) => { if (alive && data) setSheets(data) })
    return () => { alive = false }
  }, [])

  const openSheet = num => {
    setBusy(true)
    fetchCheatSheet(num).then(({ data }) => {
      setOpen(data || null)
      setBusy(false)
      if (data) record({ title: 'Cheat Sheets', detail: data.title, pct: 50 })
    })
  }

  if (open) return <CheatSheetDoc sheet={open} onBack={() => setOpen(null)} />

  const shown = sheets.filter(s => s.category === cat)
  return (
    <div className="cs">
      <div className="cs-cats">
        {CHEAT_CATS.map(c => (
          <button key={c} className={'cs-cat' + (cat === c ? ' on' : '')} onClick={() => setCat(c)}>{c}</button>
        ))}
      </div>
      <div className="cs-grid">
        {shown.map(s => (
          <button key={s.num} className="cs-sheet" onClick={() => openSheet(s.num)}>
            <span className="cs-sheet-num">{s.num}</span>
            <span className="cs-sheet-t">
              <b>{s.title}</b>
              {s.tagline && <em>{s.tagline}</em>}
            </span>
            <ChevronRight size={14} className="cs-sheet-arr" />
          </button>
        ))}
      </div>
      {shown.length === 0 && <p className="muted-empty">{busy ? 'Opening…' : 'Loading cheat sheets…'}</p>}
    </div>
  )
}

/* ── 5-Minute Quick Quizzes — live from Supabase ─────────────────────── */

const QUIZ_TOPICS = [
  { key: 'mixed', name: 'Mixed' },
  { key: 'synonyms', name: 'Synonyms' },
  { key: 'antonyms', name: 'Antonyms' },
  { key: 'voice', name: 'Active & Passive Voice' },
  { key: 'tenses', name: 'Tenses' },
  { key: 'direct-indirect-speech', name: 'Direct & Indirect Speech' },
]
const QUIZ_LEN = 8

/* what the question asks — the stem is just the word, so name the task */
const QZ_TASK = {
  'synonyms': 'Choose the SYNONYM',
  'antonyms': 'Choose the ANTONYM',
  'voice': 'Choose the correct VOICE conversion',
  'tenses': 'Choose the correct TENSE',
  'direct-indirect-speech': 'Choose the correct option',
}

function QuizView() {
  const gate = useGuestGate()
  const toast = useToast()
  const [topic, setTopic] = useState('mixed')
  const [phase, setPhase] = useState('setup')
  const [questions, setQuestions] = useState([])
  const [idx, setIdx] = useState(0)
  const [pick, setPick] = useState(null)
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(false)

  const start = () => {
    gate('Quick Quizzes', 'take a quick quiz', () => {
      setLoading(true)
      const p = topic === 'mixed' ? fetchDailyQuiz(QUIZ_LEN) : fetchQuiz(topic, 200)
      p.then(({ data }) => {
        setLoading(false)
        if (!data || !data.length) { toast('No questions in this topic yet'); return }
        const shuffled = [...data].sort(() => Math.random() - 0.5).slice(0, QUIZ_LEN)
        setQuestions(shuffled); setIdx(0); setPick(null); setScore(0); setPhase('quiz')
      })
    })
  }

  const q = phase === 'quiz' ? questions[idx] : null
  const correctIdx = q ? (q.answer_index != null ? q.answer_index : (q.options || []).indexOf(q.answer)) : -1

  const choose = i => {
    if (pick !== null) return
    setPick(i)
    if (i === correctIdx) setScore(s => s + 1)
  }
  const next = () => {
    if (idx + 1 < questions.length) { setIdx(idx + 1); setPick(null) }
    else setPhase('done')
  }

  if (phase === 'setup') {
    return (
      <div className="sk-subgrid">
        <div className="qz-setup">
          <div className="qz-setup-t">
            <b>Pick a topic</b>
            <span>8 questions · instant feedback · repeat anytime</span>
          </div>
          <div className="qz-topics">
            {QUIZ_TOPICS.map(t => (
              <button key={t.key} className={'qz-topic' + (topic === t.key ? ' on' : '')} onClick={() => setTopic(t.key)}>{t.name}</button>
            ))}
          </div>
          <button className="btn btn-primary-sm" onClick={start} disabled={loading}>{loading ? 'Loading…' : 'Start quiz'} <ArrowRight size={13} /></button>
        </div>
      </div>
    )
  }

  if (phase === 'done') {
    const acc = questions.length ? Math.round((score / questions.length) * 100) : 0
    return (
      <div className="sk-subgrid">
        <div className="qz-done">
          <Trophy size={22} />
          <b>{score} / {questions.length}</b>
          <span>{acc}% accuracy</span>
          <p>{acc >= 75 ? 'Great job — you have this down.' : acc >= 50 ? 'Solid — review the misses and go again.' : 'Keep practising — run it back.'}</p>
          <div className="qz-done-btns">
            <button className="btn btn-outline-sm" onClick={() => setPhase('setup')}>Change topic</button>
            <button className="btn btn-primary-sm" onClick={start}>Try again</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="sk-subgrid">
      <div className="sk-subcard">
        <div className="qz-top">
          <span className="qz-tag">{QUIZ_TOPICS.find(t => t.key === topic)?.name}</span>
          <span className="qz-prog">{idx + 1} / {questions.length} · Score {score}</span>
        </div>
        <div className="qz-bar"><i style={{ width: (((idx + (pick !== null ? 1 : 0)) / questions.length) * 100) + '%' }} /></div>
        <span className="qz-task">{QZ_TASK[q.topic] || 'Choose the correct option'}</span>
        <p className="qz-q">{q.question}</p>
        <div className="qz-opts">
          {q.options.map((o, i) => {
            let cls = 'qz-opt'
            if (pick !== null) {
              if (i === correctIdx) cls += ' c'
              else if (i === pick) cls += ' w'
            }
            return (
              <button key={i} className={cls} onClick={() => choose(i)} disabled={pick !== null}>
                <span className="qz-opt-l">{'ABCD'[i]}</span>
                <span className="qz-opt-t">{o}</span>
              </button>
            )
          })}
        </div>
        {pick !== null && (
          <div className="qz-feedback">
            <span className={pick === correctIdx ? 'qz-fb ok' : 'qz-fb no'}>{pick === correctIdx ? '✓ Correct!' : '✗ Wrong'}</span>
            {pick !== correctIdx && <em>Correct answer: {q.options[correctIdx]}</em>}
            {q.explanation && <p>{q.explanation}</p>}
            <button className="btn btn-primary-sm" onClick={next}>{idx + 1 < questions.length ? 'Next question' : 'See results'} <ArrowRight size={13} /></button>
          </div>
        )}
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

function PyqRow({ p, attempt }) {
  const gate = useGuestGate()
  const toast = useToast()
  const ShiftIcon = p.shift === 1 ? Sun : Moon
  return (
    <div className="pyq-row">
      <span className={'pyq-row-shift ' + (p.shift === 1 ? 'day' : 'eve')}><ShiftIcon size={15} /></span>
      <span className="pyq-row-date">{p.date} · Shift {p.shift}</span>
      <span className="pyq-row-qs">{p.qs} Qs</span>
      <span className="pyq-row-action">
        {!attempt ? (
          <button className="btn btn-outline-sm" onClick={() => gate('PYQ Papers', 'attempt this paper', () => toast('PYQ attempt — coming soon'))}>Attempt</button>
        ) : attempt.status === 'progress' ? (
          <button className="pyq-resume" onClick={() => gate('PYQ Papers', 'resume this paper', () => toast('PYQ resume — coming soon'))}>Resume</button>
        ) : (
          <>
            <span className={'pyq-score ' + scoreTone(attempt.score)}>{attempt.score}%</span>
            <button className="pyq-review" onClick={() => gate('PYQ Papers', 'review this paper', () => toast('PYQ review — coming soon'))}>Review</button>
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
                {shiftsFor(y).map(p => <PyqRow key={p.id} p={p} attempt={PYQ_ATTEMPTS[p.id]} />)}
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

/* ── Mock Tests — live papers from Supabase ─────────────────────────── */

const MK_CORRECT = 5
const MK_WRONG = -1
const LETTERS = 'ABCD'

function fmtClock(s) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return String(m).padStart(2, '0') + ':' + String(sec).padStart(2, '0')
}

function MockView({ examMode, setExamMode }) {
  const gate = useGuestGate()
  const toast = useToast()
  const [list, setList] = useState([])
  const [mock, setMock] = useState(null)
  const [phase, setPhase] = useState('list')
  const [answers, setAnswers] = useState({})
  const [idx, setIdx] = useState(0)
  const [left, setLeft] = useState(0)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let alive = true
    fetchMocks().then(({ data }) => { if (alive && data) setList(data) })
    return () => { alive = false }
  }, [])

  const tally = () => {
    const qs = (mock && mock.questions) || []
    let c = 0, w = 0, u = 0
    qs.forEach(q => {
      const a = answers[q.num]
      if (!a) u++
      else if (a === q.answer) c++
      else w++
    })
    return { c, w, u, total: qs.length, marks: c * MK_CORRECT + w * MK_WRONG }
  }

  useEffect(() => {
    if (phase !== 'test') return
    if (left <= 0) { setPhase('result'); return }
    const t = setTimeout(() => setLeft(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, left])

  const startMock = num => {
    gate('Mock Tests', 'attempt the mock test', () => {
      setBusy(true)
      fetchMock(num).then(({ data }) => {
        setBusy(false)
        if (!data) { toast('Could not load this mock'); return }
        setMock(data); setAnswers({}); setIdx(0)
        setLeft((data.duration_min || 45) * 60); setPhase('test')
      })
    })
  }

  const backToList = () => { setPhase('list'); setMock(null); setAnswers({}); setIdx(0) }

  if (phase === 'list') {
    return (
      <div className="sk-subgrid">
        <div className="mk-top">
          <div className="mk-top-t">
            <b>CUET English mock tests</b>
            <span>{list.length} full papers · +{MK_CORRECT} correct · {MK_WRONG} wrong · 45 min each</span>
          </div>
          <div className="sk-exam-mode">
            <span>Exam mode</span>
            <button className={'sk-toggle' + (examMode ? ' on' : '')} onClick={() => setExamMode(m => !m)} aria-label="Toggle exam mode"><i /></button>
            <span className="sk-exam-hint">{examMode ? 'No pausing' : 'Timer strict'}</span>
          </div>
        </div>
        <div className="mk-grid">
          {list.map(m => (
            <button key={m.num} className="mk-card" onClick={() => startMock(m.num)} disabled={busy}>
              <span className="mk-card-top"><b>{m.name}</b><span className="mk-badge">{m.total_questions} Q</span></span>
              <span className="mk-card-meta"><Clock size={12} /> {m.duration_min} min</span>
              <span className="mk-card-secs">
                {(m.sections || []).map(s => <em key={s.name}>{s.name} · {s.count}</em>)}
              </span>
              <span className="mk-card-cta">{busy ? 'Loading…' : 'Start test'} <ArrowRight size={13} /></span>
            </button>
          ))}
          {list.length === 0 && <p className="muted-empty">Loading mock tests…</p>}
        </div>
      </div>
    )
  }

  if (phase === 'result') {
    const s = tally()
    return (
      <div className="sk-subgrid">
        <div className="mk-result">
          <div className="mk-score">
            <Trophy size={20} />
            <b>{s.marks}</b>
            <span>/ {s.total * MK_CORRECT} marks</span>
          </div>
          <div className="mk-stats">
            <div className="mk-stat ok"><CheckCircle2 size={14} /><b>{s.c}</b><span>Correct</span></div>
            <div className="mk-stat no"><XCircle size={14} /><b>{s.w}</b><span>Wrong</span></div>
            <div className="mk-stat sk"><b>{s.u}</b><span>Skipped</span></div>
            <div className="mk-stat pct"><b>{s.total ? Math.round((s.c / s.total) * 100) : 0}%</b><span>Accuracy</span></div>
          </div>
          <button className="btn btn-primary-sm" onClick={backToList}><ArrowLeft size={13} /> Back to mock tests</button>
        </div>
        <div className="mk-review">
          <b className="mk-review-h">Answer review</b>
          {mock.questions.map(q => {
            const a = answers[q.num]
            const ok = a === q.answer
            const cls = a ? (ok ? ' ok' : ' no') : ' sk'
            return (
              <div className={'mk-rev' + cls} key={q.num}>
                <span className="mk-rev-n">Q{q.num}</span>
                <div className="mk-rev-b">
                  <p>{q.question}</p>
                  <span className="mk-rev-a">
                    Your answer: <b>{a ? a + ') ' + q.options[LETTERS.indexOf(a)] : 'not attempted'}</b>
                    {!ok && <> · Correct: <b className="mk-rev-c">{q.answer}) {q.options[LETTERS.indexOf(q.answer)]}</b></>}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const qs = mock.questions
  const q = qs[idx]
  const answered = Object.keys(answers).length
  return (
    <div className="mk-test">
      <div className="mk-bar">
        <div className="mk-bar-l"><b>{mock.name}</b><span>{answered}/{qs.length} answered</span></div>
        <div className={'mk-timer' + (left < 300 ? ' low' : '')}><Clock size={13} /> {fmtClock(left)}</div>
        <button className="btn btn-primary-sm" onClick={() => { if (window.confirm('Submit the test and see your score?')) setPhase('result') }}>Submit</button>
      </div>
      <div className="mk-palette">
        {qs.map((qq, i) => (
          <button key={qq.num}
            className={'mk-pal' + (i === idx ? ' cur' : '') + (answers[qq.num] ? ' done' : '')}
            onClick={() => setIdx(i)}>{qq.num}</button>
        ))}
      </div>
      <div className="mk-q">
        <div className="mk-q-head">
          <span className="mk-q-num">Question {q.num}</span>
          <span className="mk-q-sec">{q.section}</span>
        </div>
        {q.passage && (
          <div className="mk-passage">
            <b>{q.passage.title}</b>
            <p>{q.passage.text}</p>
          </div>
        )}
        <p className="mk-stem">{q.question}</p>
        <div className="mk-opts">
          {q.options.map((o, i) => {
            const L = LETTERS[i]
            const sel = answers[q.num] === L
            return (
              <button key={i} className={'mk-opt' + (sel ? ' sel' : '')} onClick={() => setAnswers(a => ({ ...a, [q.num]: L }))}>
                <span className="mk-opt-l">{L}</span>
                <span className="mk-opt-t">{o}</span>
              </button>
            )
          })}
        </div>
        <div className="mk-nav">
          <button className="btn btn-outline-sm" onClick={() => setIdx(i => Math.max(0, i - 1))} disabled={idx === 0}><ArrowLeft size={13} /> Previous</button>
          <button className="btn btn-outline-sm" onClick={() => setAnswers(a => { const b = { ...a }; delete b[q.num]; return b })}>Clear</button>
          <button className="btn btn-primary-sm" onClick={() => setIdx(i => Math.min(qs.length - 1, i + 1))} disabled={idx === qs.length - 1}>Next <ArrowRight size={13} /></button>
        </div>
      </div>
    </div>
  )
}

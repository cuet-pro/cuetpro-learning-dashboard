import { useEffect, useState } from 'react'
import {
  NotebookText, Layers, Map as MapIcon, Dumbbell, Timer, FileQuestion, Archive, ArrowLeft,
  BookOpen, PlayCircle, ListChecks, Video, Sigma, Zap, ChevronRight, Flame, Target, CheckSquare,
  Search, GraduationCap, FlaskConical, Settings, Maximize2, Minimize2,
} from 'lucide-react'
import { boostRanking, weakTopicNames, allSubSkills } from '../lib/analysisData'
import { useProfile, STREAMS } from '../lib/profile'
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
  { id: 'notes', tone: 'green', icon: NotebookText, title: 'Notes', desc: 'Concise NCERT-based notes, chapter by chapter.', progress: { done: 12, total: 18, label: 'chapters' } },
  { id: 'flashcards', tone: 'blue', icon: Layers, title: 'Flashcards', desc: 'Swipeable quick-revision cards, mark as learned.', progress: { done: 56, total: 80, label: 'cards mastered' } },
  { id: 'mindmaps', tone: 'violet', icon: MapIcon, title: 'Mind Maps', desc: 'Visual chapter maps for fast pre-exam revision.', progress: { done: 6, total: 10, label: 'viewed' } },
  { id: 'exercises', tone: 'green', icon: Dumbbell, title: 'Exercises', desc: 'Topic-wise practice tied to specific topics.', progress: { done: 9, total: 14, label: 'sets done' } },
  { id: 'videos', tone: 'amber', icon: Video, title: 'Video lectures', desc: 'Short concept videos — 5-10 min each.', progress: { done: 7, total: 12, label: 'watched' } },
  { id: 'formulas', tone: 'violet', icon: Sigma, title: 'Formula sheets', desc: 'Quick-reference formula cards per subject.', progress: { done: 4, total: 6, label: 'viewed' } },
]
const TESTING_TOOLS = [
  { id: 'quizzes', tone: 'blue', icon: Timer, title: '5-Minute Quick Quizzes', desc: 'Short, low-pressure self-checks — repeat anytime.', meta: { streak: '3-day streak', last: 'Last score 82%' } },
  { id: 'mocks', tone: 'amber', icon: FileQuestion, title: 'Mock Tests', desc: 'Full-length, CUET-pattern, timed & auto-scored.', meta: { inProgress: 'Mock Test 7 · 60%', sub: 'Section 3 of 5 left' } },
  { id: 'pyqs', tone: 'red', icon: Archive, title: 'Previous Year Questions', desc: 'Shift-wise & topic-wise PYQ bank, filterable.', progress: { done: 60, total: 100, label: 'attempted' } },
]
const ALL_TOOLS = [...LEARNING_TOOLS, ...TESTING_TOOLS]

export default function StudyKit({ onNavigate }) {
  const [profile] = useProfile()
  const stream = profile.stream
  const [subject, setSubject] = useState('all')
  const [selected, setSelected] = useState(null)
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

  return (
    <div className="page">
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
          <button className="btn btn-primary-sm" onClick={() => alert('Deep-link → resume: ' + lastActivity.title)}>Resume</button>
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
            {selected === 'flashcards' && <FlashView record={record} />}
            {selected === 'quizzes' && <QuizView />}
            {selected === 'pyqs' && <PyqView subject={subject} stream={stream} weakOnly={weakOnly} setWeakOnly={setWeakOnly} />}
            {selected === 'mocks' && <MockView examMode={examMode} setExamMode={setExamMode} />}
            {(selected === 'mindmaps' || selected === 'exercises' || selected === 'videos' || selected === 'formulas') && (
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
                      onClick={() => { setSelected(t.id) }}
                    >
                      <span className="sk-tcard-ico"><t.icon size={18} /></span>
                      <span className="sk-tcard-t">
                        <b>{t.title}</b>
                        <em>{p.total > 0 ? p.done + '/' + p.total + ' ' + p.label : t.desc}</em>
                      </span>
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
function NoteDashboard({ src, title, subject, record }) {
  const [full, setFull] = useState(false)

  useEffect(() => {
    if (!full) return
    const onKey = e => { if (e.key === 'Escape') setFull(false) }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [full])

  return (
    <div className={'sk-note-wrap' + (full ? ' full' : '')}>
      <div className="sk-note-bar">
        <span className="sk-note-bar-t">{subject} notes</span>
        <button className="sk-note-fs" onClick={() => setFull(f => !f)} title={full ? 'Minimize (Esc)' : 'Full screen'}>
          {full ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          <span>{full ? 'Minimize' : 'Full screen'}</span>
        </button>
      </div>
      <iframe
        src={src}
        title={title}
        className="sk-econ-frame"
        onLoad={() => record({ title: subject + ' notes', subject, detail: full ? 'full screen' : 'dashboard', pct: 40 })}
      />
    </div>
  )
}

function NotesView({ stream, subject, record }) {
  if (subject === 'Economics') {
    return (
      <div className="sk-econ-wrap">
        <p className="sk-econ-note">Economics notes dashboard — pattern breakdown, chapters & syllabus.</p>
        <NoteDashboard src="/econ-notes/index.html" title="Economics notes — CUET Pro" subject="Economics" record={record} />
      </div>
    )
  }
  if (subject === 'Geography') {
    return (
      <div className="sk-econ-wrap">
        <p className="sk-econ-note">Geography notes dashboard — NCERT chapters, syllabus & exam pattern.</p>
        <NoteDashboard src="/geo-notes/index.html" title="Geography notes — CUET Pro" subject="Geography" record={record} />
      </div>
    )
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

/* ── PYQ: subject-aware + year filter + shift-wise papers ── */
const PYQ_YEARS = [2026, 2025, 2024, 2023, 2022]
const PYQ_SCHEDULE = {
  2022: [['15 Jul', 1], ['15 Jul', 2], ['16 Jul', 1], ['16 Jul', 2]],
  2023: [['21 May', 1], ['21 May', 2], ['22 May', 1], ['22 May', 2]],
  2024: [['15 May', 1], ['15 May', 2], ['16 May', 1], ['16 May', 2]],
  2025: [['08 May', 1], ['08 May', 2], ['09 May', 1], ['09 May', 2]],
  2026: [['11 May', 1], ['11 May', 2], ['12 May', 1], ['12 May', 2]],
}
const PYQ_DONE = { 2022: 20, 2023: 35, 2024: 60, 2025: 0, 2026: 0 }

function PyqView({ subject, stream, weakOnly, setWeakOnly }) {
  const scope = subject === 'all' ? stream : subject
  const [year, setYear] = useState('all')
  const weak = weakTopicNames(scope)

  /* sections come from the real sub-skill engine for this scope */
  const allSections = allSubSkills(scope).map(s => s.name)
  const sections = weakOnly && weak.length ? weak : allSections.slice(0, 4)

  const shiftsFor = y => {
    const qs = scope === 'General Test' ? 50 : 45
    return (PYQ_SCHEDULE[y] || []).map(([d, s]) => ({ date: d, shift: s, qs, id: `${y}-${d}-${s}` }))
  }
  const yearsToShow = year === 'all' ? PYQ_YEARS : [year]

  return (
    <div className="sk-subgrid">
      <label className="sk-weak-only">
        <input type="checkbox" checked={weakOnly} onChange={e => setWeakOnly(e.target.checked)} />
        <CheckSquare size={13} /> Only show my weak topics
        <span>{weakOnly ? `· ${weak.join(', ')}` : ''}</span>
      </label>

      {/* year filter */}
      <div className="pyq-years">
        <span className="pyq-years-lbl">Year</span>
        <button className={'pyq-year' + (year === 'all' ? ' on' : '')} onClick={() => setYear('all')}>All</button>
        {PYQ_YEARS.map(y => (
          <button key={y} className={'pyq-year' + (year === y ? ' on' : '')} onClick={() => setYear(y)}>{y}</button>
        ))}
      </div>

      {year !== 'all' && (
        <div className="pyq-progress">
          <div className="sk-card-bar"><i style={{ width: PYQ_DONE[year] + '%' }} /></div>
          <span>{year} papers · {PYQ_DONE[year]}% attempted</span>
        </div>
      )}

      {yearsToShow.map(y => (
        <div className="pyq-yearblock" key={y}>
          {year === 'all' && <div className="pyq-yearhead">{y}{PYQ_DONE[y] === 0 ? <em> · not started</em> : <em> · {PYQ_DONE[y]}% done</em>}</div>}
          <div className="pyq-shifts">
            {shiftsFor(y).map(sh => (
              <div className="pyq-shift" key={sh.id}>
                <div className="pyq-shift-top">
                  <b>{sh.date} Shift {sh.shift}</b>
                  <span className="pyq-shift-qs">{sh.qs} Qs</span>
                  <button className="btn btn-outline-sm" onClick={() => alert(`Deep-link → PYQ: ${scope} ${y} · ${sh.date} Shift ${sh.shift}`)}>Attempt</button>
                </div>
                <div className="pyq-chips">
                  {sections.map(s => <span className="pyq-chip" key={s}>{s}</span>)}
                </div>
              </div>
            ))}
            {shiftsFor(y).length === 0 && <p className="muted-empty">No papers for this year yet.</p>}
          </div>
        </div>
      ))}
      {weakOnly && sections.length === 0 && <p className="muted-empty">No weak topics for {scope}.</p>}
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

import { useState } from 'react'
import { NotebookText, Layers, Map as MapIcon, Dumbbell, Timer, FileQuestion, Archive, ArrowLeft, BookOpen, PlayCircle, ListChecks, Video, Sigma, Zap, ChevronRight, Flame, Target, CheckSquare } from 'lucide-react'
import { boostRanking, weakTopicNames, STREAMS } from '../lib/analysisData'
import './studykit.css'

const STREAM_NAMES = ['Commerce', 'Humanities', 'Science']

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
  { id: 'notes', icon: NotebookText, title: 'Notes', desc: 'Concise NCERT-based notes, chapter by chapter.', progress: { done: 12, total: 18, label: 'chapters' } },
  { id: 'flashcards', icon: Layers, title: 'Flashcards', desc: 'Swipeable quick-revision cards, mark as learned.', progress: { done: 56, total: 80, label: 'cards mastered' } },
  { id: 'mindmaps', icon: MapIcon, title: 'Mind Maps', desc: 'Visual chapter maps for fast pre-exam revision.', progress: { done: 6, total: 10, label: 'viewed' } },
  { id: 'exercises', icon: Dumbbell, title: 'Exercises', desc: 'Topic-wise practice tied to specific topics.', progress: { done: 9, total: 14, label: 'sets done' } },
  { id: 'videos', icon: Video, title: 'Video lectures', desc: 'Short concept videos — 5-10 min each.', progress: { done: 7, total: 12, label: 'watched' } },
  { id: 'formulas', icon: Sigma, title: 'Formula sheets', desc: 'Quick-reference formula cards per subject.', progress: { done: 4, total: 6, label: 'viewed' } },
]

const TESTING_TOOLS = [
  { id: 'quizzes', icon: Timer, title: '5-Minute Quick Quizzes', desc: 'Short, low-pressure self-checks — repeat anytime.' },
  { id: 'mocks', icon: FileQuestion, title: 'Mock Tests', desc: 'Full-length, CUET-pattern, timed & auto-scored.' },
  { id: 'pyqs', icon: Archive, title: 'Previous Year Questions', desc: 'Shift-wise & topic-wise PYQ bank, filterable.' },
]

export default function StudyKit() {
  const [stream, setStream] = useState(() => localStorage.getItem('cp_stream') || 'Commerce')
  const [open, setOpen] = useState(null)
  const [weakOnly, setWeakOnly] = useState(false)
  const [examMode, setExamMode] = useState(false)
  const [lastActivity, setLastActivity] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cp_last') || 'null') } catch { return null }
  })

  const setStreamAndSave = s => { setStream(s); localStorage.setItem('cp_stream', s) }
  const record = item => {
    const v = { ...item, ts: Date.now() }
    setLastActivity(v)
    localStorage.setItem('cp_last', JSON.stringify(v))
  }

  const ranked = boostRanking('all')
  const top3 = ranked.slice(0, 3)
  const weakTopics = weakTopicNames('all')

  const tool = LEARNING_TOOLS.find(t => t.id === open) || TESTING_TOOLS.find(t => t.id === open)

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>Study Kit</h1>
          <p>Learning tools to build understanding, testing tools to prove it.</p>
        </div>
      </header>

      {/* A. Stream selector */}
      <div className="sk-stream">
        <label htmlFor="sk-stream-select">Your stream</label>
        <select id="sk-stream-select" className="sk-select" value={stream} onChange={e => setStreamAndSave(e.target.value)}>
          {STREAM_NAMES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="sk-stream-subjects">{STREAMS[stream].join(' · ')}</span>
      </div>

      {/* B. Continue where you left off */}
      {lastActivity && (
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

      {/* C. Recommended for you — live pull from Boost Plan */}
      {top3.length > 0 && (
        <section className="sk-recommended">
          <div className="sk-rec-head">
            <div className="sk-rec-ico"><Target size={17} /></div>
            <div>
              <h3>Recommended for you</h3>
              <p>Based on where you can improve fastest</p>
            </div>
          </div>
          {top3.map(t => (
            <div className="sk-rec-row" key={t.name + t.subject}>
              <span className="status-dot" style={{ background: t.acc < 50 ? 'var(--red-500)' : t.acc < 75 ? 'var(--warning-500)' : 'var(--green-500)' }} />
              <span className="sk-rec-name">{t.name}<small>{t.subject}</small></span>
              <button className="btn btn-outline-sm" onClick={() => { record({ title: t.name + ' — notes', detail: t.subject + ' · chapter 1', pct: 15 }); alert('Deep-link → notes: ' + t.name) }}>Notes</button>
              <button className="btn btn-outline-sm" onClick={() => { record({ title: t.name + ' — flashcards', detail: t.subject + ' · deck', pct: 30 }); alert('Deep-link → flashcards: ' + t.name) }}>Flashcards</button>
              <button className="btn btn-outline-sm" onClick={() => { record({ title: t.name + ' — exercises', detail: t.subject + ' · set 1', pct: 40 }); alert('Deep-link → exercises: ' + t.name) }}>Exercises</button>
            </div>
          ))}
        </section>
      )}

      {!tool ? (
        <div className="sk-stack">
          {/* Learning tools */}
          <div className="sk-group">
            <div className="sk-group-label"><BookOpen size={16} /> Learning Tools</div>
            <div className="sk-grid">
              {LEARNING_TOOLS.map(t => (
                <div className="sk-card" key={t.id} onClick={() => setOpen(t.id)}>
                  <div className="sk-ico"><t.icon size={20} /></div>
                  <h3>{t.title}</h3>
                  <p>{t.desc}</p>
                  <div className="sk-card-progress">
                    <div className="sk-card-bar"><i style={{ width: (t.progress.done / t.progress.total * 100) + '%' }} /></div>
                    <span>{t.progress.done}/{t.progress.total} {t.progress.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Focus mock */}
          <div className="sk-focusmock">
            <div className="sk-focusmock-ico"><Zap size={20} /></div>
            <div className="sk-focusmock-body">
              <h3>Focus mock</h3>
              <p>A short mock built only from what you need to work on right now — about 20 minutes.</p>
            </div>
            <button className="btn btn-primary-sm" onClick={() => alert('Deep-link → focus mock session (from boost topics: ' + top3.slice(0, 3).map(t => t.name).join(', ') + ')')}>Generate focus mock</button>
          </div>

          {/* Testing tools */}
          <div className="sk-group">
            <div className="sk-group-label"><ListChecks size={16} /> Testing Tools</div>
            <div className="sk-grid sk-grid-testing">
              {/* 5-min quiz */}
              <div className="sk-card" onClick={() => setOpen('quizzes')}>
                <div className="sk-ico"><Timer size={20} /></div>
                <h3>5-Minute Quick Quizzes</h3>
                <p>Short, low-pressure self-checks — repeat anytime.</p>
                <div className="sk-quiz-meta">
                  <span className="sk-streak"><Flame size={12} /> 3-day streak</span>
                  <span className="sk-lastscore">Last score 82%</span>
                </div>
                <button className="btn btn-primary-sm sk-quiz-cta" onClick={e => { e.stopPropagation(); alert('Deep-link → today quiz · +20 pts') }}>Take today's quiz · +20 pts</button>
              </div>

              {/* Mock tests */}
              <div className="sk-card" onClick={() => setOpen('mocks')}>
                <div className="sk-ico"><FileQuestion size={20} /></div>
                <h3>Mock Tests</h3>
                <p>Full-length, CUET-pattern, timed & auto-scored.</p>
                <div className="sk-mock-state">
                  <span className="sk-mock-progress-tag">In progress · 60%</span>
                  <span className="sk-mock-detail">Mock Test 7 · Section 3 of 5 left</span>
                  <button className="btn btn-primary-sm sk-resume-cta" onClick={e => { e.stopPropagation(); alert('Deep-link → resume Mock Test 7 at Q31') }}>Resume</button>
                  <div className="sk-exam-mode" onClick={e => e.stopPropagation()}>
                    <span>Exam mode</span>
                    <button className={'sk-toggle' + (examMode ? ' on' : '')} onClick={() => setExamMode(m => !m)} aria-label="Toggle exam mode">
                      <i />
                    </button>
                    <span className="sk-exam-hint">{examMode ? 'Fullscreen · timer locked' : 'Pause allowed'}</span>
                  </div>
                </div>
              </div>

              {/* PYQ */}
              <div className="sk-card" onClick={() => setOpen('pyqs')}>
                <div className="sk-ico"><Archive size={20} /></div>
                <h3>Previous Year Questions</h3>
                <p>Shift-wise & topic-wise PYQ bank, filterable.</p>
                <div className="sk-card-progress">
                  <div className="sk-card-bar"><i style={{ width: '60%' }} /></div>
                  <span>2024 & 2023 papers · 60% attempted</span>
                </div>
                <label className="sk-weak-only" onClick={e => e.stopPropagation()}>
                  <input type="checkbox" checked={weakOnly} onChange={e => setWeakOnly(e.target.checked)} />
                  <CheckSquare size={13} /> Only show my weak topics
                  <span className="sk-weak-count">{weakOnly ? `· ${weakTopics.join(', ')}` : ''}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="sk-toolview">
          <button className="btn btn-outline-sm" onClick={() => setOpen(null)} style={{ marginBottom: 16 }}><ArrowLeft size={14} /> All tools</button>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-heading-md)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--navy-50)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--navy-500)' }}><tool.icon size={20} /></span>
            {tool.title}
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '6px 0 20px' }}>{tool.desc}</p>

          {open === 'notes' && <NotesView stream={stream} record={record} />}
          {open === 'flashcards' && <FlashView record={record} />}
          {open === 'quizzes' && <QuizView />}
          {open === 'pyqs' && <PyqView weakOnly={weakOnly} />}
          {open === 'mocks' && <MockView examMode={examMode} setExamMode={setExamMode} />}
          {(open === 'mindmaps' || open === 'exercises' || open === 'videos' || open === 'formulas') && (
            <div className="sk-placeholder">
              <PlayCircle size={30} />
              <p>Working content for this tool ships in the next iteration — design is ready, content pipeline is in progress.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function NotesView({ stream, record }) {
  const subs = NOTES_BY_STREAM[stream] || NOTES_BY_STREAM.Commerce
  return (
    <div className="sk-subgrid">
      {subs.map(n => (
        <div className="sk-subcard" key={n.s}>
          <div className="sk-subhead">
            <b>{n.s}</b>
            <span className="sk-prog">{n.done}/{n.chapters.length} done</span>
          </div>
          <div className="sk-bar"><i style={{ width: (n.done / n.chapters.length * 100) + '%' }} /></div>
          {n.chapters.map(c => (
            <button className="sk-chapter" key={c} onClick={() => { record({ title: n.s + ' notes', detail: c, pct: 60 }); alert('Deep-link → ' + n.s + ' notes: ' + c) }}>
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

function PyqView({ weakOnly }) {
  const weak = weakTopicNames('all')
  const items = [
    { s: 'English', sections: ['Reading Comprehension', 'Verbal Ability', 'Vocabulary'], weak: ['Vocabulary'] },
    { s: 'Economics', sections: ['Macro Economics', 'Indian Economy', 'Money & Banking'], weak: ['Money & Banking'] },
    { s: 'General Test', sections: ['Quantitative Ability', 'Logical Reasoning', 'General Knowledge'], weak: ['Quantitative Ability'] },
  ]
  return (
    <div className="sk-subgrid">
      {items.map(it => (
        <div className="sk-subcard" key={it.s}>
          <div className="sk-subhead"><b>{it.s} · PYQ</b><span className="sk-prog">2024 & 2023</span></div>
          {(weakOnly ? it.sections.filter(x => it.weak.includes(x)) : it.sections).map(x => (
            <div className="sk-chapter" key={x}><span className="sk-dot" style={{ background: 'var(--green-500)' }} />{x}<span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-tertiary)' }}>15 Qs</span></div>
          ))}
          {weakOnly && it.sections.filter(x => it.weak.includes(x)).length === 0 && <p className="muted-empty">No weak topics here.</p>}
        </div>
      ))}
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

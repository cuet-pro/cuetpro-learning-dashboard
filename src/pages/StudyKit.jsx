import { useState } from 'react'
import { NotebookText, Layers, Map as MapIcon, Dumbbell, Timer, FileQuestion, Archive, ArrowLeft, BookOpen, PlayCircle, ListChecks } from 'lucide-react'
import './studykit.css'

const TOOLS = [
  { id: 'notes', icon: NotebookText, title: 'Notes', desc: 'Concise NCERT-based notes, chapter by chapter.', group: 'learning' },
  { id: 'flashcards', icon: Layers, title: 'Flashcards', desc: 'Swipeable quick-revision cards, mark as learned.', group: 'learning' },
  { id: 'mindmaps', icon: MapIcon, title: 'Mind Maps', desc: 'Visual chapter maps for fast pre-exam revision.', group: 'learning' },
  { id: 'exercises', icon: Dumbbell, title: 'Exercises', desc: 'Topic-wise practice tied to specific topics.', group: 'learning' },
  { id: 'quizzes', icon: Timer, title: '5-Minute Quick Quizzes', desc: 'Short, low-pressure self-checks — repeat anytime.', group: 'testing' },
  { id: 'mocks', icon: FileQuestion, title: 'Mock Tests', desc: 'Full-length, CUET-pattern, timed & auto-scored.', group: 'testing' },
  { id: 'pyqs', icon: Archive, title: 'Previous Year Questions', desc: 'Shift-wise & topic-wise PYQ bank, filterable.', group: 'testing' },
]

const NOTE_CHAPTERS = [
  { s: 'Economics', chapters: ['National Income Accounting', 'Money & Banking', 'Government Budget', 'Employment & SD', 'Balance of Payments'], done: 3 },
  { s: 'Accountancy', chapters: ['Accounting for Partnership', 'Company Accounts', 'Financial Statement Analysis', 'Cash Flow'], done: 2 },
  { s: 'Business Studies', chapters: ['Principles of Management', 'Business Finance', 'Marketing', 'Consumer Protection'], done: 1 },
]

export default function StudyKit() {
  const [open, setOpen] = useState(null)
  const tool = TOOLS.find(t => t.id === open)

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>Study Kit</h1>
          <p>Learning tools to build understanding, testing tools to prove it.</p>
        </div>
      </header>

      {!tool ? (
        <div className="sk-stack">
          <div className="sk-group">
            <div className="sk-group-label"><BookOpen size={16} /> Learning Tools</div>
            <div className="sk-grid">
              {TOOLS.filter(t => t.group === 'learning').map(t => (
                <ToolCard key={t.id} t={t} onClick={() => setOpen(t.id)} />
              ))}
            </div>
          </div>
          <div className="sk-group">
            <div className="sk-group-label"><ListChecks size={16} /> Testing Tools</div>
            <div className="sk-grid">
              {TOOLS.filter(t => t.group === 'testing').map(t => (
                <ToolCard key={t.id} t={t} onClick={() => setOpen(t.id)} />
              ))}
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

          {open === 'notes' && <NotesView />}
          {open === 'flashcards' && <FlashView />}
          {open === 'quizzes' && <QuizView />}
          {open === 'pyqs' && <PyqView />}
          {(open === 'mindmaps' || open === 'exercises' || open === 'mocks') && (
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

function ToolCard({ t, onClick }) {
  return (
    <div className="sk-card" onClick={onClick}>
      <div className="sk-ico"><t.icon size={20} /></div>
      <h3>{t.title}</h3>
      <p>{t.desc}</p>
    </div>
  )
}

function NotesView() {
  return (
    <div className="sk-subgrid">
      {NOTE_CHAPTERS.map(n => (
        <div className="sk-subcard" key={n.s}>
          <div className="sk-subhead">
            <b>{n.s}</b>
            <span className="sk-prog">{n.done}/{n.chapters.length} done</span>
          </div>
          <div className="sk-bar"><i style={{ width: (n.done / n.chapters.length * 100) + '%' }} /></div>
          {n.chapters.map(c => (
            <div className="sk-chapter" key={c}>
              <span className="sk-dot" style={{ background: n.chapters.indexOf(c) < n.done ? 'var(--green-500)' : 'var(--gray-200)' }} />
              {c}
            </div>
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
function FlashView() {
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
        <button className="btn btn-primary-sm">Mark learned</button>
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

function PyqView() {
  return (
    <div className="sk-subgrid">
      <div className="sk-subcard">
        <div className="sk-subhead"><b>English · PYQ 2025</b><span className="sk-prog">Shift-wise</span></div>
        {['Reading Comprehension', 'Verbal Ability', 'Vocabulary'].map(s => (
          <div className="sk-chapter" key={s}><span className="sk-dot" style={{ background: 'var(--green-500)' }} />{s}<span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-tertiary)' }}>15 Qs</span></div>
        ))}
      </div>
      <div className="sk-subcard">
        <div className="sk-subhead"><b>Economics · PYQ 2025</b><span className="sk-prog">Topic-wise</span></div>
        {['Macro Economics', 'Indian Economy'].map(s => (
          <div className="sk-chapter" key={s}><span className="sk-dot" style={{ background: 'var(--green-500)' }} />{s}<span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-tertiary)' }}>20 Qs</span></div>
        ))}
      </div>
    </div>
  )
}

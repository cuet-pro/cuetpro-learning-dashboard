import { useState } from 'react'
import { CalendarDays, PlayCircle, Flame, CheckCircle2, Layers, FileText, ChevronRight, ArrowLeft, RotateCcw, Check, X } from 'lucide-react'
import { defaultDeck, paceBadge, todayISO, addDaysISO, daysUntil, review, isDue, generateQueue, cheatSheets } from '../lib/spacedRepetition'
import { boostRanking } from '../lib/analysisData'
import './revision.css'

const MISTAKES = [
  { topic: 'Money & banking', subj: 'Economics', count: 4 },
  { topic: 'Quantitative ability', subj: 'General Test', count: 3 },
  { topic: 'Marketing', subj: 'Business Studies', count: 2 },
  { topic: 'Grammar & usage', subj: 'English', count: 2 },
]

export default function SmartRevision() {
  const [examDate, setExamDate] = useState(() => localStorage.getItem('cp_exam_date') || '2027-05-15')
  const [deck, setDeck] = useState(() => {
    try { const d = localStorage.getItem('cp_deck'); return d ? JSON.parse(d) : defaultDeck() } catch { return defaultDeck() }
  })
  const [sessionIdx, setSessionIdx] = useState(null) /* null = not in session */
  const [session, setSession] = useState([])
  const [flip, setFlip] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [done, setDone] = useState(null) /* { correct, total } */

  const saveDeck = d => { setDeck(d); localStorage.setItem('cp_deck', JSON.stringify(d)) }
  const setExamAndSave = v => { setExamDate(v); localStorage.setItem('cp_exam_date', v) }

  const daysLeft = daysUntil(examDate)
  const pace = paceBadge(daysLeft)
  const boost = boostRanking('all')
  const queue = generateQueue({ deck, boost, daysLeft })
  const dueCount = queue.filter(c => c.type !== 'topic').length
  const weakCount = queue.filter(c => c.type === 'topic').length
  const masteredCount = deck.filter(c => c.state === 'mastered').length
  const dueToday = deck.filter(c => isDue(c)).length
  const dueWeek = deck.filter(c => c.next && c.next <= addDaysISO(7) && c.state !== 'mastered').length
  const sheets = cheatSheets(MISTAKES)

  /* cheat sheets float to top in final sprint */
  const showSheetsTop = daysLeft <= 7

  const startSession = () => {
    setSession(queue)
    setSessionIdx(0)
    setFlip(false)
    setCorrectCount(0)
    setDone(null)
  }
  const answer = correct => {
    const item = session[sessionIdx]
    if (correct) setCorrectCount(c => c + 1)
    if (item.type !== 'topic') {
      const updated = review(item, correct)
      const d = deck.map(c => c.id === updated.id ? updated : c)
      saveDeck(d)
    }
    setFlip(false)
    if (sessionIdx + 1 >= session.length) {
      setDone({ correct: correctCount + (correct ? 1 : 0), total: session.length })
      setSessionIdx(null)
    } else {
      setSessionIdx(sessionIdx + 1)
    }
  }

  const sheetBlock = (
    <section className="rv-sheets">
      <h3 className="rv-section-title">Cheat sheets <span className="rv-hint">last-mile review — dense, no explanations</span></h3>
      {sheets.map(s => (
        <div className="rv-sheet" key={s.subject}>
          <span className="rv-sheet-ico"><FileText size={16} /></span>
          <div className="rv-sheet-info">
            <b>{s.subject}</b>
            <span>{s.items}</span>
          </div>
          <span className="rv-sheet-time">{s.lastUpdated}</span>
          <button className="btn btn-outline-sm" onClick={() => alert('Deep-link → cheat sheet: ' + s.subject)}>View</button>
        </div>
      ))}
    </section>
  )

  /* session player */
  if (sessionIdx !== null && session.length) {
    const item = session[sessionIdx]
    return (
      <div className="page">
        <header className="page-head">
          <div>
            <button className="btn btn-outline-sm" onClick={() => { setSessionIdx(null); setSession([]) }} style={{ marginBottom: 14 }}><ArrowLeft size={14} /> Exit revision</button>
            <h1>Smart Revision</h1>
            <p>Mixed session — recall + weak topics · {sessionIdx + 1}/{session.length}</p>
          </div>
        </header>
        <div className="rv-progress"><i style={{ width: ((sessionIdx) / session.length * 100) + '%' }} /></div>
        <div className={`rv-card-flash ${flip ? 'flip' : ''}`} onClick={() => setFlip(f => !f)}>
          <div className="rv-fc-inner">
            <div className="rv-fc-face rv-fc-front">
              <span className="rv-fc-subj">{item.subj}{item.type === 'topic' ? ' · weak topic' : ''}</span>
              <b>{item.front}</b>
              <span className="rv-fc-tip">tap to reveal</span>
            </div>
            <div className="rv-fc-face rv-fc-back">
              <p>{item.back}</p>
              <span className="rv-fc-tip">tap to flip back</span>
            </div>
          </div>
        </div>
        {flip && (
          <div className="rv-answer-row">
            <button className="btn rv-no" onClick={() => answer(false)}><X size={16} /> Not yet</button>
            <button className="btn btn-primary-sm rv-yes" onClick={() => answer(true)}><Check size={16} /> Got it</button>
          </div>
        )}
        {!flip && <p className="rv-flip-hint">Flip the card, recall it, then rate yourself</p>}
      </div>
    )
  }

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>Smart Revision</h1>
          <p>Keep what you've studied fresh — spaced repetition that intensifies as the exam nears.</p>
        </div>
      </header>

      {/* A. Exam countdown header */}
      <section className="rv-countdown">
        <div className="rv-count-ico"><CalendarDays size={22} /></div>
        <div className="rv-count-info">
          <b>{daysLeft} days left</b>
          <span>CUET 2027 · <input type="date" value={examDate} onChange={e => setExamAndSave(e.target.value)} aria-label="Exam date" /></span>
        </div>
        <span className="rv-pace" style={{ background: pace.bg, color: pace.color }}>{pace.label}</span>
      </section>

      {/* B. Today's revision queue */}
      {done && (
        <section className="rv-done">
          <CheckCircle2 size={26} style={{ color: 'var(--green-500)' }} />
          <div>
            <b>Revision complete — {done.correct}/{done.total} recalled</b>
            <span>Recalled items now review later; missed items are back due tomorrow.</span>
          </div>
          <button className="btn btn-outline-sm" onClick={() => setDone(null)}>Done</button>
        </section>
      )}
      <section className="rv-queue">
        <div className="rv-queue-head">
          <h3>Today's revision queue</h3>
          <span className="rv-queue-counts">
            <b style={{ color: 'var(--green-600)' }}>{dueCount} due for recall</b>
            <span>·</span>
            <b style={{ color: 'var(--warning-600)' }}>{weakCount} weak topics</b>
          </span>
        </div>
        <p className="rv-queue-desc">
          {daysLeft <= 7
            ? 'Final sprint — high-exam-weight and weak topics first. Cheat sheets on top for last-mile review.'
            : daysLeft <= 21
              ? 'Ramping up — more weak and high-exam-weight topics mixed into your recall set.'
              : 'Normal pace — mostly spaced-repetition recall, with a light touch of weak topics.'}
        </p>
        <div className="rv-queue-preview">
          {queue.slice(0, 6).map((c, i) => (
            <span key={c.id} className={'rv-qchip ' + (c.type === 'topic' ? 'topic' : '')}>{c.type === 'topic' ? c.front : c.front}</span>
          ))}
          {queue.length > 6 && <span className="rv-qchip more">+{queue.length - 6} more</span>}
        </div>
        <button className="btn btn-primary rv-start" onClick={startSession}><PlayCircle size={17} /> Start revision · {queue.length} cards</button>
      </section>

      {/* C. Retention status */}
      <section className="rv-stats">
        <div className="rv-stat"><b>{dueToday}</b><span>Due today</span></div>
        <div className="rv-stat"><b>{dueWeek}</b><span>Due this week</span></div>
        <div className="rv-stat"><b style={{ color: 'var(--green-600)' }}>{masteredCount}</b><span>Mastered</span></div>
      </section>

      {/* D. Cheat sheets — top in final sprint, bottom otherwise */}
      {showSheetsTop && sheetBlock}

      <section className="rv-session-note">
        <Flame size={15} />
        <span>Each correct recall pushes the next review further out (1 → 3 → 7 → 14 → 30 days). A miss resets it to tomorrow.</span>
      </section>

      {!showSheetsTop && sheetBlock}
    </div>
  )
}

/* Full-screen NTA-style exam interface for Previous Year Papers.
   Rendered outside the app shell (App.jsx swaps it in when a paper is opened).
   State is autosaved to localStorage keyed by paper id; the timer is derived
   from `started_at` so closing the tab never pauses the clock. */
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ChevronLeft, ChevronRight, X, Flag, Maximize, Minimize,
  FileText, ListChecks, LogOut, Keyboard, AlertTriangle, BookOpen,
} from 'lucide-react'
import { useProfile } from '../lib/profile'
import { endExam } from '../lib/examSession'
import {
  PQ_LETTERS, STATUS, STATUS_LABEL, markingScheme, paperDurationSeconds,
  statusOf, countStatuses, computeSummary, fmtClock,
  loadAttemptState, saveAttemptState, clearAttemptState,
  loadPyqAttempts, savePyqAttempts,
} from '../lib/examEngine'
import PyqResult from './PyqResult'
import './exam.css'
import './studykit.css'

const LEGEND_ORDER = [
  STATUS.ANSWERED,
  STATUS.NOT_ANSWERED,
  STATUS.NOT_VISITED,
  STATUS.MARKED,
  STATUS.ANSWERED_MARKED,
]

export default function PyqExam({ paper, onFinish }) {
  const [profile] = useProfile()
  const qs = paper?.questions || []
  const scheme = useMemo(() => markingScheme(paper), [paper])
  const duration = useMemo(() => paperDurationSeconds(paper), [paper])
  const sections = useMemo(() => {
    const m = new Map()
    qs.forEach(q => m.set(q.section, (m.get(q.section) || 0) + 1))
    return [...m.entries()].map(([name, count]) => ({ name, count }))
  }, [qs])

  const [phase, setPhase] = useState('instructions') // instructions | resume | test | result
  const [answers, setAnswers] = useState({})
  const [marked, setMarked] = useState([])
  const [visited, setVisited] = useState([])
  const [idx, setIdx] = useState(0)
  const [startedAt, setStartedAt] = useState(null)
  const [timeTaken, setTimeTaken] = useState({})
  const [now, setNow] = useState(Date.now())
  const [submitted, setSubmitted] = useState(null)
  const [resumeInfo, setResumeInfo] = useState(null)
  const [showSubmit, setShowSubmit] = useState(false)
  const [showInst, setShowInst] = useState(false)
  const [showPaper, setShowPaper] = useState(false)
  const [showExit, setShowExit] = useState(false)
  const [showSheet, setShowSheet] = useState(false)
  const [lastHint, setLastHint] = useState(false)
  const [timeUp, setTimeUp] = useState(false)
  const [isFs, setIsFs] = useState(false)
  const [blurCount, setBlurCount] = useState(0)

  const idxRef = useRef(0)
  const enterAtRef = useRef(Date.now())
  const finishingRef = useRef(false)
  const finishRef = useRef(null)

  const markedSet = useMemo(() => new Set(marked), [marked])
  const visitedSet = useMemo(() => new Set(visited), [visited])
  const counts = useMemo(() => countStatuses(qs, answers, markedSet, visitedSet), [qs, answers, markedSet, visitedSet])
  const flat = !!paper?.flat
  const activeSection = qs[idx]?.section
  const sectionQuestions = useMemo(() => flat ? qs : qs.filter(q => q.section === activeSection), [qs, activeSection, flat])
  const remaining = phase === 'test' && startedAt
    ? Math.max(0, duration - Math.floor((now - startedAt) / 1000))
    : duration
  const qTime = Math.max(0, Math.floor((now - enterAtRef.current) / 1000))

  /* ── restore in-progress attempt on mount ── */
  useEffect(() => {
    const st = loadAttemptState(paper?.id)
    if (!st || st.phase !== 'test') return
    const rem = st.startedAt ? Math.max(0, duration - Math.floor((Date.now() - st.startedAt) / 1000)) : duration
    if (rem > 0) {
      setResumeInfo({ ...st, remaining: rem })
      setPhase('resume')
    } else {
      // expired → auto-submit the saved answers
      const s = computeSummary(qs, st.answers || {}, scheme)
      const summary = { ...s, timeTaken: duration }
      const list = loadPyqAttempts()
      list.unshift({ id: Date.now(), paperId: paper.id, paperName: paper.name, year: paper.year, date: paper.date, shift: paper.shift, answers: st.answers || {}, marked: st.marked || [], summary, submittedAt: Date.now() })
      savePyqAttempts(list.slice(0, 30))
      clearAttemptState(paper.id)
      setSubmitted(summary)
      setPhase('result')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paper?.id])

  /* ── autosave on every change while testing ── */
  useEffect(() => {
    if (phase !== 'test' || !startedAt) return
    saveAttemptState(paper.id, { phase: 'test', answers, marked, visited, idx, startedAt, timeTaken, duration })
  }, [phase, answers, marked, visited, idx, startedAt, timeTaken, paper.id, duration])

  /* ── 1s tick ── */
  useEffect(() => {
    if (phase !== 'test') return
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [phase])

  /* ── fullscreen state sync ── */
  useEffect(() => {
    const h = () => setIsFs(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', h)
    return () => document.removeEventListener('fullscreenchange', h)
  }, [])

  /* ── soft integrity: log tab blur ── */
  useEffect(() => {
    if (phase !== 'test') return
    const h = () => setBlurCount(c => c + 1)
    window.addEventListener('blur', h)
    return () => window.removeEventListener('blur', h)
  }, [phase])

  const go = i => {
    if (i < 0 || i >= qs.length) return
    const at = Date.now()
    const prevNum = qs[idxRef.current]?.num
    if (prevNum != null) {
      setTimeTaken(t => ({ ...t, [prevNum]: (t[prevNum] || 0) + Math.max(0, (at - enterAtRef.current) / 1000) }))
    }
    enterAtRef.current = at
    idxRef.current = i
    setIdx(i)
    setVisited(v => v.includes(qs[i].num) ? v : [...v, qs[i].num])
    setLastHint(false)
  }

  const select = li => {
    const num = qs[idxRef.current]?.num
    if (num == null) return
    const L = PQ_LETTERS[li]
    setAnswers(a => ({ ...a, [num]: L }))
    setVisited(v => v.includes(num) ? v : [...v, num])
  }

  const clearCurrent = () => {
    const num = qs[idxRef.current]?.num
    if (num == null) return
    setAnswers(a => { const b = { ...a }; delete b[num]; return b })
  }

  const markCurrent = () => {
    const num = qs[idxRef.current]?.num
    if (num == null) return
    setMarked(m => m.includes(num) ? m : [...m, num])
  }

  const saveAndNext = () => {
    if (idxRef.current < qs.length - 1) go(idxRef.current + 1)
    else setLastHint(true)
  }

  const markAndNext = () => {
    markCurrent()
    if (idxRef.current < qs.length - 1) go(idxRef.current + 1)
  }

  const finish = auto => {
    if (finishingRef.current) return
    finishingRef.current = true
    const at = Date.now()
    const prevNum = qs[idxRef.current]?.num
    const finalTime = { ...timeTaken }
    if (prevNum != null) {
      finalTime[prevNum] = (finalTime[prevNum] || 0) + Math.max(0, (at - enterAtRef.current) / 1000)
    }
    const s = computeSummary(qs, answers, scheme)
    const summary = { ...s, timeTaken: Math.min(duration, Math.max(0, startedAt ? Math.floor((at - startedAt) / 1000) : duration)) }
    const attempt = {
      id: Date.now(), paperId: paper.id, paperName: paper.name, year: paper.year, date: paper.date, shift: paper.shift,
      answers, marked, timeTaken: finalTime, summary, submittedAt: at,
    }
    const list = loadPyqAttempts()
    list.unshift(attempt)
    savePyqAttempts(list.slice(0, 30))
    clearAttemptState(paper.id)
    setShowSubmit(false)
    const done = () => {
      if (onFinish) onFinish({ ...attempt, paper })
      else { setSubmitted(summary); setPhase('result'); setTimeUp(false) }
    }
    if (auto) {
      // short "time is up, submitting" state before the result renders
      setTimeUp(true)
      setTimeout(done, 1500)
    } else {
      done()
    }
  }
  finishRef.current = finish

  /* ── auto-submit at 00:00 ── */
  useEffect(() => {
    if (phase !== 'test' || !startedAt) return
    if (remaining <= 0) finishRef.current(true)
  }, [remaining, phase, startedAt])

  /* ── keyboard shortcuts (desktop) ── */
  useEffect(() => {
    if (phase !== 'test') return
    const onKey = e => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const t = e.target
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
      const k = e.key
      if (k === 'ArrowRight' || k.toLowerCase() === 'n') { e.preventDefault(); saveAndNext() }
      else if (k === 'ArrowLeft' || k.toLowerCase() === 'p') { e.preventDefault(); go(idxRef.current - 1) }
      else if (k.toLowerCase() === 'm') { e.preventDefault(); markAndNext() }
      else if (k.toLowerCase() === 'c') { e.preventDefault(); clearCurrent() }
      else {
        const li = PQ_LETTERS.indexOf(k.toUpperCase())
        if (li >= 0) select(li)
        else if (k >= '1' && k <= '4') select(+k - 1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, qs.length])

  const start = () => {
    const at = Date.now()
    finishingRef.current = false
    setAnswers({}); setMarked([]); setVisited([qs[0].num]); setIdx(0)
    idxRef.current = 0
    enterAtRef.current = at
    setStartedAt(at)
    setTimeTaken({}); setSubmitted(null); setLastHint(false); setTimeUp(false); setBlurCount(0)
    clearAttemptState(paper.id)
    setPhase('test')
  }

  const resume = () => {
    const st = resumeInfo
    finishingRef.current = false
    setAnswers(st.answers || {}); setMarked(st.marked || []); setVisited(st.visited || [])
    const i = st.idx ?? 0
    setIdx(i); idxRef.current = i
    setStartedAt(st.startedAt)
    setTimeTaken(st.timeTaken || {})
    enterAtRef.current = Date.now()
    setResumeInfo(null)
    setTimeUp(false)
    setPhase('test')
  }

  const freshStart = () => {
    clearAttemptState(paper.id)
    setResumeInfo(null)
    setPhase('instructions')
  }

  const toggleFs = () => {
    try {
      if (document.fullscreenElement) document.exitFullscreen()
      else document.documentElement.requestFullscreen()
    } catch { /* fullscreen not available */ }
  }

  const exitExam = () => { setShowExit(false); endExam() }

  const sectionSummary = sections.map(sec => {
    const secQs = qs.filter(q => q.section === sec.name)
    const c = { total: secQs.length, answered: 0, not_answered: 0, marked: 0, answered_marked: 0, not_visited: 0 }
    secQs.forEach(q => {
      const st = statusOf(q.num, answers, markedSet, visitedSet)
      if (st === STATUS.ANSWERED) c.answered++
      else if (st === STATUS.ANSWERED_MARKED) c.answered_marked++
      else if (st === STATUS.MARKED) c.marked++
      else if (st === STATUS.NOT_ANSWERED) c.not_answered++
      else c.not_visited++
    })
    return { name: sec.name, ...c }
  })

  const initials = (profile.name || 'CUET Pro').split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()
  const timerCls = remaining < 120 ? 'danger' : remaining < 600 ? 'warn' : ''

  /* ── guard: paper missing / empty ── */
  if (!paper || !qs.length) {
    return (
      <div className="ex-root">
        <div className="ex-header"><span className="ex-header-title">Previous Year Paper</span></div>
        <div className="ex-inst">
          <h3>Could not load this paper</h3>
          <p className="ex-modal-sub">The paper data is missing or empty.</p>
          <div className="ex-inst-actions"><button className="btn btn-primary" onClick={endExam}>Back to papers</button></div>
        </div>
      </div>
    )
  }

  /* ── RESULT phase ── */
  if (phase === 'result') {
    return (
      <div className="ex-root">
        <header className="ex-header">
          <span className="ex-header-title">{paper.name}</span>
          <div className="ex-header-actions">
            <button className="ex-hbtn ex-exit" onClick={endExam}><LogOut size={15} /> Back to papers</button>
          </div>
        </header>
        <div className="ex-result-scroll">
          <PyqResult paper={paper} answers={answers} summary={submitted}
            onBack={endExam}
            onRetry={() => { start() }} />
        </div>
      </div>
    )
  }

  /* ── INSTRUCTIONS phase ── */
  if (phase === 'instructions') {
    return (
      <div className="ex-root">
        <header className="ex-header">
          <span className="ex-header-title">{paper.name}</span>
          <div className="ex-header-actions">
            <button className="ex-hbtn ex-exit" onClick={() => setShowExit(true)}><LogOut size={15} /> Exit</button>
          </div>
        </header>
        <div className="ex-stage" style={{ paddingTop: 28 }}>
          <div className="ex-inst">
            <h3>{paper.name}</h3>
            <div className="ex-inst-grid">
              <div className="ex-inst-cell"><b>{qs.length}</b><span>Questions</span></div>
              <div className="ex-inst-cell"><b>{paper.duration_min} min</b><span>Duration</span></div>
              <div className="ex-inst-cell"><b>+{scheme.correct} / {scheme.wrong}</b><span>Marking</span></div>
              <div className="ex-inst-cell"><b>{paper.total_marks}</b><span>Total marks</span></div>
            </div>
            <div className="ex-inst-secs">
              <span className="ex-inst-lbl">Sections</span>
              {sections.map(s => <span key={s.name} className="ex-inst-sec">{s.name} · {s.count} Q</span>)}
            </div>
            <ul className="ex-inst-rules">
              <li>Each question has four options (A–D).</li>
              <li>+{scheme.correct} for a correct answer, {scheme.wrong} for a wrong one, 0 for unattempted.</li>
              <li>Use the question palette to jump between questions and track your status.</li>
              <li>Answers are saved as you go — closing the tab won't lose them.</li>
              <li>The test auto-submits when the timer reaches 00:00.</li>
            </ul>
            <div className="ex-inst-actions">
              <button className="btn btn-primary" onClick={start}>Start attempt <ChevronRight size={16} /></button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ── RESUME phase ── */
  if (phase === 'resume' && resumeInfo) {
    return (
      <div className="ex-root">
        <header className="ex-header">
          <span className="ex-header-title">{paper.name}</span>
        </header>
        <div className="ex-stage" style={{ paddingTop: 28 }}>
          <div className="ex-inst">
            <h3>Resume attempt</h3>
            <div className="ex-inst-grid">
              <div className="ex-inst-cell"><b>{fmtClock(resumeInfo.remaining)}</b><span>Time left</span></div>
              <div className="ex-inst-cell"><b>{Object.keys(resumeInfo.answers || {}).length}/{qs.length}</b><span>Answered</span></div>
            </div>
            <p className="ex-modal-sub">You have an in-progress attempt on this paper. Pick up where you left off, or start fresh.</p>
            <div className="ex-inst-actions">
              <button className="btn btn-primary" onClick={resume}>Resume attempt <ChevronRight size={16} /></button>
              <button className="btn btn-outline" onClick={freshStart}>Start fresh</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ── TEST phase ── */
  const q = qs[idx]
  const sel = answers[q?.num]
  const hasPassage = !!(q && q.passage)

  const paletteGrid = (
    <>
      {!flat && <div className="ex-secname">{activeSection}</div>}
      <div className="ex-grid">
        {sectionQuestions.map(qq => {
          const st = statusOf(qq.num, answers, markedSet, visitedSet)
          const cur = qq.num === q?.num
          return (
            <div key={qq.num} className={'ex-cell' + (cur ? ' cur' : '')}>
              <button className={'ex-shape ' + st} onClick={() => go(qs.findIndex(x => x.num === qq.num))}
                aria-label={`Question ${qq.num}, ${STATUS_LABEL[st]}`}>
                {qq.num}
              </button>
            </div>
          )
        })}
      </div>
    </>
  )

  const legend = (
    <div className="ex-legend">
      {LEGEND_ORDER.map(st => (
        <div key={st} className={'ex-legend-item' + (st === STATUS.ANSWERED_MARKED ? ' span2' : '')}>
          <span className={'ex-legend-shape ' + st} />
          <label>{STATUS_LABEL[st]}</label>
          <b>{counts[st]}</b>
        </div>
      ))}
      <span className="ex-legend-note">Answered & marked is considered for evaluation.</span>
    </div>
  )

  return (
    <div className="ex-root">
      {/* header */}
      <header className="ex-header">
        <span className="ex-header-title">{paper.name}</span>
        <div className="ex-header-actions">
          <button className="ex-hbtn" onClick={() => setShowInst(true)}><FileText size={15} /><span className="hide-m">View instructions</span></button>
          <button className="ex-hbtn" onClick={() => setShowPaper(true)}><ListChecks size={15} /><span className="hide-m">Question paper</span></button>
          <button className="ex-hbtn" onClick={toggleFs} aria-label="Toggle fullscreen">{isFs ? <Minimize size={15} /> : <Maximize size={15} />}</button>
          <button className="ex-hbtn ex-exit" onClick={() => setShowExit(true)}><LogOut size={15} /><span className="hide-m">Exit exam</span></button>
        </div>
      </header>

      <div className="ex-body">
        {/* left column */}
        <section className="ex-main">
          <div className="ex-toolbar">
            <div className="ex-tabs">
              {!flat && sections.map(s => (
                <button key={s.name} className={'ex-tab' + (s.name === activeSection ? ' on' : '')}
                  onClick={() => { const f = qs.findIndex(x => x.section === s.name); if (f >= 0) go(f) }}>
                  {s.name}
                </button>
              ))}
            </div>
            <div className="ex-timers">
              <div className="ex-q-time">Q time<b>{fmtClock(qTime)}</b></div>
              <div className={'ex-time-left ' + timerCls}>{fmtClock(remaining)}</div>
            </div>
          </div>

          <div className="ex-qhead">
            <span className="ex-qhead-num">Question {idx + 1}</span>
            <span className="ex-qhead-sec">{q.section}</span>
          </div>

          {hasPassage ? (
            <div className="ex-stage passage-mode">
              <div className="ex-passage-pane">
                <h4><BookOpen size={12} /> Passage</h4>
                <p>{q.passage}</p>
              </div>
              <div className="ex-qpane">
                <p className="ex-stem">{q.question}</p>
                <QuestionOptions q={q} sel={sel} select={select} />
              </div>
            </div>
          ) : (
            <div className="ex-stage">
              <p className="ex-stem">{q.question}</p>
              <QuestionOptions q={q} sel={sel} select={select} />
            </div>
          )}

          <footer className="ex-footer">
            <button className="ex-fbtn" onClick={() => go(idx - 1)} disabled={idx === 0}><ChevronLeft size={15} /> Previous</button>
            <button className="ex-fbtn" onClick={clearCurrent}>Clear response</button>
            <button className="ex-fbtn warn" onClick={markAndNext}><Flag size={15} /> Mark for review &amp; next</button>
            <button className="ex-fbtn primary" onClick={saveAndNext}>Save &amp; next <ChevronRight size={15} /></button>
            {lastHint && <span className="ex-last-hint">This is the last question</span>}
            <span className="ex-shortcuts"><Keyboard size={13} /> <kbd>A–D</kbd>/<kbd>1–4</kbd> select · <kbd>N</kbd> next · <kbd>P</kbd> prev · <kbd>M</kbd> mark · <kbd>C</kbd> clear</span>
          </footer>
        </section>

        {/* right column */}
        <aside className="ex-side">
          <div className="ex-candidate">
            <span className="ex-av">{initials}</span>
            <div className="ex-cand-txt">
              <b>{profile.name || 'Student'}</b>
              <span>{profile.stream ? 'CUET 2027 · ' + profile.stream : 'CUET 2027'}</span>
            </div>
          </div>
          {legend}
          <div className="ex-gridwrap">{paletteGrid}</div>
          <button className="ex-submit" onClick={() => setShowSubmit(true)}>Submit</button>
        </aside>
      </div>

      {/* mobile palette FAB + sheet */}
      <button className="ex-pal-fab" onClick={() => setShowSheet(true)}><ListChecks size={15} /> Palette · {counts[STATUS.ANSWERED] + counts[STATUS.ANSWERED_MARKED]}/{qs.length}</button>
      {showSheet && (
        <div className="ex-backdrop" onClick={() => setShowSheet(false)}>
          <div className="ex-sheet" onClick={e => e.stopPropagation()}>
            <div className="ex-sheet-head">
              <b>Question palette</b>
              <button className="ex-x ex-fbtn" onClick={() => setShowSheet(false)}><X size={15} /></button>
            </div>
            {legend}
            <div className="ex-gridwrap">{paletteGrid}</div>
            <button className="ex-sheet-submit" onClick={() => { setShowSheet(false); setShowSubmit(true) }}>Submit paper</button>
          </div>
        </div>
      )}

      {/* view instructions modal */}
      {showInst && (
        <div className="ex-backdrop" onClick={() => setShowInst(false)}>
          <div className="ex-modal" onClick={e => e.stopPropagation()}>
            <h4>Instructions</h4>
            <div className="ex-inst-secs">
              {sections.map(s => <span key={s.name} className="ex-inst-sec">{s.name} · {s.count} Q</span>)}
            </div>
            <ul className="ex-inst-rules">
              <li>Each question has four options (A–D).</li>
              <li>+{scheme.correct} for a correct answer, {scheme.wrong} for a wrong one, 0 for unattempted.</li>
              <li>Answers are saved as you go. The test auto-submits at 00:00.</li>
            </ul>
            <div className="ex-modal-btns"><button className="btn btn-primary-sm" onClick={() => setShowInst(false)}>Close</button></div>
          </div>
        </div>
      )}

      {/* question paper modal (read-only) */}
      {showPaper && (
        <div className="ex-backdrop" onClick={() => setShowPaper(false)}>
          <div className="ex-modal" onClick={e => e.stopPropagation()}>
            <h4>Question paper</h4>
            {sections.map(s => (
              <div key={s.name}>
                <span className="ex-inst-lbl">{s.name}</span>
                <div className="ex-qp-list" style={{ marginTop: 6, marginBottom: 12 }}>
                  {qs.filter(x => x.section === s.name).map(x => (
                    <button key={x.num} className="ex-qp-cell" onClick={() => { setShowPaper(false); go(qs.findIndex(y => y.num === x.num)) }}>{x.num}</button>
                  ))}
                </div>
              </div>
            ))}
            <div className="ex-modal-btns"><button className="btn btn-primary-sm" onClick={() => setShowPaper(false)}>Close</button></div>
          </div>
        </div>
      )}

      {/* submit confirmation */}
      {showSubmit && (
        <div className="ex-backdrop" onClick={() => setShowSubmit(false)}>
          <div className="ex-modal" onClick={e => e.stopPropagation()}>
            <h4>Submit paper?</h4>
            <p className="ex-modal-sub">Your answers will be final. Marked-with-answer questions count as answered.</p>
            <div className="ex-sum-tbl">
              <div className="ex-sum-row head"><span>Section</span><span>Total</span><span>Answered</span><span>Not ans.</span><span>Marked</span><span>A&amp;M</span><span>Not visit.</span></div>
              {sectionSummary.map(r => (
                <div className="ex-sum-row" key={r.name}>
                  <span>{r.name}</span><span>{r.total}</span><span>{r.answered}</span><span>{r.not_answered}</span><span>{r.marked}</span><span>{r.answered_marked}</span><span>{r.not_visited}</span>
                </div>
              ))}
            </div>
            <div className="ex-modal-btns">
              <button className="btn btn-outline-sm" onClick={() => setShowSubmit(false)}>Go back</button>
              <button className="btn btn-primary-sm" onClick={() => finish(false)}>Submit paper</button>
            </div>
          </div>
        </div>
      )}

      {/* exit confirmation */}
      {showExit && (
        <div className="ex-backdrop" onClick={() => setShowExit(false)}>
          <div className="ex-modal" onClick={e => e.stopPropagation()}>
            <h4>Exit exam?</h4>
            <p className="ex-modal-sub">Your progress is saved. You can resume this attempt later.</p>
            <div className="ex-modal-btns">
              <button className="btn btn-outline-sm" onClick={() => setShowExit(false)}>Stay</button>
              <button className="btn btn-primary-sm" onClick={exitExam}>Exit exam</button>
            </div>
          </div>
        </div>
      )}

      {/* soft integrity warning */}
      {blurCount > 0 && phase === 'test' && (
        <div className="ex-blur-warn">
          <AlertTriangle size={13} /> You switched tabs {blurCount}× — stay focused.
        </div>
      )}

      {/* time-up overlay */}
      {timeUp && (
        <div className="ex-timeup">
          <div><b>Time is up</b><span>Submitting your answers…</span></div>
        </div>
      )}
    </div>
  )
}

/* Option cards shared across standard + passage questions (kept A–D style,
   real radio inputs under the styled cards for accessibility). */
function QuestionOptions({ q, sel, select }) {
  return (
    <div className="ex-opts" role="radiogroup" aria-label={`Options for question ${q.num}`}>
      {q.options.map((o, i) => {
        const L = PQ_LETTERS[i]
        const isSel = sel === L
        return (
          <label key={i} className={'ex-opt' + (isSel ? ' sel' : '')}>
            <input type="radio" name={'q' + q.num} className="ex-opt-input" checked={isSel} onChange={() => select(i)} />
            <span className="ex-opt-l">{L}</span>
            <span>{o}</span>
          </label>
        )
      })}
    </div>
  )
}
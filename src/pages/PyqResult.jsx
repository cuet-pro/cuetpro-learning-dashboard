/* ── Post-submit analytics page (replaces the old score panel + long review) ──
   Modeled on NTA-style result analytics: header, rank & score, three spotlight
   tiles, a "what if" note, time-per-question chart + donut, score distribution,
   and CUET Pro's own topic/section breakdown with next steps. The answer review
   is no longer a long scroll — it opens in PyqReview, one question at a time. */
import { useMemo, useState } from 'react'
import {
  CalendarDays, Clock, CheckCircle2, XCircle, Circle, Trophy, Gauge, Target,
  MinusCircle, RotateCcw, ArrowLeft, Eye, HelpCircle, TrendingUp, Zap,
  BookOpen, ListChecks, AlertTriangle, Bookmark, ArrowRight,
} from 'lucide-react'
import { PQ_LETTERS, fmtClock, markingScheme, paperDurationSeconds } from '../lib/examEngine'
import {
  rankOf, percentileOf, histogram, peakBin, whatIf,
  attemptRateTint, accuracyTint, negMarksTint, TINT_LABEL,
} from '../lib/analytics'
import PyqReview from './PyqReview'
import './analytics.css'

/* small "?" popover explaining a metric in plain sentences */
function Hint({ text }) {
  const [open, setOpen] = useState(false)
  return (
    <span className="pqr-hintwrap">
      <button
        className="pqr-hintbtn" type="button"
        onClick={e => { e.stopPropagation(); setOpen(o => !o) }}
        aria-label="What does this mean?"
      ><HelpCircle size={14} /></button>
      {open && <span className="pqr-hintpop" role="note">{text}</span>}
    </span>
  )
}

function SpotlightTile({ icon: Icon, label, value, tint, hint, sub }) {
  return (
    <div className={'pqr-tile tint-' + tint}>
      <div className="pqr-tile-top">
        <span className="pqr-tile-ico"><Icon size={17} /></span>
        <span className="pqr-tile-label">{label}</span>
        <Hint text={hint} />
      </div>
      <div className="pqr-tile-value">{value}</div>
      <div className="pqr-tile-foot">
        <span className={'pqr-tile-word ' + tint}>{TINT_LABEL[tint]}</span>
        {sub && <span className="pqr-tile-sub">{sub}</span>}
      </div>
    </div>
  )
}

export default function PyqResult({
  paper, attempt, scheme, leaderboard,
  onBack, onRetry, onRetryWrong, onNavigate,
}) {
  const qs = paper?.questions || []
  const answers = attempt?.answers || {}
  const perQTime = attempt?.timeTaken || {}
  const summary = attempt?.summary || {}
  const submittedAt = attempt?.submittedAt

  const sc = scheme || markingScheme(paper)
  const c = summary.c || 0
  const w = summary.w || 0
  const u = summary.u || 0
  const attempted = c + w
  const total = summary.total || qs.length
  const marks = summary.marks ?? 0
  const totalMarks = summary.totalMarks || total * sc.correct
  /* Recompute accuracy & attempt rate from counts (never trust stored values —
     old attempts predate the correct ÷ attempted formula). */
  const acc = attempted ? Math.round(c / attempted * 100) : 0
  const attemptRate = total ? Math.round(attempted / total * 100) : 0
  const negMarks = w * sc.wrong // negative
  const negShare = totalMarks ? (Math.abs(negMarks) / totalMarks) * 100 : 0
  const duration = paperDurationSeconds(paper)

  const [showReview, setShowReview] = useState(null) // { q: num|null, filters: {} }

  /* ── leaderboard-dependent metrics (fall back gracefully with no server data) ── */
  const others = Array.isArray(leaderboard) ? leaderboard : null
  const totalAttempted = others ? others.length + 1 : 1
  const rank = others ? rankOf(marks, others) : 1
  const percentile = others ? percentileOf(rank, totalAttempted) : null
  const showPercentile = others && totalAttempted >= 20 && percentile != null
  const wi = others ? whatIf(rank, c, sc, others) : { x: c * sc.correct, y: 1, z: 0 }

  /* ── topic & section stats ── */
  const topicStats = useMemo(() => {
    const m = new Map()
    qs.forEach(q => {
      if (!m.has(q.topic)) m.set(q.topic, { topic: q.topic, total: 0, attempted: 0, correct: 0 })
      const t = m.get(q.topic)
      t.total++
      const a = answers[q.num]
      if (a != null) {
        t.attempted++
        if (PQ_LETTERS.indexOf(a) === q.answer_index) t.correct++
      }
    })
    return [...m.values()]
      .map(t => ({ ...t, acc: t.attempted ? Math.round(t.correct / t.attempted * 100) : 0 }))
      .sort((a, b) => a.acc - b.acc || b.total - a.total)
  }, [qs, answers])

  const sectionStats = useMemo(() => {
    const m = new Map()
    qs.forEach(q => {
      if (!m.has(q.section)) m.set(q.section, { section: q.section, total: 0, attempted: 0, correct: 0, time: 0 })
      const s = m.get(q.section)
      s.total++
      const a = answers[q.num]
      if (a != null) { s.attempted++; if (PQ_LETTERS.indexOf(a) === q.answer_index) s.correct++ }
      s.time += perQTime[q.num] || 0
    })
    return [...m.values()]
      .map(s => ({ ...s, acc: s.attempted ? Math.round(s.correct / s.attempted * 100) : 0 }))
  }, [qs, answers, perQTime])

  const weakest = topicStats.filter(t => t.acc < 60).slice(0, 3)

  /* ── time-per-question bars (paper order) ── */
  const bars = useMemo(() => qs.map(q => {
    const a = answers[q.num]
    const status = a == null ? 'skipped' : (PQ_LETTERS.indexOf(a) === q.answer_index ? 'correct' : 'wrong')
    return { n: q.num, t: Math.round(perQTime[q.num] || 0), status }
  }), [qs, answers, perQTime])
  const maxT = Math.max(1, ...bars.map(b => b.t))
  const useMinutes = maxT > 120
  const timeUsed = summary.timeTaken || 0
  const timePct = duration ? Math.min(100, timeUsed / duration * 100) : 0

  /* ── score distribution (empty under 20 attempts) ── */
  const bins = others ? histogram(others.concat(marks), 20, totalMarks) : []
  const peak = bins.length ? peakBin(bins) : null

  const openReview = (q, filters) => setShowReview({ q, filters: filters || {} })

  if (showReview) {
    return (
      <PyqReview
        paper={paper}
        answers={answers}
        perQTime={perQTime}
        summary={summary}
        scheme={sc}
        initialQ={showReview.q}
        initialFilters={showReview.filters}
        onBack={() => setShowReview(null)}
      />
    )
  }

  const dateStr = submittedAt
    ? new Date(submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : null
  const timeStr = submittedAt
    ? new Date(submittedAt).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
    : null

  return (
    <div className="pqr-root">
      <button className="pqr-back" onClick={onBack}><ArrowLeft size={15} /> Past papers</button>

      {/* ── A. Header card ── */}
      <section className="pqr-card pqr-header">
        <div className="pqr-header-main">
          <h1 className="pqr-title">{paper?.name}</h1>
          <div className="pqr-meta">
            {dateStr && <span><CalendarDays size={14} /> {dateStr}</span>}
            {timeStr && <span><Clock size={14} /> {timeStr}</span>}
            <span className="ok"><CheckCircle2 size={14} /> {c} correct</span>
            <span className="no"><XCircle size={14} /> {w} wrong</span>
            <span className="sk"><Circle size={14} /> {u} skipped</span>
            <span className="marks"><Trophy size={14} /> {marks < 0 ? '' : '+'}{marks} Marks</span>
          </div>
        </div>
        <div className="pqr-header-actions">
          <button className="btn btn-primary" onClick={() => openReview(null)}><Eye size={16} /> View questions</button>
          <button className="btn btn-outline" onClick={onRetry}><RotateCcw size={16} /> Retry paper</button>
        </div>
      </section>

      {/* ── B. Rank & score ── */}
      <section className="pqr-duo">
        <div className="pqr-card pqr-duo-card">
          <span className="pqr-duo-label">Rank</span>
          <div className="pqr-duo-big"><b>{rank}</b><span className="pqr-duo-muted"> / {totalAttempted}</span></div>
          {showPercentile
            ? <span className="pqr-duo-sub">Top {percentile}%</span>
            : <span className="pqr-duo-sub muted">among CUET Pro students who attempted this paper</span>}
        </div>
        <div className="pqr-card pqr-duo-card">
          <span className="pqr-duo-label">Score</span>
          <div className="pqr-duo-big"><b className={marks < 0 ? 'neg' : ''}>{marks}</b><span className="pqr-duo-muted"> / {totalMarks}</span></div>
          <span className="pqr-duo-sub muted">{attempted} attempted · {u} skipped</span>
        </div>
      </section>

      {/* ── C. Paper spotlight ── */}
      <section className="pqr-spotlight">
        <SpotlightTile
          icon={Gauge}
          label="Attempt rate"
          value={attemptRate + '%'}
          tint={attemptRateTint(attemptRate)}
          sub={`${attempted} of ${total} questions`}
          hint="Attempt rate is attempted ÷ total questions, where attempted = correct + wrong. It shows how much of the paper you engaged with."
        />
        <SpotlightTile
          icon={Target}
          label="Accuracy rate"
          value={attempted === 0 ? '—' : acc + '%'}
          tint={attempted === 0 ? 'skip' : accuracyTint(acc)}
          sub={`${c} correct of ${attempted} attempted`}
          hint="Accuracy is correct ÷ attempted (not ÷ total). It is how accurate you were on the questions you actually answered."
        />
        <SpotlightTile
          icon={MinusCircle}
          label="Negative marks"
          value={negMarks + ' Marks'}
          tint={negMarksTint(negShare)}
          sub={`${w} wrong × ${sc.wrong}`}
          hint={`Negative marks = wrong answers × the penalty (${sc.wrong} each). Shown as a negative number. Lower is better.`}
        />
      </section>

      {/* ── D. What-if note ── */}
      {w > 0 && wi.z > 0 && (
        <section className="pqr-note">
          <span className="pqr-note-tag">Note</span>
          <p>
            Your score could have been <b>{wi.x}</b> without negative marks, making your rank <b>{wi.y}</b>{' '}
            <span className="pqr-pill">+{wi.z} ranks</span>
          </p>
        </section>
      )}

      {/* ── E. Time per question ── */}
      <section className="pqr-card">
        <div className="pqr-card-head">
          <h3>Time per question</h3>
          <Hint text="How long you spent on each question, in paper order. Colour shows the outcome: correct (green), wrong (red), skipped (grey). Tap a bar to jump to that question." />
        </div>
        <div className="pqr-time-layout">
          <div className="pqr-time-chart">
            <div className="pqr-bars">
              {bars.map(b => {
                const h = Math.max(4, (b.t / maxT) * 120)
                return (
                  <button
                    key={b.n}
                    className={'pqr-bar ' + b.status}
                    style={{ height: h + 'px' }}
                    onClick={() => openReview(b.n)}
                    title={`Question ${b.n} · ${b.t}s`}
                    aria-label={`Question ${b.n} · ${b.t} seconds`}
                  />
                )
              })}
            </div>
            <div className="pqr-bars-x">
              {bars.map((b, i) => (i % 2 === 0 ? <span key={b.n}>{b.n}</span> : <i key={b.n} />))}
            </div>
            <div className="pqr-time-axis-label">{useMinutes ? 'minutes' : 'seconds'}</div>
          </div>

          {/* donut: time used vs total duration */}
          <div className="pqr-donut-wrap">
            <svg viewBox="0 0 120 120" className="pqr-donut" role="img" aria-label={`${fmtClock(timeUsed)} of ${fmtClock(duration)} time used`}>
              <circle cx="60" cy="60" r="50" className="pqr-donut-bg" />
              <circle
                cx="60" cy="60" r="50"
                className="pqr-donut-fg"
                strokeDasharray={`${(timePct / 100) * 2 * Math.PI * 50} ${2 * Math.PI * 50}`}
                transform="rotate(-90 60 60)"
              />
            </svg>
            <div className="pqr-donut-center">
              <span>Time spent</span>
              <b>{fmtClock(timeUsed)}</b>
            </div>
          </div>
        </div>
      </section>

      {/* ── F. Score distribution ── */}
      <section className="pqr-card">
        <div className="pqr-card-head">
          <h3>Score distribution</h3>
          <Hint text="How all CUET Pro students scored on this paper. Your score is marked 'You'; 'Peak' is the most common score." />
        </div>
        {!others || totalAttempted < 20 ? (
          <div className="pqr-empty">
            <TrendingUp size={22} />
            <p>Score distribution appears once 20 students have attempted this paper ({totalAttempted} so far).</p>
          </div>
        ) : (
          <ScoreDist bins={bins} peak={peak} you={marks} totalMarks={totalMarks} />
        )}
      </section>

      {/* ── G. CUET Pro additions ── */}
      <section className="pqr-card">
        <div className="pqr-card-head">
          <h3>Topic-wise performance</h3>
          <Hint text="Correct / attempted / total per topic, sorted weakest first. Tap a topic to review just those questions." />
        </div>
        {topicStats.map(t => (
          <button key={t.topic} className="pqr-topic-row" onClick={() => openReview(null, { topic: t.topic })}>
            <span className="pqr-topic-name">{t.topic}</span>
            <span className="pqr-topic-bar"><i style={{ width: t.acc + '%' }} /></span>
            <span className="pqr-topic-nums">{t.correct}/{t.attempted}/{t.total}</span>
            <span className="pqr-topic-acc">{t.acc}%</span>
            <ArrowRight size={14} className="pqr-topic-arrow" />
          </button>
        ))}
      </section>

      <section className="pqr-card">
        <div className="pqr-card-head"><h3>Section-wise summary</h3></div>
        <div className="pqr-sec-table">
          <div className="pqr-sec-row head">
            <span>Section</span><span>Attempted</span><span>Correct</span><span>Accuracy</span><span>Time</span>
          </div>
          {sectionStats.map(s => (
            <div className="pqr-sec-row" key={s.section}>
              <span className="pqr-sec-name">{s.section}</span>
              <span>{s.attempted}/{s.total}</span>
              <span>{s.correct}</span>
              <span>{s.acc}%</span>
              <span>{fmtClock(s.time)}</span>
            </div>
          ))}
        </div>
      </section>

      {weakest.length > 0 && (
        <section className="pqr-card pqr-weak">
          <div className="pqr-weak-head">
            <AlertTriangle size={16} />
            <b>Weakest topics</b>
          </div>
          <p className="pqr-weak-list">{weakest.map(t => t.topic).join(' · ')}</p>
          <button className="btn btn-outline" onClick={() => onNavigate ? onNavigate('analysis') : null}>
            <Zap size={15} /> Practise these topics
          </button>
        </section>
      )}

      <section className="pqr-card pqr-next">
        <h3>Next steps</h3>
        <div className="pqr-next-grid">
          <button className="btn btn-outline" onClick={onRetry}><RotateCcw size={15} /> Retry paper</button>
          <button className="btn btn-outline" onClick={onRetryWrong}><ListChecks size={15} /> Retry wrong & skipped only</button>
          <button className="btn btn-outline" onClick={() => openReview(null, { status: 'wrong' })}><Bookmark size={15} /> Review mistakes</button>
        </div>
        <p className="pqr-next-hint"><BookOpen size={13} /> Wrong answers are automatically added to Smart Revision's Mistake Replay.</p>
      </section>
    </div>
  )
}

/* ── Smoothed score-distribution curve (histogram + monotone interpolation) ── */
function ScoreDist({ bins, peak, you, totalMarks }) {
  const W = 640, H = 180, PADL = 34, PADB = 26, PADT = 14, PADR = 10
  const maxCount = Math.max(1, ...bins.map(b => b.count))
  const innerW = W - PADL - PADR
  const innerH = H - PADT - PADB
  const x = b => PADL + ((b.lo + b.hi) / 2 - bins[0].lo) / (totalMarks - bins[0].lo) * innerW
  const y = b => PADT + (1 - b.count / maxCount) * innerH
  const pts = bins.map(b => [x(b), y(b)])

  /* monotone-ish smoothing: Catmull-Rom to cubic Bézier */
  const path = pts.reduce((acc, p, i) => {
    if (i === 0) return `M ${p[0].toFixed(1)},${p[1].toFixed(1)}`
    const p0 = pts[i - 2] || pts[i - 1], p1 = pts[i - 1], p2 = p, p3 = pts[i + 1] || p
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    return `${acc} C ${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p[0].toFixed(1)},${p[1].toFixed(1)}`
  }, '')

  const youX = PADL + (you - bins[0].lo) / (totalMarks - bins[0].lo) * innerW
  const peakX = peak ? x(peak) : null
  const peakY = peak ? y(peak) : null

  return (
    <div className="pqr-dist">
      <svg viewBox={`0 0 ${W} ${H}`} className="pqr-dist-svg" role="img" aria-label="Score distribution curve">
        {[0, 0.5, 1].map(f => (
          <line key={f} x1={PADL} x2={W - PADR} y1={PADT + f * innerH} y2={PADT + f * innerH} className="pqr-dist-grid" />
        ))}
        <path d={path} fill="none" className="pqr-dist-curve" />
        <line x1={youX} y1={PADT} x2={youX} y2={H - PADB} className="pqr-dist-youline" />
        {peakX != null && <line x1={peakX} y1={PADT} x2={peakX} y2={H - PADB} className="pqr-dist-peakline" />}
        {(() => {
          const youY = pts.reduce((best, p) => Math.abs(p[0] - youX) < Math.abs(best[0] - youX) ? p : best, pts)[1]
          return <circle cx={youX} cy={youY} r={5} className="pqr-dist-youdot" />
        })()}
      </svg>
      <div className="pqr-dist-labels" style={{ left: youX }}><span className="pqr-dist-pill you">You</span></div>
      {peakX != null && <div className="pqr-dist-labels" style={{ left: peakX, top: peakY - 8 }}><span className="pqr-dist-pill peak">Peak</span></div>}
      <div className="pqr-dist-xaxis">
        <span>{bins[0].lo}</span><span>{Math.round(totalMarks / 2)}</span><span>{totalMarks}</span>
      </div>
    </div>
  )
}
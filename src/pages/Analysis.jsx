import { useState } from 'react'
import { ArrowLeft, BookOpen, Target, TrendingUp, TrendingDown, Minus, AlertTriangle, ChevronRight } from 'lucide-react'
import './analysis.css'

/* ── Data model (preview) ──
 * Question bank: every question tagged { subject, sub_skill }
 * Attempt log: per question { qId, subject, sub_skill, correct, timeTaken }
 * Aggregation: sub-skill accuracy = correct / attempted (across last N mocks)
 */

const MOCKS_TAKEN = 7

const SUBJECTS = [
  {
    name: 'English', acc: 88, attempts: 350,
    subSkills: [
      { name: 'Vocabulary', acc: 74 },
      { name: 'Grammar & usage', acc: 68 },
      { name: 'Reading comprehension', acc: 88 },
      { name: 'Para-jumbles & odd sentence', acc: 55 },
      { name: 'Sentence correction', acc: 72 },
    ],
  },
  {
    name: 'Economics', acc: 61, attempts: 350,
    subSkills: [
      { name: 'National income', acc: 62 },
      { name: 'Money & banking', acc: 48 },
      { name: 'Microeconomics', acc: 58 },
      { name: 'Current affairs', acc: 51 },
    ],
  },
  {
    name: 'Accountancy', acc: 81, attempts: 350,
    subSkills: [
      { name: 'Journal & ledger', acc: 78 },
      { name: 'Financial statements', acc: 84 },
      { name: 'Partnership accounts', acc: 76 },
      { name: 'Company accounts', acc: 70 },
    ],
  },
  {
    name: 'Business Studies', acc: 64, attempts: 350,
    subSkills: [
      { name: 'Principles of management', acc: 66 },
      { name: 'Business environment', acc: 58 },
      { name: 'Marketing', acc: 52 },
    ],
  },
  {
    name: 'General Test', acc: 45, attempts: 350,
    subSkills: [
      { name: 'Data interpretation', acc: 60 },
      { name: 'Logical reasoning', acc: 55 },
      { name: 'General knowledge', acc: 51 },
      { name: 'Quantitative ability', acc: 38 },
    ],
  },
]

const TREND = [
  { mock: 'M2', pct: 55.2 },
  { mock: 'M3', pct: 58.4 },
  { mock: 'M4', pct: 63.1 },
  { mock: 'M5', pct: 60.8 },
  { mock: 'M6', pct: 67.5 },
  { mock: 'M7', pct: 71.8 },
]
const TARGET_PCT = 85

const MISTAKES = [
  { topic: 'Money & banking', subj: 'Economics', count: 4 },
  { topic: 'Quantitative ability', subj: 'General Test', count: 3 },
  { topic: 'Marketing', subj: 'Business Studies', count: 2 },
  { topic: 'Grammar & usage', subj: 'English', count: 2 },
]

const TOPPERS = [
  { label: 'You', acc: 64, time: 36 },
  { label: 'Top 10 average', acc: 78, time: 28 },
  { label: 'Topper', acc: 91, time: 22 },
]

const OVERVIEW = {
  accuracy: 64,
  percentile: 71.8,
  avgTime: 36,
  weakTopics: 5,
}

/* Status thresholds: ≥75 green · 50–74 amber · <50 red */
function status(acc) {
  if (acc >= 75) return { color: 'var(--green-500)', label: 'on track' }
  if (acc >= 50) return { color: 'var(--warning-500)', label: 'needs attention' }
  return { color: 'var(--red-500)', label: 'weak' }
}

function pct(v) { return Math.round(v) }
function pct1(v) { return v.toFixed(1) }

export default function Analysis() {
  const [subject, setSubject] = useState(null)
  if (subject) return <SubjectDrillDown subject={subject} onBack={() => setSubject(null)} />
  return <Overview onOpenSubject={setSubject} />
}

/* ═══════════ Overview ═══════════ */
function Overview({ onOpenSubject }) {
  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>Analysis</h1>
          <p>How you're performing across mocks — subject-wise, sub-skill-wise, and against the class.</p>
        </div>
      </header>

      {/* A. Top metric strip */}
      <section className="metric-strip">
        <div className="metric-card">
          <span className="metric-label">Overall accuracy</span>
          <b className="metric-value" style={{ color: status(OVERVIEW.accuracy).color }}>{pct(OVERVIEW.accuracy)}%</b>
          <span className="metric-sub">across {MOCKS_TAKEN} mocks</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Current percentile</span>
          <b className="metric-value">{pct1(OVERVIEW.percentile)}%ile</b>
          <span className="metric-sub">target {TARGET_PCT}%ile</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Avg time per question</span>
          <b className="metric-value">{OVERVIEW.avgTime}s</b>
          <span className="metric-sub">toppers avg 22s</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Weak topics flagged</span>
          <b className="metric-value" style={{ color: 'var(--red-500)' }}>{OVERVIEW.weakTopics}</b>
          <span className="metric-sub">fix these first</span>
        </div>
      </section>

      {/* B. Section-wise accuracy */}
      <section className="an-card">
        <h3 className="an-card-title">Section-wise accuracy</h3>
        <p className="an-card-sub">Tap any subject to open its sub-skill breakdown <span className="tap-hint">→</span></p>
        {SUBJECTS.map(s => {
          const st = status(s.acc)
          return (
            <button className="subject-row" key={s.name} onClick={() => onOpenSubject(s.name)}>
              <span className="status-dot" style={{ background: st.color }} />
              <span className="subject-name">{s.name}</span>
              <span className="subject-bar"><i style={{ width: s.acc + '%', background: st.color }} /></span>
              <b className="subject-acc" style={{ color: st.color }}>{pct(s.acc)}%</b>
              <span className="subject-status" style={{ color: st.color }}>{st.label}</span>
              <span className="row-chevron"><ChevronRight size={15} /></span>
            </button>
          )
        })}
      </section>

      {/* C. Percentile trend */}
      <section className="an-card">
        <h3 className="an-card-title">Percentile trend</h3>
        <p className="an-card-sub">Last {TREND.length} mocks vs target percentile</p>
        <TrendChart />
      </section>

      <div className="an-grid">
        {/* D. Mistake tracker */}
        <section className="an-card">
          <h3 className="an-card-title">Mistake tracker</h3>
          <p className="an-card-sub">Topics where you repeat the same errors</p>
          {MISTAKES.map(m => (
            <div className="mistake-row" key={m.topic}>
              <span className="status-dot" style={{ background: 'var(--red-500)' }} />
              <div className="mistake-info">
                <b>{m.topic}</b>
                <span>{m.subj} · repeated {m.count}× across mocks</span>
              </div>
              <button className="btn btn-outline-sm" onClick={() => alert('Deep-link → practice flow, pre-filtered to: ' + m.topic)}>Review</button>
            </div>
          ))}
        </section>

        {/* E. You vs toppers */}
        <section className="an-card">
          <h3 className="an-card-title">You vs toppers</h3>
          <p className="an-card-sub">How you stack up on the key metrics</p>
          <div className="vs-table">
            <div className="vs-head"><span></span><span>Accuracy</span><span>Avg time/q</span></div>
            {TOPPERS.map(t => (
              <div className={'vs-row' + (t.label === 'You' ? ' you' : '')} key={t.label}>
                <b>{t.label}</b>
                <span>{pct(t.acc)}%</span>
                <span>{t.time}s</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

function TrendChart() {
  const W = 560, H = 170, PAD = 28
  const min = 40, max = 100
  const x = i => PAD + (i / (TREND.length - 1)) * (W - PAD * 2)
  const y = v => H - PAD - ((v - min) / (max - min)) * (H - PAD * 2)
  const line = TREND.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.pct).toFixed(1)}`).join(' ')
  const targetY = y(TARGET_PCT)
  return (
    <div className="trend-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} className="trend-svg">
        {[50, 60, 70, 80, 90, 100].map(g => (
          <line key={g} x1={PAD} x2={W - PAD} y1={y(g)} y2={y(g)} stroke="#EEF1F6" strokeWidth="1" />
        ))}
        {/* dashed target line */}
        <line x1={PAD} x2={W - PAD} y1={targetY} y2={targetY} stroke="#F5A623" strokeWidth="1.5" strokeDasharray="6 5" />
        <text x={W - PAD} y={targetY - 6} textAnchor="end" fontSize="10" fontWeight="700" fill="#C77700">target {TARGET_PCT}%ile</text>
        {/* area + line */}
        <path d={`${line} L${x(TREND.length - 1).toFixed(1)},${H - PAD} L${x(0).toFixed(1)},${H - PAD} Z`} fill="url(#trendArea)" opacity="0.5" />
        <path d={line} fill="none" stroke="#00C97F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {TREND.map((p, i) => (
          <g key={p.mock}>
            <circle cx={x(i)} cy={y(p.pct)} r="3.5" fill="#00C97F" />
            <text x={x(i)} y={y(p.pct) - 8} textAnchor="middle" fontSize="9.5" fontWeight="600" fill="#5B667A">{p.pct}%</text>
            <text x={x(i)} y={H - 10} textAnchor="middle" fontSize="9.5" fill="#7C889B">{p.mock}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="trendArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00C97F" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#00C97F" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

/* ═══════════ Subject drill-down ═══════════ */
function SubjectDrillDown({ subject, onBack }) {
  const subj = SUBJECTS.find(s => s.name === subject)
  const sorted = [...subj.subSkills].sort((a, b) => a.acc - b.acc)
  const weakest = sorted[0]
  const st = status(subj.acc)
  const prevWeak = weakest.acc + 4 /* trend: improving if last mocks better */

  /* low-data state: fewer than 3 mocks → no reliable breakdown */
  if (MOCKS_TAKEN < 3) {
    return (
      <div className="page">
        <header className="page-head">
          <div>
            <h1>Analysis · {subj.name}</h1>
          </div>
        </header>
        <div className="an-card">
          <p className="low-data">Attempt more mocks to unlock a reliable sub-skill breakdown — {MOCKS_TAKEN} mock logged so far.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <button className="btn btn-outline-sm" onClick={onBack} style={{ marginBottom: 14 }}><ArrowLeft size={14} /> All subjects</button>
          <h1>{subj.name}</h1>
          <p>Average of last {MOCKS_TAKEN} mocks · {pct(subj.acc)}% accuracy · {subj.attempts} questions attempted</p>
        </div>
      </header>

      {/* Sub-skill breakdown */}
      <section className="an-card">
        <h3 className="an-card-title">Sub-skill breakdown</h3>
        <p className="an-card-sub">Weakest first · aggregated across all mocks</p>
        {sorted.map(sk => {
          const s = status(sk.acc)
          return (
            <div className="subject-row static" key={sk.name}>
              <span className="status-dot" style={{ background: s.color }} />
              <span className="subject-name">{sk.name}</span>
              <span className="subject-bar"><i style={{ width: sk.acc + '%', background: s.color }} /></span>
              <b className="subject-acc" style={{ color: s.color }}>{pct(sk.acc)}%</b>
              {sk.name === weakest.name && <span className="weakest-tag">weakest</span>}
            </div>
          )
        })}
      </section>

      {/* Focus area callout */}
      <section className="focus-card" style={{ background: status(weakest.acc).color + '14', borderColor: status(weakest.acc).color }}>
        <div className="focus-ico" style={{ background: status(weakest.acc).color, color: '#fff' }}><Target size={18} /></div>
        <div className="focus-body">
          <h3>Focus area — {weakest.name}</h3>
          <p>
            Your accuracy here is <b>{pct(weakest.acc)}%</b> — the lowest in {subj.name}.
            {prevWeak >= weakest.acc
              ? <> It's <b className="imp">improving</b> across recent mocks — keep going.</>
              : <> It's <b className="flat">flat</b> across recent mocks — a targeted fix is needed.</>}
          </p>
        </div>
        <button className="btn btn-primary-sm" onClick={() => alert('Deep-link → practice session, filtered to: ' + subj.name + ' · ' + weakest.name)}>
          Start {weakest.name} practice <BookOpen size={14} />
        </button>
      </section>
    </div>
  )
}

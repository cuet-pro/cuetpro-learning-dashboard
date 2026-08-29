import { useState } from 'react'
import { ArrowRight, BookOpen, Target, AlertTriangle, Repeat, CheckCircle2 } from 'lucide-react'
import './analysis.css'

/* ── Sample attempt data (preview) ── */
const MOCK = {
  testName: 'Economics Full Mock #7',
  score: 61, max: 100,
  percentile: 82.4,
  timeUsed: 47, timeMax: 60,
  subjects: [
    { name: 'National Income & Budget', score: 24, max: 35 },
    { name: 'Money, Banking & BoP', score: 15, max: 30 },
    { name: 'Employment, Poverty & SD', score: 22, max: 35 },
  ],
  topics: [
    { name: 'National Income Accounting', acc: 68, weight: 12, attempts: 25, status: 'ok' },
    { name: 'Money & Banking', acc: 48, weight: 10, attempts: 21, status: 'weak' },
    { name: 'Production & Costs', acc: 42, weight: 8, attempts: 18, status: 'weak' },
    { name: 'Government Budget', acc: 56, weight: 7, attempts: 14, status: 'warn' },
    { name: 'Market Equilibrium', acc: 86, weight: 10, attempts: 22, status: 'ok' },
    { name: 'Human Capital Formation', acc: 58, weight: 6, attempts: 12, status: 'warn' },
  ],
  dots: [
    { x: 12, y: 130, tag: 'Fast + Wrong', label: 'Rushed' },
    { x: 45, y: 90, tag: 'Fast + Right', label: 'Mastered' },
    { x: 78, y: 140, tag: 'Slow + Wrong', label: 'Concept gap' },
    { x: 30, y: 30, tag: 'Slow + Right', label: 'Needs speed' },
  ],
  mistakes: [
    { q: 'Q12 — Repo rate changes impact:', topic: 'Money & Banking', wrong: 'Money supply increases', right: 'Banks borrow costlier', time: '38s', repeat: 2 },
    { q: 'Q18 — Capital receipts include:', topic: 'Government Budget', wrong: 'Interest payments', right: 'Recovery of loans', time: '51s', repeat: 1 },
    { q: 'Q23 — AFC curve shape:', topic: 'Production & Costs', wrong: 'U-shaped', right: 'Rectangular hyperbola', time: '29s', repeat: 3 },
  ],
}

function lossScore(t) { return Math.round(t.weight * (100 - t.acc) / 10) }

export default function Analysis() {
  const [tab, setTab] = useState('Overall Analysis')
  const weak = MOCK.topics.filter(t => t.status === 'weak').sort((a, b) => lossScore(b) - lossScore(a))

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>Analysis</h1>
          <p>Where you're gaining marks, where there's opportunity — and a straight line back into practice.</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="an-tabs">
        {['Overall Analysis', 'Paper Analysis', 'My Mistakes / Revision Bank'].map(t => (
          <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {tab === 'Overall Analysis' && <Overall />}
      {tab === 'Paper Analysis' && <Paper />}
      {tab === 'My Mistakes / Revision Bank' && <Mistakes />}
    </div>
  )
}

/* ── Overall ── */
function Overall() {
  const weak = MOCK.topics.filter(t => t.status === 'weak').sort((a, b) => lossScore(b) - lossScore(a))
  return (
    <div className="an-stack">
      <section className="cuet-card">
        <div className="an-score-row">
          <div className="an-score">
            <b>{MOCK.score}/{MOCK.max}</b>
            <span>{MOCK.testName}</span>
          </div>
          <div className="an-score-stats">
            <div><b>{MOCK.percentile}%ile</b><span>vs cohort</span></div>
            <div><b>{MOCK.timeUsed}/{MOCK.timeMax} min</b><span>time used</span></div>
          </div>
        </div>
      </section>

      {/* Recommendation engine — the differentiator */}
      <section className="rec-card">
        <div className="rec-ico"><Target size={20} /></div>
        <div className="rec-body">
          <h3>Recommendation — 18 marks ka potential loss</h3>
          <p>
            <b>Money & Banking (48%)</b> aur <b>Production & Costs (42%)</b> me accuracy low hai.
            In dono topics ke basics revise karke 15 easy-medium questions practice karo.
            Estimated improvement: <b>+18 marks</b> in full mocks.
          </p>
          <div className="rec-actions">
            <button className="btn btn-outline btn-sm"><BookOpen size={14} /> Revise Topic</button>
            <button className="btn btn-primary btn-sm">Practice Now <ArrowRight size={14} /></button>
          </div>
        </div>
      </section>

      <div className="an-grid">
        {/* Subject accuracy */}
        <section className="cuet-card">
          <div className="card-head"><h3>Topic Analysis</h3><span className="card-sub">Marks loss potential se sorted</span></div>
          {MOCK.topics.map(t => (
            <div className="an-topic" key={t.name}>
              <span className="an-tname">{t.name}</span>
              <div className="an-tbar"><i className={t.status} style={{ width: t.acc + '%' }} /></div>
              <b className="an-tacc" style={{ color: t.acc < 50 ? 'var(--red-500)' : t.acc < 70 ? 'var(--amber-500)' : 'var(--green-600)' }}>{t.acc}%</b>
              <span className="an-tloss">{lossScore(t)} marks loss</span>
            </div>
          ))}
        </section>

        {/* Weak topics with actions */}
        <section className="cuet-card">
          <div className="card-head"><h3>Fix these first</h3><span className="card-sub">Weak topics — sabse zyada marks yahan</span></div>
          {weak.map(t => (
            <div className="an-fix" key={t.name}>
              <div className="an-fix-info">
                <b>{t.name}</b>
                <span>Weight {t.weight}% · {t.attempts} attempts · accuracy {t.acc}%</span>
              </div>
              <div className="an-fix-actions">
                <button className="btn btn-outline btn-sm">Revise</button>
                <button className="btn btn-primary btn-sm">Practice</button>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  )
}

/* ── Paper Analysis ── */
function Paper() {
  return (
    <div className="an-stack">
      <section className="cuet-card">
        <div className="card-head"><h3>Why marks were lost — time vs accuracy</h3><span className="card-sub">One dot per attempted question</span></div>
        <div className="quad-wrap">
          <div className="quad-grid">
            <div className="quad-cell q-tl"><b>Fast + Wrong</b><span>— rushed</span></div>
            <div className="quad-cell q-tr"><b>Fast + Right</b><span>— mastered</span></div>
            <div className="quad-cell q-bl"><b>Slow + Wrong</b><span>— concept gap</span></div>
            <div className="quad-cell q-br"><b>Slow + Right</b><span>— needs speed</span></div>
          </div>
          <svg viewBox="0 0 100 100" className="quad-svg">
            {MOCK.dots.map((d, i) => (
              <g key={i}>
                <circle cx={d.x} cy={d.y} r="2.4" fill={d.tag.includes('Right') ? '#00C97F' : '#E5484D'} opacity=".85" />
                <title>{d.tag}</title>
              </g>
            ))}
          </svg>
          <div className="quad-legend">
            <span><i style={{ background: '#00C97F' }} /> Correct</span>
            <span><i style={{ background: '#E5484D' }} /> Incorrect</span>
          </div>
        </div>
      </section>

      <div className="an-grid">
        <section className="cuet-card">
          <div className="card-head"><h3>Topic breakdown</h3><span className="card-sub">{MOCK.testName}</span></div>
          {MOCK.subjects.map(s => (
            <div className="an-topic" key={s.name}>
              <span className="an-tname">{s.name}</span>
              <div className="an-tbar"><i style={{ width: (s.score / s.max * 100) + '%', background: s.score / s.max > 0.7 ? 'var(--green-500)' : s.score / s.max > 0.5 ? 'var(--amber-500)' : 'var(--red-500)' }} /></div>
              <b className="an-tacc">{s.score}/{s.max}</b>
            </div>
          ))}
        </section>
        <section className="cuet-card">
          <div className="card-head"><h3>Question by question</h3><span className="card-sub">Q1 → Q35</span></div>
          <div className="qgrid">
            {Array.from({ length: 35 }, (_, i) => {
              const wrong = [3, 11, 17, 23, 28]
              const skipped = [9, 19]
              let cls = 'qcell'
              if (wrong.includes(i)) cls += ' w'
              if (skipped.includes(i)) cls += ' s'
              return <span key={i} className={cls}>{i + 1}</span>
            })}
          </div>
          <div className="quad-legend" style={{ marginTop: 12 }}>
            <span><i style={{ background: 'var(--green-500)' }} /> Correct</span>
            <span><i style={{ background: 'var(--red-500)' }} /> Wrong</span>
            <span><i style={{ background: 'var(--gray-200)' }} /> Skipped</span>
          </div>
        </section>
      </div>
    </div>
  )
}

/* ── Mistakes / Revision Bank ── */
function Mistakes() {
  return (
    <div className="an-stack">
      <div className="rec-card" style={{ background: 'linear-gradient(120deg,#1A2C49,#2E4A75)' }}>
        <div className="rec-ico"><AlertTriangle size={20} /></div>
        <div className="rec-body">
          <h3>Revision Bank — 3 mistakes, 3 repeated topics</h3>
          <p>Inhe 48 ghante me dobara karo — repeated mistakes = exam me guaranteed loss. Har mistake ke saath similar questions ka set ready hai.</p>
        </div>
      </div>
      {MOCK.mistakes.map(m => (
        <section className="cuet-card" key={m.q}>
          <div className="mist-row">
            <div className="mist-q">
              <div className="mist-head">
                <span className="mist-topic"><Repeat size={12} /> {m.topic} {m.repeat > 1 && <span className="mist-rep">repeated ×{m.repeat}</span>}</span>
                <span className="mist-time">{m.time}</span>
              </div>
              <p className="mist-text">{m.q}</p>
              <div className="mist-ans">
                <span className="mist-wrong">✗ {m.wrong}</span>
                <span className="mist-right">✓ {m.right}</span>
              </div>
            </div>
            <div className="mist-actions">
              <button className="btn btn-outline btn-sm"><BookOpen size={13} /> Revise</button>
              <button className="btn btn-primary btn-sm">5 similar questions</button>
            </div>
          </div>
        </section>
      ))}
    </div>
  )
}

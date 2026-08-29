import { useState } from 'react'
import { ArrowRight, BookOpen, Target, AlertTriangle, Repeat, TrendingUp, Timer } from 'lucide-react'
import './analysis.css'

const MOCK = {
  name: 'CUET Mock Test #7 · Full Syllabus',
  total: 512, max: 800,
  accuracy: 64,
  percentile: 71.8,
  timeUsed: 47, timeMax: 60,
  subjects: [
    { name: 'English', score: 92, max: 100, acc: 92, attempts: 50, time: '28 min', status: 'Strong' },
    { name: 'Economics', score: 61, max: 100, acc: 61, attempts: 50, time: '32 min', status: 'Needs work' },
    { name: 'Accountancy', score: 81, max: 100, acc: 81, attempts: 50, time: '30 min', status: 'Good' },
    { name: 'Business Studies', score: 64, max: 100, acc: 64, attempts: 50, time: '31 min', status: 'Needs work' },
    { name: 'General Test', score: 45, max: 100, acc: 45, attempts: 50, time: '26 min', status: 'Weak' },
  ],
  topics: [
    { name: 'Money & Banking', subj: 'Economics', acc: 48, weight: 10, attempts: 21 },
    { name: 'Production & Costs', subj: 'Economics', acc: 42, weight: 8, attempts: 18 },
    { name: 'Quantitative Reasoning', subj: 'General Test', acc: 38, weight: 12, attempts: 25 },
    { name: 'Current Affairs', subj: 'General Test', acc: 51, weight: 10, attempts: 19 },
    { name: 'Marketing Management', subj: 'Business Studies', acc: 52, weight: 9, attempts: 17 },
    { name: 'National Income Accounting', subj: 'Economics', acc: 68, weight: 12, attempts: 25 },
    { name: 'Vocabulary & Idioms', subj: 'English', acc: 74, weight: 8, attempts: 16 },
    { name: 'Reading Comprehension', subj: 'English', acc: 88, weight: 12, attempts: 24 },
  ],
  dots: [
    { x: 12, y: 130, tag: 'Fast + Wrong', label: 'Rushed' },
    { x: 45, y: 90, tag: 'Fast + Right', label: 'Mastered' },
    { x: 78, y: 140, tag: 'Slow + Wrong', label: 'Concept gap' },
    { x: 30, y: 30, tag: 'Slow + Right', label: 'Needs speed' },
  ],
  mistakes: [
    { q: 'Q12 — Repo rate changes impact:', topic: 'Money & Banking', subj: 'Economics', wrong: 'Money supply increases', right: 'Banks borrow costlier', time: '38s', repeat: 2 },
    { q: 'Q23 — AFC curve shape:', topic: 'Production & Costs', subj: 'Economics', wrong: 'U-shaped', right: 'Rectangular hyperbola', time: '29s', repeat: 3 },
    { q: 'Q34 — Syllogism premise:', topic: 'Quantitative Reasoning', subj: 'General Test', wrong: 'All A are B, so B are A', right: 'Cannot be concluded', time: '44s', repeat: 2 },
    { q: 'Q18 — Capital receipts include:', topic: 'Government Budget', subj: 'Economics', wrong: 'Interest payments', right: 'Recovery of loans', time: '51s', repeat: 1 },
  ],
}

function lossScore(t) { return Math.round(t.weight * (100 - t.acc) / 10) }
function statusColor(s) {
  if (s === 'Strong' || s === 'Good') return 'var(--green-600)'
  if (s === 'Needs work') return 'var(--warning-500)'
  return 'var(--red-500)'
}

export default function Analysis() {
  const [tab, setTab] = useState('Overall Analysis')
  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>Analysis</h1>
          <p>Where you're gaining marks, where there's opportunity — and a straight line back into practice.</p>
        </div>
      </header>

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

/* ── Overall: 5-subject mock breakdown ── */
function Overall() {
  const weak = MOCK.topics.filter(t => t.acc < 60).sort((a, b) => lossScore(b) - lossScore(a))
  const totalLoss = weak.reduce((s, t) => s + lossScore(t), 0)
  return (
    <div className="an-stack">
      {/* Score header */}
      <section className="cuet-card">
        <div className="an-score-row">
          <div className="an-score">
            <b>{MOCK.total}/{MOCK.max}</b>
            <span>{MOCK.name}</span>
          </div>
          <div className="an-score-stats">
            <div><b>{MOCK.percentile}%ile</b><span>vs cohort</span></div>
            <div><b>{MOCK.accuracy}%</b><span>overall accuracy</span></div>
            <div><b>{MOCK.timeUsed}/{MOCK.timeMax} min</b><span>time used</span></div>
          </div>
        </div>
      </section>

      {/* Recommendation — from the weak subjects */}
      <section className="rec-card">
        <div className="rec-ico"><Target size={20} /></div>
        <div className="rec-body">
          <h3>Recommendation — {totalLoss} marks of potential gain</h3>
          <p>
            <b>General Test (45%)</b> and <b>Economics (61%)</b> are pulling your score down.
            Fix <b>Quantitative Reasoning</b> and <b>Money & Banking</b> first — together they cost you the most marks.
            Revise the basics, then attempt 15 easy-medium questions per topic.
          </p>
          <div className="rec-actions">
            <button className="btn btn-outline-sm"><BookOpen size={14} /> Revise Topics</button>
            <button className="btn btn-primary-sm">Practice Now <ArrowRight size={14} /></button>
          </div>
        </div>
      </section>

      {/* 5 subject cards */}
      <div className="an-subjects">
        {MOCK.subjects.map(s => (
          <div className="an-subj" key={s.name}>
            <div className="an-subj-head">
              <b>{s.name}</b>
              <span className="an-subj-badge" style={{ background: statusColor(s.status) + '1a', color: statusColor(s.status) }}>{s.status}</span>
            </div>
            <div className="an-subj-score">
              <b style={{ color: s.acc < 50 ? 'var(--red-500)' : s.acc < 70 ? 'var(--warning-500)' : 'var(--green-600)' }}>{s.score}<span>/{s.max}</span></b>
              <span>{s.acc}% accuracy</span>
            </div>
            <div className="an-subj-bar"><i style={{ width: s.acc + '%', background: s.acc < 50 ? 'var(--red-500)' : s.acc < 70 ? 'var(--warning-500)' : 'var(--green-500)' }} /></div>
            <div className="an-subj-meta"><span>{s.attempts} attempts</span><span>{s.time}</span></div>
          </div>
        ))}
      </div>

      <div className="an-grid">
        {/* Topic analysis */}
        <section className="cuet-card">
          <div className="card-head"><h3>Topic Analysis</h3><span className="card-sub">Sorted by marks-loss potential</span></div>
          {MOCK.topics.sort((a, b) => lossScore(b) - lossScore(a)).map(t => (
            <div className="an-topic" key={t.name}>
              <div className="an-tname-wrap">
                <b className="an-tname">{t.name}</b>
                <span className="an-tsubj">{t.subj}</span>
              </div>
              <div className="an-tbar"><i style={{ width: t.acc + '%', background: t.acc < 50 ? 'var(--red-500)' : t.acc < 70 ? 'var(--warning-500)' : 'var(--green-500)' }} /></div>
              <b className="an-tacc" style={{ color: t.acc < 50 ? 'var(--red-500)' : t.acc < 70 ? 'var(--warning-500)' : 'var(--green-600)' }}>{t.acc}%</b>
              <span className="an-tloss">{lossScore(t)} marks</span>
            </div>
          ))}
        </section>

        {/* Fix first */}
        <section className="cuet-card">
          <div className="card-head"><h3>Fix These First</h3><span className="card-sub">Weak topics — most marks at stake</span></div>
          {weak.map(t => (
            <div className="an-fix" key={t.name}>
              <div className="an-fix-info">
                <b>{t.name}</b>
                <span>{t.subj} · weight {t.weight}% · {t.attempts} attempts · {t.acc}% accuracy</span>
              </div>
              <div className="an-fix-actions">
                <button className="btn btn-outline-sm">Revise</button>
                <button className="btn btn-primary-sm">Practice</button>
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
          <div className="card-head"><h3>Subject breakdown</h3><span className="card-sub">{MOCK.name}</span></div>
          {MOCK.subjects.map(s => (
            <div className="an-topic" key={s.name}>
              <b className="an-tname">{s.name}</b>
              <div className="an-tbar"><i style={{ width: s.acc + '%', background: s.acc < 50 ? 'var(--red-500)' : s.acc < 70 ? 'var(--warning-500)' : 'var(--green-500)' }} /></div>
              <b className="an-tacc">{s.score}/{s.max}</b>
            </div>
          ))}
        </section>
        <section className="cuet-card">
          <div className="card-head"><h3>Question by question</h3><span className="card-sub">Q1 → Q50 · full mock</span></div>
          <div className="qgrid">
            {Array.from({ length: 50 }, (_, i) => {
              const wrong = [3, 11, 17, 23, 28, 34, 41, 47]
              const skipped = [9, 19, 39]
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
          <h3>Revision Bank — 4 mistakes, 3 repeated topics</h3>
          <p>Re-attempt these within 48 hours — repeated mistakes mean guaranteed marks lost in the exam. A similar-question set is ready for each.</p>
        </div>
      </div>
      {MOCK.mistakes.map(m => (
        <section className="cuet-card" key={m.q}>
          <div className="mist-row">
            <div className="mist-q">
              <div className="mist-head">
                <span className="mist-topic"><Repeat size={12} /> {m.topic} · {m.subj} {m.repeat > 1 && <span className="mist-rep">repeated ×{m.repeat}</span>}</span>
                <span className="mist-time">{m.time}</span>
              </div>
              <p className="mist-text">{m.q}</p>
              <div className="mist-ans">
                <span className="mist-wrong">✗ {m.wrong}</span>
                <span className="mist-right">✓ {m.right}</span>
              </div>
            </div>
            <div className="mist-actions">
              <button className="btn btn-outline-sm"><BookOpen size={13} /> Revise</button>
              <button className="btn btn-primary-sm">5 similar questions</button>
            </div>
          </div>
        </section>
      ))}
    </div>
  )
}

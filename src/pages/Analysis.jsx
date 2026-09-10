import { useState } from 'react'
import { Home, Grid3x3, TrendingUp, Zap, ChevronRight, Target, AlertTriangle, BookOpen, Info } from 'lucide-react'
import { status, allSubSkills, boostRanking, boostReason, subjectsFor } from '../lib/analysisData'
import { useProfile } from '../lib/profile'
import { Modal } from '../components/shell/Shell'
import './analysis.css'

/* ═══════════ Shared data + boost logic lives in src/lib/analysisData.js ═══════════ */

const OVERALL = {
  acc: 64, percentile: 71.8, avgTime: 36, weakTopics: 5,
  trend: [55.2, 58.4, 63.1, 60.8, 67.5, 71.8],
}
const TOPPERS = [
  { label: 'You', acc: 64, time: 36 },
  { label: 'Top 10 average', acc: 78, time: 28 },
  { label: 'Topper', acc: 91, time: 22 },
]
const HIGH_WEIGHT = 5 /* exam-weight threshold for urgent (Threat/Opportunity) */

const pct = v => Math.round(v)
const pct1 = v => v.toFixed(1)

const TABS = [
  { id: 'overview', label: 'Overview', icon: Home },
  { id: 'swot', label: 'SWOT', icon: Grid3x3 },
  { id: 'trend', label: 'Trend', icon: TrendingUp },
  { id: 'boost', label: 'Boost plan', icon: Zap },
]

function selectedSubjects(scope) {
  return subjectsFor(scope)
}

export default function Analysis() {
  const [profile] = useProfile()
  const [subject, setSubject] = useState('all')
  const [tab, setTab] = useState('overview')

  /* single source of truth: scope = selected pill, falling back to profile stream for 'all' */
  const scope = subject === 'all' ? profile.stream : subject
  const pills = subjectsFor(profile.stream)

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>Analysis</h1>
          <p>How you're performing across mocks — subject-wise, sub-skill-wise, and against the class.</p>
        </div>
      </header>

      {/* A. Subject selector — stream comes from Profile */}
      <div className="subj-pills">
        <button className={'subj-pill' + (subject === 'all' ? ' on' : '')} onClick={() => setSubject('all')}>All subjects</button>
        {pills.map(s => (
          <button key={s.name} className={'subj-pill' + (subject === s.name ? ' on' : '')} onClick={() => setSubject(s.name)}>{s.name}</button>
        ))}
      </div>

      {/* B. Tab strip */}
      <div className="an-tabs">
        {TABS.map(t => (
          <button key={t.id} className={tab === t.id ? 'on' : ''} onClick={() => setTab(t.id)}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && <OverviewTab subject={scope} target={profile.targetPercentile} />}
      {tab === 'swot' && <SwotTab subject={scope} />}
      {tab === 'trend' && <TrendTab subject={scope} target={profile.targetPercentile} />}
      {tab === 'boost' && <BoostTab subject={scope} single={subjectsFor(scope).length === 1} />}
    </div>
  )
}

/* ═══════════ 1. Overview ═══════════ */
function OverviewTab({ subject, target }) {
  const subs = selectedSubjects(subject)
  const isAll = subs.length > 1
  const [showSkills, setShowSkills] = useState(false)
  const acc = isAll ? OVERALL.acc : Math.round(subs.reduce((s, x) => s + x.acc, 0) / subs.length)
  const mistakes = subs.flatMap(s => (s.mistakes || []).map(m => ({ ...m, subj: s.name })))
  const weakTopics = allSubSkills(subject).filter(sk => sk.acc < 50).length

  return (
    <>
      {/* Metric strip */}
      <section className="metric-strip">
        <div className="metric-card">
          <span className="metric-label">Overall accuracy</span>
          <b className="metric-value" style={{ color: status(acc).color }}>{pct(acc)}%</b>
          <span className="metric-sub">{isAll ? 'across 7 mocks' : subject + ' · last 7 mocks'}</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Current percentile</span>
          <b className="metric-value">{pct1(isAll ? OVERALL.percentile : OVERALL.percentile - 8)}%ile</b>
          <span className="metric-sub">target {target}%ile</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Avg time per question</span>
          <b className="metric-value">{isAll ? OVERALL.avgTime : subs[0].avgTime}s</b>
          <span className="metric-sub">toppers avg 22s</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Weak topics flagged</span>
          <b className="metric-value" style={{ color: 'var(--red-500)' }}>{weakTopics}</b>
          <span className="metric-sub">fix these first</span>
        </div>
      </section>

      {/* Section-wise accuracy */}
      <section className="an-card">
        <h3 className="an-card-title">Section-wise accuracy</h3>
        <p className="an-card-sub">Tap any subject to focus it. Repeated mistakes are broken down by sub-skill below <span className="tap-hint">→</span></p>
        {subs.map(s => {
          const st = status(s.acc)
          return (
            <div className="subject-row static" key={s.name}>
              <span className="status-dot" style={{ background: st.color }} />
              <span className="subject-name">{s.name}</span>
              <span className="subject-bar"><i style={{ width: s.acc + '%', background: st.color }} /></span>
              <b className="subject-acc" style={{ color: st.color }}>{pct(s.acc)}%</b>
              <span className="subject-status" style={{ color: st.color }}>{st.label}</span>
              {!isAll && <span className="row-chevron"><ChevronRight size={15} /></span>}
            </div>
          )
        })}
      </section>

      <div className="an-grid">
        {/* Mistake tracker */}
        <section className="an-card">
          <div className="an-card-head">
            <div>
              <h3 className="an-card-title">Mistake tracker</h3>
              <p className="an-card-sub">Topics where you repeat the same errors</p>
            </div>
            {mistakes.length > 0 && (
              <button className="an-view-more" onClick={() => setShowSkills(true)}>
                View more <ChevronRight size={14} />
              </button>
            )}
          </div>
          {mistakes.length === 0 && <p className="muted-empty">No repeated mistakes logged for {isAll ? 'your subjects' : subject}.</p>}
          {mistakes.map(m => (
            <div className="mistake-row" key={m.topic + m.subj}>
              <span className="status-dot" style={{ background: 'var(--red-500)' }} />
              <div className="mistake-info">
                <b>{m.topic}</b>
                <span>{m.subj} · repeated {m.count}× across mocks</span>
              </div>
              <button className="btn btn-outline-sm" onClick={() => alert('Deep-link → practice flow, pre-filtered to: ' + m.topic)}>Review</button>
            </div>
          ))}
        </section>

        {/* You vs toppers */}
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

      {/* View more → sub-skill breakdown behind the repeated mistakes */}
      <Modal open={showSkills} onClose={() => setShowSkills(false)} title="Sub-skills behind your mistakes">
        <MistakeSkills mistakes={mistakes} scope={subject} />
      </Modal>
    </>
  )
}

/* ═══════════ 2. SWOT ═══════════ */
function SwotTab({ subject }) {
  const [level, setLevel] = useState('subtopics')
  const isAll = selectedSubjects(subject).length > 1

  const items = level === 'topics'
    ? selectedSubjects(subject).map(s => ({ name: s.name, acc: s.acc, weight: s.weight, sub: s.subSkills }))
    : allSubSkills(subject)

  const classify = it => {
    if (it.acc >= 75) return 'S'
    if (it.acc < 50) return it.weight >= HIGH_WEIGHT ? 'T' : 'W'
    return it.weight >= HIGH_WEIGHT ? 'O' : 'W'
  }
  const quads = {
    S: items.filter(i => classify(i) === 'S'),
    W: items.filter(i => classify(i) === 'W'),
    T: items.filter(i => classify(i) === 'T'),
    O: items.filter(i => classify(i) === 'O'),
  }

  return (
    <>
      <div className="swot-toggle">
        <button className={level === 'topics' ? 'on' : ''} onClick={() => setLevel('topics')}>Topics</button>
        <button className={level === 'subtopics' ? 'on' : ''} onClick={() => setLevel('subtopics')}>Sub-topics</button>
      </div>
      <div className="swot-grid">
        <SwotQuad title="Strengths" desc="accuracy ≥ 75%" color="var(--green-500)" rows={quads.S} level={level} />
        <SwotQuad title="Weaknesses" desc="covers little of the exam — not urgent" color="var(--warning-500)" rows={quads.W} level={level} />
        <SwotQuad title="Threats" desc="low accuracy × big exam share — costing marks" color="var(--red-500)" rows={quads.T} level={level} />
        <SwotQuad title="Opportunities" desc="quick wins if fixed" color="var(--blue-500)" rows={quads.O} level={level} />
      </div>
      <p className="swot-note">
        {isAll
          ? 'Classified by accuracy and how much of the exam a topic covers — a 40% topic worth only 3% of the exam is a Weakness, not a Threat.'
          : `Showing ${subject} at the ${level === 'topics' ? 'subject' : 'sub-topic'} level.`}
      </p>
    </>
  )
}

function SwotQuad({ title, desc, color, rows, level }) {
  const [open, setOpen] = useState(null)
  return (
    <section className="swot-quad" style={{ borderTopColor: color }}>
      <div className="swot-head"><b style={{ color }}>{title}</b><span>{desc}</span></div>
      {rows.length === 0 ? (
        <p className="muted-empty">No topics</p>
      ) : (
        rows.map(r => (
          <div key={r.name}>
            <div className="swot-row">
              <span className="status-dot" style={{ background: color }} />
              <span className="swot-name">{r.name}</span>
              <span className="swot-meta">{level === 'topics' ? r.weight + '% of the exam' : r.weight + '% of subject marks'}</span>
              <b className="swot-acc">{pct(r.acc)}%</b>
              {level === 'topics' && r.sub && (
                <button className="swot-expand" onClick={() => setOpen(open === r.name ? null : r.name)}>
                  <ChevronRight size={14} style={{ transform: open === r.name ? 'rotate(90deg)' : 'none', transition: 'transform .15s' }} />
                </button>
              )}
            </div>
            {level === 'topics' && r.sub && open === r.name && (
              <div className="swot-sub">
                {r.sub.map(sk => (
                  <span key={sk.name} className="swot-subchip" style={{ color: status(sk.acc).color }}>{sk.name} · {pct(sk.acc)}%</span>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </section>
  )
}

/* ═══════════ Sub-skill breakdown behind repeated mistakes (opens from Mistake tracker) ═══════════ */
function MistakeSkills({ mistakes, scope }) {
  const all = allSubSkills(scope)
  const rows = mistakes.map(m => {
    const sk = all.find(a => a.name.toLowerCase() === String(m.topic).toLowerCase())
    return sk ? { ...sk, count: m.count } : { name: m.topic, subject: m.subj, acc: null, count: m.count }
  }).sort((a, b) => (a.acc ?? 101) - (b.acc ?? 101))
  const weakest = rows.find(r => r.acc != null)

  if (rows.length === 0) return <p className="muted-empty">No repeated mistakes logged yet — sub-skill breakdown appears here once you have a few mocks.</p>

  return (
    <>
      <p className="ov-sub">Grouped by the topics you keep getting wrong — weakest first.</p>
      <section className="an-card" style={{ marginBottom: 0 }}>
        <h3 className="an-card-title">Sub-skills behind your mistakes</h3>
        <p className="an-card-sub">Aggregated across all mocks · matched from your mistake tracker</p>
        {rows.map(r => {
          const s = r.acc != null ? status(r.acc) : null
          return (
            <div className="subject-row static" key={r.name + r.subject}>
              <span className="status-dot" style={{ background: s ? s.color : 'var(--border-strong)' }} />
              <span className="subject-name">{r.name}</span>
              <span className="subject-subj">{r.subject}</span>
              {r.acc != null
                ? <span className="subject-bar"><i style={{ width: r.acc + '%', background: s.color }} /></span>
                : <span className="subject-bar"><i style={{ width: '0%' }} /></span>}
              <b className="subject-acc" style={{ color: s ? s.color : 'var(--text-muted)' }}>{r.acc != null ? pct(r.acc) + '%' : '—'}</b>
              <span className="mskill-count">×{r.count}</span>
              {weakest && r.name === weakest.name && <span className="weakest-tag">weakest</span>}
            </div>
          )
        })}
        {rows.some(r => r.acc == null) && (
          <p className="muted-empty" style={{ marginTop: 10 }}>
            Topics marked “—” need more attempts before a reliable sub-skill estimate can be shown.
          </p>
        )}
      </section>

      {weakest && (
        <section className="focus-card" style={{ background: status(weakest.acc).color + '14', borderColor: status(weakest.acc).color, marginTop: 14 }}>
          <div className="focus-ico" style={{ background: status(weakest.acc).color, color: '#fff' }}><Target size={18} /></div>
          <div className="focus-body">
            <h3>Fix this first — {weakest.name}</h3>
            <p>
              Your accuracy here is <b>{pct(weakest.acc)}%</b> and it accounts for <b>×{weakest.count}</b> repeated mistakes. Clearing it also lifts {weakest.subject}.
            </p>
          </div>
          <button className="btn btn-primary-sm" onClick={() => alert('Deep-link → practice session, filtered to: ' + weakest.subject + ' · ' + weakest.name)}>
            Start practice <BookOpen size={14} />
          </button>
        </section>
      )}
    </>
  )
}

/* ═══════════ 4. Trend ═══════════ */
function TrendTab({ subject, target }) {
  const subs = selectedSubjects(subject)
  const isAll = subs.length > 1
  const data = isAll ? OVERALL.trend : subs[0].trend
  const mocks = data.map((v, i) => ({ mock: 'M' + (i + 2), pct: v }))
  return (
    <section className="an-card">
      <h3 className="an-card-title">Percentile trend</h3>
      <p className="an-card-sub">{isAll ? 'Last 6 mocks vs target percentile' : subject + ' · last 6 mocks vs target percentile'}</p>
      <TrendChart mocks={mocks} target={target} />
    </section>
  )
}

function TrendChart({ mocks, target }) {
  const W = 560, H = 170, PAD = 28
  const min = 30, max = 100
  const x = i => PAD + (i / (mocks.length - 1)) * (W - PAD * 2)
  const y = v => H - PAD - ((v - min) / (max - min)) * (H - PAD * 2)
  const line = mocks.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.pct).toFixed(1)}`).join(' ')
  const targetY = y(target)
  return (
    <div className="trend-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} className="trend-svg">
        {[40, 50, 60, 70, 80, 90, 100].map(g => (
          <line key={g} x1={PAD} x2={W - PAD} y1={y(g)} y2={y(g)} stroke="#EEF1F6" strokeWidth="1" />
        ))}
        <line x1={PAD} x2={W - PAD} y1={targetY} y2={targetY} stroke="#F5A623" strokeWidth="1.5" strokeDasharray="6 5" />
        <text x={W - PAD} y={targetY - 6} textAnchor="end" fontSize="10" fontWeight="700" fill="#C77700">target {target}%ile</text>
        <path d={`${line} L${x(mocks.length - 1).toFixed(1)},${H - PAD} L${x(0).toFixed(1)},${H - PAD} Z`} fill="url(#trendArea)" opacity="0.5" />
        <path d={line} fill="none" stroke="#00C97F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {mocks.map((p, i) => (
          <g key={p.mock}>
            <circle cx={x(i)} cy={y(p.pct)} r="3.5" fill="#00C97F" />
            <text x={x(i)} y={y(p.pct) - 8} textAnchor="middle" fontSize="9.5" fontWeight="600" fill="#5B667A">{pct1(p.pct)}%</text>
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

/* ═══════════ 5. Boost plan (unique) ═══════════ */
function BoostTab({ subject, single }) {
  const [showAll, setShowAll] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const skills = allSubSkills(subject)

  /* score_gain_per_hour — shared logic from lib/analysisData */
  const ranked = boostRanking(subject)

  const lowData = skills.length - ranked.length
  const hero = ranked[0]
  const secondary = ranked.slice(1, 5)
  const rest = ranked.slice(5)

  /* top third of weights → "high weight" */
  const sortedW = [...ranked].map(r => r.weight).sort((a, b) => b - a)
  const highW = sortedW.length ? sortedW[Math.max(0, Math.ceil(sortedW.length / 3) - 1)] : 99

  const reason = r => boostReason(r, highW)
  const tier = (r, i) => {
    if (r.acc >= 80) return 'low'
    const n = ranked.length
    if (i < Math.ceil(n / 3)) return 'high'
    if (i < Math.ceil(n * 2 / 3)) return 'medium'
    return 'low'
  }

  return (
    <>
      <section className="boost-banner">
        <Zap size={18} />
        <p>
          <b>Your best next hour</b> — ranked by how much you can improve, not just readiness.
        </p>
        <button className="boost-info" onClick={() => setShowInfo(s => !s)} aria-label="How this ranking works">
          <Info size={16} />
        </button>
      </section>
      {showInfo && (
        <p className="boost-info-line">
          Ranked using how much of the exam this topic covers, how far behind you are, and how long it typically takes to fix — combined into one score.
        </p>
      )}

      {/* A. Hero recommendation */}
      {hero && (
        <section className="boost-hero">
          <span className="boost-hero-badge">Best pick right now</span>
          <h3>{hero.name}</h3>
          <p className="boost-hero-reason">{reason(hero)}</p>
          <button className="btn btn-primary boost-hero-cta" onClick={() => alert('Deep-link → practice session: ' + hero.name)}>
            Study this first <BookOpen size={15} />
          </button>
          {single && <span className="boost-hero-subject">{subject}</span>}
        </section>
      )}

      {/* B. Also worth your time */}
      {secondary.length > 0 && (
        <section className="an-card">
          <h3 className="an-card-title">Also worth your time</h3>
          <p className="an-card-sub">Good returns in the next hour or two</p>
          {secondary.map((r, i) => (
            <button className="boost-row" key={r.name + r.subject} onClick={() => alert('Deep-link → practice session: ' + r.name)}>
              <span className="status-dot" style={{ background: status(r.acc).color }} />
              <span className="boost-name">{r.name}<small>{r.subject}</small></span>
              <span className="boost-reason">{reason(r)}</span>
              <ImpactBadge tier={tier(r, i + 1)} />
            </button>
          ))}
        </section>
      )}

      {/* C. Collapsed full list */}
      {rest.length > 0 && (
        <>
          <button className="see-full" onClick={() => setShowAll(s => !s)}>
            {showAll ? 'Hide full list' : `See full list · ${rest.length} more topics`}
          </button>
          {showAll && (
            <section className="an-card">
              <h3 className="an-card-title">Full list</h3>
              <p className="an-card-sub">All ranked topics — deeper detail</p>
              {rest.map((r, i) => (
                <button className="boost-row" key={r.name + r.subject} onClick={() => alert('Deep-link → practice session: ' + r.name)}>
                  <span className="status-dot" style={{ background: status(r.acc).color }} />
                  <span className="boost-name">{r.name}<small>{r.subject} · {r.weight}% of this subject's marks · accuracy {pct(r.acc)}%</small></span>
                  <ImpactBadge tier={tier(r, i + 5)} />
                </button>
              ))}
            </section>
          )}
        </>
      )}

      {lowData > 0 && (
        <p className="boost-note">{lowData} topic{lowData > 1 ? 's' : ''} need more attempts before they can be ranked.</p>
      )}
    </>
  )
}

function ImpactBadge({ tier }) {
  if (tier === 'high') return <span className="impact-badge high">high impact</span>
  if (tier === 'medium') return <span className="impact-badge medium">medium impact</span>
  return <span className="impact-badge low">low impact</span>
}

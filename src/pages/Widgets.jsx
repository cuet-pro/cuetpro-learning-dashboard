import { useEffect, useState } from 'react'
import {
  Swords, List, Layers, TrendingUp,
  FileText, BarChart3, ListChecks, Files, CheckCircle2, Users, Flame, Award, Zap,
  Compass, Target, Timer, Trophy, Video, Sparkles, ArrowLeft, ChevronRight, ArrowRight,
} from 'lucide-react'
import { VOCAB_CATEGORIES } from '../data/vocab'
import { Modal } from '../components/shell/Shell.jsx'
import './widgets.css'

/* ── motion helpers (respect prefers-reduced-motion) ── */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const on = e => setReduced(e.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return reduced
}

function CountUp({ value }) {
  const reduced = usePrefersReducedMotion()
  const [n, setN] = useState(() => (reduced ? value : 0))
  useEffect(() => {
    if (reduced) return
    let raf
    const start = performance.now()
    const dur = 900
    const tick = t => {
      const p = Math.min(1, (t - start) / dur)
      const eased = 1 - Math.pow(1 - p, 3)
      setN(Math.round(eased * value))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, reduced])
  return n.toLocaleString('en-IN')
}

function ProgressRing({ pct, size = 52, stroke = 5 }) {
  const reduced = usePrefersReducedMotion()
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const target = c * (1 - pct / 100)
  const [off, setOff] = useState(() => (reduced ? target : c))
  useEffect(() => {
    if (reduced) return
    const raf = requestAnimationFrame(() => setOff(target))
    return () => cancelAnimationFrame(raf)
  }, [target, reduced])
  return (
    <div className="bt-ring-box" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={pct + '% mastered'}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--success)" strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: reduced ? 'none' : 'stroke-dashoffset 1s cubic-bezier(.22,.61,.36,1)' }}
        />
      </svg>
      <span className="bt-ring-pct"><CountUp value={pct} />%</span>
    </div>
  )
}

/* ── bento tile cells ── */
function BentoTile({ t, today, onGo }) {
  const I = t.icon
  return (
    <button
      className={'bento-tile tone-' + t.tone + (today ? ' today' : '')}
      onClick={onGo}
      disabled={!t.go && !t.nav}
    >
      <span className={'bt-icon tone-' + t.tone}><I size={19} /></span>
      <span className="bt-label">
        {t.label}
        {t.recommended && <span className="bt-rec"><Sparkles size={10} /> Recommended for you</span>}
      </span>
      {t.ring != null ? (
        <div className="bt-ring-wrap">
          <ProgressRing pct={t.ring} size={34} stroke={3.5} />
          <span className="bt-stat">{t.ringMeta}</span>
        </div>
      ) : t.stat ? (
        <span className="bt-stat"><CountUp value={t.stat.n} /> {t.stat.suffix}</span>
      ) : (
        <span className="bt-stat">{t.statText}</span>
      )}
      {today && <span className="bt-today-tag">Today's focus</span>}
    </button>
  )
}

function FeaturedTile({ t, today, onGo }) {
  const I = t.icon
  return (
    <div
      className={'bento-tile featured tone-' + t.tone + (today ? ' today' : '')}
      role="button"
      tabIndex={0}
      onClick={onGo}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onGo() } }}
    >
      <span className={'bt-icon featured tone-' + t.tone}><I size={22} /></span>
      <span className="bt-main">
        <span className="bt-label">{t.label}</span>
        <span className="bt-sub">{t.sub}</span>
      </span>
      <span className="bt-side">
        <span className="bt-live">{t.live}</span>
        {today && <span className="bt-today-tag">Today's focus</span>}
        <button className="bt-cta" onClick={e => { e.stopPropagation(); onGo() }}>{t.cta} <ArrowRight size={14} /></button>
      </span>
    </div>
  )
}

export function ActivityTile() {
  const [feed, setFeed] = useState([
    { id: 1, icon: CheckCircle2, tone: 'green', t: 'Mock Test #7 completed', when: '2h' },
    { id: 2, icon: Layers, tone: 'blue', t: '12 flashcards mastered', when: '4h' },
    { id: 3, icon: Users, tone: 'purple', t: 'Joined a study room', when: '6h' },
    { id: 4, icon: Flame, tone: 'amber', t: '9-day streak milestone', when: '1d' },
  ])
  useEffect(() => {
    const extra = [
      { icon: Flame, tone: 'amber', t: 'Daily challenge completed', when: 'now' },
      { icon: Trophy, tone: 'green', t: 'Rank moved up to #142', when: 'now' },
      { icon: Video, tone: 'blue', t: 'Watched “National income” lesson', when: 'now' },
    ]
    let i = 0
    const iv = setInterval(() => {
      const e = extra[i % extra.length]
      i += 1
      setFeed(f => [{ ...e, id: Date.now() }, ...f].slice(0, 6))
    }, 9000)
    return () => clearInterval(iv)
  }, [])
  const stats = [
    { icon: Target, tone: 'blue', v: '2/3', l: 'mocks' },
    { icon: TrendingUp, tone: 'green', v: '+4.2%', l: 'accuracy' },
    { icon: Timer, tone: 'purple', v: '6.5h', l: 'studied' },
    { icon: Flame, tone: 'amber', v: '7', l: 'streak' },
  ]
  return (
    <>
      <div className="stat-pills">
        {stats.map(s => {
          const I = s.icon
          return (
            <div className={'stat-pill ' + s.tone} key={s.l}>
              <span className={'sp-ico ' + s.tone}><I size={13} /></span>
              <b>{s.v}</b><span>{s.l}</span>
            </div>
          )
        })}
      </div>
      <div className="feed">
        {feed.map(f => {
          const I = f.icon
          return (
            <div className="feed-row" key={f.id}>
              <span className={'fd-ico ' + f.tone}><I size={14} /></span>
              <span className="fd-t">{f.t}</span>
              <span className="fd-when">{f.when}</span>
            </div>
          )
        })}
      </div>
    </>
  )
}

export function BadgesTile() {
  const badges = [
    { icon: Flame, label: '7-day streak', earned: true, tone: 'amber' },
    { icon: Award, label: 'Mock marathoner', earned: true, tone: 'green' },
    { icon: Zap, label: 'Weak → strong', earned: true, tone: 'purple' },
    { icon: Trophy, label: 'Top 5%', earned: true, tone: 'amber' },
    { icon: Flame, label: '30-day streak', earned: false },
    { icon: Target, label: 'Perfect mock', earned: false },
    { icon: Sparkles, label: 'Scholar', earned: false },
    { icon: Compass, label: 'Explorer', earned: false },
  ]
  const earned = badges.filter(b => b.earned).length
  return (
    <>
      <div className="badge-meta">
        <span className="bm-pill earned"><Award size={12} /> {earned} earned</span>
        <span className="bm-pill locked"><Target size={12} /> {badges.length - earned} to unlock</span>
        <div className="bm-bar"><i style={{ width: (earned / badges.length * 100) + '%' }} /></div>
      </div>
      <div className="badge-grid">
        {badges.map(b => {
          const I = b.icon
          return (
            <button
              className={'badge-cell' + (b.earned ? ' earned ' + b.tone : ' locked')}
              key={b.label}
              onClick={() => alert(b.earned ? `Earned: ${b.label}` : `Locked — ${b.label}: keep going to unlock`)}
            >
              <span className="bd-ring"><I size={20} /></span>
              <span className="bd-label">{b.label}</span>
            </button>
          )
        })}
      </div>
    </>
  )
}

export default function DashboardTiles({ onNavigate }) {
  const [wlOpen, setWlOpen] = useState(false)
  const [cat, setCat] = useState(null)
  const [q, setQ] = useState('')
  const active = VOCAB_CATEGORIES.find(c => c.id === cat)

  const match = (it) => {
    if (!q) return true
    const hay = Object.values(it).map(v => Array.isArray(v) ? v.join(' ') : String(v)).join(' ')
    return hay.toLowerCase().includes(q.toLowerCase())
  }
  const words = active ? active.items.filter(match) : []
  const vocabCount = VOCAB_CATEGORIES.reduce((s, c) => s + c.items.length, 0)

  /* grouped bento: Play / Learn / Plan (data + labels + handlers unchanged) */
  const groups = [
    {
      key: 'play', label: 'Play',
      tiles: [
        { id: 'word-battle', label: 'Word battle', tone: 'blue', icon: Swords, featured: true, sub: '5 rounds today · 1v1 vocabulary duel', live: '3 wins today', cta: 'Find opponent', go: () => alert('Deep-link → Word battle (Chill Zone)') },
      ],
    },
    {
      key: 'learn', label: 'Learn',
      tiles: [
        { id: 'word-list', label: 'Word list', tone: 'blue', icon: List, stat: { n: vocabCount, suffix: 'words' }, go: () => setWlOpen(true) },
        { id: 'flashcards', label: 'Flashcards', tone: 'green', icon: Layers, ring: 46, ringMeta: '230/500 mastered', recommended: true, nav: 'studykit' },
        { id: 'syllabus', label: 'Syllabus PDF', tone: 'blue', icon: FileText, stat: { n: 19, suffix: 'chapters' }, go: () => alert('Deep-link → Syllabus PDF') },
      ],
    },
    {
      key: 'plan', label: 'Plan',
      tiles: [
        { id: 'cutoffs', label: 'Cutoffs', tone: 'amber', icon: BarChart3, statText: '2025-26 data', nav: 'explorer' },
        { id: 'eligibility', label: 'Eligibility', tone: 'green', icon: ListChecks, statText: 'check your course', go: () => alert('Deep-link → Eligibility checker') },
        { id: 'sample-papers', label: 'Sample papers', tone: 'blue', icon: Files, stat: { n: 12, suffix: 'papers' }, go: () => alert('Deep-link → Sample papers') },
      ],
    },
  ]

  const flat = groups.flatMap(g => g.tiles)
  const todayId = flat[new Date().getDate() % flat.length].id

  const handle = t => { if (t.go) t.go(); else if (t.nav && onNavigate) onNavigate(t.nav) }

  return (
    <section className="tile green open">
      <div className="tile-head">
        <span className="tile-ico green"><Layers size={16} /></span>
        <b>📚 Practice &amp; resources</b>
        <span className="tile-count green">{flat.length}</span>
      </div>
      <div className="tile-body">
        {groups.map(g => (
          <div className="bento-group" key={g.key}>
            <span className="bento-group-label">{g.label}</span>
            <div className="bento-grid">
              {g.tiles.map(t => {
                const today = t.id === todayId
                return t.featured
                  ? <FeaturedTile key={t.id} t={t} today={today} onGo={() => handle(t)} />
                  : <BentoTile key={t.id} t={t} today={today} onGo={() => handle(t)} />
              })}
            </div>
          </div>
        ))}
      </div>
      <Modal open={wlOpen} onClose={() => { setWlOpen(false); setCat(null); setQ('') }} title={active ? active.name : 'Word list'} wide>
        {active ? (
          <div className="wl-words">
            <div className="wl-top">
              <button type="button" className="wl-back" onClick={() => { setCat(null); setQ('') }}><ArrowLeft size={14} /> All categories</button>
              <input className="wl-search" type="text" placeholder={'Search ' + active.name.toLowerCase() + '…'} value={q} onChange={e => setQ(e.target.value)} />
            </div>
            <div className="wl-table-wrap">
              <table className="wl-table">
                <thead>
                  <tr><th className="wl-sno-h">S.No.</th>{active.cols.map(c => <th key={c.h}>{c.h}</th>)}</tr>
                </thead>
                <tbody>
                  {words.map((it, i) => (
                    <tr key={it.id || i}>
                      <td className="wl-sno">{i + 1}</td>
                      {active.cols.map(c => {
                        let v = it[c.f]
                        if (c.join) v = (v || []).join(', ')
                        const cls = c.pill ? 'wl-pill-cell' : (c.f === 'word' || c.f === 'front' ? 'wl-tword' : '')
                        return (
                          <td key={c.h} className={cls}>
                            {c.pill ? <span className={'wl-diff ' + String(v || '').toLowerCase()}>{v}</span> : v}
                            {c.star && it.pyq ? <span className="wl-pyq">PYQ</span> : null}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {words.length === 0 && <p className="wl-empty">No matches — try a different search.</p>}
          </div>
        ) : (
          <div className="wl-list">
            {VOCAB_CATEGORIES.map(c => (
              <button type="button" className="wl-cat" key={c.id} onClick={() => { setCat(c.id); setQ('') }}>
                <span className="wl-cat-ico" style={{ background: c.color + '1a' }}>{c.icon}</span>
                <span className="wl-cat-t"><b>{c.name}</b><em>{c.items.length} {c.unit}</em></span>
                <ChevronRight size={15} className="wl-cat-arrow" />
              </button>
            ))}
          </div>
        )}
      </Modal>
    </section>
  )
}
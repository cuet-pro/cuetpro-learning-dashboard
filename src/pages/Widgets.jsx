import { useEffect, useState } from 'react'
import {
  Swords, List, Layers, TrendingUp,
  FileText, BarChart3, ListChecks, Files, CheckCircle2, Users, Flame, Award, Zap,
  Compass, Target, Timer, Trophy, Video, Sparkles, ArrowLeft, ChevronRight,
} from 'lucide-react'
import { VOCAB_CATEGORIES } from '../data/vocab'
import { Modal } from '../components/shell/Shell.jsx'
import './widgets.css'

/* tone: green = progress/success · blue = learning/resources · purple/amber = achievements · red/amber = attention */
function IconGrid({ items, onNavigate }) {
  return (
    <div className="icon-grid">
      {items.map((it, i) => {
        const I = it.icon
        return (
          <button
            className={'icon-cell ' + (it.tone || 'neutral')}
            key={it.label}
            style={{ animationDelay: (i * 0.08) + 's' }}
            onClick={(e) => {
              const wrap = e.currentTarget.querySelector('.ic-wrap')
              if (wrap && wrap.animate) {
                wrap.animate(
                  [{ transform: 'scale(1)' }, { transform: 'scale(1.25)', offset: 0.45 }, { transform: 'scale(1)' }],
                  { duration: 350, easing: 'ease' }
                )
              }
              if (it.go) it.go(); else if (it.nav && onNavigate) onNavigate(it.nav)
            }}
            disabled={!it.go && !it.nav}
          >
            <span className={'ic-wrap ' + (it.tone || 'neutral')}><I size={18} /></span>
            <span className="ic-label">{it.label}</span>
            {it.stat && <span className="ic-stat">{it.stat}</span>}
            {it.new && <span className="ic-new" aria-label="New content" />}
          </button>
        )
      })}
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

  /* one clean box: vocab practice + learning resources together */
  const items = [
    { icon: Swords, label: 'Word battle', tone: 'blue', stat: '5 rounds today', go: () => alert('Deep-link → Word battle (Chill Zone)') },
    { icon: List, label: 'Word list', tone: 'blue', stat: vocabCount + ' words', go: () => setWlOpen(true) },
    { icon: Layers, label: 'Flashcards', tone: 'green', stat: '230/500 mastered', nav: 'studykit' },
    { icon: FileText, label: 'Syllabus PDF', tone: 'blue', stat: '19 chapters', go: () => alert('Deep-link → Syllabus PDF') },
    { icon: BarChart3, label: 'Cutoffs', tone: 'amber', stat: '2025-26 data', nav: 'explorer' },
    { icon: ListChecks, label: 'Eligibility', tone: 'green', stat: 'check your course', go: () => alert('Deep-link → Eligibility checker') },
    { icon: Files, label: 'Sample papers', tone: 'blue', stat: '12 papers', go: () => alert('Deep-link → Sample papers') },
  ]

  return (
    <section className="tile green open">
      <div className="tile-head">
        <span className="tile-ico green"><Layers size={16} /></span>
        <b>📚 Practice &amp; resources</b>
        <span className="tile-count green">{items.length}</span>
      </div>
      <div className="tile-body">
        <IconGrid onNavigate={onNavigate} items={items} />
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
                  <tr>{active.cols.map(c => <th key={c.h}>{c.h}</th>)}</tr>
                </thead>
                <tbody>
                  {words.map((it, i) => (
                    <tr key={it.id || i}>
                      {active.cols.map(c => {
                        let v = it[c.f]
                        if (c.join) v = (v || []).join(', ')
                        const cls = c.pill ? 'wl-pill-cell' : (c.f === 'word' || c.f === 'front' ? 'wl-tword' : '')
                        return (
                          <td key={c.h} className={cls}>
                            {c.star && it.star ? <span className="wl-star">★</span> : null}
                            {c.pill ? <span className={'wl-diff ' + String(v || '').toLowerCase()}>{v}</span> : v}
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
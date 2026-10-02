import { useEffect, useState } from 'react'
import {
  Swords, List, Layers, MessageCircle, TrendingUp, Lightbulb,
  FileText, BarChart3, ListChecks, Files, CheckCircle2, Users, Flame, Award, Zap,
  Compass, Target, Timer, Trophy, Video, Sparkles, Grid3x3, ArrowLeft, ChevronRight,
} from 'lucide-react'
import { boostRanking } from '../lib/analysisData'
import { VOCAB_CATEGORIES } from '../data/vocab'
import { Modal } from '../components/shell/Shell.jsx'
import './widgets.css'

/* tone: green = progress/success · blue = learning/resources · purple/amber = achievements · red/amber = attention */
function IconGrid({ items, onNavigate }) {
  return (
    <div className="icon-grid">
      {items.map(it => {
        const I = it.icon
        return (
          <button
            className={'icon-cell ' + it.tone}
            key={it.label}
            onClick={() => (it.go ? it.go() : it.nav && onNavigate ? onNavigate(it.nav) : null)}
            disabled={!it.go && !it.nav}
          >
            <span className={'ic-wrap ' + it.tone}><I size={18} /></span>
            <span className="ic-label">{it.label}</span>
            {it.badge && <em className="icon-badge">{it.badge}</em>}
          </button>
        )
      })}
    </div>
  )
}

function VocabTile({ onNavigate }) {
  const [wlOpen, setWlOpen] = useState(false)
  const [cat, setCat] = useState(null)
  const [q, setQ] = useState('')
  const active = VOCAB_CATEGORIES.find(c => c.id === cat)

  const open = (id) => { setCat(id); setQ('') }
  const close = () => { setWlOpen(false); setCat(null); setQ('') }

  const match = (it) => {
    if (!q) return true
    const hay = Object.values(it).map(v => Array.isArray(v) ? v.join(' ') : String(v)).join(' ')
    return hay.toLowerCase().includes(q.toLowerCase())
  }

  const words = active ? active.items.filter(match) : []

  return (
    <>
      <IconGrid onNavigate={onNavigate} items={[
        { icon: Swords, label: 'Word battle', tone: 'blue', go: () => alert('Deep-link → Word battle (Chill Zone)') },
        { icon: List, label: 'Word list', tone: 'blue', go: () => setWlOpen(true) },
        { icon: Layers, label: 'Flashcards', tone: 'green', nav: 'studykit' },
        { icon: MessageCircle, label: 'Phrasal verbs', tone: 'purple', go: () => alert('Deep-link → Phrasal verbs') },
      ]} />
      <Modal open={wlOpen} onClose={close} title={active ? active.name : 'Word list'} wide>
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
              <button type="button" className="wl-cat" key={c.id} onClick={() => open(c.id)}>
                <span className="wl-cat-ico" style={{ background: c.color + '1a' }}>{c.icon}</span>
                <span className="wl-cat-t"><b>{c.name}</b><em>{c.items.length} {c.unit}</em></span>
                <ChevronRight size={15} className="wl-cat-arrow" />
              </button>
            ))}
          </div>
        )}
      </Modal>
    </>
  )
}

function InsightsTile({ onNavigate }) {
  const goSwot = () => { try { localStorage.setItem('cp_analysis_tab', 'swot') } catch {} onNavigate('analysis') }
  return <IconGrid onNavigate={onNavigate} items={[
    { icon: Grid3x3, label: 'SWOT', tone: 'purple', go: goSwot },
    { icon: Lightbulb, label: 'Fixes', tone: 'purple', go: goSwot },
    { icon: FileText, label: 'Syllabus PDF', tone: 'blue', go: () => alert('Deep-link → Syllabus PDF') },
    { icon: BarChart3, label: 'Cutoffs', tone: 'blue', nav: 'explorer' },
    { icon: ListChecks, label: 'Eligibility', tone: 'green', go: () => alert('Deep-link → Eligibility checker') },
    { icon: Files, label: 'Sample papers', tone: 'purple', go: () => alert('Deep-link → Sample papers') },
  ]} />
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
  const [open, setOpen] = useState({ vocab: true, insights: true })
  const [topWords] = useState(() => boostRanking('Commerce').slice(0, 1))

  const tiles = [
    { id: 'vocab', title: 'Vocabulary & practice', icon: Layers, tone: 'green', count: 4, body: <VocabTile onNavigate={onNavigate} /> },
    { id: 'insights', title: 'Insights & resources', icon: Lightbulb, tone: 'blue', count: 6, body: <InsightsTile onNavigate={onNavigate} /> },
  ]

  return (
    <div className="tiles">
      {tiles.map(t => {
        const I = t.icon
        const isOpen = open[t.id]
        return (
          <section className={'tile ' + t.tone + (isOpen ? ' open' : '')} key={t.id}>
            <button className="tile-head" onClick={() => setOpen(o => ({ ...o, [t.id]: !o[t.id] }))} aria-expanded={isOpen}>
              <span className={'tile-ico ' + t.tone}><I size={16} /></span>
              <b>{t.title}</b>
              <span className={'tile-count ' + t.tone}>{t.count}</span>
              {t.id === 'vocab' && topWords[0] && <span className="tile-hint">top: {topWords[0].name}</span>}
              <span className={'tile-chev' + (isOpen ? ' up' : '')}>⌄</span>
            </button>
            {isOpen && <div className="tile-body">{t.body}</div>}
          </section>
        )
      })}
    </div>
  )
}

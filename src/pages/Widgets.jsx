import { useEffect, useState } from 'react'
import {
  Swords, List, Layers, MessageCircle, TrendingUp, TrendingDown, AlertTriangle, Lightbulb,
  FileText, BarChart3, ListChecks, Files, Info, CheckCircle2, Users, Flame, Award, Zap,
  Compass, Target, Timer, BookOpen, Trophy, Sigma, Map as MapIcon, Video,
} from 'lucide-react'
import { boostRanking, weakTopicNames } from '../lib/analysisData'
import './widgets.css'

/* ── 1. Vocabulary & practice — icon grid ── */
function VocabTile({ onNavigate }) {
  const items = [
    { icon: Swords, label: 'Word battle', go: () => alert('Deep-link → Word battle (Chill Zone)') },
    { icon: List, label: 'Word list', go: () => alert('Deep-link → Word list') },
    { icon: Layers, label: 'Flashcards', go: null, nav: 'studykit' },
    { icon: MessageCircle, label: 'Phrasal verbs', go: () => alert('Deep-link → Phrasal verbs') },
    { icon: Timer, label: 'Quick quiz', go: null, nav: 'studykit' },
    { icon: Zap, label: 'Focus mock', go: null, nav: 'studykit' },
  ]
  return <IconGrid items={items} onNavigate={onNavigate} />
}

/* ── 2. Insights & resources — icon grid ── */
function InsightsTile({ words, onNavigate }) {
  const items = [
    { icon: TrendingUp, label: 'Strengths', tone: 'ok' },
    { icon: TrendingDown, label: 'Weaknesses', tone: 'warn' },
    { icon: AlertTriangle, label: 'Threats', tone: 'bad' },
    { icon: Lightbulb, label: 'Fixes', tone: 'info' },
    { icon: FileText, label: 'Syllabus PDF', go: () => alert('Deep-link → Syllabus PDF') },
    { icon: BarChart3, label: 'Cutoffs', nav: 'explorer' },
    { icon: ListChecks, label: 'Eligibility', go: () => alert('Deep-link → Eligibility checker') },
    { icon: Files, label: 'Sample papers', go: () => alert('Deep-link → Sample papers') },
    { icon: Info, label: 'Pattern guide', go: () => alert('Deep-link → Exam pattern guide') },
    { icon: MapIcon, label: 'Explorer', nav: 'explorer' },
    { icon: Sigma, label: 'Formulas', nav: 'studykit' },
    { icon: BookOpen, label: 'Weak topics', badge: String(words.length) },
  ]
  return <IconGrid items={items} onNavigate={onNavigate} />
}

/* ── 3. Activity — icon chips + animated feed ── */
function ActivityTile() {
  const [feed, setFeed] = useState([
    { id: 1, icon: CheckCircle2, tone: 'ok', t: 'Mock Test #7 completed', when: '2h ago' },
    { id: 2, icon: Layers, tone: 'info', t: '12 flashcards mastered', when: '4h ago' },
    { id: 3, icon: Users, tone: 'info', t: 'Joined a study room', when: '6h ago' },
    { id: 4, icon: Flame, tone: 'warn', t: '9-day streak milestone', when: 'yesterday' },
  ])
  useEffect(() => {
    const extra = [
      { icon: Flame, tone: 'warn', t: 'Daily challenge completed', when: 'just now' },
      { icon: Trophy, tone: 'ok', t: 'Rank moved up to #142', when: 'just now' },
      { icon: Video, tone: 'info', t: 'Watched “National income” lesson', when: 'just now' },
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
    { icon: Target, v: '2/3', l: 'mocks' },
    { icon: TrendingUp, v: '+4.2%', l: 'accuracy' },
    { icon: Timer, v: '6.5h', l: 'studied' },
    { icon: Flame, v: '7', l: 'day streak' },
  ]
  return (
    <>
      <div className="icon-strip">
        {stats.map(s => {
          const I = s.icon
          return <div className="icon-stat" key={s.l}><I size={15} /><b>{s.v}</b><span>{s.l}</span></div>
        })}
      </div>
      <div className="feed">
        {feed.map(f => {
          const I = f.icon
          return (
            <div className={'feed-row ' + f.tone} key={f.id}>
              <span className={'feed-ico ' + f.tone}><I size={14} /></span>
              <span className="feed-t">{f.t}</span>
              <span className="feed-when">{f.when}</span>
            </div>
          )
        })}
      </div>
    </>
  )
}

/* ── 4. Badges — icon grid, earned vs locked ── */
function BadgesTile() {
  const badges = [
    { icon: Flame, label: '7-day streak', earned: true, tone: 'warn' },
    { icon: Award, label: 'Mock marathoner', earned: true, tone: 'ok' },
    { icon: Zap, label: 'Weak → strong', earned: true, tone: 'ok' },
    { icon: Trophy, label: 'Top 5%', earned: true, tone: 'warn' },
    { icon: Flame, label: '30-day streak', earned: false },
    { icon: Target, label: 'Perfect mock', earned: false },
    { icon: BookOpen, label: 'Scholar', earned: false },
    { icon: Compass, label: 'Explorer', earned: false },
  ]
  return (
    <div className="badge-grid">
      {badges.map(b => {
        const I = b.icon
        return (
          <button
            className={'badge-cell' + (b.earned ? ' earned ' + (b.tone || '') : ' locked')}
            key={b.label}
            onClick={() => alert(b.earned ? `Earned: ${b.label}` : `Locked — ${b.label}: keep going to unlock`)}
          >
            <I size={20} />
            <span>{b.label}</span>
          </button>
        )
      })}
    </div>
  )
}

function IconGrid({ items, onNavigate }) {
  return (
    <div className="icon-grid">
      {items.map(it => {
        const I = it.icon
        return (
          <button
            className={'icon-cell' + (it.tone ? ' ' + it.tone : '')}
            key={it.label}
            onClick={() => (it.go ? it.go() : it.nav && onNavigate ? onNavigate(it.nav) : null)}
            disabled={!it.go && !it.nav}
          >
            <I size={19} />
            <span>{it.label}</span>
            {it.badge && <em className="icon-badge">{it.badge}</em>}
          </button>
        )
      })}
    </div>
  )
}

export default function DashboardTiles({ onNavigate }) {
  const [open, setOpen] = useState('vocab')
  const words = weakTopicNames('Commerce')
  const [topWords] = useState(() => boostRanking('Commerce').slice(0, 1))

  const tiles = [
    { id: 'vocab', title: 'Vocabulary & practice', icon: Layers, body: <VocabTile onNavigate={onNavigate} /> },
    { id: 'insights', title: 'Insights & resources', icon: Lightbulb, body: <InsightsTile words={words} onNavigate={onNavigate} /> },
    { id: 'activity', title: 'Your recent activity', icon: TrendingUp, body: <ActivityTile /> },
    { id: 'badges', title: 'Recent badges', icon: Award, body: <BadgesTile /> },
  ]

  return (
    <div className="tiles">
      {tiles.map(t => {
        const I = t.icon
        const isOpen = open === t.id
        return (
          <section className={'tile' + (isOpen ? ' open' : '')} key={t.id}>
            <button className="tile-head" onClick={() => setOpen(isOpen ? null : t.id)} aria-expanded={isOpen}>
              <span className="tile-ico"><I size={16} /></span>
              <b>{t.title}</b>
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

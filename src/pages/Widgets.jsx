import { useEffect, useState } from 'react'
import {
  Swords, List, Layers, MessageCircle, TrendingUp, TrendingDown, AlertTriangle, Lightbulb,
  FileText, BarChart3, ListChecks, Files, Info, CheckCircle2, Users, Flame, Award,
  Activity, CalendarRange, Target, Zap, GraduationCap, Sparkles, Compass, ChevronRight, Gift,
} from 'lucide-react'
import './widgets.css'

/* Icons reuse the app's existing vocabulary (flashcards=Layers, trend=TrendingUp/Down,
   alert=AlertTriangle, bulb=Lightbulb, file=FileText, checklist=ListChecks,
   check=CheckCircle2, users=Users, flame=Flame, bolt=Zap, target=Target). */

function TileHead({ icon: Icon, title, sub, hint, onClickHint }) {
  return (
    <div className="tile-head">
      <span className="tile-ico"><Icon size={16} /></span>
      <div className="tile-t"><b>{title}</b><em>{sub}</em></div>
      {hint && <button className="tile-open" onClick={onClickHint}>{hint} <ChevronRight size={13} /></button>}
    </div>
  )
}
function Row({ icon: Icon, label, sub, color, onClick }) {
  return (
    <button className="tile-row" onClick={() => (onClick ? onClick() : alert('Deep-link → ' + label))}>
      <span className="tile-row-ico" style={color ? { color } : undefined}><Icon size={14} /></span>
      <span className="tile-row-t"><b>{label}</b>{sub && <em>{sub}</em>}</span>
      <ChevronRight size={13} className="tile-row-arr" />
    </button>
  )
}

const VOCAB = [
  { icon: Swords, label: 'Word battle', sub: '1v1 vocab duel', onClick: () => alert('Deep-link → Chill Zone · Word battle') },
  { icon: List, label: 'Word list', sub: '120 words this week' },
  { icon: Layers, label: 'Flashcards', sub: '34 due for recall', onClick: () => null },
  { icon: MessageCircle, label: 'Phrasal verbs', sub: '12 new phrases' },
]
const SWOT = [
  { icon: TrendingUp, label: 'Vocabulary · 88%', color: 'var(--success)', sub: 'strength' },
  { icon: TrendingDown, label: 'Money & Banking · 48%', color: 'var(--warning)', sub: 'weakness' },
  { icon: AlertTriangle, label: 'Quant ability · 38%', color: 'var(--error)', sub: 'threat — high marks share' },
  { icon: Lightbulb, label: 'National income · 62%', color: 'var(--info)', sub: 'opportunity' },
]
const RESOURCES = [
  { icon: FileText, label: 'Syllabus PDF' }, { icon: BarChart3, label: 'Previous year cutoffs' },
  { icon: ListChecks, label: 'Eligibility checker' }, { icon: Files, label: 'Sample papers' }, { icon: Info, label: 'Exam pattern guide' },
]
const SHORTCUTS = [
  { icon: GraduationCap, label: 'Study Kit', id: 'studykit' }, { icon: BarChart3, label: 'Analysis', id: 'analysis' },
  { icon: Sparkles, label: 'Smart Revision', id: 'revision' }, { icon: Compass, label: 'DU Explorer', id: 'explorer' },
]
const BASE_ACTIVITY = [
  { icon: CheckCircle2, color: 'var(--success)', label: 'Mock Test #7 completed', sub: '2 hours ago · 512/800' },
  { icon: Layers, color: 'var(--success)', label: 'Flashcards mastered', sub: '12 cards · Money & Banking' },
  { icon: Users, color: 'var(--info)', label: 'Joined a study room', sub: '6 hours ago · 50-min session' },
  { icon: Flame, color: 'var(--warning)', label: '9-day streak milestone', sub: 'Yesterday' },
]
const NEW_ACTIVITY = [
  { icon: CheckCircle2, color: 'var(--success)', label: 'Daily challenge completed', sub: 'Word of the Day · +10 pts' },
  { icon: Flame, color: 'var(--warning)', label: 'Streak extended to 10 days', sub: 'Just now' },
]
const WEEK_STATS = [
  { icon: Target, v: '2 mocks', l: 'of 3 planned' }, { icon: TrendingUp, v: '+4.2%', l: 'accuracy' },
  { icon: Activity, v: '6.5h', l: 'studied' }, { icon: Flame, v: '7 days', l: 'streak' },
]
const BADGES = [
  { icon: Flame, color: 'var(--warning)', name: '7-day streak', earned: true },
  { icon: Award, color: 'var(--success)', name: 'Mock marathoner', earned: true },
  { icon: Zap, color: 'var(--success)', name: 'Weak → strong', earned: true },
  { icon: Award, name: '30-day streak', earned: false },
  { icon: Target, name: 'Perfect mock', earned: false },
  { icon: Award, name: 'Scholar', earned: false },
]

export default function DashboardTiles({ onNavigate }) {
  const [activity, setActivity] = useState(BASE_ACTIVITY.map((a, i) => ({ ...a, id: i, fresh: false })))
  const [newCount, setNewCount] = useState(0)
  useEffect(() => {
    const iv = setInterval(() => {
      const n = NEW_ACTIVITY[newCount % NEW_ACTIVITY.length]
      setActivity(list => [{ ...n, id: Date.now(), fresh: true }, ...list].slice(0, 6))
      setNewCount(c => c + 1)
    }, 9000)
    return () => clearInterval(iv)
  }, [newCount])

  return (
    <div className="tiles">
      {/* 1 · Vocabulary & practice */}
      <section className="cuet-card tile">
        <TileHead icon={Swords} title="Vocabulary & practice" sub="Words, flashcards, quick duels" hint="Open Study Kit" onClickHint={() => onNavigate('studykit')} />
        {VOCAB.map(r => <Row key={r.label} {...r} onClick={r.onClick} />)}
        <div className="tile-div" />
        <div className="tile-chips">
          {SHORTCUTS.map(s => (
            <button key={s.id} className="tile-chip" onClick={() => onNavigate(s.id)}><s.icon size={12} /> {s.label.split(' ')[0]}</button>
          ))}
        </div>
      </section>

      {/* 2 · Insights & resources */}
      <section className="cuet-card tile">
        <TileHead icon={Gift} title="Insights & resources" sub="SWOT snapshot + free downloads" hint="Open Analysis" onClickHint={() => onNavigate('analysis')} />
        {SWOT.map(r => <Row key={r.label} {...r} />)}
        <div className="tile-div" />
        <div className="tile-chips">
          {RESOURCES.map(r => (
            <button key={r.label} className="tile-chip" onClick={() => alert('Deep-link → ' + r.label)}><r.icon size={12} /> {r.label.split(' ')[0]}</button>
          ))}
        </div>
      </section>

      {/* 3 · Activity */}
      <section className="cuet-card tile">
        <TileHead icon={Activity} title="Your recent activity" sub="Live feed · this week at a glance" />
        <div className="tile-feed">
          {activity.map(a => (
            <div key={a.id} className={'tile-feed-row' + (a.fresh ? ' fresh' : '')}>
              <span className="tile-feed-ico" style={{ color: a.color }}><a.icon size={14} /></span>
              <span className="tile-feed-t"><b>{a.label}</b><em>{a.sub}</em></span>
            </div>
          ))}
        </div>
        <div className="tile-div" />
        <div className="tile-stats">
          {WEEK_STATS.map(s => (
            <div className="tile-stat" key={s.l}><span style={{ color: 'var(--text-muted)' }}><s.icon size={13} /></span><b>{s.v}</b><em>{s.l}</em></div>
          ))}
        </div>
      </section>

      {/* 4 · Badges */}
      <section className="cuet-card tile">
        <TileHead icon={Award} title="Recent badges" sub="Earned & waiting for you" hint="Chill Zone" onClickHint={() => onNavigate('chill')} />
        <div className="tile-badges">
          {BADGES.map(b => (
            <div key={b.name} className={'tile-badge' + (b.earned ? ' earned' : ' locked')} title={b.name}>
              <span style={b.earned ? { color: b.color } : undefined}><b.icon size={18} /></span>
              <em>{b.name}</em>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

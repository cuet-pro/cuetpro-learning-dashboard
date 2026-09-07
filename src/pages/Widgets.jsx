import { useEffect, useState } from 'react'
import {
  CaseSensitive, Swords, List, Layers, MessageCircle, TrendingUp, TrendingDown, AlertTriangle,
  Lightbulb, FileText, BarChart3, ListChecks, Files, Info, CheckCircle2, Users, Flame, Award,
  Activity, CalendarRange, Target, Zap, GraduationCap, Sparkles, Compass, ChevronDown, ArrowRight, Gift,
} from 'lucide-react'
import './widgets.css'

/* ── Icons reused from the app's existing vocabulary (consistency rule) ──
 * flashcards = Layers (Study Kit) · trending = TrendingUp/Down (Analysis)
 * alert = AlertTriangle (Analysis focus) · bulb = Lightbulb (Chill Zone riddle)
 * file-text = FileText (Smart Revision cheat sheets) · checklist = ListChecks (Study Kit)
 * check = CheckCircle2 / users = Users / flame = Flame (Dashboard challenges/leaderboard)
 * bolt = Zap (Boost plan) · target = Target (Profile) · chevron = ChevronDown */

function W({ title, icon: Icon, sub, open, onToggle, children }) {
  return (
    <section className={'wdg' + (open ? ' open' : '')}>
      <button className="wdg-head" onClick={onToggle} aria-expanded={open}>
        <span className="wdg-ico"><Icon size={17} /></span>
        <span className="wdg-t">
          <b>{title}</b>
          {sub && <em>{sub}</em>}
        </span>
        <ChevronDown size={16} className="wdg-chev" />
      </button>
      {open && <div className="wdg-body">{children}</div>}
    </section>
  )
}

function Row({ icon: Icon, label, sub, color, onClick }) {
  return (
    <button className="wdg-row" onClick={() => (onClick ? onClick() : alert('Deep-link → ' + label))}>
      <span className="wdg-row-ico" style={color ? { color } : undefined}><Icon size={15} /></span>
      <span className="wdg-row-t"><b>{label}</b>{sub && <em>{sub}</em>}</span>
      <ArrowRight size={13} className="wdg-row-arr" />
    </button>
  )
}

const VOCAB = [
  { icon: Swords, label: 'Word battle', sub: '1v1 — find an opponent' },
  { icon: List, label: 'Word list', sub: '120 words this week' },
  { icon: Layers, label: 'Flashcards', sub: '34 due for recall' },
  { icon: MessageCircle, label: 'Phrasal verbs', sub: '12 new phrases today' },
]

const SWOT = [
  { icon: TrendingUp, label: 'Strength — Vocabulary', sub: 'English · 88% accuracy', color: 'var(--green-600)' },
  { icon: TrendingDown, label: 'Weakness — Money & Banking', sub: 'Economics · 48%', color: 'var(--warning-600)' },
  { icon: AlertTriangle, label: 'Threat — Quantitative ability', sub: 'General Test · 38% · high marks share', color: 'var(--red-500)' },
  { icon: Lightbulb, label: 'Opportunity — National income', sub: '62% → up to 80% potential', color: 'var(--blue-500)' },
]

const RESOURCES = [
  { icon: FileText, label: 'Syllabus PDF', sub: 'NTA CUET 2027 — full document' },
  { icon: BarChart3, label: 'Previous year cutoffs', sub: 'College-wise, last 3 rounds' },
  { icon: ListChecks, label: 'Eligibility checker', sub: 'Subjects → programs' },
  { icon: Files, label: 'Sample papers', sub: 'Official + curated sets' },
  { icon: Info, label: 'Exam pattern guide', sub: 'Marks, sections, timing' },
]

const BASE_ACTIVITY = [
  { icon: CheckCircle2, color: 'var(--green-600)', label: 'Mock Test #7 completed', sub: '2 hours ago · 512/800' },
  { icon: Layers, color: 'var(--green-600)', label: 'Flashcards mastered', sub: '12 cards · Money & Banking' },
  { icon: Users, color: 'var(--blue-500)', label: 'Joined a study room', sub: '6 hours ago · 50-min session' },
  { icon: Flame, color: 'var(--warning-500)', label: '9-day streak milestone', sub: 'Yesterday · keep it going' },
]
const NEW_ACTIVITY = [
  { icon: CheckCircle2, color: 'var(--green-600)', label: 'Daily challenge completed', sub: 'Word of the Day · +10 pts' },
  { icon: Flame, color: 'var(--warning-500)', label: 'Streak extended to 10 days', sub: 'Just now · nice!' },
]

const WEEK = [
  { icon: Target, label: '2 mocks attempted', sub: 'of 3 planned this week', color: 'var(--navy-500)' },
  { icon: TrendingUp, label: 'Accuracy +4.2%', sub: 'vs last week', color: 'var(--green-600)' },
  { icon: Activity, label: '6.5 h studied', sub: 'best day: Tuesday', color: 'var(--blue-500)' },
  { icon: Flame, label: '7-day streak', sub: 'keep it alive', color: 'var(--warning-500)' },
]

const SHORTCUTS = [
  { icon: GraduationCap, label: 'Study Kit', sub: 'Notes & flashcards', color: 'var(--navy-500)' },
  { icon: BarChart3, label: 'Analysis', sub: 'SWOT + boost plan', color: 'var(--green-600)' },
  { icon: Sparkles, label: 'Smart Revision', sub: 'Today: 14 cards due', color: 'var(--blue-500)' },
  { icon: Compass, label: 'DU Explorer', sub: 'College & course predictor', color: 'var(--navy-500)' },
]

const BADGES = [
  { icon: Flame, color: 'var(--warning-500)', name: '7-day streak', earned: true },
  { icon: Award, color: 'var(--green-600)', name: 'Mock marathoner', earned: true },
  { icon: Zap, color: 'var(--green-600)', name: 'Weak → strong', earned: true },
  { icon: Award, name: '30-day streak', earned: false },
  { icon: Target, name: 'Perfect mock', earned: false },
  { icon: Award, name: 'Scholar', earned: false },
]

function BadgeStrip() {
  return (
    <div className="wdg-badges">
      {BADGES.map(b => (
        <div key={b.name} className={'wdg-badge' + (b.earned ? ' earned' : ' locked')} title={b.name}>
          <span className="wdg-badge-ico" style={b.earned ? { color: b.color } : undefined}><b.icon size={20} /></span>
          <em>{b.name}</em>
        </div>
      ))}
    </div>
  )
}

export default function DashboardWidgets() {
  const [open, setOpen] = useState({})
  const [activity, setActivity] = useState(BASE_ACTIVITY.map((a, i) => ({ ...a, id: i, fresh: false })))
  const [newCount, setNewCount] = useState(0)

  /* demo: a new activity item arrives every ~9s → animates in */
  useEffect(() => {
    const iv = setInterval(() => {
      const n = NEW_ACTIVITY[newCount % NEW_ACTIVITY.length]
      setActivity(list => [{ ...n, id: Date.now(), fresh: true }, ...list].slice(0, 6))
      setNewCount(c => c + 1)
    }, 9000)
    return () => clearInterval(iv)
  }, [newCount])

  const toggle = id => setOpen(o => ({ ...o, [id]: !o[id] }))

  return (
    <div className="wdg-grid">
      <W title="Vocab Builder" icon={CaseSensitive} sub="Grow your word power daily" open={!!open.vocab} onToggle={() => toggle('vocab')}>
        {VOCAB.map(r => <Row key={r.label} {...r} />)}
      </W>
      <W title="SWOT Snapshot" icon={Target} sub="Where you stand, at a glance" open={!!open.swot} onToggle={() => toggle('swot')}>
        {SWOT.map(r => <Row key={r.label} {...r} />)}
      </W>
      <W title="Free Resources" icon={Gift} sub="Syllabus, cutoffs, papers" open={!!open.res} onToggle={() => toggle('res')}>
        {RESOURCES.map(r => <Row key={r.label} {...r} />)}
      </W>
      <W title="Your recent activity" icon={Activity} sub="What you've been up to" open={!!open.act} onToggle={() => toggle('act')}>
        <div className="wdg-feed">
          {activity.map(a => (
            <div key={a.id} className={'wdg-feed-row' + (a.fresh ? ' fresh' : '')}>
              <span className="wdg-feed-ico" style={{ color: a.color }}><a.icon size={15} /></span>
              <span className="wdg-feed-t"><b>{a.label}</b><em>{a.sub}</em></span>
            </div>
          ))}
        </div>
      </W>
      <W title="This Week at a Glance" icon={CalendarRange} sub="Your week in numbers" open={!!open.week} onToggle={() => toggle('week')}>
        {WEEK.map(r => <Row key={r.label} {...r} />)}
      </W>
      <W title="Quick Shortcuts" icon={Zap} sub="Jump straight in" open={!!open.sc} onToggle={() => toggle('sc')}>
        {SHORTCUTS.map(r => <Row key={r.label} {...r} onClick={() => alert('Deep-link → ' + r.label)} />)}
      </W>
      <W title="Recent Badges" icon={Award} sub="Earned & waiting for you" open={!!open.badges} onToggle={() => toggle('badges')}>
        <BadgeStrip />
      </W>
    </div>
  )
}

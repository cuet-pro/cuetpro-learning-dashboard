import { RotateCcw, BookOpen, BarChart3, ArrowRight } from 'lucide-react'
import BrandLogo from '../../components/BrandLogo'

const FEATURES = [
  { icon: RotateCcw, title: 'Smart Revision', sub: "Spaced-repetition cards that tell you exactly what's due today." },
  { icon: BookOpen, title: 'Study Kit', sub: 'Chapter-wise notes for your stream, with progress saved.' },
  { icon: BarChart3, title: 'Analysis & College Explorer', sub: 'Subject-wise accuracy, plus DU cut-offs and seats for your target course.' },
]

const STEPS = [
  { title: 'Create your account', sub: 'Name, email and mobile' },
  { title: 'Set your goal', sub: 'Stream, dream college, target score' },
  { title: 'Start your first plan', sub: "Your dashboard opens with today's focus" },
]

function dotClass(i, step) {
  if (step >= 3) return 'dot done'
  return i < step ? 'dot done' : i === step ? 'dot current' : 'dot'
}

export default function BrandPanel({ view, step, onSwitch }) {
  const isLogin = view === 'login'
  return (
    <section className="brand">
      <BrandLogo size="md" />

      {isLogin ? (
        <>
          <div className="brand-body">
            <span className="eyebrow">CUET UG preparation</span>
            <h1>Your seat at your dream college starts with today&apos;s plan.</h1>
            <p className="lead">Log in to pick up where you left off — your revision deck, notes progress and streak are waiting.</p>
            <ul className="features">
              {FEATURES.map(f => (
                <li key={f.title}>
                  <span className="f-ico"><f.icon size={18} /></span>
                  <div>
                    <div className="f-title">{f.title}</div>
                    <div className="f-sub">{f.sub}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="from-to">
            <small>From</small><b>You</b>
            <ArrowRight size={16} className="from-to-arrow" />
            <small>To</small><b>Your dream college</b>
          </div>
        </>
      ) : (
        <>
          <div className="brand-body">
            <h1>Set up your prep in two minutes.</h1>
            <p className="lead">Tell us your stream and target once — Study Kit, Smart Revision and Analysis all tune themselves to it. You can change it any time from Profile.</p>
            <ol className="steps">
              {STEPS.map((s, i) => (
                <li key={s.title}>
                  <span className={dotClass(i + 1, step)}>{i + 1}</span>
                  <div>
                    <div className="f-title">{s.title}</div>
                    <div className="f-sub">{s.sub}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <p className="brand-foot">Already have an account? <a href="#login" onClick={e => { e.preventDefault(); onSwitch('login') }}>Log in</a></p>
        </>
      )}
    </section>
  )
}
import { useEffect, useState } from 'react'
import { Flame, ArrowRight, BookOpen, Zap, CheckCircle2, XCircle, Sparkles, ChevronDown, ChevronRight, CalendarDays, Eye, X, Trophy, Users } from 'lucide-react'
import { useProfile, dreamCollegeShort } from '../lib/profile'
import DashboardWidgets from './Widgets.jsx'
import './dashboard.css'

const SUBJECTS = [
  { n: 'English', pct: 74, status: 'On track' },
  { n: 'Economics', pct: 58, status: 'Needs attention' },
  { n: 'Accountancy', pct: 81, status: 'On track' },
  { n: 'Business Studies', pct: 64, status: 'On track' },
  { n: 'General Test', pct: 45, status: 'Behind' },
]

/* My Standing — same source the whole app's leaderboard uses */
const LB = {
  all: {
    rank: 142, of: 3480, pctile: 95.9, pts: 1120, cohort: 'All CUET Pro',
    rows: [
      { name: 'Ishaan M.', pts: 2840 }, { name: 'Ridhima K.', pts: 2790 }, { name: 'Aryan B.', pts: 2705 },
      { name: 'Simran K.', pts: 2650 }, { name: 'Devansh R.', pts: 2600 }, { name: 'Kiara J.', pts: 2540 },
      { name: 'Arjun S.', pts: 2490 }, { name: 'Meera P.', pts: 2430 }, { name: 'Rohan V.', pts: 2380 },
      { name: 'Tanya G.', pts: 2310 }, { name: 'Yash D.', pts: 2250 }, { name: 'Sneha T.', pts: 2190 },
      { name: 'Kabir N.', pts: 2120 }, { name: 'Ishita R.', pts: 2060 }, { name: 'Advait M.', pts: 1980 },
      { name: 'Naina S.', pts: 1900 }, { name: 'Vedant K.', pts: 1830 }, { name: 'Ananya Verma', pts: 1120, me: true },
      { name: 'Parth L.', pts: 980 }, { name: 'Divya C.', pts: 760 },
    ],
  },
  subj: {
    rank: 38, of: 512, pctile: 91.2, pts: 420, cohort: 'Economics cohort',
    rows: [
      { name: 'Ishaan M.', pts: 890 }, { name: 'Aryan B.', pts: 860 }, { name: 'Meera P.', pts: 830 },
      { name: 'Ridhima K.', pts: 800 }, { name: 'Kiara J.', pts: 770 }, { name: 'Arjun S.', pts: 730 },
      { name: 'Simran K.', pts: 690 }, { name: 'Tanya G.', pts: 640 }, { name: 'Ananya Verma', pts: 420, me: true },
      { name: 'Yash D.', pts: 380 }, { name: 'Sneha T.', pts: 320 }, { name: 'Vedant K.', pts: 270 },
    ],
  },
}

const WORD_Q = { word: 'Ubiquitous', q: 'Pick what it means.', options: ['Present or found everywhere', 'Extremely rare', 'Loud and noisy', 'Difficult to understand'], answer: 0, pts: 10 }
const QUIZ = [
  { q: 'Which is a monetary policy tool of RBI?', options: ['Repo Rate', 'Fiscal Deficit', 'GST Rate', 'Union Budget'], answer: 0 },
  { q: 'Capital of a business is classified as:', options: ['Liability', 'Asset', 'Revenue', 'Expense'], answer: 0 },
  { q: '"She has lived here ___ 2015."', options: ['since', 'for', 'from', 'by'], answer: 0 },
]

function sc(s) {
  if (s === 'On track') return 'var(--green-500)'
  if (s === 'Needs attention') return 'var(--warning-500)'
  return 'var(--red-500)'
}

function daysLeft(dateStr) {
  const t = new Date(dateStr + 'T00:00:00').getTime()
  const n = Date.now()
  return Math.max(0, Math.ceil((t - n) / 86400000))
}
/* live countdown: remaining days + hours, recomputed every minute */
function useLiveCountdown(examDate) {
  const calc = () => {
    const t = new Date(examDate + 'T00:00:00').getTime()
    const ms = Math.max(0, t - Date.now())
    return { days: Math.floor(ms / 86400000), hours: Math.floor((ms % 86400000) / 3600000) }
  }
  const [cd, setCd] = useState(calc)
  useEffect(() => { setCd(calc()); const iv = setInterval(() => setCd(calc()), 60000); return () => clearInterval(iv) }, [examDate])
  return cd
}

/* ── Animated avatar: neutral/female/male variants, idle blink (JS interval ~3s) ── */
function Avatar({ gender, blink }) {
  const eyeCls = 'av-eye' + (blink ? ' blink' : '')
  const eyes = (
    <>
      <g className={eyeCls}><ellipse cx="38" cy="47" rx="5" ry="5.6" fill="#fff" /><ellipse cx="38" cy="47" rx="2.4" ry="3.4" fill="#1a2436" /></g>
      <g className={eyeCls}><ellipse cx="62" cy="47" rx="5" ry="5.6" fill="#fff" /><ellipse cx="62" cy="47" rx="2.4" ry="3.4" fill="#1a2436" /></g>
    </>
  )
  return (
    <svg viewBox="0 0 100 100" className="dash-avatar-svg" aria-hidden="true">
      <circle cx="50" cy="50" r="50" fill="#2a3f63" />
      <circle cx="50" cy="58" r="34" fill="#f2c9a0" />
      {gender === 'Female' && (<>
        <path d="M50 14 Q78 10 74 30 Q78 22 68 20 Q76 34 72 44 Q60 26 40 26 Q30 30 28 40 Q24 26 30 18 Q38 12 50 14 Z" fill="#3d2b1f" />
        <path d="M28 40 Q16 34 20 52 Q24 62 32 58 Q28 46 30 42 Z" fill="#3d2b1f" />
        <path d="M72 44 Q86 42 84 56 Q80 66 72 62 Q78 52 76 48 Z" fill="#3d2b1f" />
      </>)}
      {gender === 'Male' && (<>
        <path d="M50 16 Q76 14 72 38 Q70 34 66 30 L66 44 Q50 30 30 36 Q28 20 50 16 Z" fill="#1f2937" />
        <path d="M26 32 Q16 34 18 50 Q22 42 28 42 Z" fill="#1f2937" />
      </>)}
      {/* waving arm + hand — proper adult hand beside the head, waves OUTWARD */}
      <g className="av-arm">
        <path d="M80 78 Q93 66 89 52" stroke="#eab98f" strokeWidth="6.5" strokeLinecap="round" fill="none" />
        <path d="M86.5 51 h6 a3.2 3.2 0 0 1 3.2 3.2 v4.6 a3.2 3.2 0 0 1 -3.2 3.2 h-6 a3.2 3.2 0 0 1 -3.2 -3.2 v-4.6 a3.2 3.2 0 0 1 3.2 -3.2 z" fill="#e9b98c" />
        <path d="M89 51 v-3 a1.8 1.8 0 0 1 3.6 0 v3" fill="none" stroke="#e9b98c" strokeWidth="2.4" strokeLinecap="round" />
      </g>
      {eyes}
      <path d="M42 56 Q50 62 58 56" fill="none" stroke="#c48a68" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="34" cy="40" r="1.6" fill="#dbaa7f" opacity="0.6" />
      <circle cx="66" cy="40" r="1.6" fill="#dbaa7f" opacity="0.6" />
    </svg>
  )
}

export default function Dashboard({ onNavigate }) {
  const [profile] = useProfile()
  const college = profile.dreamCollege
  const collegeShort = dreamCollegeShort(college)
  const cd = useLiveCountdown(profile.examDate)

  /* challenges: collapsed by default */
  const [wordOpen, setWordOpen] = useState(false)
  const [quizOpen, setQuizOpen] = useState(false)
  const [rcOpen, setRcOpen] = useState(false)
  const [wordPick, setWordPick] = useState(null)
  const [quizIdx, setQuizIdx] = useState(0)
  const [quizPick, setQuizPick] = useState(null)
  const [quizScore, setQuizScore] = useState(0)
  const [quizDone, setQuizDone] = useState(false)

  /* avatar idle blink — every ~3s, quick close-open */
  const [blink, setBlink] = useState(false)
  useEffect(() => {
    const iv = setInterval(() => {
      setBlink(true)
      setTimeout(() => setBlink(false), 160)
    }, 3000)
    return () => clearInterval(iv)
  }, [])

  /* manifestation modal + standing modal + standing view */
  const [showManifest, setShowManifest] = useState(false)
  const [showStanding, setShowStanding] = useState(false)
  const [stView, setStView] = useState('all')

  const pickWord = i => { if (wordPick === null) setWordPick(i) }
  const pickQuiz = i => {
    if (quizPick !== null) return
    setQuizPick(i)
    if (i === QUIZ[quizIdx].answer) setQuizScore(s => s + 1)
    setTimeout(() => {
      if (quizIdx + 1 < QUIZ.length) { setQuizIdx(quizIdx + 1); setQuizPick(null) }
      else setQuizDone(true)
    }, 750)
  }

  const lb = LB[stView]
  const top5 = lb.rows.filter(r => !r.me).slice(0, 5)

  return (
    <div className="dash">
      {/* 1. Welcome header — animated avatar + streak + top% */}
      <div className="dash-header">
        <div className="dash-user">
          <div className="dash-avatar"><Avatar gender={profile.gender} blink={blink} /></div>
          <div>
            <h1>Welcome back, Ananya</h1>
            <p>CUET 2027 · here's today's snapshot.</p>
          </div>
        </div>
        <div className="dash-chips">
          <div className="chip-streak"><Flame size={15} /><span className="chip-mono">9-day streak</span></div>
          <span className="chip-top">Top 5%</span>
        </div>
      </div>

      {/* 2. Exam countdown strip — date from Profile → same value Smart Revision uses */}
      <div className="count-strip">
        <div className="count-l">
          <span className="count-ico"><CalendarDays size={16} /></span>
          <div><b>CUET 2027</b><span className="count-sub">Common University Entrance Test</span></div>
        </div>
        <div className="count-r">
          <b className="count-days">{cd.days}</b>
          <span className="count-days-lbl">{cd.days === 1 ? 'day' : 'days'} left{cd.hours > 0 ? ` · ${cd.hours}h` : ''}</span>
        </div>
      </div>

      {/* 3. Manifestation Board — compact strip */}
      <div className="manifest-compact">
        <img className="mc-thumb" src="/images/target-college.jpg" alt={collegeShort} />
        <div className="mc-info">
          <span className="mc-lbl">MANIFESTATION · DREAM COLLEGE</span>
          <b>{college}</b>
        </div>
        <button className="btn btn-outline-sm" onClick={() => setShowManifest(true)}>View <Eye size={14} /></button>
      </div>

      {/* 4. Today's Plan — existing, linked to Boost */}
      <div className="plan-card">
        <div className="plan-ico"><Sparkles size={20} /></div>
        <div className="plan-body">
          <h3>Today's Plan</h3>
          <p><b>Economics (58%)</b> is your weakest — revise Money & Banking, then attempt the Subject Quiz. This can add an estimated <b>+18 marks</b> to your next mock.</p>
        </div>
        <div className="plan-actions">
          <button className="btn btn-ghost-sm" onClick={() => onNavigate('studykit')}>Revise Topic</button>
          <button className="btn btn-primary-sm" onClick={() => { setQuizOpen(true); document.getElementById('challenges')?.scrollIntoView({ behavior: 'smooth' }) }}>Practice Now <ArrowRight size={14} /></button>
        </div>
      </div>

      {/* 5. Daily Challenges — moved up, expandable */}
      <div className="dash-section" id="challenges">
        <h2 className="dash-section-title">Daily Challenges</h2>
        <div className="chal-grid">
          {/* Word of the Day */}
          <div className={'cuet-card chal-card' + (wordOpen ? ' open' : '')}>
            <button className="ch-head" onClick={() => setWordOpen(!wordOpen)} aria-expanded={wordOpen}>
              <span className="ch-top">
                <span className="ch-tag">Word of the Day</span>
                <span className="ch-pts-badge">+{WORD_Q.pts} pts</span>
                <ChevronDown size={16} className="ch-chev" />
              </span>
              <span className="ch-q">What does "<b>{WORD_Q.word}</b>" mean?</span>
            </button>
            {wordOpen && (
              <div className="ch-body">
                <div className="ch-opts">
                  {WORD_Q.options.map((o, i) => {
                    let cls = 'ch-opt'
                    if (wordPick !== null) { if (i === WORD_Q.answer) cls += ' c'; else if (i === wordPick) cls += ' w' }
                    return <button key={i} className={cls} onClick={() => pickWord(i)} disabled={wordPick !== null}>{o}</button>
                  })}
                </div>
                <div className="ch-pts">
                  {wordPick === null ? 'Tap an option to answer.' : wordPick === WORD_Q.answer ? <span className="ok">+10 pts ✓ Correct!</span> : <span className="no">Correct answer: "{WORD_Q.options[WORD_Q.answer]}"</span>}
                </div>
              </div>
            )}
          </div>

          {/* Subject Quiz of the Day */}
          <div className={'cuet-card chal-card' + (quizOpen ? ' open' : '')}>
            <button className="ch-head" onClick={() => setQuizOpen(!quizOpen)} aria-expanded={quizOpen}>
              <span className="ch-top">
                <span className="ch-tag">Subject Quiz of the Day</span>
                <span className="ch-pts-badge">+20 pts</span>
                <ChevronDown size={16} className="ch-chev" />
              </span>
              <span className="ch-q">{quizDone ? 'Quiz complete — you scored ' + quizScore + '/3' : QUIZ[quizIdx].q}</span>
            </button>
            {quizOpen && (
              <div className="ch-body">
                {!quizDone ? (
                  <>
                    <div className="ch-opts">
                      {QUIZ[quizIdx].options.map((o, i) => {
                        let cls = 'ch-opt'
                        if (quizPick !== null) { if (i === QUIZ[quizIdx].answer) cls += ' c'; else if (i === quizPick) cls += ' w' }
                        return <button key={i} className={cls} onClick={() => pickQuiz(i)} disabled={quizPick !== null}>{o}</button>
                      })}
                    </div>
                    <div className="ch-pts">{quizPick !== null ? (quizPick === QUIZ[quizIdx].answer ? <span className="ok">✓ Correct!</span> : <span className="no">Wrong — correct answer is highlighted green</span>) : `Question ${quizIdx + 1}/3`}</div>
                  </>
                ) : (
                  <div className="quiz-done"><b>{quizScore}/3 correct!</b><p>Economics · Money & Banking — next quiz tomorrow.</p><span className="ok">+{quizScore * 5} pts added</span></div>
                )}
              </div>
            )}
          </div>

          {/* RC of the Day */}
          <div className={'cuet-card chal-card' + (rcOpen ? ' open' : '')}>
            <button className="ch-head" onClick={() => setRcOpen(!rcOpen)} aria-expanded={rcOpen}>
              <span className="ch-top">
                <span className="ch-tag">RC of the Day</span>
                <span className="ch-pts-badge">+15 pts</span>
                <ChevronDown size={16} className="ch-chev" />
              </span>
              <span className="ch-q">Urban water scarcity — 3 quick questions on a short passage.</span>
            </button>
            {rcOpen && (
              <div className="ch-body">
                <p className="ch-desc">A short passage on how cities lose 30% of treated water to leaks, and what Delhi's revival plans mean for residents.</p>
                <button className="btn btn-blue-sm" onClick={() => onNavigate('studykit')}>Start Reading · +15 pts</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 6. My Progress + My Standing */}
      <div className="dash-cols">
        <div className="cuet-card">
          <div className="card-title-row">
            <div><h2>My Progress</h2><p>CUET Commerce Batch 2027</p></div>
            <span className="pill-green">On track</span>
          </div>
          <div className="progress-wrap">
            <div className="ring" style={{ '--p': '64%' }}>
              <div className="ring-in"><b>64%</b><span>Overall syllabus</span></div>
            </div>
            <p className="exp">Expected by now: 62%</p>
          </div>
          <div className="subjects">
            {SUBJECTS.map((s, i) => (
              <div className="subject-row" key={s.n}>
                <span className="sn">{i + 1}</span>
                <span className="sname">{s.n}</span>
                <div className="sbar"><i style={{ width: s.pct + '%', background: sc(s.status) }} /></div>
                <b className="spct">{s.pct}%</b>
                <span className="sstatus" style={{ color: sc(s.status) }}>{s.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* My Standing — tappable card + working toggle */}
        <div className="cuet-card standing-card" role="button" tabIndex={0} onClick={() => setShowStanding(true)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setShowStanding(true) }}>
          <div className="card-title-row">
            <div><h2>My Standing</h2><p>Ranked by contest & daily-challenge points</p></div>
            <ChevronRight size={18} className="st-chev" />
          </div>
          <div className="st-tabs" onClick={e => e.stopPropagation()}>
            <button className={'st-tab' + (stView === 'all' ? ' on' : '')} onClick={() => setStView('all')}>All CUET Pro</button>
            <button className={'st-tab' + (stView === 'subj' ? ' on' : '')} onClick={() => setStView('subj')}>My Subject</button>
          </div>
          <div className="st-num"><b>#{lb.rank}</b><span>of {lb.of.toLocaleString('en-IN')} students</span></div>
          <div className="st-pct"><Trophy size={14} /> <b>{lb.pctile}%ile</b> current standing</div>
          <div className="board">
            <div className="board-title">TOP 5 THIS WEEK · {lb.cohort.toUpperCase()}</div>
            {top5.map((p, i) => (
              <div className="board-row" key={p.name}><span className="br">{i + 1}</span><span className="bname">{p.name}</span><b className="bpts">{p.pts} pts</b></div>
            ))}
            <div className="board-row me"><span className="br">#{lb.rank}</span><span className="bname">Ananya Verma (you)</span><b className="bpts">{lb.pts} pts</b></div>
          </div>
          <span className="st-full-hint">Tap to view full leaderboard <ArrowRight size={12} /></span>
        </div>
      </div>

      {/* Dashboard widgets — vocab, SWOT snapshot, resources, activity, week, shortcuts, badges */}
      <div className="dash-section">
        <h2 className="dash-section-title">More tools & updates</h2>
        <DashboardWidgets />
      </div>

      {/* Manifestation full view modal */}
      {showManifest && (
        <div className="overlay" onClick={() => setShowManifest(false)}>
          <div className="overlay-card" onClick={e => e.stopPropagation()}>
            <button className="ov-close" onClick={() => setShowManifest(false)} aria-label="Close"><X size={16} /></button>
            <div className="m-head">
              <h3>Manifestation Board</h3>
              <span className="m-seat">SEAT CUET 2027-A</span>
            </div>
            <div className="m-flow">
              <div className="m-side"><span className="m-lbl">FROM</span><b>You</b></div>
              <ArrowRight size={18} />
              <div className="m-side right"><span className="m-lbl to">TO</span><b>{collegeShort}</b></div>
            </div>
            <div className="m-photo"><img src="/images/target-college.jpg" alt={'Target college — ' + collegeShort} /></div>
            <div className="m-src"><b>{college}</b><span>Dream college · set in Profile</span></div>
            <div className="m-cols">
              <div><span className="m-label">DID YOU KNOW</span><p>One of DU's oldest commerce colleges — routinely posts the highest CUET cutoffs for B.Com (Hons) in the country.</p></div>
              <div><span className="m-label">IN-FLIGHT QUOTE</span><p>"Your Class 12 board score is one input. Your consistency is the bigger one."</p></div>
              <div><span className="m-label">TARGET SCORE</span><p className="m-score">B.Com (Hons) · last year, Round 1<br /><b>{profile.targetPercentile}%ile</b></p>
                <button className="btn btn-outline-sm" onClick={() => { setShowManifest(false); onNavigate('explorer') }}>Explore colleges →</button></div>
            </div>
          </div>
        </div>
      )}

      {/* Full leaderboard modal */}
      {showStanding && (
        <div className="overlay" onClick={() => setShowStanding(false)}>
          <div className="overlay-card" onClick={e => e.stopPropagation()}>
            <button className="ov-close" onClick={() => setShowStanding(false)} aria-label="Close"><X size={16} /></button>
            <h3 className="ov-title">Leaderboard</h3>
            <div className="st-tabs wide">
              <button className={'st-tab' + (stView === 'all' ? ' on' : '')} onClick={() => setStView('all')}><Users size={13} /> All CUET Pro</button>
              <button className={'st-tab' + (stView === 'subj' ? ' on' : '')} onClick={() => setStView('subj')}><BookOpen size={13} /> My Subject</button>
            </div>
            <p className="ov-sub">{lb.cohort} · {lb.of.toLocaleString('en-IN')} students · rank #{lb.rank}</p>
            <div className="lb-list">
              {lb.rows.map((r, i) => (
                <div className={'lb-row' + (r.me ? ' me' : '')} key={r.name}>
                  <span className="lb-rank">{r.me ? '#' + lb.rank : i + 1}</span>
                  <span className="lb-name">{r.name}{r.me ? ' (you)' : ''}</span>
                  <b className="lb-pts">{r.pts} pts</b>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

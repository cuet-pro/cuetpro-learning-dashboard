import { useEffect, useState } from 'react'
import {
  Flame, ArrowRight, BookOpen, CheckCircle2, ChevronDown, CalendarDays, Eye,
  Trophy, Users, PieChart, ArrowUpRight, RefreshCw, TrendingUp, Target, Quote, Sparkles, Medal,
} from 'lucide-react'
import { useProfile, dreamCollegeShort } from '../lib/profile'
import { Modal } from '../components/shell/Shell.jsx'
import DashboardTiles from './Widgets.jsx'
import './dashboard.css'

/* same real data as before the redesign (unchanged) */
const SUBJECTS = [
  { n: 'English', pct: 74, status: 'On track', d: 2.1 },
  { n: 'Economics', pct: 58, status: 'Needs attention', d: -1.4 },
  { n: 'Accountancy', pct: 81, status: 'On track', d: 3.2 },
  { n: 'Business Studies', pct: 64, status: 'On track', d: 0.8 },
  { n: 'General Test', pct: 45, status: 'Behind', d: -3.6 },
]
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
const WORD_Q = { word: 'Ubiquitous', q: 'What does it mean?', options: ['Present or found everywhere', 'Extremely rare', 'Loud and noisy', 'Difficult to understand'], answer: 0, pts: 10 }
const QUIZ = [
  { q: 'Which is a monetary policy tool of RBI?', options: ['Repo Rate', 'Fiscal Deficit', 'GST Rate', 'Union Budget'], answer: 0 },
  { q: 'Capital of a business is classified as:', options: ['Liability', 'Asset', 'Revenue', 'Expense'], answer: 0 },
  { q: '"She has lived here ___ 2015."', options: ['since', 'for', 'from', 'by'], answer: 0 },
]
const RC = { title: 'Urban water scarcity', q: '3 quick questions on a short passage', pts: 15 }

const sc = st => (st === 'On track' ? 'var(--success)' : st === 'Needs attention' ? 'var(--warning)' : 'var(--error)')

function daysLeft(dateStr) {
  const t = new Date(dateStr + 'T00:00:00').getTime()
  const ms = Math.max(0, t - Date.now())
  return { days: Math.floor(ms / 86400000), hours: Math.floor((ms % 86400000) / 3600000) }
}

/* ── Avatar (blink + wave, gender variants) ── */
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
      <defs>
        <linearGradient id="avDisc" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--primary)" />
          <stop offset="100%" stopColor="var(--secondary)" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="52" r="47" fill="url(#avDisc)" />
      <circle cx="50" cy="58" r="36" fill="#f2c9a0" />
      {gender === 'Female' && (<>
        <path d="M50 14 Q78 10 74 30 Q78 22 68 20 Q76 34 72 44 Q60 26 40 26 Q30 30 28 40 Q24 26 30 18 Q38 12 50 14 Z" fill="#3d2b1f" />
        <path d="M28 40 Q16 34 20 52 Q24 62 32 58 Q28 46 30 42 Z" fill="#3d2b1f" />
        <path d="M72 44 Q86 42 84 56 Q80 66 72 62 Q78 52 76 48 Z" fill="#3d2b1f" />
      </>)}
      {gender === 'Male' && (<>
        <path d="M50 16 Q76 14 72 38 Q70 34 66 30 L66 44 Q50 30 30 36 Q28 20 50 16 Z" fill="#1f2937" />
        <path d="M26 32 Q16 34 18 50 Q22 42 28 42 Z" fill="#1f2937" />
      </>)}
      <g className="av-arm">
        <path d="M84 82 Q104 68 98 42" stroke="#eab98f" strokeWidth="7" strokeLinecap="round" fill="none" />
        <path d="M95.5 41 h6.5 a3.4 3.4 0 0 1 3.4 3.4 v5 a3.4 3.4 0 0 1 -3.4 3.4 h-6.5 a3.4 3.4 0 0 1 -3.4 -3.4 v-5 a3.4 3.4 0 0 1 3.4 -3.4 z" fill="#e9b98c" />
        <path d="M98.5 41 v-3.4 a2 2 0 0 1 4 0 v3.4" fill="none" stroke="#e9b98c" strokeWidth="2.6" strokeLinecap="round" />
      </g>
      {eyes}
      <path d="M42 56 Q50 62 58 56" fill="none" stroke="#c48a68" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}

function useLiveCountdown(examDate) {
  const calc = () => daysLeft(examDate)
  const [cd, setCd] = useState(calc)
  useEffect(() => { setCd(calc()); const iv = setInterval(() => setCd(calc()), 60000); return () => clearInterval(iv) }, [examDate])
  return cd
}

export default function Dashboard({ onNavigate }) {
  const [profile] = useProfile()
  const college = profile.dreamCollege
  const collegeShort = dreamCollegeShort(college)
  const cd = useLiveCountdown(profile.examDate)
  const [blink, setBlink] = useState(false)
  useEffect(() => {
    const iv = setInterval(() => { setBlink(true); setTimeout(() => setBlink(false), 160) }, 3000)
    return () => clearInterval(iv)
  }, [])

  const [chTab, setChTab] = useState('word')
  const [wordPick, setWordPick] = useState(null)
  const [quizIdx, setQuizIdx] = useState(0)
  const [quizPick, setQuizPick] = useState(null)
  const [quizScore, setQuizScore] = useState(0)
  const [quizDone, setQuizDone] = useState(false)
  const [showManifest, setShowManifest] = useState(false)
  const [showStanding, setShowStanding] = useState(false)
  const [stView, setStView] = useState('all')
  const [openRow, setOpenRow] = useState(null)
  const [flipped, setFlipped] = useState(false)

  const weakest = [...SUBJECTS].sort((a, b) => a.pct - b.pct)[0]
  const lb = LB[stView]
  const top5 = lb.rows.filter(r => !r.me).slice(0, 5)

  const pickWord = i => { if (wordPick === null) setWordPick(i) }
  const pickQuiz = i => {
    if (quizPick !== null) return
    setQuizPick(i)
    if (i === QUIZ[quizIdx].answer) setQuizScore(s => s + 1)
    setTimeout(() => {
      if (quizIdx + 1 < QUIZ.length) { setQuizIdx(quizIdx + 1); setQuizPick(null) } else setQuizDone(true)
    }, 750)
  }

  return (
    <div className="page dash">
      {/* 1. Hero identity strip */}
      <section className="hero">
        <div className="hero-id">
          <div className="av-float"><div className="dash-avatar"><Avatar gender={profile.gender} blink={blink} /></div></div>
          <div className="hero-id-t">
            <h1>Welcome back, Ananya</h1>
            <p>CUET 2027 · {profile.stream} · keep the streak alive</p>
          </div>
        </div>
        <div className="hero-meta">
          <div className="hero-chip streak"><Flame size={15} /><b>9-day streak</b></div>
          <button className="hero-chip manifest" onClick={() => setShowManifest(true)} title="View manifestation board">
            <Medal size={15} /><span><em>Manifesting</em><b>{collegeShort}</b></span><Eye size={14} />
          </button>
          <div className="hero-chip count" title="Live countdown to CUET 2027">
            <CalendarDays size={15} /><span><em>CUET 2027 in</em><b>{cd.days}d {cd.hours}h</b></span>
          </div>
        </div>
      </section>

      {/* 2. Focus card (primary) */}
      <section className="focus">
        <div className="focus-body">
          <span className="focus-kicker"><Target size={13} /> TODAY'S FOCUS</span>
          <h2>Get <b>{weakest.n}</b> from {weakest.pct}% to 75%</h2>
          <p>Weakest subject · revise the flagged topic, then take the subject quiz. Estimated <b>+18 marks</b> on your next mock.</p>
          <div className="focus-bar"><i style={{ width: weakest.pct + '%' }} /></div>
        </div>
        <div className="focus-actions">
          <button className="btn btn-outline" onClick={() => onNavigate('studykit')}>Revise topic <BookOpen size={14} /></button>
          <button className="btn btn-primary" onClick={() => { setChTab('quiz'); document.getElementById('challenges')?.scrollIntoView({ behavior: 'smooth' }) }}>Take subject quiz <ArrowRight size={14} /></button>
        </div>
      </section>

      {/* 3. Daily challenges — tabbed */}
      <section className="cuet-card" id="challenges">
        <div className="ch-tabs">
          {[['word', 'Word of the Day'], ['quiz', 'Subject Quiz'], ['rc', 'RC of the Day']].map(([id, label]) => (
            <button key={id} className={'ch-tab' + (chTab === id ? ' on' : '')} onClick={() => setChTab(id)}>{label}</button>
          ))}
          <span className="ch-pts-total">+{chTab === 'word' ? WORD_Q.pts : chTab === 'quiz' ? 20 : RC.pts} pts</span>
        </div>
        {chTab === 'word' && (
          <div className="ch-panel">
            <div className="ch-q">What does "<b>{WORD_Q.word}</b>" mean?</div>
            <div className="ch-opts">
              {WORD_Q.options.map((o, i) => {
                let cls = 'ch-opt'
                if (wordPick !== null) { if (i === WORD_Q.answer) cls += ' c'; else if (i === wordPick) cls += ' w' }
                return <button key={i} className={cls} onClick={() => pickWord(i)} disabled={wordPick !== null}>{o}</button>
              })}
            </div>
            <div className="ch-pts">{wordPick === null ? 'Pick an answer.' : wordPick === WORD_Q.answer ? <span className="ok">+10 pts ✓ Correct!</span> : <span className="no">Correct answer: "{WORD_Q.options[WORD_Q.answer]}"</span>}</div>
          </div>
        )}
        {chTab === 'quiz' && (
          <div className="ch-panel">
            {!quizDone ? (<>
              <div className="ch-q">{QUIZ[quizIdx].q}</div>
              <div className="ch-opts">
                {QUIZ[quizIdx].options.map((o, i) => {
                  let cls = 'ch-opt'
                  if (quizPick !== null) { if (i === QUIZ[quizIdx].answer) cls += ' c'; else if (i === quizPick) cls += ' w' }
                  return <button key={i} className={cls} onClick={() => pickQuiz(i)} disabled={quizPick !== null}>{o}</button>
                })}
              </div>
              <div className="ch-pts">{quizPick !== null ? (quizPick === QUIZ[quizIdx].answer ? <span className="ok">✓ Correct!</span> : <span className="no">Wrong — correct answer is highlighted green</span>) : `Question ${quizIdx + 1}/3`}</div>
            </>) : (
              <div className="quiz-done"><b>{quizScore}/3 correct!</b><p>Economics · Money & Banking — next quiz tomorrow.</p><span className="ok">+{quizScore * 5} pts added</span></div>
            )}
          </div>
        )}
        {chTab === 'rc' && (
          <div className="ch-panel">
            <div className="ch-q">{RC.title}</div>
            <p className="ch-desc">A short passage on how cities lose 30% of treated water to leaks, and what Delhi's revival plans mean for residents.</p>
            <button className="btn btn-blue" onClick={() => onNavigate('studykit')}>Start Reading · +{RC.pts} pts</button>
          </div>
        )}
      </section>

      {/* 4. Progress ⇄ Standing — combined flip card */}
      <div className="flip-wrap">
        <button className="flip-cue" onClick={() => setFlipped(f => !f)} title="Flip card" aria-label="Flip card">
          <RefreshCw size={13} />
        </button>
        <div className={'flip-inner' + (flipped ? ' flipped' : '')}>
          {/* FRONT — My Progress */}
          <section className="cuet-card flip-face flip-front">
            <div className="flip-bar">
              <button className="flip-seg on" onClick={() => setFlipped(false)}><PieChart size={13} /> My Progress</button>
              <button className="flip-seg" onClick={() => setFlipped(true)}><Trophy size={13} /> My Standing <RefreshCw size={12} /></button>
            </div>
            <button className="prog-head" onClick={() => onNavigate('analysis')}>
              <span className="prog-head-ico"><PieChart size={17} /></span>
              <span className="prog-head-t"><b>My Progress</b><em>CUET Commerce Batch 2027</em></span>
              <span className="pill-green">On track</span>
              <ArrowUpRight size={15} className="prog-head-arr" />
            </button>
            <button className="prog-ring-wrap" onClick={() => onNavigate('analysis')}>
              <div className="ring" style={{ '--p': '64%' }}><div className="ring-in"><b>64%</b><span>Overall syllabus</span></div></div>
            </button>
            <p className="prog-exp">Expected by now: 62% · <b className="ok">ahead +2%</b></p>
            <div className="prog-subjects">
              {SUBJECTS.map(s => (
                <div key={s.n} className={'prow' + (openRow === s.n ? ' open' : '')}>
                  <button className="prow-main" onClick={() => setOpenRow(openRow === s.n ? null : s.n)} aria-expanded={openRow === s.n}>
                    <span className="pname">{s.n}</span>
                    <div className="pbar"><i style={{ width: s.pct + '%', background: sc(s.status) }} /></div>
                    <b className="ppct">{s.pct}%</b>
                    <span className={'pstat ' + s.status.toLowerCase().replace(/ /g, '-')}>{s.status}</span>
                    <ChevronDown size={14} className="prow-chev" />
                  </button>
                  {openRow === s.n && (
                    <div className="prow-more">
                      <span className={'prow-note' + (s.d >= 0 ? ' up' : ' down')}>
                        {s.d >= 0 ? '▲ +' + s.d.toFixed(1) + '% vs last mock' : '▼ ' + s.d.toFixed(1) + '% vs last mock'} · {s.pct >= 75 ? 'keep the momentum' : (() => { const n = Math.ceil((75 - s.pct) / 3); return n + ' quick fix' + (n > 1 ? 'es' : '') + ' to reach 75%' })()}
                      </span>
                      <div className="prow-actions">
                        <button className="btn btn-primary-sm" onClick={() => onNavigate('studykit')}>Practice <BookOpen size={13} /></button>
                        <button className="btn btn-outline-sm" onClick={() => onNavigate('analysis')}>Open Analysis</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* BACK — My Standing */}
          <section className="cuet-card flip-face flip-back" onClick={() => setShowStanding(true)}>
            <div className="flip-bar" onClick={e => e.stopPropagation()}>
              <button className="flip-seg" onClick={() => setFlipped(false)}><PieChart size={13} /> My Progress <RefreshCw size={12} /></button>
              <button className="flip-seg on" onClick={() => setFlipped(true)}><Trophy size={13} /> My Standing</button>
            </div>
            <div className="card-title-row">
              <div><h2>My Standing</h2><p>Ranked by contest & daily-challenge points</p></div>
              <ChevronDown size={16} className="st-chev-up" />
            </div>
            <div className="st-tabs" onClick={e => e.stopPropagation()}>
              <button className={'st-tab' + (stView === 'all' ? ' on' : '')} onClick={() => setStView('all')}>All CUET Pro</button>
              <button className={'st-tab' + (stView === 'subj' ? ' on' : '')} onClick={() => setStView('subj')}>My Subject</button>
            </div>
            <div className="st-num"><b>#{lb.rank}</b><span>of {lb.of.toLocaleString('en-IN')} students</span></div>
            <div className="st-pct"><Trophy size={14} /> <b>{lb.pctile}%ile</b> current standing</div>
            <div className="board">
              <div className="board-title">TOP 5 · {lb.cohort.toUpperCase()}</div>
              {top5.map((p, i) => <div className="board-row" key={p.name}><span className="br">{i + 1}</span><span className="bname">{p.name}</span><b className="bpts">{p.pts} pts</b></div>)}
              <div className="board-row me"><span className="br">#{lb.rank}</span><span className="bname">Ananya Verma (you)</span><b className="bpts">{lb.pts} pts</b></div>
            </div>
            <span className="st-full-hint">Tap to view full leaderboard <ArrowRight size={12} /></span>
          </section>
        </div>
      </div>

      {/* 5. Tool tiles (4 grouped) */}
      <DashboardTiles onNavigate={onNavigate} />

      {/* Manifestation modal */}
      <Modal open={showManifest} onClose={() => setShowManifest(false)}>
        <div className="m-flow"><div className="m-side"><span className="m-lbl">FROM</span><b>You</b></div><ArrowRight size={18} /><div className="m-side right"><span className="m-lbl to">TO</span><b>{collegeShort}</b></div></div>
        <div className="m-photo"><img src="/images/target-college.jpg" alt={'Target college — ' + collegeShort} /></div>
        <div className="m-src"><b>{college}</b><span>Dream college · set in Profile</span></div>
        <div className="m-cols">
          <div><span className="m-label">DID YOU KNOW</span><p>One of DU's oldest commerce colleges — routinely posts the highest CUET cutoffs for B.Com (Hons) in the country.</p></div>
          <div><span className="m-label">IN-FLIGHT QUOTE</span><p><Quote size={12} /> "Your Class 12 board score is one input. Your consistency is the bigger one."</p></div>
          <div><span className="m-label">TARGET SCORE</span><p>B.Com (Hons) · last year, Round 1<br /><b className="m-score">{profile.targetPercentile}%ile</b></p>
            <button className="btn btn-outline-sm" onClick={() => { setShowManifest(false); onNavigate('explorer') }}>Explore colleges <ArrowRight size={13} /></button></div>
        </div>
      </Modal>

      {/* Leaderboard modal */}
      <Modal open={showStanding} onClose={() => setShowStanding(false)} title="Leaderboard">
        <div className="st-tabs wide" onClick={e => e.stopPropagation()}>
          <button className={'st-tab' + (stView === 'all' ? ' on' : '')} onClick={() => setStView('all')}><Users size={13} /> All CUET Pro</button>
          <button className={'st-tab' + (stView === 'subj' ? ' on' : '')} onClick={() => setStView('subj')}><BookOpen size={13} /> My Subject</button>
        </div>
        <p className="ov-sub">{lb.cohort} · {lb.of.toLocaleString('en-IN')} students · your rank #{lb.rank}</p>
        <div className="lb-list">
          {lb.rows.map((r, i) => (
            <div className={'lb-row' + (r.me ? ' me' : '')} key={r.name}>
              <span className="lb-rank">{r.me ? '#' + lb.rank : i + 1}</span>
              <span className="lb-name">{r.name}{r.me ? ' (you)' : ''}</span>
              <b className="lb-pts">{r.pts} pts</b>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  )
}

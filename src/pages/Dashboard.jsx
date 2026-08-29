import { useState } from 'react'
import { Flame, Archive, TrendingUp, Trophy, ArrowRight, BookOpen, Zap, CheckCircle2, XCircle, Sparkles } from 'lucide-react'
import './dashboard.css'

const SUBJECTS = [
  { n: 'English', pct: 74, status: 'On track' },
  { n: 'Economics', pct: 58, status: 'Needs attention' },
  { n: 'Accountancy', pct: 81, status: 'On track' },
  { n: 'Business Studies', pct: 64, status: 'On track' },
  { n: 'General Test', pct: 45, status: 'Behind' },
]
const BOARD = [
  { name: 'Ishaan M.', pts: '2,840', rank: 1 },
  { name: 'Ridhima K.', pts: '2,790', rank: 2 },
  { name: 'Aryan B.', pts: '2,705', rank: 3 },
  { name: 'Simran K.', pts: '2,650', rank: 4 },
  { name: 'Devansh R.', pts: '2,600', rank: 5 },
]
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

export default function Dashboard({ onNavigate }) {
  const [wordPick, setWordPick] = useState(null)
  const [quizIdx, setQuizIdx] = useState(0)
  const [quizPick, setQuizPick] = useState(null)
  const [quizScore, setQuizScore] = useState(0)
  const [quizDone, setQuizDone] = useState(false)

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

  return (
    <div className="dash">
      {/* Header */}
      <div className="dash-header">
        <div className="dash-user">
          <div className="dash-avatar"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg></div>
          <div>
            <h1>Welcome back, Ananya</h1>
            <p>CUET 2027 · here's today's snapshot.</p>
          </div>
        </div>
        <div className="dash-chips">
          <div className="chip-streak"><Flame size={15} /><span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>9-day streak</span></div>
          <span className="chip-top">Top 5%</span>
        </div>
      </div>

      {/* Today's Plan — actionable recommendation */}
      <div className="plan-card">
        <div className="plan-ico"><Sparkles size={20} /></div>
        <div className="plan-body">
          <h3>Today's Plan</h3>
          <p><b>Economics (58%)</b> is your weakest — revise Money & Banking, then attempt the Subject Quiz. This can add an estimated <b>+18 marks</b> to your next mock.</p>
        </div>
        <div className="plan-actions">
          <button className="btn btn-ghost-sm" onClick={() => onNavigate('studykit')}>Revise Topic</button>
          <button className="btn btn-primary-sm" onClick={() => document.getElementById('challenges')?.scrollIntoView({ behavior: 'smooth' })}>Practice Now <ArrowRight size={14} /></button>
        </div>
      </div>

      {/* My Progress + My Standing */}
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

        <div className="cuet-card">
          <div className="card-title-row">
            <div><h2>My Standing</h2><p>Ranked by contest & daily-challenge points</p></div>
          </div>
          <div className="st-tabs"><span className="on">All CUET Pro</span><span>My Subject</span></div>
          <div className="st-num"><b>#142</b><span>of 3,480 students</span></div>
          <div className="st-pct"><Trophy size={14} /> <b>95.9%ile</b> current standing</div>
          <div className="board">
            <div className="board-title">TOP 5 THIS WEEK</div>
            {BOARD.map(p => (
              <div className="board-row" key={p.rank}><span className="br">{p.rank}</span><span className="bname">{p.name}</span><b className="bpts">{p.pts} pts</b></div>
            ))}
            <div className="board-row me"><span className="br">#142</span><span className="bname">Ananya Verma (you)</span><b className="bpts">1,120 pts</b></div>
          </div>
        </div>
      </div>

      {/* Daily Challenges */}
      <div className="dash-section" id="challenges">
        <h2 className="dash-section-title">Daily Challenges</h2>
        <div className="chal-grid">
          <div className="cuet-card chal-card">
            <div className="ch-tag">Word of the Day</div>
            <p className="ch-word">"{WORD_Q.word}" — {WORD_Q.q}</p>
            <div className="ch-opts">
              {WORD_Q.options.map((o, i) => {
                let cls = 'ch-opt'
                if (wordPick !== null) { if (i === WORD_Q.answer) cls += ' c'; else if (i === wordPick) cls += ' w' }
                return <button key={i} className={cls} onClick={() => pickWord(i)} disabled={wordPick !== null}>{o}</button>
              })}
            </div>
            <div className="ch-pts">
              {wordPick === null ? '+10 pts' : wordPick === WORD_Q.answer ? <span className="ok">+10 pts ✓ Correct!</span> : <span className="no">Correct answer: "{WORD_Q.options[WORD_Q.answer]}"</span>}
            </div>
          </div>

          <div className="cuet-card chal-card">
            <div className="ch-tag">Subject Quiz of the Day</div>
            {!quizDone ? (
              <>
                <p className="ch-word">{QUIZ[quizIdx].q}</p>
                <div className="ch-opts">
                  {QUIZ[quizIdx].options.map((o, i) => {
                    let cls = 'ch-opt'
                    if (quizPick !== null) { if (i === QUIZ[quizIdx].answer) cls += ' c'; else if (i === quizPick) cls += ' w' }
                    return <button key={i} className={cls} onClick={() => pickQuiz(i)} disabled={quizPick !== null}>{o}</button>
                  })}
                </div>
                <div className="ch-pts">{quizPick !== null ? (quizPick === QUIZ[quizIdx].answer ? <span className="ok">✓ Correct!</span> : <span className="no">Wrong — correct answer is highlighted green</span>) : `Question ${quizIdx + 1}/3 · +20 pts`}</div>
              </>
            ) : (
              <div className="quiz-done"><b>{quizScore}/3 correct!</b><p>Economics · Money & Banking — next quiz tomorrow.</p><span className="ok">+{quizScore * 5} pts added</span></div>
            )}
          </div>

          <div className="cuet-card chal-card">
            <div className="ch-tag">RC of the Day</div>
            <p className="ch-word">Urban water scarcity — 3 quick questions.</p>
            <p className="ch-desc">A short passage on how cities lose 30% of treated water to leaks, and what Delhi's revival plans mean for residents.</p>
            <button className="btn btn-blue-sm" onClick={() => onNavigate('studykit')}>Start · +15 pts</button>
          </div>
        </div>
      </div>

      {/* Manifestation Board */}
      <div className="dash-section">
        <h2 className="dash-section-title">Manifestation Board</h2>
        <div className="cuet-card manifest">
          <div className="m-head">
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-heading-sm)', color: 'var(--text-primary)' }}>Manifestation Board</h3>
            <span className="m-seat">SEAT CUET 2027-A</span>
          </div>
          <div className="m-body">
            <div className="m-flow">
              <div className="m-side"><span className="m-lbl">FROM</span><b>You</b></div>
              <ArrowRight size={18} />
              <div className="m-side right"><span className="m-lbl to">TO</span><b>SRCC</b></div>
            </div>
            <div className="m-photo">
              <img src="/images/target-college.jpg" alt="Target college — SRCC" />
            </div>
            <div className="m-src"><b>Shri Ram College of Commerce (SRCC)</b><span>North Campus · Est. 1926 · sample data</span></div>
            <div className="m-cols">
              <div><span className="m-label">DID YOU KNOW</span><p>One of DU's oldest commerce colleges — routinely posts the highest CUET cutoffs for B.Com (Hons) in the country.</p></div>
              <div><span className="m-label">IN-FLIGHT QUOTE</span><p>"Your Class 12 board score is one input. Your consistency is the bigger one."</p></div>
              <div><span className="m-label">TARGET SCORE</span><p className="m-score">B.Com (Hons) · last year, Round 1<br /><b>95.1%ile</b></p><button className="btn btn-outline-sm" onClick={() => onNavigate('explorer')}>Explore colleges →</button></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

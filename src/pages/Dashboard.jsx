import { useState } from 'react'
import { Flame, Trophy, Target, ArrowRight, CheckCircle2, XCircle, Sparkles } from 'lucide-react'
import './dashboard.css'

const SUBJECTS = [
  { n: 'English', pct: 74, status: 'On track' },
  { n: 'Economics', pct: 58, status: 'Needs attention' },
  { n: 'Accountancy', pct: 81, status: 'On track' },
  { n: 'Business Studies', pct: 64, status: 'On track' },
  { n: 'General Test', pct: 45, status: 'Behind' },
]

const LEADERBOARD = [
  { name: 'Ishaan M.', pts: 2840, rank: 1 },
  { name: 'Ridhima K.', pts: 2790, rank: 2 },
  { name: 'Aryan B.', pts: 2705, rank: 3 },
  { name: 'Simran K.', pts: 2650, rank: 4 },
  { name: 'Devansh R.', pts: 2600, rank: 5 },
]

const WORD_Q = {
  word: 'Ubiquitous',
  q: 'Pick what it means.',
  options: ['Present or found everywhere', 'Extremely rare', 'Loud and noisy', 'Difficult to understand'],
  answer: 0,
  pts: 10,
}

const QUIZ = [
  { q: 'Money & Banking — Which is a monetary policy tool of RBI?', options: ['Repo Rate', 'Fiscal Deficit', 'GST Rate', 'Union Budget'], answer: 0 },
  { q: 'Accountancy — Capital of a business is classified as:', options: ['Liability', 'Asset', 'Revenue', 'Expense'], answer: 0 },
  { q: 'English — "She has lived here ___ 2015."', options: ['since', 'for', 'from', 'by'], answer: 0 },
]

function statusColor(s) {
  if (s === 'On track') return 'var(--green-500)'
  if (s === 'Needs attention') return 'var(--amber-500)'
  return 'var(--red-500)'
}

export default function Dashboard({ onNavigate }) {
  const [wordPick, setWordPick] = useState(null)
  const [quizIdx, setQuizIdx] = useState(0)
  const [quizPick, setQuizPick] = useState(null)
  const [quizScore, setQuizScore] = useState(0)
  const [quizDone, setQuizDone] = useState(false)

  const pickWord = (i) => { if (wordPick === null) setWordPick(i) }
  const pickQuiz = (i) => {
    if (quizPick !== null) return
    setQuizPick(i)
    if (i === QUIZ[quizIdx].answer) setQuizScore(s => s + 1)
    setTimeout(() => {
      if (quizIdx + 1 < QUIZ.length) { setQuizIdx(quizIdx + 1); setQuizPick(null) }
      else setQuizDone(true)
    }, 700)
  }

  return (
    <div className="page">
      {/* Header */}
      <header className="dash-head">
        <div>
          <h1>Welcome back, Ananya</h1>
          <p>CUET 2027 · here's today's snapshot.</p>
        </div>
        <div className="dash-chips">
          <span className="chip-streak"><Flame size={14} /> 9-day streak</span>
          <span className="chip-top">TOP 5%</span>
        </div>
      </header>

      {/* NEW — Aaj ka plan: actionable recommendation */}
      <section className="plan-card">
        <div className="plan-ico"><Sparkles size={22} /></div>
        <div className="plan-body">
          <h3>Aaj ka plan</h3>
          <p><b>Economics (58%)</b> sabse weak hai — Money & Banking ka 15-min revision karke Subject Quiz 2 baar do. Isse estimated score +18 ka jump aa sakta hai.</p>
        </div>
        <div className="plan-actions">
          <button className="btn btn-outline btn-sm" onClick={() => onNavigate('studykit')}>Revise Topic</button>
          <button className="btn btn-primary btn-sm" onClick={() => document.getElementById('daily-quiz')?.scrollIntoView({ behavior: 'smooth' })}>Practice Now →</button>
        </div>
      </section>

      <div className="dash-grid">
        {/* My Progress */}
        <section className="cuet-card">
          <div className="card-head">
            <h3>My Progress</h3>
            <span className="card-sub">CUET Commerce Batch 2027</span>
            <span className="track-badge">ON TRACK</span>
          </div>
          <div className="progress-total">
            <div className="ring" style={{ '--p': '64%' }}>
              <div className="ring-in"><b>64%</b><span>Overall syllabus</span></div>
            </div>
            <div className="progress-expected">Expected by now: 62%</div>
          </div>
          <div className="subjects">
            {SUBJECTS.map((s, i) => (
              <div className="subject-row" key={s.n}>
                <span className="subject-num">{i + 1}</span>
                <span className="subject-name">{s.n}</span>
                <div className="subject-bar"><i style={{ width: s.pct + '%', background: statusColor(s.status) }} /></div>
                <b className="subject-pct">{s.pct}%</b>
                <span className="subject-status" style={{ color: statusColor(s.status) }}>{s.status}</span>
              </div>
            ))}
          </div>
        </section>

        {/* My Standing */}
        <section className="cuet-card">
          <div className="card-head">
            <h3>My Standing</h3>
            <span className="card-sub">Ranked by contest & daily-challenge points</span>
          </div>
          <div className="standing">
            <div className="standing-tabs"><span className="st-active">All CUET Pro</span><span>My Subject</span></div>
            <div className="standing-num"><b>#142</b><span>of 3,480 students</span></div>
            <div className="standing-pct"><Trophy size={15} /> <b>95.9%ile</b> current standing</div>
          </div>
          <div className="board">
            <div className="board-title">TOP 5 THIS WEEK</div>
            {LEADERBOARD.map(p => (
              <div className="board-row" key={p.rank}>
                <span className="board-rank">{p.rank}</span>
                <span className="board-name">{p.name}</span>
                <b className="board-pts">{p.pts.toLocaleString()} pts</b>
              </div>
            ))}
            <div className="board-row me"><span className="board-rank">#142</span><span className="board-name">Ananya Verma (you)</span><b className="board-pts">1,120 pts</b></div>
          </div>
        </section>
      </div>

      {/* Daily Challenges */}
      <section className="challenges" id="daily-quiz">
        <h2 className="section-title">Daily Challenges</h2>
        <div className="challenge-grid">
          {/* Word of the Day */}
          <div className="challenge-card">
            <span className="ch-tag">Word of the Day</span>
            <p className="ch-word">“{WORD_Q.word}” — {WORD_Q.q}</p>
            <div className="ch-options">
              {WORD_Q.options.map((o, i) => {
                let cls = 'ch-opt'
                if (wordPick !== null) {
                  if (i === WORD_Q.answer) cls += ' correct'
                  else if (i === wordPick) cls += ' wrong'
                }
                return (
                  <button key={i} className={cls} onClick={() => pickWord(i)} disabled={wordPick !== null}>
                    {wordPick !== null && i === WORD_Q.answer && <CheckCircle2 size={14} />}
                    {wordPick === i && wordPick !== WORD_Q.answer && <XCircle size={14} />}
                    {o}
                  </button>
                )
              })}
            </div>
            <div className="ch-pts">
              {wordPick === null ? '+10 pts' : wordPick === WORD_Q.answer ? <span className="pts-win">+10 pts ✓ Correct!</span> : <span className="pts-lose">Sahi answer: "{WORD_Q.options[WORD_Q.answer]}"</span>}
            </div>
          </div>

          {/* Subject Quiz of the Day */}
          <div className="challenge-card">
            <span className="ch-tag">Subject Quiz of the Day</span>
            {!quizDone ? (
              <>
                <p className="ch-word">{QUIZ[quizIdx].q}</p>
                <div className="ch-options">
                  {QUIZ[quizIdx].options.map((o, i) => {
                    let cls = 'ch-opt'
                    if (quizPick !== null) {
                      if (i === QUIZ[quizIdx].answer) cls += ' correct'
                      else if (i === quizPick) cls += ' wrong'
                    }
                    return <button key={i} className={cls} onClick={() => pickQuiz(i)} disabled={quizPick !== null}>{o}</button>
                  })}
                </div>
                <div className="ch-pts">{quizPick !== null ? (quizPick === QUIZ[quizIdx].answer ? '✓ Sahi!' : 'Galat — sahi answer highlight hai') : `Question ${quizIdx + 1}/${QUIZ.length} · +20 pts`}</div>
              </>
            ) : (
              <div className="quiz-done">
                <b>{quizScore}/{QUIZ.length} sahi!</b>
                <p>Economics · Money & Banking — agla quiz kal.</p>
                <span className="pts-win">+{quizScore * 5} pts added</span>
              </div>
            )}
          </div>

          {/* RC of the Day */}
          <div className="challenge-card">
            <span className="ch-tag">RC of the Day</span>
            <p className="ch-word">Urban water scarcity — 3 quick questions.</p>
            <p className="ch-desc">A short passage on how cities lose 30% of treated water to leaks, and what Delhi's revival plans mean for residents.</p>
            <button className="btn btn-blue btn-sm" onClick={() => onNavigate('studykit')}>Start · +15 pts</button>
          </div>
        </div>
      </section>

      {/* Manifestation Board */}
      <section className="manifest">
        <h2 className="section-title">Manifestation Board</h2>
        <div className="manifest-card">
          <div className="manifest-row">
            <div className="manifest-seat"><b>SEAT</b><span>CUET 2027-A</span></div>
            <div className="manifest-flow"><span className="m-from">FROM</span><b>You</b><ArrowRight size={16} /><span className="m-to">TO</span><b>SRCC</b></div>
            <div className="manifest-src"><b>Shri Ram College of Commerce (SRCC)</b><span>North Campus · Est. 1926 · sample data</span></div>
          </div>
          <div className="manifest-cols">
            <div className="m-col"><span className="m-label">DID YOU KNOW</span><p>One of DU's oldest commerce colleges — routinely posts the highest CUET cutoffs for B.Com (Hons) in the country.</p></div>
            <div className="m-col"><span className="m-label">IN-FLIGHT QUOTE</span><p>"The students who ask for help early are the ones who don't panic in March."</p></div>
            <div className="m-col"><span className="m-label">TARGET SCORE</span><p className="m-score">B.Com (Hons) · last year, Round 1<br /><b>95.1%ile</b></p><button className="btn btn-outline btn-sm" onClick={() => onNavigate('explorer')}>Explore colleges →</button></div>
          </div>
        </div>
      </section>
    </div>
  )
}

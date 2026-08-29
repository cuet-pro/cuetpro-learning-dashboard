import { useState } from 'react'
import { Zap, Layers, FlaskConical, RefreshCcw, ArrowRight, CheckCircle2, XCircle } from 'lucide-react'
import './revision.css'

const DAILY_QS = [
  { q: 'RBI ka main monetary policy tool kaunsa hai?', options: ['Repo Rate', 'Fiscal Deficit', 'GST', 'Import Duty'], a: 0, subj: 'Economics' },
  { q: '"Elucidate" ka sabse kareeb matlab:', options: ['Confuse', 'Explain clearly', 'Hide', 'Repeat'], a: 1, subj: 'English' },
  { q: 'Current Ratio = ?', options: ['CA/CL', 'CL/CA', 'Net Profit/Sales', 'Debt/Equity'], a: 0, subj: 'Accountancy' },
  { q: 'Break-even point pe:', options: ['Loss', 'No profit no loss', 'Max profit', 'Bankrupt'], a: 1, subj: 'Business Studies' },
  { q: 'First Five Year Plan kis year start hua?', options: ['1947', '1950', '1951', '1956'], a: 2, subj: 'General Test' },
]

const CARDS = [
  { front: 'Repo Rate', back: 'Jis rate pe RBI commercial banks ko short-term loan deta hai' },
  { front: 'Liquidity', back: 'Asset ka cash me convert hone ki capability' },
  { front: 'Opportunity Cost', back: 'Agla best option jo chhodna pada' },
  { front: 'Monetary Policy', back: 'RBI ke actions — money supply & interest rates control' },
  { front: 'Fiscal Deficit', back: 'Total expenditure − total receipts excluding borrowings' },
  { front: 'Working Capital', back: 'Current Assets − Current Liabilities' },
]

const FORMULAS = [
  { name: 'Gross Profit Ratio', f: 'Gross Profit / Net Sales × 100' },
  { name: 'Current Ratio', f: 'Current Assets / Current Liabilities' },
  { name: 'Debt-Equity Ratio', f: 'Total Debt / Shareholder Equity' },
  { name: 'Break-Even Point', f: 'Fixed Costs / (Price − Variable Cost)' },
]

export default function SmartRevision() {
  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>Smart Revision</h1>
          <p>Chill Zone ki jagah — light, low-stakes, lekin har din value deta hai. Community & Music hata diya — ye rakha.</p>
        </div>
      </header>

      <div className="rev-grid">
        <DailyQuiz />
        <FlashcardSprint />
        <FormulaDrill />
        <MistakeReplay />
      </div>
    </div>
  )
}

function DailyQuiz() {
  const [idx, setIdx] = useState(0)
  const [pick, setPick] = useState(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  const q = DAILY_QS[idx]
  const choose = (i) => {
    if (pick !== null) return
    setPick(i)
    if (i === q.a) setScore(s => s + 1)
    setTimeout(() => {
      if (idx + 1 < DAILY_QS.length) { setIdx(idx + 1); setPick(null) }
      else setDone(true)
    }, 800)
  }
  return (
    <section className="rev-card">
      <div className="rev-head"><span className="rev-ico g"><Zap size={16} /></span><div><h3>Daily Quiz</h3><span className="rev-sub">5 Qs · rotating subjects</span></div><span className="rev-pts">+20 pts</span></div>
      {!done ? (
        <>
          <p className="rev-q">{idx + 1}. {q.q}</p>
          <div className="rev-opts">
            {q.options.map((o, i) => {
              let cls = 'rev-opt'
              if (pick !== null) { if (i === q.a) cls += ' c'; else if (i === pick) cls += ' w' }
              return <button key={i} className={cls} onClick={() => choose(i)} disabled={pick !== null}>{o}</button>
            })}
          </div>
          <div className="rev-feedback">{pick !== null ? (pick === q.a ? <span className="ok">✓ Sahi! {q.subj}</span> : <span className="no">Galat — sahi answer green hai</span>) : `Q ${idx + 1}/5 · ${q.subj}`}</div>
        </>
      ) : (
        <div className="rev-done"><b>{score}/5 sahi!</b><p>Kal naya set — streak mat todo 🔥</p></div>
      )}
    </section>
  )
}

function FlashcardSprint() {
  const [idx, setIdx] = useState(0)
  const [flip, setFlip] = useState(false)
  const [learned, setLearned] = useState([])
  const c = CARDS[idx]
  const next = (ok) => {
    if (ok) setLearned(l => [...l, c.front])
    setFlip(false)
    setIdx(i => (i + 1) % CARDS.length)
  }
  return (
    <section className="rev-card">
      <div className="rev-head"><span className="rev-ico b"><Layers size={16} /></span><div><h3>Flashcard Sprint</h3><span className="rev-sub">Spaced repetition · {learned.length}/{CARDS.length} learned</span></div></div>
      <div className={`flashcard ${flip ? 'flip' : ''}`} onClick={() => setFlip(f => !f)}>
        <div className="fc-inner">
          <div className="fc-face fc-front"><b>{c.front}</b><span className="fc-hint">tap to flip</span></div>
          <div className="fc-face fc-back"><p>{c.back}</p><span className="fc-hint">tap to flip back</span></div>
        </div>
      </div>
      <div className="fc-actions">
        <button className="btn btn-outline btn-sm" onClick={() => next(false)}><XCircle size={13} /> Again</button>
        <button className="btn btn-primary btn-sm" onClick={() => next(true)}><CheckCircle2 size={13} /> Got it</button>
      </div>
    </section>
  )
}

function FormulaDrill() {
  const [show, setShow] = useState(null)
  return (
    <section className="rev-card">
      <div className="rev-head"><span className="rev-ico p"><FlaskConical size={16} /></span><div><h3>Formula Drill</h3><span className="rev-sub">2-min quick recall</span></div></div>
      <div className="formula-list">
        {FORMULAS.map((f, i) => (
          <div className="formula-row" key={f.name} onClick={() => setShow(show === i ? null : i)}>
            <b>{f.name}</b>
            <span className="formula-ans">{show === i ? f.f : '—'}</span>
          </div>
        ))}
      </div>
      <p className="rev-hint">Tap a formula to reveal — phir dobara chhupa ke khud bolo.</p>
    </section>
  )
}

function MistakeReplay() {
  return (
    <section className="rev-card">
      <div className="rev-head"><span className="rev-ico r"><RefreshCcw size={16} /></span><div><h3>Mistake Replay</h3><span className="rev-sub">Analysis se aaye — 3 pending</span></div></div>
      {[
        { t: 'Money & Banking', d: 'Repo rate question — 2 baar galat' },
        { t: 'Production & Costs', d: 'AFC curve — 3 baar galat' },
        { t: 'Government Budget', d: 'Capital receipts — 1 baar galat' },
      ].map(m => (
        <div className="mistake-row" key={m.t}>
          <div><b>{m.t}</b><span>{m.d}</span></div>
          <button className="btn btn-primary btn-sm">Replay <ArrowRight size={13} /></button>
        </div>
      ))}
    </section>
  )
}

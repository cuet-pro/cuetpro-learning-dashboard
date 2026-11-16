import { useEffect, useMemo, useRef, useState } from 'react'
import { Timer, RotateCcw, CheckCircle2, XCircle, ArrowRight, ArrowLeft, Trophy, Shuffle, Lightbulb } from 'lucide-react'

const LETTERS = 'ABCD'

/* shuffle helper */
function shuffled(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] }
  return a
}

/* ── Exam test: fresh 15 questions from the topic's PYQ bank ── */
function ExamTest({ pyq }) {
  const [phase, setPhase] = useState('intro') // intro | test | result
  const [qs, setQs] = useState([])
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState({})
  const [left, setLeft] = useState(900)
  const [exact] = useState(true)

  const start = () => {
    setQs(shuffled(pyq).slice(0, 15))
    setAnswers({}); setIdx(0); setLeft(900); setPhase('test')
  }

  useEffect(() => {
    if (phase !== 'test') return
    if (left <= 0) { setPhase('result'); return }
    const t = setTimeout(() => setLeft(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, left])

  if (phase === 'intro') {
    return (
      <div className="ep-intro">
        <div className="ep-intro-card">
          <b>{Math.min(15, pyq.length)} questions · timed</b>
          <p>Fresh questions drawn from this topic's CUET PYQ bank. Answer all, then see your score and the explanations.</p>
          {pyq.length === 0 && <p className="ep-note">No questions for this topic yet.</p>}
          <button className="btn btn-primary-sm" onClick={start} disabled={!pyq.length}>Start test <ArrowRight size={13} /></button>
        </div>
      </div>
    )
  }

  if (phase === 'result') {
    let c = 0
    qs.forEach(q => { if (answers[q.q] === q.answer) c++ })
    return (
      <div className="ep-result">
        <div className="ep-score"><Trophy size={20} /><b>{c}</b><span>/ {qs.length} correct</span></div>
        <div className="ep-review">
          {qs.map((q, i) => {
            const a = answers[q.q]
            const ok = a === q.answer
            return (
              <div className={'ep-rv' + (ok ? ' ok' : ' no')} key={i}>
                <span className="ep-rv-n">Q{i + 1}</span>
                <div className="ep-rv-b">
                  <p>{q.q}</p>
                  <span className="ep-rv-a">Your answer: <b>{a == null ? '—' : LETTERS[a] + ') ' + q.opts[a]}</b></span>
                  {!ok && <span className="ep-rv-c">Correct: <b>{LETTERS[q.answer]}) {q.opts[q.answer]}</b></span>}
                  {q.explain && <span className="ep-rv-x">{q.explain}</span>}
                </div>
              </div>
            )
          })}
        </div>
        <button className="btn btn-outline-sm" onClick={start}><RotateCcw size={13} /> Retry</button>
      </div>
    )
  }

  const q = qs[idx]
  return (
    <div className="ep-test">
      <div className="ep-bar">
        <span>Question {idx + 1} / {qs.length}</span>
        <span className={'ep-timer' + (left < 60 ? ' low' : '')}><Timer size={13} /> {String(Math.floor(left / 60)).padStart(2, '0')}:{String(left % 60).padStart(2, '0')}</span>
        <button className="btn btn-primary-sm" onClick={() => setPhase('result')}>Submit</button>
      </div>
      <div className="ep-q">
        <p className="ep-stem">{q.q}</p>
        <div className="ep-opts">
          {q.opts.map((o, i) => (
            <button key={i} className={'ep-opt' + (answers[q.q] === i ? ' sel' : '')} onClick={() => setAnswers(a => ({ ...a, [q.q]: i }))}>
              <span className="ep-opt-l">{LETTERS[i]}</span><span>{o}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="ep-nav">
        <button className="btn btn-outline-sm" disabled={idx === 0} onClick={() => setIdx(i => i - 1)}><ArrowLeft size={13} /> Prev</button>
        <button className="btn btn-outline-sm" onClick={() => setAnswers(a => { const b = { ...a }; delete b[q.q]; return b })}>Clear</button>
        <button className="btn btn-primary-sm" disabled={idx === qs.length - 1} onClick={() => setIdx(i => i + 1)}>Next <ArrowRight size={13} /></button>
      </div>
    </div>
  )
}

/* ── Flashcards (flip) ── */
function Flashcards({ cards }) {
  const [i, setI] = useState(0)
  const [flip, setFlip] = useState(false)
  const c = cards[i]
  if (!c) return null
  return (
    <div className="ep-game">
      <button className="ep-flip" onClick={() => setFlip(f => !f)}>
        <span className="ep-flip-side">{flip ? 'Meaning' : 'Word'}</span>
        <b>{flip ? (c.back || c.sub || '—') : c.front}</b>
        {flip && c.sub && <em>{c.sub}</em>}
      </button>
      <div className="ep-flip-nav">
        <button className="btn btn-outline-sm" disabled={i === 0} onClick={() => { setI(i - 1); setFlip(false) }}><ArrowLeft size={13} /></button>
        <span>{i + 1} / {cards.length}</span>
        <button className="btn btn-outline-sm" disabled={i === cards.length - 1} onClick={() => { setI(i + 1); setFlip(false) }}><ArrowRight size={13} /></button>
      </div>
    </div>
  )
}

/* ── Matching (front → back pairs) ── */
function Matching({ pairs }) {
  const data = useMemo(() => shuffled(pairs).slice(0, 6), [pairs])
  const fronts = useMemo(() => shuffled(data.map(p => p[0])), [data])
  const backs = useMemo(() => shuffled(data.map(p => p[1])), [data])
  const [selF, setSelF] = useState(null)
  const [matched, setMatched] = useState([])
  const [wrong, setWrong] = useState(null)

  const pickF = i => { setSelF(i); setWrong(null) }
  const pickB = j => {
    if (selF == null) return
    const f = fronts[selF]
    const b = backs[j]
    const pair = data.find(p => p[0] === f)
    if (pair && pair[1] === b) {
      setMatched(m => [...m, f]); setSelF(null)
    } else {
      setWrong(j); setTimeout(() => { setWrong(null); setSelF(null) }, 600)
    }
  }

  return (
    <div className="ep-match">
      <div className="ep-match-cols">
        <div className="ep-match-col">
          {fronts.map((f, i) => (
            <button key={i} className={'ep-mb' + (selF === i ? ' sel' : '') + (matched.includes(f) ? ' done' : '')} onClick={() => pickF(i)} disabled={matched.includes(f)}>{f}</button>
          ))}
        </div>
        <div className="ep-match-col">
          {backs.map((b, j) => (
            <button key={j} className={'ep-mb' + (wrong === j ? ' wrong' : '')} onClick={() => pickB(j)} disabled={matched.includes(data.find(p => p[1] === b)?.[0])}>{b}</button>
          ))}
        </div>
      </div>
      {matched.length === data.length && <p className="ep-done"><CheckCircle2 size={16} /> All matched!</p>}
    </div>
  )
}

/* ── Word Sprint (10s per word) ── */
function WordSprint({ cards }) {
  const words = useMemo(() => shuffled(cards.filter(c => c.front && c.back)).slice(0, 8), [cards])
  const [i, setI] = useState(0)
  const [val, setVal] = useState('')
  const [left, setLeft] = useState(10)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (done || i >= words.length) return
    setLeft(10)
    const t = setTimeout(() => {
      if (i < words.length - 1) { setI(i + 1); setVal('') } else setDone(true)
    }, 10000)
    return () => clearTimeout(t)
  }, [i, done])

  if (done || words.length === 0) {
    return <div className="ep-done">{score}/{words.length} correct</div>
  }
  const w = words[i]
  const check = () => {
    if (val.trim().toLowerCase() === String(w.back).toLowerCase()) setScore(s => s + 1)
    if (i < words.length - 1) { setI(i + 1); setVal('') } else setDone(true)
  }
  return (
    <div className="ep-sprint">
      <span className="ep-sprint-timer">{left}s</span>
      <b className="ep-sprint-word">{w.front}</b>
      <input autoFocus value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && check()} placeholder="Type the meaning / synonym" />
      <button className="btn btn-primary-sm" onClick={check}>Next</button>
    </div>
  )
}

/* ── Hangman ── */
function Hangman({ cards }) {
  const words = useMemo(() => shuffled(cards.map(c => c.back).filter(w => /^[a-z ]+$/i.test(w))).slice(0, 1), [cards])
  const word = (words[0] || 'sample').toLowerCase().replace(/[^a-z ]/g, '')
  const [guessed, setGuessed] = useState([])
  const [wrong, setWrong] = useState(0)
  const [won, setWon] = useState(false)
  const letters = 'abcdefghijklmnopqrstuvwxyz'
  const revealed = [...word].map(ch => ch === ' ' ? ' ' : (guessed.includes(ch) ? ch : '_')).join(' ')
  const isWon = [...word].every(ch => ch === ' ' || guessed.includes(ch))

  useEffect(() => { if (isWon) setWon(true) }, [isWon])

  const guess = ch => {
    if (guessed.includes(ch) || wrong >= 6 || won) return
    setGuessed(g => [...g, ch])
    if (!word.includes(ch)) setWrong(w => w + 1)
  }

  return (
    <div className="ep-hang">
      <p className="ep-hang-word">{revealed}</p>
      <p className="ep-hang-state">{wrong}/6 wrong {won && '· solved! 🎉'}</p>
      <div className="ep-hang-keys">
        {letters.split('').map(ch => (
          <button key={ch} onClick={() => guess(ch)} disabled={guessed.includes(ch)}>{ch}</button>
        ))}
      </div>
    </div>
  )
}

/* ── Practice tab (exam + games) ── */
export default function PracticeTab({ data, topicId, topic }) {
  const [seg, setSeg] = useState('exam')
  const pyq = data?.pyqBank?.[topicId] || []
  const flashcards = data?.flashcardsByTopic?.[topicId] || []
  const match = data?.matchByTopic?.[topicId] || []
  const [game, setGame] = useState('flashcards')

  const games = [
    { id: 'flashcards', label: 'Flashcards', has: flashcards.length > 0 },
    { id: 'matching', label: 'Matching', has: match.length > 0 },
    { id: 'sprint', label: 'Word Sprint', has: flashcards.length > 0 },
    { id: 'hangman', label: 'Hangman', has: flashcards.length > 0 },
  ]

  return (
    <div className="ep">
      <div className="ep-seg">
        <button className={seg === 'exam' ? 'on' : ''} onClick={() => setSeg('exam')}>Exam test</button>
        <button className={seg === 'games' ? 'on' : ''} onClick={() => setSeg('games')}>Games</button>
      </div>

      {seg === 'exam' ? (
        <ExamTest pyq={pyq} />
      ) : (
        <div className="ep-games">
          <div className="ep-game-picker">
            {games.filter(g => g.has).map(g => (
              <button key={g.id} className={game === g.id ? 'on' : ''} onClick={() => setGame(g.id)}>{g.label}</button>
            ))}
          </div>
          {game === 'flashcards' && <Flashcards cards={flashcards} />}
          {game === 'matching' && <Matching pairs={match} />}
          {game === 'sprint' && <WordSprint cards={flashcards} />}
          {game === 'hangman' && <Hangman cards={flashcards} />}
        </div>
      )}
    </div>
  )
}
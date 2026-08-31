import { useEffect, useState } from 'react'
import { Users, Timer, Play, Pause, LogOut, Swords, Hourglass, Lightbulb, Flame, Trophy, Zap, Crown, Target, GraduationCap, Lock, Share2, Check, Star, PartyPopper } from 'lucide-react'
import './chillzone.css'

/* unified points ledger — same system as Daily Challenges & Smart Revision */
function usePoints() {
  const [pts, setPts] = useState(() => Number(localStorage.getItem('cp_points') || 0))
  const [toast, setToast] = useState(null)
  const add = (n, label) => {
    const v = pts + n
    setPts(v)
    localStorage.setItem('cp_points', v)
    setToast('+' + n + ' pts · ' + label)
    setTimeout(() => setToast(null), 2200)
  }
  return [pts, add, toast]
}

export default function ChillZone() {
  const [pts, add, toast] = usePoints()
  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>Chill Zone</h1>
          <p>A low-pressure space to stay in the game — study together, play a round, collect badges.</p>
        </div>
        <div className="cz-points"><Star size={14} /> {pts} pts</div>
      </header>

      {toast && <div className="cz-toast">{toast}</div>}

      <StudyRooms />
      <div className="cz-grid">
        <WordBattle add={add} />
        <DailyRiddle add={add} />
      </div>
      <BadgeShowcase />
      <InviteFriends add={add} />
    </div>
  )
}

/* ── A. Study rooms — flagship ── */
function StudyRooms() {
  const [count, setCount] = useState(14)
  const [mins, setMins] = useState(50)
  const [inSession, setInSession] = useState(false)
  const [secsLeft, setSecsLeft] = useState(null)

  /* live headcount — polling stand-in (real-time layer later: websocket/polling) */
  useEffect(() => {
    const t = setInterval(() => setCount(c => Math.max(9, Math.min(23, c + (Math.random() > 0.5 ? 1 : -1)))), 5000)
    return () => clearInterval(t)
  }, [])

  /* synced session timer */
  useEffect(() => {
    if (secsLeft === null) return
    if (secsLeft <= 0) { setInSession(false); setSecsLeft(null); return }
    const t = setTimeout(() => setSecsLeft(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [secsLeft])

  const join = () => { setCount(c => c + 1); setSecsLeft(mins * 60); setInSession(true) }
  const leave = () => { setCount(c => Math.max(9, c - 1)); setInSession(false); setSecsLeft(null) }

  const mm = secsLeft === null ? 0 : Math.floor(secsLeft / 60)
  const ss = secsLeft === null ? 0 : secsLeft % 60

  return (
    <section className="cz-room">
      <div className="cz-room-head">
        <div className="cz-room-ico"><Users size={20} /></div>
        <div className="cz-room-title">
          <h3>Study rooms</h3>
          <p className="cz-live"><i /> {count} students studying right now</p>
        </div>
      </div>
      <p className="cz-room-desc">
        A silent co-study room — shared countdown timer, no camera, no chat. Just peer presence to keep you accountable.
      </p>

      {!inSession ? (
        <div className="cz-room-actions">
          <span className="cz-session-label">Session length</span>
          <div className="cz-mins">
            {[25, 50, 90].map(m => (
              <button key={m} className={'cz-min' + (mins === m ? ' on' : '')} onClick={() => setMins(m)}>{m} min</button>
            ))}
          </div>
          <button className="btn btn-primary cz-join" onClick={join}><Play size={15} /> Join room</button>
        </div>
      ) : (
        <div className="cz-session">
          <div className="cz-timer">
            <Timer size={16} />
            <b>{String(mm).padStart(2, '0')}:{String(ss).padStart(2, '0')}</b>
            <span>{mins} min session · synced</span>
          </div>
          <div className="cz-room-livebar"><i style={{ width: ((mins * 60 - secsLeft) / (mins * 60) * 100) + '%' }} /></div>
          <button className="btn btn-outline-sm" onClick={leave}><LogOut size={14} /> Leave room</button>
        </div>
      )}
    </section>
  )
}

/* ── B. Word battle ── */
const WORDS = [
  { word: 'Ephemeral', opts: ['Permanent', 'Short-lived', 'Cheerful', 'Ancient'], a: 1 },
  { word: 'Ubiquitous', opts: ['Rare', 'Found everywhere', 'Hidden', 'Noisy'], a: 1 },
  { word: 'Mitigate', opts: ['Worsen', 'Lessen the impact', 'Ignore', 'Celebrate'], a: 1 },
  { word: 'Candid', opts: ['Secretive', 'Honest and direct', 'Rude', 'Shy'], a: 1 },
  { word: 'Adept', opts: ['Clumsy', 'Highly skilled', 'Sleepy', 'Brave'], a: 1 },
]
function WordBattle({ add }) {
  const [phase, setPhase] = useState('idle') /* idle | searching | playing | result */
  const [qIdx, setQIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [picked, setPicked] = useState(null)
  const [timeLeft, setTimeLeft] = useState(60)

  useEffect(() => {
    if (phase !== 'playing') return
    const t = setTimeout(() => {
      if (timeLeft <= 1) {
        const won = score >= 3
        add(won ? 20 : 5, won ? 'word battle win' : 'word battle played')
        setPhase('result'); setPicked(null); setQIdx(0)
      } else setTimeLeft(s => s - 1)
    }, 1000)
    return () => clearTimeout(t)
  }, [phase, timeLeft, score])

  const findOpponent = () => {
    setPhase('searching'); setScore(0); setQIdx(0); setPicked(null); setTimeLeft(60)
    setTimeout(() => setPhase('playing'), 1800)
  }
  const choose = i => {
    if (picked !== null) return
    setPicked(i)
    if (i === WORDS[qIdx].a) setScore(s => s + 1)
    setTimeout(() => {
      if (qIdx + 1 >= WORDS.length) {
        const final = score + (i === WORDS[qIdx].a ? 1 : 0)
        add(final >= 3 ? 20 : 5, final >= 3 ? 'word battle win' : 'word battle played')
        setPhase('result'); setPicked(null); setQIdx(0)
      } else { setQIdx(q => q + 1); setPicked(null) }
    }, 700)
  }

  return (
    <section className="cz-card">
      <div className="cz-card-head"><Swords size={18} /><div><h3>Word battle</h3><span>1v1 vocabulary duel · 60 seconds</span></div></div>

      {phase === 'idle' && (
        <>
          <p className="cz-desc">Matched against another student — 5 words, quickest correct answers win. Winner takes 20 pts.</p>
          <button className="btn btn-primary cz-wide" onClick={findOpponent}><Swords size={15} /> Find opponent</button>
        </>
      )}
      {phase === 'searching' && (
        <div className="cz-searching"><Hourglass size={22} /><b>Finding opponent…</b><span>usually takes a few seconds</span></div>
      )}
      {phase === 'playing' && (
        <>
          <div className="cz-battle-top">
            <span className="cz-battle-timer"><Timer size={13} /> {timeLeft}s</span>
            <span className="cz-battle-score">Q {qIdx + 1}/5 · {score} pts</span>
          </div>
          <p className="cz-word">{WORDS[qIdx].word}</p>
          <div className="cz-opts">
            {WORDS[qIdx].opts.map((o, i) => {
              let cls = 'cz-opt'
              if (picked !== null) { if (i === WORDS[qIdx].a) cls += ' c'; else if (i === picked) cls += ' w' }
              return <button key={i} className={cls} onClick={() => choose(i)} disabled={picked !== null}>{o}</button>
            })}
          </div>
        </>
      )}
      {phase === 'result' && (
        <div className="cz-result">
          <PartyPopper size={26} style={{ color: score >= 3 ? 'var(--green-500)' : 'var(--warning-500)' }} />
          <b>{score >= 3 ? 'You won!' : 'Close one — ' + score + '/5'}</b>
          <span>{score >= 3 ? '+20 pts added' : '+5 pts for playing'}</span>
          <button className="btn btn-primary cz-wide" onClick={findOpponent}>Battle again</button>
        </div>
      )}
    </section>
  )
}

/* ── C. Daily riddle ── */
const RIDDLES = [
  { q: 'I speak without a mouth and hear without ears. What am I?', opts: ['Wind', 'An echo', 'A radio', 'A dream'], a: 1, playful: 'No syllabus here — just a tiny brain stretch.' },
  { q: 'The more you take, the more you leave behind. What am I?', opts: ['Footsteps', 'Money', 'Time', 'Breath'], a: 0, playful: 'Fresh puzzle daily — this one never gets old.' },
  { q: 'What has keys but can never open a lock?', opts: ['A piano', 'A map', 'A keyboard', 'A code'], a: 0, playful: 'Way easier than a CUET paper, promise.' },
  { q: 'What gets wetter the more it dries?', opts: ['A towel', 'A sponge', 'Rain', 'A plant'], a: 0, playful: 'Two minutes, one answer, zero pressure.' },
]
function DailyRiddle({ add }) {
  const day = Math.floor(Date.now() / 86400000)
  const r = RIDDLES[day % RIDDLES.length]
  const [picked, setPicked] = useState(null)
  const [solved, setSolved] = useState(() => localStorage.getItem('cp_riddle_' + day) === '1')

  const choose = i => {
    if (picked !== null || solved) return
    setPicked(i)
    if (i === r.a) {
      setSolved(true)
      localStorage.setItem('cp_riddle_' + day, '1')
      add(10, 'riddle solved')
    }
  }

  return (
    <section className="cz-card cz-riddle">
      <div className="cz-card-head"><Lightbulb size={18} /><div><h3>Daily riddle</h3><span>{r.playful}</span></div></div>
      <p className="cz-riddle-q">{r.q}</p>
      <div className="cz-opts">
        {r.opts.map((o, i) => {
          let cls = 'cz-opt'
          if (picked !== null || solved) { if (i === r.a) cls += ' c'; else if (i === picked) cls += ' w' }
          return <button key={i} className={cls} onClick={() => choose(i)} disabled={picked !== null || solved}>{o}</button>
        })}
      </div>
      {solved && <p className="cz-solved">✓ Solved today — +10 pts. Come back tomorrow for a new one.</p>}
    </section>
  )
}

/* ── D. Badge showcase ── */
const BADGES = [
  { name: '9-day streak', icon: Flame, earned: true, desc: 'Studied 9 days in a row' },
  { name: 'Mock marathoner', icon: Trophy, earned: true, desc: 'Completed 5 full mock tests' },
  { name: 'Weak → strong', icon: Zap, earned: true, desc: 'Took a weak topic above 75% accuracy' },
  { name: 'Top 5%', icon: Crown, earned: true, desc: 'Reached the top 5% of your cohort' },
  { name: '30-day streak', icon: Flame, earned: false, desc: 'Keep your streak alive for 30 days' },
  { name: 'Perfect mock', icon: Target, earned: false, desc: 'Score 90%+ in a full-length mock' },
  { name: 'Scholar', icon: GraduationCap, earned: false, desc: 'Finish every subject in the Study Kit' },
]
function BadgeShowcase() {
  const [open, setOpen] = useState(null)
  return (
    <section className="cz-card">
      <div className="cz-card-head"><Trophy size={18} /><div><h3>Badges</h3><span>Earned from your streaks, mocks and comebacks</span></div></div>
      <div className="cz-badges">
        {BADGES.map((b, i) => (
          <button key={b.name} className={'cz-badge' + (b.earned ? '' : ' locked')} onClick={() => setOpen(open === i ? null : i)}>
            <span className="cz-badge-ico"><b.icon size={20} />{!b.earned && <i className="cz-lock"><Lock size={9} /></i>}</span>
            <b>{b.name}</b>
            {open === i && <span className="cz-badge-desc">{b.desc}</span>}
          </button>
        ))}
      </div>
    </section>
  )
}

/* ── E. Invite friends ── */
function InviteFriends({ add }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    const url = 'https://cuetpro.com/?ref=ADITI21'
    try { navigator.clipboard?.writeText(url) } catch {}
    setCopied(true)
    add(50, 'invite link copied')
    setTimeout(() => setCopied(false), 2200)
  }
  return (
    <section className="cz-card cz-invite">
      <div className="cz-card-head"><Share2 size={18} /><div><h3>Invite friends</h3><span>+50 pts for every friend who joins and signs up</span></div></div>
      <div className="cz-invite-row">
        <code className="cz-invite-link">https://cuetpro.com/?ref=ADITI21</code>
        <button className="btn btn-primary-sm" onClick={copy}>{copied ? <><Check size={14} /> Copied!</> : 'Copy invite link'}</button>
      </div>
    </section>
  )
}

import { useEffect, useRef, useState } from 'react'
import './myprogresscard.css'

/* ── Mood table (diff = actual − expected) ── */
const MOODS = {
  star:    { tag: 'Superstar',    ring: '#0F6E56', msg: 'Way ahead. Teach a friend today?',           pill: 'green' },
  excited: { tag: 'On fire',      ring: '#0F6E56', msg: "You're flying. Keep the rhythm.",             pill: 'green' },
  happy:   { tag: 'On track',     ring: '#0F6E56', msg: 'One more section, one bigger jump.',         pill: 'green' },
  worried: { tag: 'Slipping',     ring: '#BA7517', msg: 'A little behind. One focused day fixes it.', pill: 'amber' },
  sad:     { tag: 'Needs a push', ring: '#A32D2D', msg: "Let's catch up. Start with your behind section.", pill: 'red' },
}
const moodKey = d => (d >= 15 ? 'star' : d >= 5 ? 'excited' : d >= 0 ? 'happy' : d >= -6 ? 'worried' : 'sad')

/* ── Dynamic avatar: inline SVG face ── */
function Face({ mood }) {
  const parts = {
    star: {
      eyes: (<>
        <path d="M16.5 17.8 l1.5 3.2 3.2 1.5 -3.2 1.5 -1.5 3.2 -1.5 -3.2 -3.2 -1.5 3.2 -1.5 Z" fill="#24313a" />
        <path d="M31.5 17.8 l1.5 3.2 3.2 1.5 -3.2 1.5 -1.5 3.2 -1.5 -3.2 -3.2 -1.5 3.2 -1.5 Z" fill="#24313a" />
      </>),
      mouth: <path d="M14 30 Q24 41 34 30 Q24 44 14 30 Z" fill="#24313a" />,
    },
    excited: {
      eyes: (<>
        <path d="M13.5 20.5 Q16.5 16.5 19.5 20.5" stroke="#24313a" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <path d="M28.5 20.5 Q31.5 16.5 34.5 20.5" stroke="#24313a" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      </>),
      mouth: <path d="M14 29 Q24 38 34 29 Q24 41 14 29 Z" fill="#24313a" />,
    },
    happy: {
      eyes: (<>
        <circle cx="16.5" cy="22" r="2.4" fill="#24313a" />
        <circle cx="31.5" cy="22" r="2.4" fill="#24313a" />
      </>),
      mouth: <path d="M16 30 Q24 37 32 30" stroke="#24313a" strokeWidth="2.4" fill="none" strokeLinecap="round" />,
    },
    worried: {
      eyes: (<>
        <circle cx="16.5" cy="22" r="2.4" fill="#24313a" />
        <circle cx="31.5" cy="22" r="2.4" fill="#24313a" />
        <path d="M13.5 17.5 Q16.5 15 19.5 17.5" stroke="#24313a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d="M28.5 17.5 Q31.5 15 34.5 17.5" stroke="#24313a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d="M40 22 Q42.5 26 40 30 Q37.5 26 40 22 Z" fill="#7ec8f0" />
      </>),
      mouth: <path d="M17.5 32 Q21 33 24 32 Q28 31 30.5 32" stroke="#24313a" strokeWidth="2.2" fill="none" strokeLinecap="round" />,
    },
    sad: {
      eyes: (<>
        <circle cx="16.5" cy="22" r="2.6" fill="#24313a" />
        <circle cx="31.5" cy="22" r="2.6" fill="#24313a" />
        <path d="M37 24 Q39 28 37 31 Q35 28 37 24 Z" fill="#7ec8f0" />
      </>),
      mouth: <path d="M16 35 Q24 28 32 35" stroke="#24313a" strokeWidth="2.4" fill="none" strokeLinecap="round" />,
    },
  }
  const p = parts[mood]
  return (
    <svg viewBox="0 0 48 48" className="mood-face" key={mood} aria-hidden="true">
      <circle cx="24" cy="24" r="21" fill="#FFD166" />
      <ellipse cx="13" cy="30.5" rx="4" ry="2.6" fill="#f1a66a" opacity=".55" />
      <ellipse cx="35" cy="30.5" rx="4" ry="2.6" fill="#f1a66a" opacity=".55" />
      {p.eyes}
      {p.mouth}
    </svg>
  )
}

/* ── Progress ring (SVG) ── */
const R = 88
const C = 2 * Math.PI * R

function Ring({ shown, actual, expected, color, ghost, nextSectionGain, big, sub, onTap }) {
  const prog = Math.max(0, Math.min(100, shown)) / 100 * C
  const ghostPct = Math.min(100, actual + nextSectionGain)
  const ghostLen = ghostPct / 100 * C
  const tickAngle = Math.min(100, expected) / 100 * 360
  return (
    <button type="button" className="mpc-ring" onClick={onTap}
      aria-label={`${shown}% overall syllabus. Expected ${expected}%.`}>
      <svg viewBox="0 0 220 220" className="mpc-ring-svg">
        <circle cx="110" cy="110" r={R} className="mpc-track" />
        {ghost && <circle cx="110" cy="110" r={R} className="mpc-ghost" style={{ stroke: color }}
          strokeDasharray={`${ghostLen} ${C}`} transform="rotate(-90 110 110)" />}
        <circle cx="110" cy="110" r={R} className="mpc-prog" style={{ stroke: color }}
          strokeDasharray={`${prog} ${C}`} transform="rotate(-90 110 110)" />
        <g transform={`rotate(${tickAngle} 110 110)`}>
          <line x1="110" y1="15" x2="110" y2="29" className="mpc-tick" />
        </g>
        <text x="110" y="103" textAnchor="middle" className="mpc-ring-num">{big}</text>
        <text x="110" y="126" textAnchor="middle" className="mpc-ring-sub">{sub}</text>
      </svg>
    </button>
  )
}

export default function MyProgressCard({
  actual = 64, expected = 62,
  sections = { onTrack: [], needsAttention: [], behind: [] },
  totalSections = 28, completedSections = 18, daysToExam = 47,
  nextSectionGain = 5, onNextSection = () => {}, dark = false,
}) {
  const diff = Math.round(actual - expected)
  const mood = moodKey(diff)
  const m = MOODS[mood]

  const [shown, setShown] = useState(0)
  const shownRef = useRef(0)
  const [centerMode, setCenterMode] = useState(0)
  const [ghost, setGhost] = useState(false)
  const [openChip, setOpenChip] = useState(null)

  // count-up animation on load / actual change
  useEffect(() => {
    const from = shownRef.current
    const start = performance.now()
    const dur = 600
    let raf
    const step = t => {
      const p = Math.min(1, (t - start) / dur)
      const e = 1 - Math.pow(1 - p, 3)
      const v = Math.round(from + (actual - from) * e)
      shownRef.current = v
      setShown(v)
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [actual])

  const centers = [
    { big: `${shown}%`, sub: 'Overall syllabus' },
    { big: `${completedSections} / ${totalSections}`, sub: 'Sections done' },
    { big: `${daysToExam} days`, sub: 'To CUET exam' },
  ]
  const c = centers[centerMode]

  const CHIPS = [
    { key: 'onTrack', label: 'on track', tone: 'green', list: sections.onTrack },
    { key: 'needsAttention', label: 'needs attention', tone: 'amber', list: sections.needsAttention },
    { key: 'behind', label: 'behind', tone: 'red', list: sections.behind },
  ]
  const openList = openChip ? CHIPS.find(ch => ch.key === openChip).list : []

  return (
    <div className={'mpc' + (dark ? ' dark' : '')}>
      {/* header */}
      <div className="mpc-head">
        <span className="mpc-head-ico">
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path d="M4 12a8 8 0 1 1 3 6.24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M14 4.5a8 8 0 0 1 3 15.74" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </span>
        <div className="mpc-head-t">
          <b>My Progress</b>
          <span>CUET Humanities batch 2027</span>
        </div>
      </div>

      {/* ring */}
      <div className="mpc-ring-zone">
        <Ring shown={shown} actual={actual} expected={expected} color={m.ring}
          ghost={ghost} nextSectionGain={nextSectionGain} big={c.big} sub={c.sub}
          onTap={() => setCenterMode(x => (x + 1) % 3)} />
      </div>

      {/* pace line */}
      <p className="mpc-pace">
        Expected by now: <b>{expected}%</b> ·{' '}
        <span className={diff >= 0 ? 'up' : 'down'}>
          {diff >= 0 ? `ahead +${diff}%` : `behind -${Math.abs(diff)}%`}
        </span>
      </p>

      {/* status chips */}
      <div className="mpc-chips">
        {CHIPS.map(ch => (
          <button key={ch.key} type="button"
            className={'mpc-chip ' + ch.tone + (openChip === ch.key ? ' open' : '')}
            aria-expanded={openChip === ch.key}
            onClick={() => setOpenChip(openChip === ch.key ? null : ch.key)}>
            <b>{ch.list.length}</b> {ch.label}
          </button>
        ))}
      </div>

      {/* expanded section list */}
      {openList.length > 0 && (
        <div className="mpc-chip-list">
          {openList.map(name => (
            <div className="mpc-chip-row" key={name}>
              {openChip === 'onTrack'
                ? <span className="mpc-check" aria-hidden="true">✓</span>
                : <span className="mpc-dot" aria-hidden="true" />}
              <span className="mpc-chip-name">{name}</span>
              {openChip !== 'onTrack' && (
                <button type="button" className="mpc-catchup" onClick={onNextSection}>Catch up</button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* nudge box */}
      <div className={'mpc-nudge ' + m.pill} role="button" tabIndex={0}
        onMouseEnter={() => setGhost(true)} onMouseLeave={() => setGhost(false)}
        onTouchStart={() => setGhost(true)} onTouchEnd={() => setTimeout(() => setGhost(false), 500)}
        onClick={onNextSection}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onNextSection() }}>
        <Face mood={mood} />
        <div className="mpc-nudge-body">
          <span className="mpc-tag">{m.tag}</span>
          <p className="mpc-nudge-msg">{ghost ? `Next section takes you to ${Math.min(100, actual + nextSectionGain)}%` : m.msg}</p>
        </div>
        <button type="button" className="mpc-nudge-arrow" aria-label="Go to next section"
          onClick={e => { e.stopPropagation(); onNextSection() }}>
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
    </div>
  )
}
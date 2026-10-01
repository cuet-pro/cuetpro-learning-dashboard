import { useState } from 'react'
import MyProgressCard from '../components/MyProgressCard.jsx'
import './progressdemo.css'

const SECTIONS = {
  onTrack: ['History', 'Political science', 'Geography'],
  needsAttention: ['Economics'],
  behind: ['Sociology'],
}

export default function ProgressDemo() {
  const [actual, setActual] = useState(64)
  const [dark, setDark] = useState(false)
  const [lastNav, setLastNav] = useState('')
  const expected = 62
  const diff = actual - expected
  const mood = diff >= 15 ? 'star · Superstar' : diff >= 5 ? 'excited · On fire'
    : diff >= 0 ? 'happy · On track' : diff >= -6 ? 'worried · Slipping' : 'sad · Needs a push'

  return (
    <div className="demo-page">
      <h2 className="demo-title">My Progress — component demo</h2>

      <MyProgressCard
        actual={actual}
        expected={expected}
        sections={SECTIONS}
        totalSections={28}
        completedSections={18}
        daysToExam={47}
        nextSectionGain={5}
        onNextSection={() => setLastNav('Navigated → ' + SECTIONS.behind[0])}
        dark={dark}
      />

      <div className="demo-controls">
        <label className="demo-slider">
          <span>Demo progress</span>
          <input type="range" min="30" max="100" value={actual}
            onChange={e => setActual(Number(e.target.value))} />
          <b>{actual}%</b>
        </label>
        <div className="demo-meta">
          <span>diff {diff >= 0 ? '+' : ''}{diff}% · mood: <b>{mood}</b></span>
          <button type="button" onClick={() => setDark(d => !d)}>
            {dark ? 'Light mode' : 'Dark mode'}
          </button>
        </div>
        {lastNav && <p className="demo-nav">{lastNav}</p>}
      </div>

      <p className="demo-hint">
        Move the slider to cycle all five moods (star / excited / happy / worried / sad).
        Tap the ring center to cycle the readout · hover the nudge box for the “next section” ghost arc.
      </p>
    </div>
  )
}
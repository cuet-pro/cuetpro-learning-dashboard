import { useEffect, useMemo, useRef, useState } from 'react'
import { Target, Trophy, AlarmClock, Sparkles, Book, ArrowRight, FileText, Bell, Play, Pause, CalendarPlus, Check, ChevronLeft, ChevronRight } from 'lucide-react'
import './hero-banner.css'

const DURATION = 10000
const MAX_SLIDES = 4
const MAX_IMPRESSIONS = 3
const IDLE_RESTART = 5 * 60 * 1000
const PREV_ZONE = 0.3
const SEEN_KEY = 'cuet_hero_seen'

const ICONS = { 'target-arrow': Target, 'trophy': Trophy, 'alarm': AlarmClock, 'sparkles': Sparkles, 'book': Book, 'arrow-right': ArrowRight, 'file-text': FileText, 'bell': Bell, 'player-play': Play, 'player-pause': Pause, 'calendar-plus': CalendarPlus, 'check': Check }

const THEMES = {
  focus:    { bg: 'linear-gradient(110deg, #0F6E56 0%, #0d5a52 55%, #1b4157 100%)', ink: '#0F6E56', tag: { bg: '#C0DD97', text: '#173404' } },
  mock:     { bg: 'linear-gradient(110deg, #3C3489 0%, #3a2f86 55%, #26215C 100%)', ink: '#3C3489', tag: { bg: '#CECBF6', text: '#26215C' } },
  deadline: { bg: 'linear-gradient(110deg, #993C1D 0%, #7f2f17 55%, #4A1B0C 100%)', ink: '#993C1D', tag: { bg: '#F5C4B3', text: '#4A1B0C' } },
  feature:  { bg: 'linear-gradient(110deg, #185FA5 0%, #124f8c 55%, #042C53 100%)', ink: '#185FA5', tag: { bg: '#B5D4F4', text: '#042C53' } },
}

function demoSlides(now) {
  return [
    { id: 'focus-gt', type: 'focus', label: "Today's focus", priority: 100, title: 'Get General Test from 45% to 75%', body: 'Weakest subject. Revise the flagged topic, then take the subject quiz. Estimated +18 marks on your next mock.', meta: { progress: 45 }, ctaSecondary: { label: 'Revise topic', icon: 'book', href: '/study-kit/general-test' }, ctaPrimary: { label: 'Take subject quiz', icon: 'arrow-right', href: '/quiz/general-test' } },
    { id: 'aim-3', type: 'mock', label: 'All India mock', tag: 'Registrations open', priority: 80, title: 'All India Mock #3 on Sun, 18 Oct, 10 AM', body: 'Full-length CUET pattern. Get your All India rank, percentile and a college-wise cutoff match.', expiresAt: now + 16 * 86400000, meta: { registeredCount: 12480, registered: false }, ctaSecondary: { label: 'View syllabus', icon: 'file-text', href: '/mocks/aim-3' }, ctaPrimary: { label: 'Register free', icon: 'arrow-right', action: 'register' } },
    { id: 'du-csas-p1', type: 'deadline', label: 'DU deadline', tag: 'Closing soon', priority: 70, title: 'DU CSAS Phase 1 closes soon', body: 'Fill your course and college preferences before the window closes. You can edit until the deadline.', expiresAt: now + 2 * 86400000 + 14 * 3600000 + 22 * 60000, ctaSecondary: { label: 'Set reminder', icon: 'bell', action: 'remind' }, ctaPrimary: { label: 'Open DU explorer', icon: 'arrow-right', href: '/du-explorer' } },
    { id: 'ai-doubt', type: 'feature', label: 'New feature', tag: 'New', priority: 60, title: 'Meet AI doubt solver', body: 'Snap a question, get a step-by-step explanation in Hindi or English. Free for your first 20 doubts.', meta: { chips: ['Photo upload', 'Hindi + English', 'Step-by-step'] }, ctaSecondary: { label: 'Watch 30s demo', icon: 'player-play', action: 'demo' }, ctaPrimary: { label: 'Try it now', icon: 'arrow-right', href: '/doubt-solver' } },
  ]
}

/* seen tracking (localStorage, try/catch) */
function readSeen() { try { return JSON.parse(localStorage.getItem(SEEN_KEY)) || {} } catch { return {} } }
function writeSeen(v) { try { localStorage.setItem(SEEN_KEY, JSON.stringify(v)) } catch {} }

/* rich text: <mark>amber</mark> and <b>bold</b> */
function Rich({ html }) {
  const parts = String(html || '').split(/(<mark>.*?<\/mark>|<b>.*?<\/b>)/g)
  return parts.map((p, i) => {
    if (p.startsWith('<mark>')) return <mark key={i}>{p.slice(6, -7)}</mark>
    if (p.startsWith('<b>')) return <b key={i}>{p.slice(3, -4)}</b>
    return p
  })
}

export default function HeroBanner({ onRemind, onAddToCalendar, onOpenDemo, onNavigate }) {
  const [now, setNow] = useState(() => Date.now())
  const [registered, setRegistered] = useState(false)
  const [index, setIndex] = useState(0)
  const [userPause, setUserPause] = useState(false)
  const [hoverPause, setHoverPause] = useState(false)
  const [cycleDone, setCycleDone] = useState(false)
  const [reminder, setReminder] = useState('')
  const [swiped, setSwiped] = useState(false)
  const [hint, setHint] = useState('')
  const [reduced, setReduced] = useState(false)
  const touchX = useRef(0)

  /* crossfade gradient layers */
  const [bgLayer, setBgLayer] = useState(0)
  const [grads, setGrads] = useState([THEMES.focus.bg, THEMES.focus.bg])

  useEffect(() => { setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches) }, [])

  /* 1s clock for countdown + expiry */
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t) }, [])

  /* build + order queue (base slides computed once, filtered live) */
  const baseSlides = useMemo(() => demoSlides(Date.now()), [])
  const slides = useMemo(() => {
    const seen = readSeen()
    let list = baseSlides.filter(s => {
      if (s.startsAt && now < s.startsAt) return false
      if (s.expiresAt && now > s.expiresAt) return false
      return true
    }).filter(s => {
      if (s.type === 'focus') return true
      const rec = seen[s.id]
      if (s.type === 'mock' && registered) return true
      if (rec && (rec.done || (rec.n || 0) >= MAX_IMPRESSIONS)) return false
      return true
    })
    list = list.sort((a, b) => {
      const aUrgent = a.type === 'deadline' && a.expiresAt && (a.expiresAt - now) < 48 * 3600000
      const bUrgent = b.type === 'deadline' && b.expiresAt && (b.expiresAt - now) < 48 * 3600000
      if (aUrgent !== bUrgent) return aUrgent ? -1 : 1
      if (a.type === 'focus') return -1
      if (b.type === 'focus') return 1
      return (b.priority || 0) - (a.priority || 0)
    })
    return list.slice(0, MAX_SLIDES)
  }, [baseSlides, now, registered])

  const n = slides.length
  const slide = slides[index] || slides[0]

  /* impression tracking when a NEW slide is shown (keyed by id, not the 1s clock) */
  useEffect(() => {
    if (!slide) return
    const seen = readSeen()
    const rec = seen[slide.id] || { n: 0, done: false }
    rec.n = (rec.n || 0) + 1
    seen[slide.id] = rec
    writeSeen(seen)
  }, [slide && slide.id])

  const isPaused = hoverPause || userPause || cycleDone || reduced

  /* idle restart */
  useEffect(() => {
    if (!cycleDone) return
    const t = setTimeout(() => setCycleDone(false), IDLE_RESTART)
    return () => clearTimeout(t)
  }, [cycleDone])

  function go(next) {
    if (n <= 1) return
    setIndex(i => {
      let k = next
      if (k < 0) k = n - 1
      if (k >= n) k = 0
      return k
    })
  }
  const next = () => go(index + 1)
  const prev = () => go(index - 1)

  /* auto-advance on segment fill completion */
  function onSegEnd() {
    if (index + 1 >= n) {
      setCycleDone(true)
      setIndex(slides.findIndex(s => s.type === 'focus') >= 0 ? slides.findIndex(s => s.type === 'focus') : 0)
    } else {
      setIndex(index + 1)
    }
  }

  function markDone(id) { const seen = readSeen(); seen[id] = { ...(seen[id] || {}), done: true }; writeSeen(seen) }

  function handleAction(action, id) {
    if (action === 'register') { setRegistered(true); markDone(id) }
    else if (action === 'remind') { setReminder("Reminder set. We'll notify you before the deadline."); onRemind && onRemind(id) }
    else if (action === 'calendar') onAddToCalendar && onAddToCalendar(id)
    else if (action === 'demo') onOpenDemo && onOpenDemo(id)
  }
  function handleCTA(cta, id) {
    if (!cta) return
    if (cta.action) handleAction(cta.action, id)
    if (cta.href) { markDone(id); onNavigate ? onNavigate(cta.href) : (window.location.href = cta.href) }
  }

  /* dynamic tag */
  let tag = slide && slide.tag
  if (slide && slide.type === 'deadline' && slide.expiresAt) {
    const hrsLeft = (slide.expiresAt - now) / 3600000
    if (hrsLeft < 48) tag = 'Closes in ' + Math.ceil(hrsLeft) + ' hrs'
  }
  if (slide && slide.type === 'mock' && registered) tag = 'Registered ✓'

  const theme = slide ? THEMES[slide.type] : THEMES.focus

  useEffect(() => {
    const g = (slide && THEMES[slide.type] && THEMES[slide.type].bg) || THEMES.focus.bg
    setGrads(gs => { const c = [...gs]; c[1 - bgLayer] = g; return c })
    setBgLayer(1 - bgLayer)
  }, [index])

  /* banner click zones */
  function onBannerClick(e) {
    if (n <= 1) return
    if (e.target.closest('button, a')) return
    if (swiped) { setSwiped(false); return }
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    x < PREV_ZONE ? prev() : next()
  }

  return (
    <section
      className={'hb' + (reduced ? ' reduced' : '')}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="Announcements"
      onClick={onBannerClick}
      onMouseEnter={() => setHoverPause(true)}
      onMouseLeave={() => { setHoverPause(false); setHint('') }}
      onMouseMove={e => { if (n > 1) { const r = e.currentTarget.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width; setHint(x < PREV_ZONE ? 'left' : 'right') } }}
      onFocus={() => setHoverPause(true)}
      onBlur={() => setHoverPause(false)}
      onKeyDown={e => { if (e.key === 'ArrowRight') next(); if (e.key === 'ArrowLeft') prev() }}
      onTouchStart={e => { setHoverPause(true); touchX.current = e.touches[0].clientX }}
      onTouchEnd={e => {
        setHoverPause(false)
        const dx = e.changedTouches[0].clientX - touchX.current
        if (Math.abs(dx) > 40) { setSwiped(true); dx < 0 ? next() : prev() }
      }}
    >
      {/* crossfade gradient layers */}
      <div className="hb-bg" style={{ background: grads[0], opacity: bgLayer === 0 ? 1 : 0 }} aria-hidden="true" />
      <div className="hb-bg" style={{ background: grads[1], opacity: bgLayer === 1 ? 1 : 0 }} aria-hidden="true" />

      {/* top row */}
      {n > 1 && (
        <div className="hb-top">
          <div className="hb-segs" role="tablist" aria-label="Slides">
            {slides.map((s, i) => (
              <button key={s.id} className="hb-seg" role="tab" aria-selected={i === index} aria-label={'Go to ' + s.label} onClick={e => { e.stopPropagation(); setIndex(i) }}>
                <span className={'hb-seg-fill' + (i < index ? ' done' : i === index ? ' active' : '')} style={{ animationDuration: DURATION + 'ms', animationPlayState: (i === index && isPaused) ? 'paused' : 'running' }} onAnimationEnd={i === index ? onSegEnd : undefined} />
              </button>
            ))}
          </div>
          <span className="hb-count">{index + 1} / {n}</span>
          <button className="hb-pause" aria-label={isPaused ? 'Play' : 'Pause'} onClick={e => { e.stopPropagation(); if (cycleDone) { setCycleDone(false); setUserPause(false) } else setUserPause(p => !p) }}>
            {isPaused ? <Play size={13} /> : <Pause size={13} />}
          </button>
        </div>
      )}

      {/* slide */}
      <div className="hb-body" key={slide.id} role="group" aria-roledescription="slide" aria-label={(index + 1) + ' of ' + n}>
        <div className="hb-left">
          <div className="hb-label">
            {(() => { const I = ICONS[({ focus: 'target-arrow', mock: 'trophy', deadline: 'alarm', feature: 'sparkles' })[slide.type]]; return <I size={16} /> })()}
            <span>{slide.label}</span>
            {tag && <span className="hb-tag" style={{ background: theme.tag.bg, color: theme.tag.text }}>{tag}</span>}
          </div>
          <h2 className="hb-title"><Rich html={slide.title} /></h2>
          <p className="hb-body-p"><Rich html={slide.body} /></p>
          {slide.type === 'focus' && (
            <div className="hb-prog" role="progressbar" aria-valuenow={slide.meta.progress} aria-valuemin={0} aria-valuemax={100} aria-label="Progress">
              <div className="hb-prog-fill" style={{ width: slide.meta.progress + '%' }} />
            </div>
          )}
          {slide.type === 'mock' && (
            <div className="hb-avatars">
              {['RS', 'AK', 'PM', '+'].map((t, i) => <span key={i} className={'hb-av' + (t === '+' ? ' hb-av-plus' : '')} style={t === '+' ? { background: '#fff', color: '#26215C' } : { background: ['#AFA9EC', '#9FE1CB', '#F4C0D1'][i], color: '#26215C' }}>{t}</span>)}
              <span className="hb-av-note">{slide.meta.registeredCount.toLocaleString('en-IN')} students registered</span>
            </div>
          )}
          {slide.type === 'deadline' && (
            <div className="hb-cd" aria-label="Time left">
              {(() => {
                let ms = Math.max(0, slide.expiresAt - now)
                const d = Math.floor(ms / 86400000); ms -= d * 86400000
                const h = Math.floor(ms / 3600000); ms -= h * 3600000
                const m = Math.floor(ms / 60000); ms -= m * 60000
                const s = Math.floor(ms / 1000)
                const pad = x => String(x).padStart(2, '0')
                return [['days', d], ['hrs', h], ['min', m], ['sec', s]].map(([u, v]) => <div className="hb-cd-box" key={u}><b>{pad(v)}</b><em>{u}</em></div>)
              })()}
            </div>
          )}
          {slide.type === 'feature' && (
            <div className="hb-chips">
              {slide.meta.chips.map(c => <span className="hb-chip" key={c}><Check size={12} /> {c}</span>)}
            </div>
          )}
        </div>
        <div className="hb-cta">
          {slide.ctaSecondary && <button className="hb-btn hb-btn-2" onClick={e => { e.stopPropagation(); handleCTA(slide.ctaSecondary, slide.id) }}>{slide.ctaSecondary.label}{(() => { const I = ICONS[slide.ctaSecondary.icon]; return I ? <I size={15} /> : null })()}</button>}
          {slide.ctaPrimary && (() => {
            const p = (slide.type === 'mock' && registered) ? { label: 'Add to calendar', icon: 'calendar-plus', action: 'calendar' } : slide.ctaPrimary
            return <button className="hb-btn hb-btn-1" style={{ color: theme.ink }} onClick={e => { e.stopPropagation(); handleCTA(p, slide.id) }}>{p.label}{(() => { const I = ICONS[p.icon]; return I ? <I size={15} /> : null })()}</button>
          })()}
        </div>
      </div>

      {/* click-zone hints (desktop) */}
      {n > 1 && (
        <>
          <span className={'hb-hint hb-hint-l' + (hint === 'left' ? ' on' : '')} aria-hidden="true"><ChevronLeft size={18} /></span>
          <span className={'hb-hint hb-hint-r' + (hint === 'right' ? ' on' : '')} aria-hidden="true"><ChevronRight size={18} /></span>
        </>
      )}

      {/* aria-live announcement (manual changes only) */}
      <span className="hb-live" aria-live="polite">{reminder}</span>
    </section>
  )
}
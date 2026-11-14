import { useEffect, useRef, useState } from 'react'
import {
  ExternalLink, Loader2, Compass, Table2, Building2, Trophy, ListChecks, ClipboardList, RefreshCw,
} from 'lucide-react'
import { useProfile, dreamCollegeShort } from '../lib/profile'
import './explorer.css'

/* The DU Admissions Explorer is a separate app (repo cuet-pro/Cuet-pro-du) at its
   own Vercel URL. We embed it with ?embed=1 so it drops its own chrome/hero and
   re-themes to the dashboard. This page supplies the native frame: page header,
   stat tiles, the dashboard tab strip, and the postMessage bridge (theme sync,
   context, auto-height). The standalone URL is untouched. */
const DU_EXPLORER_URL = 'https://cuet-pro-du.vercel.app/'
const DU_ORIGIN = 'https://cuet-pro-du.vercel.app'

const EXPLORER_TABS = [
  { id: 'cutoffs', label: 'Cutoffs & Seats', route: '/cutoffs', icon: Table2 },
  { id: 'colleges', label: 'Colleges & Rankings', route: '/colleges', icon: Building2 },
  { id: 'quota', label: 'Sports & ECA', route: '/quota', icon: Trophy },
  { id: 'subject-combination', label: 'Subject Combination', route: '/subject-combination', icon: ListChecks },
  { id: 'preference-sheet', label: 'Preference Sheet', route: '/preference-sheet', icon: ClipboardList },
]

const STATS = [
  { label: 'Programs', value: '225' },
  { label: 'Colleges', value: '69' },
  { label: 'Seats', value: '71,088' },
  { label: 'Categories', value: '6' },
]

function initialTab() {
  try {
    const t = new URLSearchParams(window.location.search).get('tab')
    return EXPLORER_TABS.some(x => x.id === t) ? t : 'cutoffs'
  } catch { return 'cutoffs' }
}

function useDashboardTheme() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'light')
  useEffect(() => {
    const el = document.documentElement
    const sync = () => setTheme(el.dataset.theme || 'light')
    const mo = new MutationObserver(sync)
    mo.observe(el, { attributes: true, attributeFilter: ['data-theme'] })
    return () => mo.disconnect()
  }, [])
  return theme
}

export default function Explorer() {
  const [profile] = useProfile()
  const [tab, setTab] = useState(initialTab)
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  const frameRef = useRef(null)
  const theme = useDashboardTheme()

  const active = EXPLORER_TABS.find(t => t.id === tab) || EXPLORER_TABS[0]
  const src = DU_EXPLORER_URL + active.route.replace(/^\//, '') + '?embed=1'

  /* reflect the active tab in the dashboard URL (?tab=) so refresh + back work */
  useEffect(() => {
    try {
      const url = new URL(window.location.href)
      if (tab === 'cutoffs') url.searchParams.delete('tab')
      else url.searchParams.set('tab', tab)
      window.history.replaceState(null, '', url)
    } catch { /* ignore */ }
  }, [tab])

  /* post theme + student context to the framed tool */
  const postToTool = msg => {
    try { frameRef.current?.contentWindow?.postMessage(msg, DU_ORIGIN) } catch { /* ignore */ }
  }
  const sendContext = () => {
    postToTool({ type: 'theme', value: theme })
    postToTool({ type: 'context', value: { stream: profile.stream, targetCollege: profile.dreamCollege, targetScore: profile.targetScore, tab: active.id } })
  }
  useEffect(() => { if (loaded) sendContext() }, [theme, loaded, active.id, profile.stream, profile.dreamCollege, profile.targetScore])

  /* listen: auto-height, ready, internal route change */
  useEffect(() => {
    const onMsg = e => {
      if (e.origin !== DU_ORIGIN) return
      const d = e.data
      if (!d || typeof d !== 'object') return
      if (d.type === 'resize' && typeof d.height === 'number') {
        if (frameRef.current) frameRef.current.style.height = d.height + 'px'
      } else if (d.type === 'ready') {
        sendContext()
      } else if (d.type === 'CUET_DASHBOARD_ROUTE_CHANGE' && typeof d.path === 'string') {
        const t = EXPLORER_TABS.find(x => d.path.startsWith(x.route))
        if (t && t.id !== tab) setTab(t.id)
      }
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [tab, theme, profile])

  const selectTab = id => {
    setTab(id)
    setLoaded(false)
    setFailed(false)
    if (frameRef.current) frameRef.current.style.height = ''
  }

  return (
    <div className="page du-page">
      <header className="page-head">
        <span className="page-head-ico"><Compass size={20} /></span>
        <div className="page-head-t">
          <h1>DU Admissions Explorer</h1>
          <p>Cutoffs, seats and colleges for DU admissions through CSAS.</p>
        </div>
        <a className="btn btn-outline-sm du-open" href={DU_EXPLORER_URL + active.route.replace(/^\//, '')} target="_blank" rel="noopener noreferrer">
          <ExternalLink size={14} /> Open in new tab
        </a>
      </header>

      <div className="du-headblock">
        <div className="du-headblock-t">
          <span className="du-chip">CSAS 2026 · Official seat matrix</span>
          <p>Browse every Delhi University program and college. Tap a row for category-wise seats and cutoffs.</p>
          {profile.dreamCollege && (
            <span className="du-target-chip">Your target: {dreamCollegeShort(profile.dreamCollege)}</span>
          )}
        </div>
        <div className="metric-strip">
          {STATS.map(s => (
            <div className="metric-card" key={s.label}>
              <span className="metric-label">{s.label}</span>
              <b className="metric-value">{s.value}</b>
            </div>
          ))}
        </div>
      </div>

      <div className="an-tabs du-tabs">
        {EXPLORER_TABS.map(t => (
          <button key={t.id} className={tab === t.id ? 'on' : ''} onClick={() => selectTab(t.id)}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      <div className="du-frame">
        {!loaded && !failed && (
          <div className="du-skeleton">
            <Loader2 size={22} className="du-spin" />
            <span>Loading DU Admissions Explorer…</span>
          </div>
        )}
        {failed && (
          <div className="du-fail">
            <Compass size={26} />
            <p>Couldn&apos;t load the explorer.</p>
            <div className="du-fail-actions">
              <button className="btn btn-primary-sm" onClick={() => { setFailed(false); setLoaded(false) }}><RefreshCw size={14} /> Retry</button>
              <a className="btn btn-outline-sm" href={DU_EXPLORER_URL} target="_blank" rel="noopener noreferrer">Open in new tab</a>
            </div>
          </div>
        )}
        <iframe
          ref={frameRef}
          key={src}
          src={src}
          title="DU Admissions Explorer"
          onLoad={() => { setLoaded(true); sendContext() }}
          onError={() => setFailed(true)}
          allow="fullscreen"
        />
      </div>

      <p className="du-attribution">Data compiled by DU Toppers · CSAS 2026 official seat matrix</p>
    </div>
  )
}
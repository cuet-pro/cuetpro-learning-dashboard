import { useEffect, useState } from 'react'
import { ExternalLink, Loader2, Compass } from 'lucide-react'
import './explorer.css'

/* The DU Admissions Explorer is a separate, already-built app (repo cuet-pro/Cuet-pro-du),
   deployed at its own Vercel URL. We embed it here so it lives inside the dashboard.
   It posts its route (type: CUET_DASHBOARD_ROUTE_CHANGE) to the parent, so we remember
   where the student was and restore that route if they switch tabs and come back. */
const DU_EXPLORER_URL = 'https://cuet-pro-du.vercel.app/'

/* survives tab switches within this session (module scope resets only on full reload) */
let lastRoute = '/'

function duSrc(route) {
  const path = route && route !== '/' ? route.replace(/^\//, '') : ''
  return DU_EXPLORER_URL + path
}

export default function Explorer() {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  const [src] = useState(() => duSrc(lastRoute))

  useEffect(() => {
    const onMsg = e => {
      if (e.data && e.data.type === 'CUET_DASHBOARD_ROUTE_CHANGE' && typeof e.data.path === 'string') {
        lastRoute = e.data.path
      }
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [])

  return (
    <div className="du-embed">
      <div className="du-embed-bar">
        <div className="du-embed-head">
          <h1>DU Admissions Explorer</h1>
          <p>Colleges, cutoffs, rankings, eligibility, subject combos &amp; preference sheet — the full explorer, live inside your dashboard.</p>
        </div>
        <a className="du-embed-open" href={DU_EXPLORER_URL} target="_blank" rel="noopener noreferrer">
          <ExternalLink size={14} /> Open in new tab
        </a>
      </div>

      <div className="du-embed-frame">
        {!loaded && !failed && (
          <div className="du-embed-loading">
            <Loader2 size={22} className="du-spin" />
            <span>Loading DU Admissions Explorer…</span>
          </div>
        )}
        {failed && (
          <div className="du-embed-fail">
            <Compass size={26} />
            <p>Couldn&apos;t load the explorer.</p>
            <a className="btn btn-primary-sm" href={DU_EXPLORER_URL} target="_blank" rel="noopener noreferrer">Open in a new tab</a>
          </div>
        )}
        <iframe
          src={src}
          title="DU Admissions Explorer"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          allow="fullscreen"
        />
      </div>
    </div>
  )
}
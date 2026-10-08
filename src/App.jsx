import { useState } from 'react'
import Dashboard from './pages/Dashboard.jsx'
import StudyKit from './pages/StudyKit.jsx'
import { consumeNotesDeepLink } from './lib/notesProgress.js'
import Analysis from './pages/Analysis.jsx'
import ChillZone from './pages/ChillZone.jsx'
import Explorer from './pages/Explorer.jsx'
import Profile from './pages/Profile.jsx'
import AppShell, { ToastProvider } from './components/shell/Shell.jsx'
import './tokens.css'
import './shell.css'

const PAGES = {
  dashboard: Dashboard,
  studykit: StudyKit,
  analysis: Analysis,
  chill: ChillZone,
  explorer: Explorer,
  profile: Profile,
}

/* Boot straight into Study Kit when the URL carries a notes deep link
   (?subject=&book=&ch=&topic=), so a reload / shared link reopens the topic. */
function bootPage() {
  try { if (new URLSearchParams(window.location.search).get('ch')) return 'studykit' } catch { /* ignore */ }
  return 'dashboard'
}

export default function App() {
  const [page, setPage] = useState(bootPage)
  const Page = PAGES[page]
  const navigate = p => { consumeNotesDeepLink(); setPage(p) }
  return (
    <ToastProvider>
      <AppShell page={page} onNavigate={navigate}>
        <main className="shell-main-inner" key={page}>
          <Page onNavigate={navigate} />
        </main>
      </AppShell>
    </ToastProvider>
  )
}

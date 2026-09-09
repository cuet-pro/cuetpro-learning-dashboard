import { useState } from 'react'
import Dashboard from './pages/Dashboard.jsx'
import StudyKit from './pages/StudyKit.jsx'
import Analysis from './pages/Analysis.jsx'
import SmartRevision from './pages/SmartRevision.jsx'
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
  revision: SmartRevision,
  chill: ChillZone,
  explorer: Explorer,
  profile: Profile,
}

export default function App() {
  const [page, setPage] = useState('dashboard')
  const Page = PAGES[page]
  return (
    <ToastProvider>
      <AppShell page={page} onNavigate={setPage}>
        <main className="shell-main-inner" key={page}>
          <Page onNavigate={setPage} />
        </main>
      </AppShell>
    </ToastProvider>
  )
}

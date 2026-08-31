import { useState } from 'react'
import { LayoutDashboard, GraduationCap, BarChart3, Sparkles, Compass, Settings, Bell, Coffee } from 'lucide-react'
import Dashboard from './pages/Dashboard.jsx'
import StudyKit from './pages/StudyKit.jsx'
import Analysis from './pages/Analysis.jsx'
import SmartRevision from './pages/SmartRevision.jsx'
import ChillZone from './pages/ChillZone.jsx'
import Explorer from './pages/Explorer.jsx'
import Profile from './pages/Profile.jsx'
import './tokens.css'
import './shell.css'

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'studykit', label: 'Study Kit', icon: GraduationCap },
  { id: 'analysis', label: 'Analysis', icon: BarChart3 },
  { id: 'revision', label: 'Smart Revision', icon: Sparkles },
  { id: 'chill', label: 'Chill Zone', icon: Coffee },
  { id: 'explorer', label: 'DU Admissions Explorer', icon: Compass },
  { id: 'profile', label: 'Profile & Settings', icon: Settings },
]

export default function App() {
  const [page, setPage] = useState('dashboard')
  return (
    <div className="shell">
      <Sidebar active={page} onNavigate={setPage} />
      <main className="shell-main">
        {page === 'dashboard' && <Dashboard onNavigate={setPage} />}
        {page === 'studykit' && <StudyKit onNavigate={setPage} />}
        {page === 'analysis' && <Analysis />}
        {page === 'revision' && <SmartRevision />}
        {page === 'chill' && <ChillZone />}
        {page === 'explorer' && <Explorer />}
        {page === 'profile' && <Profile />}
      </main>
    </div>
  )
}

function Sidebar({ active, onNavigate }) {
  return (
    <aside className="side">
      <div className="side-logo">CUET Pro</div>
      <div className="side-nav">
        {NAV.map(({ id, label, icon: Icon }) => (
          <div
            key={id}
            className={'side-item' + (active === id ? ' active' : '')}
            onClick={() => onNavigate(id)}
          >
            <Icon size={18} strokeWidth={1.5} />
            <span>{label}</span>
          </div>
        ))}
      </div>
      <div className="side-foot">
        <div className="side-user">
          <div className="side-avatar">AV</div>
          <div>
            <b>Ananya Verma</b>
            <span>CUET 2027</span>
          </div>
        </div>
      </div>
    </aside>
  )
}

function ComingSoon({ title, desc, onNavigate }) {
  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>{title}</h1>
          <p>{desc}</p>
        </div>
        <button className="bell" aria-label="Notifications"><Bell size={18} /></button>
      </header>
      <div className="cs-card">
        <div className="cs-ico">🚧</div>
        <h3>Is page ka working build agle iteration me</h3>
        <p>Design preserve hai — features isi design me add honge.</p>
        <button className="btn btn-primary" onClick={() => onNavigate('dashboard')}>← Dashboard pe wapas</button>
      </div>
    </div>
  )
}

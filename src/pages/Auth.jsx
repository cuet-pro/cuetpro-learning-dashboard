import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import BrandPanel from './auth/BrandPanel'
import Login from './auth/Login'
import Signup from './auth/Signup'
import './auth.css'

/* Full-screen auth page — not wrapped by the sidebar/topbar/bottom-nav. */
export default function Auth({ onAuthed }) {
  const [view, setView] = useState(() => (location.hash === '#signup' ? 'signup' : 'login'))
  const [step, setStep] = useState(1)
  const [theme, setTheme] = useState(() => localStorage.getItem('cp_theme') || 'light')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('cp_theme', theme)
  }, [theme])

  const switchView = v => { setView(v); setStep(1) }

  return (
    <div className="auth">
      <button
        className="theme-toggle"
        type="button"
        aria-label="Toggle dark mode"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      >
        {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        {theme === 'dark' ? 'Light mode' : 'Dark mode'}
      </button>

      <BrandPanel view={view} step={step} onSwitch={switchView} />

      <main className="form-side">
        <div className="form-wrap">
          {view === 'login'
            ? <Login onSwitch={switchView} onAuthed={onAuthed} />
            : <Signup step={step} setStep={setStep} onSwitch={switchView} onAuthed={onAuthed} />}
        </div>
      </main>
    </div>
  )
}
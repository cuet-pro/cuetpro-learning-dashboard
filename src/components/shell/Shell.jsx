import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import {
  LayoutDashboard, GraduationCap, BarChart3, Compass, Settings, Coffee,
  Search, Sun, Moon, Bell, Menu, X, PanelLeftClose, PanelLeftOpen, ChevronDown,
  User, Crown, HelpCircle, LogOut, CircleCheck, CircleAlert, Info,
} from 'lucide-react'
import { useProfile } from '../../lib/profile'
import './shell.css'

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'studykit', label: 'Study Kit', icon: GraduationCap },
  { id: 'analysis', label: 'Analysis', icon: BarChart3 },
  { id: 'chill', label: 'Chill Zone', icon: Coffee },
  { id: 'explorer', label: 'DU Admissions Explorer', icon: Compass },
  { id: 'profile', label: 'Profile & Settings', icon: Settings },
]
const PRIMARY_NAV = ['dashboard', 'studykit', 'analysis', 'profile', 'explorer']

/* ── theme ── */
function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem('cp_theme') || 'light')
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('cp_theme', theme)
  }, [theme])
  return [theme, setTheme]
}

/* ── Sidebar ── */
function Sidebar({ active, onNavigate, rail, setRail, open, setOpen }) {
  const [profile] = useProfile()
  const initials = (profile.name || 'CUET Pro').split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()
  return (
    <>
      {open && <button className="scrim" onClick={() => setOpen(false)} aria-label="Close menu" />}
      <aside className={'side' + (rail ? ' rail' : '') + (open ? ' open' : '')}>
        <div className="side-logo">
          <span className="side-logo-mark">CP</span>
          <span className="side-logo-name">CUET Pro</span>
        </div>
        <nav className="side-nav">
          {NAV.filter(n => n.id !== 'profile').map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={'side-item' + (active === id ? ' active' : '')}
              onClick={() => { onNavigate(id); setOpen(false) }}
              title={label}
            >
              <Icon size={19} strokeWidth={1.8} className="s-ico" />
              <span className="s-label">{label}</span>
            </button>
          ))}
        </nav>
        <div className="side-foot">
          <button
            className={'side-user' + (active === 'profile' ? ' active' : '')}
            onClick={() => { onNavigate('profile'); setOpen(false) }}
            title="Profile & settings"
            aria-label="Open profile and settings"
          >
            <span className="side-user-av">{initials}</span>
            <span className="side-user-txt">
              <b>{profile.name}</b>
              <span>{profile.stream ? 'CUET 2027 · ' + profile.stream : 'CUET 2027'}</span>
            </span>
            <Settings size={16} strokeWidth={1.9} className="side-user-gear" />
          </button>
          <button
            className="side-collapse"
            onClick={() => setRail(!rail)}
            title={rail ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label="Toggle sidebar width"
          >
            {rail ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
          </button>
        </div>
      </aside>
    </>
  )
}

/* ── Notifications (empty state only — no notification source in the app yet) ── */
function NotificationsPanel({ onClose }) {
  const items = []
  return (
    <div className="dd" onClick={e => e.stopPropagation()}>
      <div className="dd-head">Notifications</div>
      {items.length === 0 ? (
        <div className="dd-empty">You're all caught up — no new notifications.</div>
      ) : (
        items.map(i => (
          <button key={i.k} className="dd-item" onClick={onClose}><CircleAlert size={15} style={{ color: 'var(--warning)' }} />{i.label}</button>
        ))
      )}
    </div>
  )
}

function Dropdown({ onClose, children }) {
  useEffect(() => {
    const h = () => onClose()
    document.addEventListener('click', h)
    return () => document.removeEventListener('click', h)
  }, [onClose])
  return <>{children}</>
}

/* ── Topbar ── */
function Topbar({ onNavigate, setMenuOpen, theme, setTheme }) {
  const [profile] = useProfile()
  const initials = (profile.name || 'CUET Pro').split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()
  const [dd, setDd] = useState(null) // 'bell' | 'user'
  const closeDd = useCallback(() => setDd(null), [])
  const go = id => { onNavigate(id); closeDd() }
  return (
    <header className="topbar">
      <button className="tb-menu" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Menu size={19} /></button>
      <div className="tb-search"><Search size={15} /><input placeholder="Search topics, tools, colleges…" onKeyDown={e => { if (e.key === 'Enter') e.target.blur() }} /></div>
      <div className="tb-spacer" />
      <button className="tb-icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Toggle theme" title="Toggle theme">
        {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
      </button>
      <div style={{ position: 'relative' }}>
        <button className="tb-icon" onClick={e => { e.stopPropagation(); setDd(dd === 'bell' ? null : 'bell') }} aria-label="Notifications">
          <Bell size={17} />
          <i className="tb-dot" />
        </button>
        {dd === 'bell' && <Dropdown onClose={closeDd}><NotificationsPanel onClose={closeDd} /></Dropdown>}
      </div>
      <div style={{ position: 'relative' }}>
        <button className="tb-user" onClick={e => { e.stopPropagation(); setDd(dd === 'user' ? null : 'user') }}>
          <span className="tb-user-av">{initials}</span>
          <b>{(profile.name || 'Ananya Verma').split(' ')[0]}</b>
          <ChevronDown size={14} />
        </button>
        {dd === 'user' && (
          <Dropdown onClose={closeDd}>
            <div className="dd">
              <button className="dd-item" onClick={() => go('profile')}><User size={15} />Profile & Settings</button>
              <button className="dd-item" onClick={() => alert('Deep-link → Upgrade plan')}><Crown size={15} />Upgrade to Pro</button>
              <button className="dd-item" onClick={() => alert('Deep-link → Help centre')}><HelpCircle size={15} />Help & support</button>
              <div className="dd-div" />
              <button className="dd-item danger" onClick={() => alert('Deep-link → Sign out')}><LogOut size={15} />Sign out</button>
            </div>
          </Dropdown>
        )}
      </div>
    </header>
  )
}

/* ── Bottom nav (mobile) ── */
function BottomNav({ active, onNavigate }) {
  return (
    <nav className="bottom-nav">
      {PRIMARY_NAV.map(id => {
        const item = NAV.find(n => n.id === id)
        const Icon = item.icon
        return (
          <button key={id} className={'bn-item' + (active === id ? ' active' : '')} onClick={() => onNavigate(id)}>
            <span className="bn-ico"><Icon size={19} /></span>
            {item.label.split(' ')[0]}
          </button>
        )
      })}
    </nav>
  )
}

/* ── Toast system ── */
const ToastCtx = createContext(() => {})
// oxlint-disable-next-line react/only-export-components
export const useToast = () => useContext(ToastCtx)
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const toast = useCallback((msg, type = 'info', sub) => {
    const id = Date.now() + Math.random()
    setToasts(t => [...t, { id, msg, type, sub }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3800)
  }, [])
  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div className="toast-view">
        {toasts.map(t => (
          <div key={t.id} className={'toast ' + t.type}>
            {t.type === 'success' ? <CircleCheck size={16} style={{ color: 'var(--success)', flexShrink: 0, marginTop: 1 }} />
              : t.type === 'error' ? <CircleAlert size={16} style={{ color: 'var(--error)', flexShrink: 0, marginTop: 1 }} />
                : <Info size={16} style={{ color: 'var(--info)', flexShrink: 0, marginTop: 1 }} />}
            <div><b>{t.msg}</b>{t.sub && <span>{t.sub}</span>}</div>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

/* ── Modal ── */
export function Modal({ open, onClose, title, children, footer }) {
  useEffect(() => {
    if (!open) return
    const h = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <button className="modal-x" onClick={onClose} aria-label="Close"><X size={16} /></button>
        {title && <h3>{title}</h3>}
        {children}
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  )
}

/* ── App shell ── */
export default function AppShell({ page, onNavigate, children }) {
  const [rail, setRail] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [theme, setTheme] = useTheme()
  return (
    <div className={'shell' + (rail ? ' rail' : '')}>
      <Sidebar active={page} onNavigate={onNavigate} rail={rail} setRail={setRail} open={menuOpen} setOpen={setMenuOpen} />
      <div className="shell-main">
        <Topbar onNavigate={onNavigate} setMenuOpen={setMenuOpen} theme={theme} setTheme={setTheme} />
        {children}
      </div>
      <BottomNav active={page} onNavigate={onNavigate} />
    </div>
  )
}

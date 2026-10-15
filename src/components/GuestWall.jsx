import { X } from 'lucide-react'
import { signIn, exitGuest } from '../lib/auth'
import { closeGuestWall, takePending, useWallData } from '../lib/guestGate'
import './guestwall.css'

const GoogleG = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
    <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
  </svg>
)

/* AfterBoards-style login wall. Rendered once at the shell level; it shows
   itself whenever a gated CTA is hit while browsing as a guest. */
export default function GuestWall({ onAuthed }) {
  const wall = useWallData()
  if (!wall) return null
  const { feature, action } = wall

  const google = () => { signIn({ user: 'Guest', method: 'google' }); onAuthed() }
  const email = () => { takePending(); closeGuestWall(); exitGuest() }

  return (
    <div className="gw-scrim" onClick={closeGuestWall}>
      <div className="gw-card" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Create an account to continue">
        <button className="gw-x" onClick={closeGuestWall} aria-label="Close"><X size={18} /></button>

        <div className="gw-brand">
          <span className="gw-mark">CUET</span>
          <span className="gw-pro">PRO</span>
        </div>

        <h2>Create an account or log in to {action}:</h2>

        <button className="gw-google" type="button" onClick={google}>
          <GoogleG /> Continue with Google
        </button>

        <button className="gw-email" type="button" onClick={email}>Continue with email →</button>

        <div className="gw-foot">
          <b>Unlock {feature}!</b>
          <span>Login to continue!</span>
        </div>
      </div>
    </div>
  )
}
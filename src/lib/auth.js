/* TODO: replace with real auth provider (Firebase Auth / Supabase Auth with
   Google + Indian phone OTP). Local store for now — mirrors profile.js
   (storage + custom event + hook) so the internals can be swapped later
   without touching the UI.

   Guest mode (AfterBoards-style): a visitor can browse as a guest by setting
   cp_guest. `isGuest()` is only true when the flag is set AND there is no real
   session — so signing in immediately promotes them out of guest mode. */
import { useEffect, useState } from 'react'

const KEY = 'cp_auth'
const GUEST_KEY = 'cp_guest'
const EVENT = 'cp-auth-change'

/* session shape: { user: string, method: 'email'|'phone'|'google', at: number, remember: boolean } */

export function getSession() {
  try {
    const remembered = JSON.parse(localStorage.getItem(KEY) || 'null')
    if (remembered && remembered.remember) return remembered
    return JSON.parse(sessionStorage.getItem(KEY) || 'null')
  } catch { return null }
}

export function signIn(session) {
  const s = { ...session, at: Date.now() }
  if (s.remember) {
    localStorage.setItem(KEY, JSON.stringify(s))
    sessionStorage.removeItem(KEY)
  } else {
    sessionStorage.setItem(KEY, JSON.stringify(s))
    localStorage.removeItem(KEY)
  }
  localStorage.removeItem(GUEST_KEY) // signing in always exits guest mode
  window.dispatchEvent(new Event(EVENT))
}

export function signOut() {
  localStorage.removeItem(KEY)
  sessionStorage.removeItem(KEY)
  localStorage.removeItem(GUEST_KEY) // log out → back to Auth, not guest
  window.dispatchEvent(new Event(EVENT))
}

export function enterGuest() {
  localStorage.setItem(GUEST_KEY, '1')
  window.dispatchEvent(new Event(EVENT))
}

export function exitGuest() {
  localStorage.removeItem(GUEST_KEY)
  window.dispatchEvent(new Event(EVENT))
}

export function isGuest() {
  try {
    return localStorage.getItem(GUEST_KEY) === '1' && !getSession()
  } catch { return false }
}

export function useAuth() {
  const [session, setSession] = useState(getSession)
  const [guest, setGuest] = useState(isGuest)
  useEffect(() => {
    const h = () => { setSession(getSession()); setGuest(isGuest()) }
    window.addEventListener(EVENT, h)
    return () => window.removeEventListener(EVENT, h)
  }, [])
  return [session, { signIn, signOut, guest, enterGuest, exitGuest }]
}